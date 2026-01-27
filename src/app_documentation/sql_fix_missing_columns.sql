-- =========================================================
-- Quick Fix: Add ai_description and sleeve_length columns
-- =========================================================

-- Add ai_description column (lowercase)
ALTER TABLE garments 
ADD COLUMN IF NOT EXISTS ai_description TEXT;

-- Add sleeve_length column  
ALTER TABLE garments 
ADD COLUMN IF NOT EXISTS sleeve_length TEXT 
CHECK (sleeve_length IN ('short-sleeve', 'long-sleeve', 'none'));

-- Set default for existing rows
UPDATE garments 
SET sleeve_length = 'none' 
WHERE sleeve_length IS NULL;

-- Verify columns exist
SELECT column_name, data_type, is_nullable 
FROM information_schema.columns
WHERE table_name = 'garments' 
AND column_name IN ('ai_description', ' sleeve_length', 'full_name');

-- Check counts
SELECT 
  COUNT(*) as total_garments,
  COUNT(ai_description) as with_ai_desc,
  COUNT(sleeve_length) as with_sleeve,
  COUNT(full_name) as with_full_name
FROM garments;
