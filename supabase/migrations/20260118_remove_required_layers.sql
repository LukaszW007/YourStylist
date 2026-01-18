-- Migration: Remove deprecated required_layers column
-- After migrating to slots-based structure, required_layers is no longer needed

-- Step 1: Make column nullable first (for safety)
ALTER TABLE layering_templates 
ALTER COLUMN required_layers DROP NOT NULL;

-- Step 2: Drop the column
ALTER TABLE layering_templates 
DROP COLUMN required_layers;

-- Verify the change
COMMENT ON TABLE layering_templates IS 'Layering templates with strict slot-based validation. Use slots instead of deprecated required_layers.';
