/**
 * Automatic Template Migration Script
 * Parses descriptions from layering-templates.json and generates slots automatically
 */

import { readFileSync } from 'fs';
import { join } from 'path';
import { supabase } from '@/lib/supabase/standalone';  // ← ENV vars loaded here

interface RawTemplate {
  name: string;
  min_temp_c: number;
  max_temp_c: number;
  layer_count: number;
  required_layers: string[];
  description: string;
}

interface GeneratedSlot {
  slot_name: string;
  allowed_subcategories: string[];
  required: boolean;
}

/**
 * Parses description like "Polo + Cardigan/Shawl Cardigan + Harrington/Bomber"
 * into structured slots
 */
function parseDescriptionToSlots(description: string, required_layers: string[]): GeneratedSlot[] {
  const slots: GeneratedSlot[] = [];
  
  // Split by " + " to get each layer
  const layers = description.split('+').map(s => s.trim());
  
  layers.forEach((layer, index) => {
    // Skip if it's just a generic description
    if (layer.toLowerCase().includes('optional') || layer.toLowerCase().includes('any')) {
      return;
    }
    
    // Split by "/" to get alternatives (e.g., "Cardigan/Shawl Cardigan")
    const alternatives = layer.split('/').map(s => s.trim());
    
    // Determine slot name from required_layers or infer from position
    let slot_name = required_layers[index] || `layer_${index}`;
    
    // Clean up subcategories (remove parenthetical descriptions)
    const cleanedSubcats = alternatives.map(alt => {
      // Remove text in parentheses
      return alt.replace(/\([^)]*\)/g, '').trim();
    }).filter(s => s.length > 0);
    
    if (cleanedSubcats.length > 0) {
      slots.push({
        slot_name,
        allowed_subcategories: cleanedSubcats,
        required: true
      });
    }
  });
  
  // Always add bottoms and shoes if not already present
  const hasBottoms = slots.some(s => s.slot_name.includes('bottom'));
  const hasShoes = slots.some(s => s.slot_name.includes('shoe'));
  
  if (!hasBottoms) {
    slots.push({
      slot_name: 'bottoms',
      allowed_subcategories: ['Jeans', 'Chinos', 'Trousers', 'Pants'],
      required: true
    });
  }
  
  if (!hasShoes) {
    slots.push({
      slot_name: 'shoes',
      allowed_subcategories: ['Sneakers', 'Boots', 'Loafers', 'Oxfords', 'Brogues'],
      required: true
    });
  }
  
  return slots;
}

async function autoMigrateTemplates() {
  console.log('🤖 Starting AUTOMATIC template migration...\n');
  
  // 1. Read layering-templates.json
  const jsonPath = join(process.cwd(), 'src/data/layering-templates.json');
  const rawData = readFileSync(jsonPath, 'utf-8');
  const templates: RawTemplate[] = JSON.parse(rawData);
  
  console.log(`📄 Loaded ${templates.length} templates from JSON\n`);
  
  // 2. Generate slots for each template
  const migratedTemplates = templates.map(template => {
    const slots = parseDescriptionToSlots(template.description, template.required_layers);
    
    console.log(`📋 ${template.name}`);
    console.log(`   Description: ${template.description}`);
    console.log(`   Generated Slots:`);
    slots.forEach(slot => {
      console.log(`      - ${slot.slot_name}: [${slot.allowed_subcategories.join(', ')}]`);
    });
    console.log('');
    
    return {
      name: template.name,
      slots
    };
  });
  
  // 3. Update database
  console.log('\n💾 Updating database...\n');
  
  let successCount = 0;
  let errorCount = 0;
  let notFoundCount = 0;
  
  for (const template of migratedTemplates) {
    // First check if template exists
    const { data: existing, error: checkError } = await supabase
      .from('layering_templates')
      .select('name')
      .eq('name', template.name)
      .maybeSingle();
    
    if (checkError) {
      console.error(`❌ Error checking "${template.name}":`, checkError.message);
      errorCount++;
      continue;
    }
    
    if (!existing) {
      console.warn(`⚠️  Template "${template.name}" not found in database - skipping`);
      notFoundCount++;
      continue;
    }
    
    // Template exists, update it
    const { error } = await supabase
      .from('layering_templates')
      .update({ slots: template.slots as any })
      .eq('name', template.name);
      
    if (error) {
      console.error(`❌ Failed: ${template.name} - ${error.message}`);
      errorCount++;
    } else {
      console.log(`✅ Updated: ${template.name}`);
      successCount++;
    }
  }
  
  console.log(`\n📊 Migration Complete:`);
  console.log(`   ✅ Success: ${successCount}/${templates.length}`);
  console.log(`   ⚠️  Not Found: ${notFoundCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);
  
  if (errorCount === 0) {
    console.log('\n🎉 ALL TEMPLATES MIGRATED SUCCESSFULLY!');
  }
}

// Run if executed directly
if (require.main === module) {
  autoMigrateTemplates()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('❌ Migration failed:', err);
      process.exit(1);
    });
}

export { autoMigrateTemplates };
