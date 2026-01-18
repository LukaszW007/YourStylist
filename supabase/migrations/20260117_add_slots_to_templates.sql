-- Add slots column to layering_templates table
-- This enables strict per-slot allowed subcategories instead of generic LAYER_SLOT_MAPPINGS

ALTER TABLE layering_templates 
ADD COLUMN IF NOT EXISTS slots JSONB;

-- Add comment explaining the new structure
COMMENT ON COLUMN layering_templates.slots IS 'Array of slot objects with slot_name, allowed_subcategories, and required flag. Example: [{"slot_name": "mid_layer", "allowed_subcategories": ["Cardigan", "Shawl Cardigan"], "required": true}]';

-- Create index for JSONB queries
CREATE INDEX IF NOT EXISTS idx_layering_templates_slots ON layering_templates USING GIN (slots);
