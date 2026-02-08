-- Migration: Add style_preferences column to user_preferences table
-- Date: 2026-02-08
-- Description: Allows users to select up to 3 preferred styles for outfit generation

ALTER TABLE user_preferences 
ADD COLUMN IF NOT EXISTS style_preferences text[] 
DEFAULT ARRAY['Casual/streetwear/workwear', 'Smart casual', 'Business casual'];

-- Add check constraint to ensure max 3 styles
ALTER TABLE user_preferences 
ADD CONSTRAINT style_preferences_max_3 
CHECK (array_length(style_preferences, 1) <= 3);

COMMENT ON COLUMN user_preferences.style_preferences IS 'User-selected style preferences (max 3) from 8 defined styles';
