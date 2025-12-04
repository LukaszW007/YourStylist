-- Migration: Wrap auth.uid() calls in SELECT to optimize RLS function evaluation
-- Applies only if policies already exist.

DO $$
BEGIN
  -- Drop and recreate policies with SELECT wrappers (cannot ALTER POLICY expression directly before PG15)
  DROP POLICY IF EXISTS "Users can view own garments" ON garments;
  CREATE POLICY "Users can view own garments"
    ON garments FOR SELECT
    USING ((user_id = (SELECT auth.uid())));

  DROP POLICY IF EXISTS "Users can insert own garments" ON garments;
  CREATE POLICY "Users can insert own garments"
    ON garments FOR INSERT
    WITH CHECK ((user_id = (SELECT auth.uid())));

  DROP POLICY IF EXISTS "Users can update own garments" ON garments;
  CREATE POLICY "Users can update own garments"
    ON garments FOR UPDATE
    USING ((user_id = (SELECT auth.uid())));

  DROP POLICY IF EXISTS "Users can delete own garments" ON garments;
  CREATE POLICY "Users can delete own garments"
    ON garments FOR DELETE
    USING ((user_id = (SELECT auth.uid())));
END$$;

-- Ensure index for user_id exists (already created in initial migration; recreate defensively)
CREATE INDEX IF NOT EXISTS idx_garments_user_id ON garments(user_id);