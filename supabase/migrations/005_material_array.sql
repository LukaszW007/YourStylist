-- Migration: introduce array-based material column replacing material_guess
-- 1. Add new material column as TEXT[] if not exists
ALTER TABLE garments ADD COLUMN IF NOT EXISTS material TEXT[];

-- 2. Migrate single material_guess values into material array where material is NULL
UPDATE garments SET material = ARRAY[material_guess] WHERE material IS NULL AND material_guess IS NOT NULL;

-- 3. Optional: If some legacy 'tags' contained material info but material_guess was null you could enrich here (left for future)
-- UPDATE garments SET material = ARRAY[tags[1]] WHERE material IS NULL AND tags && ARRAY['Cotton','Denim','Wool','Leather','Linen','Silk','Synthetic','Polyester','Nylon','Fleece','Suede','Canvas','Blend'];

-- 4. Drop material_guess column (only after successful migration)
ALTER TABLE garments DROP COLUMN IF EXISTS material_guess;
