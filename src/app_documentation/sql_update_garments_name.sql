-- =====================================================
-- SQL Script: Update garments.name to full descriptive name
-- Purpose: Enable slot matching by checking if name.includes(allowed_subcategory)
-- 
-- New format: "{name} {subcategory} {material[0]} {sleeve_length}"
-- Example: "white v-neck t-shirt cotton long-sleeve"
-- 
-- Run this ONCE in Supabase SQL Editor
-- =====================================================

-- Update name to include full descriptive info (lowercase for matching)
UPDATE garments
SET name = LOWER(
  TRIM(
    CONCAT_WS(' ',
      -- Original name
      name,
      -- Subcategory
      subcategory,
      -- First material from array (if exists)
      CASE 
        WHEN material IS NOT NULL AND array_length(material, 1) > 0 
        THEN material[1]
        ELSE NULL
      END,
      -- Sleeve length (only if not 'none')
      CASE 
        WHEN sleeve_length IS NOT NULL AND sleeve_length != 'none'
        THEN sleeve_length
        ELSE NULL
      END
    )
  )
);

-- Verify results (run this SELECT after UPDATE to check)
-- SELECT id, name, subcategory, material, sleeve_length 
-- FROM garments 
-- LIMIT 20;
