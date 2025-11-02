# Supabase Integration Implementation Guide

## Overview

This document explains the Supabase integration for WardrobeAI, including authentication, database schema, and data storage.

---

## 📋 What Was Implemented

### 1. **Database Schema** (`supabase/migrations/001_initial_schema.sql`)

Created 6 main tables with Row Level Security (RLS):

#### **user_profiles**
- **Purpose**: Extends Supabase auth.users with display name and avatar
- **Data Stored**: 
  - `display_name`: User's name (e.g., "Emma Wilson")
  - `avatar_url`: Profile picture URL
  - `member_since`: Account creation date
- **Auto-created**: Trigger automatically creates profile when user signs up

#### **user_preferences**
- **Purpose**: Stores user settings and preferences
- **Data Stored**:
  - `language`: Preferred language ('en', 'pl', 'no')
  - `theme`: UI theme ('light', 'dark')
  - `email_notifications`: Email notification preference
  - `push_notifications`: Push notification preference
  - `weather_location`: User's location for weather widget
  - `subscription_plan`: Current plan ('free', 'premium', 'elite')
  - `subscription_expires_at`: When subscription expires
- **Auto-created**: Trigger automatically creates preferences when user signs up

#### **garments**
- **Purpose**: Stores all clothing items in user's wardrobe
- **Data Stored**:
  - `name`: Garment name (e.g., "Navy Wool Blazer")
  - `category`: Main category ('tops', 'bottoms', 'shoes', 'outerwear', etc.)
  - `subcategory`: Specific type (e.g., "t-shirt", "jeans")
  - `brand`: Brand name (e.g., "Hugo Boss")
  - `color`: Primary color
  - `season`: Array of seasons ['spring', 'summer', 'fall', 'winter']
  - `size`, `material`: Additional details
  - `image_url`: URL to garment image
  - `purchase_date`, `purchase_price`, `purchase_location`: Purchase info
  - `last_worn_date`: Last time worn
  - `wear_count`: Number of times worn
  - `favorite`: Is it a favorite item
  - `notes`, `tags`: Additional metadata

#### **outfits**
- **Purpose**: Stores saved outfit combinations
- **Data Stored**:
  - `name`: Outfit name
  - `description`: Outfit description
  - `occasion`: When to wear (e.g., "business", "casual")
  - `season`, `weather_condition`: Context
  - `rating`: User rating 1-5
  - `image_url`: Outfit image

#### **outfit_garments** (Junction Table)
- **Purpose**: Links outfits to garments (many-to-many)
- **Data Stored**: `outfit_id`, `garment_id`

#### **outfit_plans**
- **Purpose**: Stores planned outfits for specific dates
- **Data Stored**:
  - `outfit_id`: Planned outfit
  - `planned_date`: Date for the outfit
  - `notes`: Planning notes
  - `completed`: Whether plan was completed

---

### 2. **Authentication Integration** (`src/lib/supabase/auth.ts`)

**Functions Created:**
- `signInWithEmail()`: Sign in with email/password
- `signUpWithEmail()`: Create new account with email/password
- `signInWithGoogle()`: OAuth sign in with Google
- `signOut()`: Sign out current user
- `getSession()`: Get current session
- `getCurrentUser()`: Get current user
- `onAuthStateChange()`: Listen to auth state changes

**What It Does:**
- Handles email/password authentication
- Supports Google OAuth
- Auto-creates user_profile and user_preferences on sign up
- Persists sessions across page reloads

---

### 3. **Database Queries** (`src/lib/supabase/queries.ts`)

**Functions Created:**

**User Profile:**
- `getUserProfile()`: Get user profile by ID
- `updateUserProfile()`: Update display name or avatar

**User Preferences:**
- `getUserPreferences()`: Get user preferences
- `updateUserPreferences()`: Update preferences (language, theme, etc.)

**Garments:**
- `getGarments()`: Get all garments with optional filters (category, color, season, brand)
- `createGarment()`: Create new garment
- `updateGarment()`: Update garment details
- `deleteGarment()`: Delete garment
- `markGarmentAsWorn()`: Update last worn date and increment wear count

