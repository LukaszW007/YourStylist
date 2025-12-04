-- Add thermal comfort fields and color family
DO $$ BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'garments' AND column_name = 'comfort_min_c'
  ) THEN
    ALTER TABLE public.garments ADD COLUMN comfort_min_c INT;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'garments' AND column_name = 'comfort_max_c'
  ) THEN
    ALTER TABLE public.garments ADD COLUMN comfort_max_c INT;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'garments' AND column_name = 'thermal_profile'
  ) THEN
    ALTER TABLE public.garments ADD COLUMN thermal_profile TEXT;
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' AND table_name = 'garments' AND column_name = 'color_family'
  ) THEN
    ALTER TABLE public.garments ADD COLUMN color_family TEXT;
  END IF;
END $$;
