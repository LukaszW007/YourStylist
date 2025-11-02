# Supabase Database Schema Documentation

## Overview

This document describes the database schema for the WardrobeAI application. The schema is designed to support user authentication, wardrobe management, outfit planning, and user preferences.

## Environment Variables Required

Add these to your `.env` or `.env.local` file:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key (optional, for server-side admin operations)
```

## Database Tables

### 1. `user_profiles`
**Purpose**: Extends Supabase auth.users with additional profile information.

**Columns**:
- `id` (UUID, PK, FK → auth.users): User's unique identifier
- `display_name` (TEXT): User's display name (e.g., "Emma Wilson")
- `avatar_url` (TEXT): URL to user's profile picture
- `member_since` (TIMESTAMP): When the user joined
- `created_at` (TIMESTAMP): Record creation time
- `updated_at` (TIMESTAMP): Last update time

**Use Cases**:
- Display user name in profile page
- Show "Member since" date
- Store avatar image URL

### 2. `user_preferences`
**Purpose**: Stores user settings and preferences.

**Columns**:
- `id` (UUID, PK): Unique identifier
- `user_id` (UUID, FK → auth.users): Reference to user
- `language` (TEXT): Preferred language ('en', 'pl', 'no') - Default: 'en'
- `theme` (TEXT): UI theme ('light', 'dark') - Default: 'light'
- `email_notifications` (BOOLEAN): Email notification preference
- `push_notifications` (BOOLEAN): Push notification preference
- `weather_location` (TEXT): User's location for weather (e.g., "San Francisco, CA")
- `weather_location_lat` (DECIMAL): Latitude for weather
- `weather_location_lng` (DECIMAL): Longitude for weather
- `subscription_plan` (TEXT): Plan type ('free', 'premium', 'elite') - Default: 'free'
- `subscription_expires_at` (TIMESTAMP): When subscription expires
- `created_at`, `updated_at`: Timestamps

**Use Cases**:
- Persist language selection from profile dropdown
- Save dark/light mode preference
- Store subscription information
- Remember weather location

### 3. `garments`
**Purpose**: Stores all clothing items in user's wardrobe.

**Columns**:
- `id` (UUID, PK): Unique identifier
- `user_id` (UUID, FK → auth.users): Owner of the garment
- `name` (TEXT, REQUIRED): Garment name (e.g., "Navy Wool Blazer")
- `category` (TEXT): Main category ('tops', 'bottoms', 'shoes', 'outerwear', 'accessories', 'underwear', 'other')
- `subcategory` (TEXT): Specific type (e.g., "t-shirt", "jeans")
- `brand` (TEXT): Brand name (e.g., "Hugo Boss")
- `color` (TEXT): Primary color
- `season` (TEXT[]): Array of seasons ['spring', 'summer', 'fall', 'winter']
- `size` (TEXT): Clothing size
- `material` (TEXT): Fabric/material type
- `image_url` (TEXT): URL to garment image
- `image_storage_path` (TEXT): Path in Supabase Storage
- `purchase_date` (DATE): When purchased
- `purchase_price` (DECIMAL): Purchase price
- `purchase_location` (TEXT): Where purchased
- `last_worn_date` (DATE): Last time worn
- `wear_count` (INTEGER): Number of times worn
- `favorite` (BOOLEAN): Is it a favorite item
- `notes` (TEXT): Additional notes
- `tags` (TEXT[]): Array of tags for filtering/search
- `created_at`, `updated_at`: Timestamps

**Use Cases**:
- Display wardrobe in grid/list view
- Filter by category, color, season, brand
- Track wear history
- Manage garment inventory

### 4. `outfits`
**Purpose**: Stores saved outfit combinations.

**Columns**:
- `id` (UUID, PK): Unique identifier
- `user_id` (UUID, FK → auth.users): Owner
- `name` (TEXT, REQUIRED): Outfit name
- `description` (TEXT): Outfit description
- `occasion` (TEXT): When to wear (e.g., "business", "casual", "wedding")
- `season` (TEXT): Season suitability
- `weather_condition` (TEXT): Weather appropriate for
- `rating` (INTEGER): User rating 1-5
- `notes` (TEXT): Additional notes
- `image_url` (TEXT): Outfit image
- `created_at`, `updated_at`: Timestamps

**Use Cases**:
- Save favorite outfit combinations
- Plan outfits for occasions
- Track outfit ratings

### 5. `outfit_garments` (Junction Table)
**Purpose**: Links outfits to garments (many-to-many relationship).

**Columns**:
- `outfit_id` (UUID, FK → outfits): Outfit reference
- `garment_id` (UUID, FK → garments): Garment reference
- PRIMARY KEY: (outfit_id, garment_id)

**Use Cases**:
- Associate multiple garments with one outfit
- Track which garments are used together

### 6. `outfit_plans`
**Purpose**: Stores planned outfits for specific dates.

**Columns**:
- `id` (UUID, PK): Unique identifier
- `user_id` (UUID, FK → auth.users): Owner
- `outfit_id` (UUID, FK → outfits): Planned outfit
- `planned_date` (DATE, REQUIRED): Date for the outfit
- `notes` (TEXT): Planning notes
- `completed` (BOOLEAN): Was the plan completed
- `created_at`, `updated_at`: Timestamps
- UNIQUE constraint: (user_id, outfit_id, planned_date)

**Use Cases**:
- Weekly outfit planning
- Plan outfits for special events
- Track completed plans

## Security (Row Level Security)

All tables have Row Level Security (RLS) enabled. Users can only:
- **View** their own data
- **Insert** data for themselves
- **Update** their own data
- **Delete** their own data

This ensures data privacy and security at the database level.

## Automatic Features

### Triggers
- **Auto-update `updated_at`**: All tables automatically update `updated_at` when a row is modified
- **Auto-create profile**: When a new user signs up via Supabase Auth, a `user_profile` and `user_preferences` record are automatically created

## Indexes

Indexes are created on frequently queried columns for performance:
- `garments`: user_id, category, last_worn_date
- `outfits`: user_id
- `outfit_plans`: user_id, planned_date
- `outfit_garments`: outfit_id, garment_id

## Migration Instructions

1. Go to your Supabase project dashboard
2. Navigate to SQL Editor
3. Copy and paste the contents of `supabase/migrations/001_initial_schema.sql`
4. Run the migration
5. Verify tables are created in the Table Editor

## Next Steps

After running the migration:
1. Configure Supabase Storage buckets for garment images
2. Set up email templates for authentication
3. Test the authentication flow
4. Test CRUD operations on all tables

