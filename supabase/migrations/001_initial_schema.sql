-- ============================================================
-- WARDROBEAI DATABASE SCHEMA
-- ============================================================
-- This migration creates all necessary tables for the WardrobeAI application
-- Tables: user_profiles, user_preferences, garments, outfits, outfit_plans
-- ============================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================================
-- 1. USER PROFILES TABLE
-- ============================================================
-- Extends Supabase auth.users with additional user information
-- Stores: display name, avatar URL, member since date
-- ============================================================
CREATE TABLE IF NOT EXISTS user_profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  member_since TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own profile
CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  USING (auth.uid() = id);

-- Policy: Users can update their own profile
CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  USING (auth.uid() = id);

-- Policy: Users can insert their own profile
CREATE POLICY "Users can insert own profile"
  ON user_profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- ============================================================
-- 2. USER PREFERENCES TABLE
-- ============================================================
-- Stores user settings and preferences
-- Data: language preference, theme (dark/light), notifications, etc.
-- ============================================================
CREATE TABLE IF NOT EXISTS user_preferences (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  language TEXT DEFAULT 'en' CHECK (language IN ('en', 'pl', 'no')),
  theme TEXT DEFAULT 'light' CHECK (theme IN ('light', 'dark')),
  email_notifications BOOLEAN DEFAULT true,
  push_notifications BOOLEAN DEFAULT true,
  weather_location TEXT, -- e.g., "San Francisco, CA"
  weather_location_lat DECIMAL(10, 8),
  weather_location_lng DECIMAL(11, 8),
  subscription_plan TEXT DEFAULT 'free' CHECK (subscription_plan IN ('free', 'premium', 'elite')),
  subscription_expires_at TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read their own preferences
CREATE POLICY "Users can view own preferences"
  ON user_preferences FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can update their own preferences
CREATE POLICY "Users can update own preferences"
  ON user_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own preferences
CREATE POLICY "Users can insert own preferences"
  ON user_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- ============================================================
-- 3. GARMENTS TABLE
-- ============================================================
-- Stores clothing items in user's wardrobe
-- Data: name, category, brand, color, season, image, purchase info, etc.
-- ============================================================
CREATE TABLE IF NOT EXISTS garments (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  category TEXT NOT NULL CHECK (category IN ('tops', 'bottoms', 'shoes', 'outerwear', 'accessories', 'underwear', 'other')),
  subcategory TEXT, -- e.g., "t-shirt", "jeans", "sneakers"
  brand TEXT,
  color TEXT,
  season TEXT[], -- Array: ['spring', 'summer', 'fall', 'winter']
  size TEXT,
  material TEXT, -- e.g., "cotton", "wool", "polyester"
  image_url TEXT,
  image_storage_path TEXT, -- Path in Supabase Storage
  purchase_date DATE,
  purchase_price DECIMAL(10, 2),
  purchase_location TEXT,
  last_worn_date DATE,
  wear_count INTEGER DEFAULT 0,
  favorite BOOLEAN DEFAULT false,
  notes TEXT,
  tags TEXT[], -- Array of tags for filtering
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_garments_user_id ON garments(user_id);
CREATE INDEX IF NOT EXISTS idx_garments_category ON garments(category);
CREATE INDEX IF NOT EXISTS idx_garments_last_worn ON garments(last_worn_date);

-- Enable RLS
ALTER TABLE garments ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only access their own garments
CREATE POLICY "Users can view own garments"
  ON garments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own garments"
  ON garments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own garments"
  ON garments FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own garments"
  ON garments FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================
-- 4. OUTFITS TABLE
-- ============================================================
-- Stores saved outfit combinations
-- Data: name, description, garments included, occasion, rating
-- ============================================================
CREATE TABLE IF NOT EXISTS outfits (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  occasion TEXT, -- e.g., "business", "casual", "formal", "wedding"
  season TEXT,
  weather_condition TEXT,
  rating INTEGER CHECK (rating >= 1 AND rating <= 5),
  notes TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Junction table for outfit-garment relationship (many-to-many)
CREATE TABLE IF NOT EXISTS outfit_garments (
  outfit_id UUID NOT NULL REFERENCES outfits(id) ON DELETE CASCADE,
  garment_id UUID NOT NULL REFERENCES garments(id) ON DELETE CASCADE,
  PRIMARY KEY (outfit_id, garment_id)
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_outfits_user_id ON outfits(user_id);
CREATE INDEX IF NOT EXISTS idx_outfit_garments_outfit ON outfit_garments(outfit_id);
CREATE INDEX IF NOT EXISTS idx_outfit_garments_garment ON outfit_garments(garment_id);

-- Enable RLS
ALTER TABLE outfits ENABLE ROW LEVEL SECURITY;
ALTER TABLE outfit_garments ENABLE ROW LEVEL SECURITY;

-- Policies for outfits
CREATE POLICY "Users can view own outfits"
  ON outfits FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own outfits"
  ON outfits FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own outfits"
  ON outfits FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own outfits"
  ON outfits FOR DELETE
  USING (auth.uid() = user_id);

-- Policies for outfit_garments
CREATE POLICY "Users can view own outfit garments"
  ON outfit_garments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM outfits
      WHERE outfits.id = outfit_garments.outfit_id
      AND outfits.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can manage own outfit garments"
  ON outfit_garments FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM outfits
      WHERE outfits.id = outfit_garments.outfit_id
      AND outfits.user_id = auth.uid()
    )
  );

-- ============================================================
-- 5. OUTFIT PLANS TABLE
-- ============================================================
-- Stores weekly/monthly outfit planning
-- Data: planned outfits for specific dates
-- ============================================================
CREATE TABLE IF NOT EXISTS outfit_plans (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  outfit_id UUID NOT NULL REFERENCES outfits(id) ON DELETE CASCADE,
  planned_date DATE NOT NULL,
  notes TEXT,
  completed BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, outfit_id, planned_date)
);

-- Create index
CREATE INDEX IF NOT EXISTS idx_outfit_plans_user_date ON outfit_plans(user_id, planned_date);

-- Enable RLS
ALTER TABLE outfit_plans ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "Users can view own outfit plans"
  ON outfit_plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage own outfit plans"
  ON outfit_plans FOR ALL
  USING (auth.uid() = user_id);

-- ============================================================
-- 6. TRIGGERS FOR UPDATED_AT TIMESTAMP
-- ============================================================
-- Automatically update updated_at timestamp on row changes
-- ============================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_profiles_updated_at BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at BEFORE UPDATE ON user_preferences
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_garments_updated_at BEFORE UPDATE ON garments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_outfits_updated_at BEFORE UPDATE ON outfits
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_outfit_plans_updated_at BEFORE UPDATE ON outfit_plans
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- ============================================================
-- 7. FUNCTION TO AUTO-CREATE USER PROFILE AND PREFERENCES
-- ============================================================
-- Automatically creates user_profile and user_preferences when a new user signs up
-- ============================================================
CREATE OR REPLACE FUNCTION handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.user_profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', NEW.email));
  
  INSERT INTO public.user_preferences (user_id, language)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'language', 'en'));
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to run function on new user creation
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION handle_new_user();

