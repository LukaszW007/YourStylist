-- ================================================
-- Reset Hard Rules and Knowledge Tables
-- ================================================
-- This script drops and recreates the compatibility_rules
-- and knowledge_base tables with fresh data from JSON sources.
--
-- Usage:
-- 1. Run this SQL script in Supabase SQL Editor
-- 2. Run: npm run ingest-hard-rules
-- 3. Run: npm run ingest-knowledge (if script exists)
--
-- ================================================

-- Drop existing tables (CASCADE removes dependencies)
DROP TABLE IF EXISTS public.compatibility_rules CASCADE;
DROP TABLE IF EXISTS public.knowledge_base CASCADE;

-- Recreate compatibility_rules table
CREATE TABLE public.compatibility_rules (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    rule_type TEXT NOT NULL,
    trigger_value TEXT NOT NULL,
    allowed_values TEXT[] NOT NULL DEFAULT '{}',
    error_message TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Recreate knowledge_base table
CREATE TABLE public.knowledge_base (
    id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
    category TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Create indexes for performance
CREATE INDEX idx_compatibility_rules_type ON public.compatibility_rules(rule_type);
CREATE INDEX idx_compatibility_rules_trigger ON public.compatibility_rules(trigger_value);
CREATE INDEX idx_knowledge_base_category ON public.knowledge_base(category);

-- Enable Row Level Security (optional, adjust based on your needs)
ALTER TABLE public.compatibility_rules ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.knowledge_base ENABLE ROW LEVEL SECURITY;

-- Create RLS policies to allow public read access
CREATE POLICY "Allow public read access on compatibility_rules"
    ON public.compatibility_rules
    FOR SELECT
    USING (true);

CREATE POLICY "Allow public read access on knowledge_base"
    ON public.knowledge_base
    FOR SELECT
    USING (true);

-- Grant permissions (adjust based on your setup)
GRANT SELECT ON public.compatibility_rules TO anon, authenticated;
GRANT SELECT ON public.knowledge_base TO anon, authenticated;

-- Success message
SELECT 'Tables reset successfully. Run ingestion scripts to populate data.' as status;