---

### 4. **Sign-In Page Integration** (`src/app/[lang]/sign-in/SignInPageClient.tsx`)

**What Was Changed:**
- Integrated `signInWithEmail()` for email/password sign in
- Integrated `signUpWithEmail()` for account creation
- Integrated `signInWithGoogle()` for Google OAuth
- Added loading states and error handling
- Auto-creates account if sign in fails with "Invalid login credentials"

---

### 5. **Profile Page Integration**

**Language Selector:**
- Saves language preference to `user_preferences` table when changed

**Sign Out:**
- Uses `signOut()` to properly sign out user from Supabase

---

### 6. **OAuth Callback Handler** (`src/app/[lang]/auth/callback/route.ts`)

**Purpose**: Handles redirect after Google OAuth sign in
- Exchanges OAuth code for session
- Redirects to app or sign-in page on error

---

## 🛠️ Technologies Used

1. **Supabase Auth** (`@supabase/supabase-js`):
   - Email/password authentication
   - OAuth (Google)
   - Session management
   - Automatic user profile creation

2. **Supabase Database**:
   - PostgreSQL database
   - Row Level Security (RLS) for data privacy
   - Automatic triggers for profile/preferences creation
   - Timestamp triggers for `updated_at` fields

3. **Next.js**:
   - Server-side route handlers for OAuth callback
   - Client-side React hooks for auth state
   - TypeScript for type safety

---

## 📦 Data Storage Summary

### **User Data:**
- **auth.users**: Email, password hash (managed by Supabase)
- **user_profiles**: Display name, avatar, member since date
- **user_preferences**: Language, theme, notifications, subscription info

### **Wardrobe Data:**
- **garments**: Complete inventory of clothing items with metadata
- Tracks: wear history, purchase info, categorization, images

### **Outfit Data:**
- **outfits**: Saved outfit combinations
- **outfit_garments**: Links outfits to garments
- **outfit_plans**: Planned outfits for specific dates

---

## 🔒 Security Features

1. **Row Level Security (RLS)**: Users can only access their own data
2. **Secure Authentication**: Password hashing handled by Supabase
3. **OAuth Security**: Google OAuth handled securely by Supabase
4. **Environment Variables**: Sensitive keys stored in .env files

---

## 🚀 Setup Instructions

1. **Create Supabase Project**:
   - Go to https://supabase.com
   - Create new project
   - Get your URL and keys

2. **Set Environment Variables**:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_project_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key (optional)
   ```

3. **Run Database Migration**:
   - Go to Supabase Dashboard → SQL Editor
   - Copy contents of `supabase/migrations/001_initial_schema.sql`
   - Run the migration

4. **Configure Google OAuth** (optional):
   - Go to Supabase Dashboard → Authentication → Providers
   - Enable Google provider
   - Add OAuth credentials

5. **Configure Email** (optional):
   - Go to Supabase Dashboard → Authentication → Email Templates
   - Customize email templates

---

## 📝 Next Steps

1. **Add Proper Sign-In Form**: Replace `prompt()` with a proper form component
2. **Add Email Confirmation**: Handle email verification flow
3. **Add Password Reset**: Implement forgot password functionality
4. **Add Image Upload**: Implement Supabase Storage for garment images
5. **Add Real-time Updates**: Use Supabase Realtime for live updates
6. **Add Analytics**: Track user activity and wardrobe statistics

---

## 🔍 Key Files Reference

- **Database Schema**: `supabase/migrations/001_initial_schema.sql`
- **Auth Functions**: `src/lib/supabase/auth.ts`
- **Database Queries**: `src/lib/supabase/queries.ts`
- **Type Definitions**: `src/lib/supabase/types.ts`
- **Client Setup**: `src/lib/supabase/client.ts`
- **Sign-In Page**: `src/app/[lang]/sign-in/SignInPageClient.tsx`
- **OAuth Callback**: `src/app/[lang]/auth/callback/route.ts`

---

This implementation provides a complete foundation for user authentication and data persistence in WardrobeAI!

