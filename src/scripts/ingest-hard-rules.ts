/**
 * Script: Ingest Hard Rules into Supabase
 * Source: data/hard-rules-source.json
 * Target: compatibility_rules table
 * Run: npx tsx src/scripts/ingest-hard-rules.ts
 */

import * as dotenv from 'dotenv';
import { createClient } from '@supabase/supabase-js';
import { readFile } from 'fs/promises';
import { resolve } from 'path';

// Load env from .env.local
dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!SUPABASE_URL || !SUPABASE_SERVICE_KEY) {
    console.error('❌ Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in .env.local');
    process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function main() {
    console.log('🚀 Starting Hard Rules Ingestion...');

    try {
        const jsonPath = resolve(process.cwd(), 'src/data/hard-rules-source.json');
        console.log(`📄 Reading from: ${jsonPath}`);
        
        const fileContent = await readFile(jsonPath, 'utf-8');
        const rules = JSON.parse(fileContent);
        
        console.log(`📦 Found ${rules.length} rules to insert.`);

        // 1. Clear table safely (delete all rows where ID > 0)
        console.log('🗑️  Clearing existing compatibility_rules...');
        const { error: deleteError } = await supabase
            .from('compatibility_rules')
            .delete()
            .gt('id', 0); // Safe delete for all rows

        if (deleteError) {
            throw new Error(`Error clearing table: ${deleteError.message}`);
        }

        // 2. Insert in batches
        let successCount = 0;
        const batchSize = 50;
        
        for (let i = 0; i < rules.length; i += batchSize) {
            const batch = rules.slice(i, i + batchSize);
            
            const { error: insertError } = await supabase
                .from('compatibility_rules')
                .insert(batch.map((rule: any) => ({
                    rule_type: rule.rule_type,
                    trigger_value: rule.trigger_value,
                    allowed_values: rule.allowed_values,
                    error_message: rule.error_message,
                })));

            if (insertError) {
                console.error(`❌ Batch error: ${insertError.message}`);
            } else {
                successCount += batch.length;
                console.log(`  ✓ Inserted ${successCount}/${rules.length}`);
            }
        }

        console.log(`\n✅ DONE. Successfully inserted: ${successCount} rules.`);

    } catch (error: any) {
        console.error('\n❌ CRITICAL ERROR:', error.message);
        process.exit(1);
    }
}

main();