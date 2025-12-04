# Supabase Garments Table Fix Guide

## Problem

Error: `Could not find the table 'public.garments' in the schema cache`

## Possible Causes

1. Migration was not run on Supabase
2. Schema cache needs refresh
3. RLS policies are misconfigured
4. Table exists but API can't see it

## Solution Steps

### Option 1: Run Migration Manually in Supabase Dashboard

1. Go to your Supabase Dashboard: https://bgxkroyixepstktekokt.supabase.co
2. Navigate to **SQL Editor**
3. Copy and paste the following SQL:

```sql
-- Check if table exists
SELECT EXISTS (
  SELECT FROM information_schema.tables
  WHERE table_schema = 'public'
  AND table_name = 'garments'
);

-- If false, create the table
CREATE TABLE IF NOT EXISTS public.garments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('tops', 'bottoms', 'shoes', 'outerwear', 'accessories', 'underwear', 'other')),
  subcategory TEXT,
  brand TEXT,
  color TEXT,
  season TEXT[],
  size TEXT,
  material TEXT,
  image_url TEXT,
  image_storage_path TEXT,
  purchase_date DATE,
  purchase_price DECIMAL(10, 2),
  purchase_location TEXT,
  last_worn_date DATE,
  wear_count INTEGER DEFAULT 0,
  favorite BOOLEAN DEFAULT false,
  notes TEXT,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_garments_user_id ON public.garments(user_id);
CREATE INDEX IF NOT EXISTS idx_garments_category ON public.garments(category);
CREATE INDEX IF NOT EXISTS idx_garments_last_worn ON public.garments(last_worn_date);

-- Enable RLS
ALTER TABLE public.garments ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view own garments" ON public.garments;
DROP POLICY IF EXISTS "Users can insert own garments" ON public.garments;
DROP POLICY IF EXISTS "Users can update own garments" ON public.garments;
DROP POLICY IF EXISTS "Users can delete own garments" ON public.garments;

-- Create RLS policies
CREATE POLICY "Users can view own garments"
  ON public.garments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own garments"
  ON public.garments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own garments"
  ON public.garments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own garments"
  ON public.garments FOR DELETE
  USING (auth.uid() = user_id);

-- Grant permissions
GRANT ALL ON public.garments TO authenticated;
GRANT ALL ON public.garments TO service_role;

-- Refresh schema cache
NOTIFY pgrst, 'reload schema';
```

4. Click **Run** to execute

### Option 2: Use Supabase CLI (if installed)

```bash
# Reset local database
supabase db reset

# Or push migrations
supabase db push
```

### Option 3: Refresh Schema Cache via API

Run this SQL in Supabase SQL Editor:

```sql
-- Force schema cache reload
NOTIFY pgrst, 'reload schema';

-- Check table exists and is accessible
SELECT
  schemaname,
  tablename,
  tableowner
FROM pg_tables
WHERE tablename = 'garments';

-- Check RLS policies
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'garments';
```

### Option 4: Quick Test Insert (after running Option 1)

```sql
-- Test insert (replace with your user ID)
INSERT INTO public.garments (user_id, name, category, color, image_url)
VALUES (
  auth.uid(), -- Current user
  'Test Shirt',
  'tops',
  'Blue',
  'https://example.com/image.jpg'
);

-- Verify
SELECT * FROM public.garments WHERE user_id = auth.uid();
```

## Verification

After running the fix, verify in your app:

1. Restart Next.js dev server:

```bash
npm run dev
```

2. Try uploading an image via the scanner
3. Check browser console for errors
4. Check Supabase Dashboard → Table Editor → `garments` table

## Alternative: Temporary Bypass (for testing only)

If you want to test without RLS temporarily:

```sql
-- WARNING: Only for testing! This removes security!
ALTER TABLE public.garments DISABLE ROW LEVEL SECURITY;
```

Then re-enable after testing:

```sql
ALTER TABLE public.garments ENABLE ROW LEVEL SECURITY;
```

## Common Issues

### Issue: "permission denied for table garments"

**Solution:** Run the GRANT statements above

### Issue: "new row violates row-level security policy"

**Solution:** Make sure user is authenticated and RLS policies are correct

### Issue: Table exists but still can't see it

**Solution:** Run `NOTIFY pgrst, 'reload schema';`

## Next Steps

1. Run **Option 1** SQL in Supabase Dashboard
2. Restart your Next.js dev server
3. Test the scanner again
4. If still not working, check Supabase logs in Dashboard

## Need More Help?

Check:

-   Supabase Dashboard → Logs
-   Browser Console (F12)
-   Network tab for API request details
