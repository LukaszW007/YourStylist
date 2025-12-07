-- Migration: Add Layering System to Garments
-- This migration introduces a layering system to better categorize garments for outfit generation.
-- 1. Creates a new ENUM type 'layer_type'.
-- 2. Adds a 'layer_type' column to the 'garments' table.
-- 3. Populates the new 'layer_type' column based on existing 'category' and 'subcategory' values.

-- Step 1: Create the ENUM type for layer_type
CREATE TYPE layer_type AS ENUM ('base', 'mid', 'outer', 'bottom', 'shoes', 'accessory');

-- Step 2: Add the 'layer_type' column to the 'garments' table
-- Wrapped in a transaction to ensure it only runs if the column doesn't exist.
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'garments' AND column_name = 'layer_type'
  ) THEN
    ALTER TABLE public.garments ADD COLUMN layer_type layer_type;
  END IF;
END $$;

-- Step 3: Populate the 'layer_type' column based on 'category' and 'subcategory'
-- This query categorizes garments into layers. It's designed to be idempotent.
UPDATE garments
SET layer_type = CASE
  -- Direct category mappings
  WHEN category = 'outerwear' THEN 'outer'::layer_type
  WHEN category = 'bottoms' THEN 'bottom'::layer_type
  WHEN category = 'shoes' THEN 'shoes'::layer_type
  WHEN category = 'accessories' THEN 'accessory'::layer_type
  
  -- Conditional mapping for 'Tops' based on 'subcategory'
  WHEN category = 'tops' AND lower(subcategory) IN (
    't-shirt', 'shirt', 'polo shirt', 'blouse', 'tank top', 'henley', 'bodysuit', 'long-sleeve', 'camisole'
  ) THEN 'base'::layer_type
  
  WHEN category = 'tops' AND lower(subcategory) IN (
    'sweater', 'hoodie', 'sweatshirt', 'cardigan', 'fleece', 'vest', 'jumper', 'pullover', 'turtleneck'
  ) THEN 'mid'::layer_type
  
  -- Default for any 'tops' that don't match the subcategory lists (can be adjusted)
  WHEN category = 'tops' THEN 'base'::layer_type

  -- Keep existing value if already set (for rerunning the script)
  ELSE layer_type
END;

-- Add an index for faster filtering on layer_type
CREATE INDEX IF NOT EXISTS idx_garments_layer_type ON garments(layer_type);
