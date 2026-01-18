/**
 * Template Migration Script
 * Migrates layering templates from generic required_layers to strict slots
 */

import { createClient } from '@/lib/supabase/server';

// Example migration data - parse from descriptions
const SLOT_MIGRATIONS = [
  {
    name: "3 Layer Style (10°C+) - Polo",
    slots: [
      {
        slot_name: "base_layer",
        allowed_subcategories: ["Polo"],
        required: true
      },
      {
        slot_name: "mid_layer",
        allowed_subcategories: ["Cardigan", "Shawl Cardigan"],
        required: true
      },
      {
        slot_name: "outer_layer",
        allowed_subcategories: ["Harrington", "Bomber", "Denim Jacket", "Quilted Jacket", "Trench", "Field Jacket", "Waxed Jacket"],
        required: true
      }
    ]
  },
  {
    name: "3 Layer Style (10°C+) - Henley",
    slots: [
      {
        slot_name: "base_layer",
        allowed_subcategories: ["Henley"],
        required: true
      },
      {
        slot_name: "mid_layer",
        allowed_subcategories: ["Cardigan", "Shawl Cardigan"],
        required: true
      },
      {
        slot_name: "outer_layer",
        allowed_subcategories: ["Harrington", "Bomber", "Denim Jacket", "Quilted Jacket", "Trench", "Field Jacket", "Waxed Jacket", "Overshirt"],
        required: true
      }
    ]
  },
  // Add more templates as needed...
];

async function migrateTemplates() {
  console.log('🚀 Starting template migration...');
  
  const supabase = await createClient();
  let successCount = 0;
  let errorCount = 0;
  
  for (const template of SLOT_MIGRATIONS) {
    const { error } = await supabase
      .from('layering_templates')
      .update({ slots: template.slots as any })
      .eq('name', template.name);
      
    if (error) {
      console.error(`❌ Failed to migrate "${template.name}":`, error.message);
      errorCount++;
    } else {
      console.log(`✅ Migrated: ${template.name}`);
      successCount++;
    }
  }
  
  console.log(`\n📊 Migration Complete:`);
  console.log(`   ✅ Success: ${successCount}`);
  console.log(`   ❌ Errors: ${errorCount}`);
}

// Run if executed directly
if (require.main === module) {
  migrateTemplates()
    .then(() => process.exit(0))
    .catch((err) => {
      console.error('Migration failed:', err);
      process.exit(1);
    });
}

export { migrateTemplates };
