/**
 * Script: Ingest Layering Templates (NEW SLOTS FORMAT)
 * Source: data/new_layering_templates.json
 * Target: layering_templates table
 * Run: npx tsx src/scripts/ingest-templates.ts
 */

import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { readFile } from 'fs/promises';
import { resolve } from 'path';

dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
    auth: { autoRefreshToken: false, persistSession: false }
});

async function main() {
    console.log('🚀 Starting Templates Ingestion (NEW SLOTS FORMAT)...');

    try {
        // Use NEW template file with slots
        const jsonPath = resolve(process.cwd(), 'src/data/new_layering_templates.json');
        console.log(`📄 Reading from: ${jsonPath}`);
        
        const fileContent = await readFile(jsonPath, 'utf-8');
        const templates = JSON.parse(fileContent);

        console.log(`📦 Found ${templates.length} templates.`);

        // 1. Clear table
        console.log('🗑️  Clearing existing layering_templates...');
        const { error: deleteError } = await supabase
            .from('layering_templates')
            .delete()
            .gt('id', 0);

        if (deleteError) throw new Error(deleteError.message);

        // 2. Insert with NEW slots field
        const { error: insertError } = await supabase
            .from('layering_templates')
            .insert(templates.map((t: any) => ({
                name: t.name,
                min_temp_c: t.min_temp_c,
                max_temp_c: t.max_temp_c,
                layer_count: t.layer_count,
                
                // NEW FORMAT (strict slots with allowed_subcategories)
                slots: t.slots || null,
                
                description: t.description,
            })));

        if (insertError) throw new Error(insertError.message);

        console.log(`✅ DONE. Inserted ${templates.length} templates with slots.`);
        console.log(`   Example slot structure: ${JSON.stringify(templates[0].slots?.[0], null, 2)}`);

    } catch (error: any) {
        console.error('\n❌ ERROR:', error.message);
        process.exit(1);
    }
}

main();