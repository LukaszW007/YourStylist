-- =====================================================
-- SQL Migration: Add AI_description column to garments
-- Purpose: Store detailed visual descriptions optimized for FLUX.2Dev image generation
-- 
-- Run this in Supabase SQL Editor
-- =====================================================

-- Add AI_description column
ALTER TABLE garments 
ADD COLUMN IF NOT EXISTS AI_description TEXT;

-- Add comment for documentation
COMMENT ON COLUMN garments.AI_description IS 'Detailed visual description optimized for FLUX.2Dev AI image generation. Format: [Color + Material/Texture] [Item] featuring [Secondary Details]. Example: "Tan rough-out suede hiking boots featuring navy mesh panels and black outsole with white speckles."';

-- Optional: Add index if we plan to search by description (not needed initially)
-- CREATE INDEX IF NOT EXISTS idx_garments_ai_description ON garments USING gin(to_tsvector('english', AI_description));

-- Verify column creation
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns
WHERE table_name = 'garments' AND column_name = 'AI_description';

-- Check current population (should be all NULL initially)
SELECT 
  COUNT(*) as total_garments,
  COUNT(AI_description) as with_descriptions,
  ROUND(COUNT(AI_description)::numeric / COUNT(*) * 100, 2) as coverage_percent
FROM garments;
