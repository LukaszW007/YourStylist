-- Direct SQL migration for slots
-- Run this in Supabase SQL Editor if TypeScript script fails

-- Example: Update "3 Layer Style (10°C+) - Polo"
UPDATE layering_templates
SET slots = '[
  {
    "slot_name": "base_layer",
    "allowed_subcategories": ["Polo"],
    "required": true
  },
  {
    "slot_name": "mid_layer",
    "allowed_subcategories": ["Cardigan", "Shawl Cardigan"],
    "required": true
  },
  {
    "slot_name": "outer_layer",
    "allowed_subcategories": ["Harrington", "Bomber", "Denim Jacket", "Quilted Jacket", "Trench", "Field Jacket", "Waxed Jacket"],
    "required": true
  },
  {
    "slot_name": "bottoms",
    "allowed_subcategories": ["Jeans", "Chinos", "Trousers"],
    "required": true
  },
  {
    "slot_name": "shoes",
    "allowed_subcategories": ["Sneakers", "Loafers", "Boots", "Chelsea Boots"],
    "required": true
  }
]'::jsonb
WHERE name = '3 Layer Style (10°C+) - Polo';

-- Verify
SELECT name, slots FROM layering_templates WHERE slots IS NOT NULL;
