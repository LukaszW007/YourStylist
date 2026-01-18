-- Migration: Extract brand from notes column
-- Background: Legacy data stored brand as "Brand: X" in notes field
-- Goal: Move to dedicated brand column and clean up notes

-- Step 1: Extract brand from notes and populate brand column
UPDATE garments
SET brand = TRIM(SUBSTRING(notes FROM 'Brand:\s*(.+?)(?:\s*\||$)'))
WHERE notes LIKE 'Brand:%' AND (brand IS NULL OR brand = '');

-- Step 2: Remove "Brand: X" portion from notes
-- Pattern: "Brand: X | other" → "other"
-- Pattern: "Brand: X" → NULL
UPDATE garments
SET notes = CASE
  -- If notes only contains brand, set to NULL
  WHEN notes ~ '^Brand:\s*[^|]+$' THEN NULL
  -- If brand is at start with other content, remove it
  WHEN notes ~ '^Brand:\s*[^|]+\|' THEN 
    TRIM(REGEXP_REPLACE(notes, '^Brand:\s*[^|]+\|\s*', ''))
  -- If brand is in middle or end, remove it
  WHEN notes ~ '\|?\s*Brand:\s*[^|]+' THEN
    TRIM(REGEXP_REPLACE(notes, '\|?\s*Brand:\s*[^|]+', ''))
  ELSE notes
END
WHERE notes LIKE '%Brand:%';

-- Step 3: Clean up any remaining artifacts
UPDATE garments
SET notes = NULL
WHERE notes = '' OR notes ~ '^\s*$';

-- Step 4: Add index on brand for faster queries
CREATE INDEX IF NOT EXISTS idx_garments_brand ON garments(brand);

-- Add comment
COMMENT ON COLUMN garments.brand IS 'Brand name extracted from legacy notes field';
COMMENT ON COLUMN garments.notes IS 'Additional notes (brand info moved to dedicated column)';
