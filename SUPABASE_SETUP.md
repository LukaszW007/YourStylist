# Supabase Setup Guide

## ✅ Current Status

Your Supabase environment variables are already configured in `.env`:

-   `NEXT_PUBLIC_SUPABASE_URL` ✓
-   `NEXT_PUBLIC_SUPABASE_ANON_KEY` ✓
-   `SUPABASE_SERVICE_ROLE_KEY` ✓

## 🚀 Quick Start

### 1. Restart Development Server

After adding or changing environment variables, you MUST restart the Next.js dev server:

```bash
# Stop the current server (Ctrl+C)
# Then restart:
npm run dev
```

### 2. Google OAuth Configuration (Required for "Continue with Google")

To enable Google sign-in, you need to configure OAuth in your Supabase dashboard:

#### Step 1: Get Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure the consent screen if prompted
6. For Application type, select **Web application**
7. Add authorized redirect URIs:
    ```
    https://bgxkroyixepstktekokt.supabase.co/auth/v1/callback
    ```
8. Copy your **Client ID** and **Client Secret**

#### Step 2: Configure in Supabase Dashboard

1. Go to [Supabase Dashboard](https://supabase.com/dashboard)
2. Select your project: `bgxkroyixepstktekokt`
3. Navigate to **Authentication** → **Providers**
4. Find **Google** in the list
5. Enable the toggle
6. Paste your Google **Client ID** and **Client Secret**
7. Click **Save**

#### Step 3: Configure Site URL (Important!)

1. In Supabase Dashboard, go to **Authentication** → **URL Configuration**
2. Set **Site URL** to your app URL:
    - Development: `http://localhost:3000`
    - Production: your actual domain
3. Add **Redirect URLs**:
    ```
    http://localhost:3000/en/auth/callback
    http://localhost:3000/pl/auth/callback
    ```

### 3. Test Google Sign-In

1. Click "Continue with Google" button
2. You should be redirected to Google's OAuth consent screen
3. After approval, you'll be redirected back to your app

## 🔧 Troubleshooting

### "Authentication currently unavailable" error

**Cause**: Development server not restarted after .env changes

**Solution**:

```bash
# Stop server with Ctrl+C
npm run dev
```

### Google OAuth not working

**Checklist**:

-   ✓ Google OAuth credentials created
-   ✓ Redirect URI matches exactly: `https://bgxkroyixepstktekokt.supabase.co/auth/v1/callback`
-   ✓ Google provider enabled in Supabase Dashboard
-   ✓ Client ID and Secret added to Supabase
-   ✓ Site URL configured in Supabase

### "Invalid redirect URL" error

-   Check that your redirect URLs in Supabase match your app routes
-   Format: `http://localhost:3000/{lang}/auth/callback`

## 📚 Additional Configuration (Optional)

### Email Authentication

Already works! No additional setup needed for email/password sign-in.

### Database Schema

Run migrations to create required tables:

```bash
# If you have Supabase CLI installed:
supabase db push

# Or manually run the SQL from:
# supabase/migrations/001_initial_schema.sql
```

### Row Level Security (RLS)

The schema includes RLS policies. Users can only access their own data.

## 🎯 What's Already Working

-   ✅ Environment variables configured
-   ✅ Supabase client initialized
-   ✅ Email/password authentication
-   ✅ Protected routes with auth guards
-   ✅ Graceful fallback when Supabase unavailable
-   ✅ Demo mode warning banner

## 🔜 Next Steps After Google OAuth Setup

1. Test the full authentication flow
2. Add user profile data
3. Test wardrobe features with real data
4. Configure email templates in Supabase (optional)
5. Set up production environment variables

## 🆘 Need Help?

-   [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
-   [Google OAuth Setup Guide](https://supabase.com/docs/guides/auth/social-login/auth-google)
-   Check browser console for detailed error messages
