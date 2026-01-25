-- Manual insertion of new belt matching rules
-- Run this in Supabase SQL Editor

-- Insert new prohibition rules for belt-shoe matching
INSERT INTO compatibility_rules (rule_type, trigger_value, allowed_values, error_message)
VALUES 
(
  'prohibition',
  'Black Belt + Brown Shoes',
  '{}',
  'NEVER wear a black belt with brown shoes. Belt and shoes MUST match color. Black with black, brown with brown.'
),
(
  'prohibition',
  'Brown Belt + Black Shoes',
  '{}',
  'NEVER wear a brown belt with black shoes. Belt and shoes MUST match color. Black with black, brown with brown.'
),
(
  'style_advice',
  'Brown Belt + Brown Shoes',
  ARRAY['Match Tone'],
  'When wearing brown belt with brown shoes, try to match tone: warm brown with warm, cool brown with cool.'
)
ON CONFLICT DO NOTHING;

-- Verify insertion
SELECT * FROM compatibility_rules 
WHERE trigger_value LIKE '%Belt%' 
ORDER BY created_at DESC 
LIMIT 5;
