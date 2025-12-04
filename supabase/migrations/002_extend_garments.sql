-- Migration: extend garments with AI-derived fields and laundering date
-- Executes only if columns do not already exist

ALTER TABLE garments
  ADD COLUMN IF NOT EXISTS style_context TEXT,
  ADD COLUMN IF NOT EXISTS main_color_name TEXT,
  ADD COLUMN IF NOT EXISTS main_color_hex TEXT,
  ADD COLUMN IF NOT EXISTS secondary_colors JSONB,
  ADD COLUMN IF NOT EXISTS pattern TEXT,
  ADD COLUMN IF NOT EXISTS key_features TEXT[],
  ADD COLUMN IF NOT EXISTS material_guess TEXT,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS last_laundered_date DATE;

-- Optional indexes for frequently queried new fields
CREATE INDEX IF NOT EXISTS idx_garments_style_context ON garments(style_context);
CREATE INDEX IF NOT EXISTS idx_garments_pattern ON garments(pattern);