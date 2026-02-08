-- Migration: Update Layering Templates with New Combinations
-- Date: 2026-02-05
-- Description: Updates layering_templates table with new templates:
--   - 4 Layer Style with Troyer
--   - 4 Layer Style with Blazer + Gilet
--   - 2 Layer Style with Polo + Blazer
-- Source: src/data/new_layering_templates.json

-- Clear existing templates
DELETE FROM layering_templates WHERE id > 0;

-- Reset sequence (optional, for clean IDs)
ALTER SEQUENCE layering_templates_id_seq RESTART WITH 1;

-- Insert all templates from new_layering_templates.json
-- Note: This includes both existing and new templates

-- 4 Layer Style (<0°C) - Original with split mid_layer slots
INSERT INTO layering_templates (name, min_temp_c, max_temp_c, layer_count, slots, description) VALUES
(
  '4 Layer Style (<0°C)',
  -50,
  0,
  4,
  '[
    {
      "slot_name": "base_layer",
      "allowed_subcategories": ["White T-shirt", "Undershirt"],
      "required": true,
      "tucked_in": "always",
      "buttoning": "n/a"
    },
    {
      "slot_name": "shirt_layer",
      "allowed_subcategories": ["Cotton Shirt"],
      "required": true,
      "tucked_in": "always",
      "buttoning": "one_button_undone"
    },
    {
      "slot_name": "mid_layer",
      "allowed_subcategories": ["Sweater", "Cardigan"],
      "required": true,
      "tucked_in": "never",
      "buttoning": "buttoned"
    },
    {
      "slot_name": "mid_layer",
      "allowed_subcategories": ["Blazer"],
      "required": true,
      "tucked_in": "never",
      "buttoning": "buttoned"
    },
    {
      "slot_name": "outer_layer",
      "allowed_subcategories": ["Parka", "Overcoat", "Pea Coat"],
      "required": true,
      "tucked_in": "never",
      "buttoning": "n/a"
    }
  ]'::jsonb,
  'White T-shirt/Undershirt + Cotton Shirt + Sweater/Cardigan/Shawl Cardigan/Blazer + Winter Outerwear'
);

-- 4 Layer Style (<0°C) - Duplicate with full options
INSERT INTO layering_templates (name, min_temp_c, max_temp_c, layer_count, slots, description) VALUES
(
  '4 Layer Style (<0°C)',
  -50,
  0,
  4,
  '[
    {
      "slot_name": "base_layer",
      "allowed_subcategories": ["White T-shirt", "Undershirt"],
      "required": true,
      "tucked_in": "always",
      "buttoning": "n/a"
    },
    {
      "slot_name": "shirt_layer",
      "allowed_subcategories": ["Cotton Shirt"],
      "required": true,
      "tucked_in": "always",
      "buttoning": "one_button_undone"
    },
    {
      "slot_name": "mid_layer",
      "allowed_subcategories": ["Sweater", "Cardigan", "Shawl Cardigan", "Blazer"],
      "required": true,
      "tucked_in": "never",
      "buttoning": "buttoned"
    },
    {
      "slot_name": "outer_layer",
      "allowed_subcategories": ["Winter Outerwear", "Parka", "Overcoat", "Pea Coat"],
      "required": true,
      "tucked_in": "never",
      "buttoning": "n/a"
    }
  ]'::jsonb,
  'White T-shirt/Undershirt + Cotton Shirt + Sweater/Cardigan/Shawl Cardigan/Blazer + Winter Outerwear'
);

-- NEW: 4 Layer Style (<0°C) - Troyer
INSERT INTO layering_templates (name, min_temp_c, max_temp_c, layer_count, slots, description) VALUES
(
  '4 Layer Style (<0°C) - troyer',
  -50,
  0,
  4,
  '[
    {
      "slot_name": "base_layer",
      "allowed_subcategories": ["White T-shirt", "Undershirt"],
      "required": true,
      "tucked_in": "always",
      "buttoning": "n/a"
    },
    {
      "slot_name": "turtleneck_layer",
      "allowed_subcategories": ["Turtleneck"],
      "required": true,
      "tucked_in": "always",
      "buttoning": "n/a"
    },
    {
      "slot_name": "mid_layer",
      "allowed_subcategories": ["Troyer"],
      "required": true,
      "tucked_in": "optional",
      "buttoning": "unzipped"
    },
    {
      "slot_name": "outer_layer",
      "allowed_subcategories": ["Winter Outerwear", "Parka", "Overcoat", "Pea Coat"],
      "required": true,
      "tucked_in": "never",
      "buttoning": "n/a"
    }
  ]'::jsonb,
  'White T-shirt/Undershirt + Turtleneck + Troyer + Winter Outerwear'
);

-- NEW: 4 Layer Style (5°C+) - Blazer with Gilet
INSERT INTO layering_templates (name, min_temp_c, max_temp_c, layer_count, slots, description) VALUES
(
  '4 Layer Style (5°C+) - blazer with gilet',
  5,
  15,
  4,
  '[
    {
      "slot_name": "base_layer",
      "allowed_subcategories": ["White T-shirt", "Undershirt"],
      "required": true,
      "tucked_in": "always",
      "buttoning": "n/a"
    },
    {
      "slot_name": "shirt_layer",
      "allowed_subcategories": ["Cotton Shirt"],
      "required": true,
      "tucked_in": "always",
      "buttoning": "always_one_undone"
    },
    {
      "slot_name": "mid_layer",
      "allowed_subcategories": ["Blazer"],
      "required": true,
      "tucked_in": "never",
      "buttoning": "buttoned"
    },
    {
      "slot_name": "outer_layer",
      "allowed_subcategories": ["Gilet"],
      "required": true,
      "tucked_in": "never",
      "buttoning": "n/a"
    }
  ]'::jsonb,
  'White T-shirt/Undershirt + Cotton Shirt + Blazer + Gilet'
);

-- NEW: 2 Layer Style (17°C+) - Polo + Blazer
INSERT INTO layering_templates (name, min_temp_c, max_temp_c, layer_count, slots, description) VALUES
(
  '2 Layer Style (17°C+) - Polo + blazer',
  17,
  30,
  2,
  '[
    {
      "slot_name": "base_layer",
      "allowed_subcategories": ["Polo"],
      "required": true,
      "tucked_in": "always",
      "buttoning": "always_one_undone"
    },
    {
      "slot_name": "outer_layer",
      "allowed_subcategories": ["Blazer"],
      "required": true,
      "tucked_in": "never",
      "buttoning": "n/a"
    }
  ]'::jsonb,
  'Polo + Blazer Seersucker/Blazer Merino fresco'
);

-- Verify insertion
SELECT 
  id,
  name,
  min_temp_c,
  max_temp_c,
  layer_count,
  jsonb_array_length(slots) as slot_count
FROM layering_templates
WHERE name IN (
  '4 Layer Style (<0°C) - troyer',
  '4 Layer Style (5°C+) - blazer with gilet',
  '2 Layer Style (17°C+) - Polo + blazer'
)
ORDER BY min_temp_c DESC, name;
