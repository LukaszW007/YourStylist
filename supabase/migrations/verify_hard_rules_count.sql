-- Check current count in compatibility_rules
SELECT COUNT(*) as current_rules_count FROM compatibility_rules;

-- This should show 100 rows currently
-- Expected: 131 rows (from hard-rules-source.json)
-- Missing: 31 rules

-- To update, run the TypeScript ingestion script:
-- npx tsx src/scripts/ingest-hard-rules.ts

-- OR manually verify which rules are missing with:
-- SELECT DISTINCT rule_type FROM compatibility_rules ORDER BY rule_type;

-- After ingestion, verify:
-- SELECT COUNT(*) FROM compatibility_rules;  -- Should be 131
