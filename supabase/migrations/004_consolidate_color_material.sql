-- Migration: Consolidate color/material columns
-- Migrate data from old columns (color, material) to new AI columns (main_color_name, material_guess)
-- Then drop the deprecated columns

-- Step 1: Migrate existing data
UPDATE garments 
SET main_color_name = color 
WHERE main_color_name IS NULL AND color IS NOT NULL;

UPDATE garments 
SET material_guess = material 
WHERE material_guess IS NULL AND material IS NOT NULL;

-- Step 2: Drop deprecated columns
ALTER TABLE garments 
  DROP COLUMN IF EXISTS color,
  DROP COLUMN IF EXISTS material;

-- Note: Indexes and policies reference user_id and other fields, not color/material, so no changes needed there.
