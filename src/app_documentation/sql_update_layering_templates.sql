-- =====================================================
-- SQL Script: Update layering_templates in Supabase
-- Purpose: Apply changes from new_layering_templates.json
-- 
-- Run this in Supabase SQL Editor
-- =====================================================

-- Update 1: "4 Layer Style (5°C+) - Turtle + Vest" - max_temp changed 20 → 15
UPDATE layering_templates
SET max_temp_c = 15
WHERE name = '4 Layer Style (5°C+) - Turtle + Vest';

-- Update 2: "3 Layer Style (10°C+) - Flannel" - max_temp changed 20 → 18
UPDATE layering_templates
SET max_temp_c = 18
WHERE name = '3 Layer Style (10°C+) - Flannel';

-- Update 3: "4 Layer Style (<0°C)" - Add "Thin Wool Shirt" to shirt_layer
-- This updates the JSONB slots array
UPDATE layering_templates
SET slots = (
  SELECT jsonb_agg(
    CASE 
      WHEN slot->>'slot_name' = 'shirt_layer' 
      THEN jsonb_set(
        slot, 
        '{allowed_subcategories}', 
        '["Cotton Shirt", "Thin Wool Shirt"]'::jsonb
      )
      ELSE slot
    END
  )
  FROM jsonb_array_elements(slots) AS slot
)
WHERE name = '4 Layer Style (<0°C)';

-- Verify updates (run these SELECTs after UPDATE)
-- SELECT name, min_temp_c, max_temp_c FROM layering_templates 
-- WHERE name IN ('4 Layer Style (5°C+) - Turtle + Vest', '3 Layer Style (10°C+) - Flannel');

-- SELECT name, slots FROM layering_templates WHERE name = '4 Layer Style (<0°C)';
