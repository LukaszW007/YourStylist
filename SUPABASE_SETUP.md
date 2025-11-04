# Supabase Setup Guide

## 🔒 Security Best Practices

### Environment Files Explained

Your project uses three environment files:

1. **`.env.example`** ✅ **Safe to commit**

    - Template showing which variables are needed
    - Contains placeholder values only
    - Committed to git for team reference

2. **`.env.local`** 🔐 **NEVER commit** (automatically ignored)

    - Contains your **real API keys and secrets**
    - Takes precedence over `.env`
    - **This is where your actual credentials live**
    - Automatically excluded by `.gitignore`

3. **`.env`** ⚠️ **Should NOT contain real secrets**
    - Often accidentally committed
    - Use `.env.local` instead for sensitive data
    - Can be used for non-sensitive defaults

### What's Safe to Share?

| Variable                        | Safe to Commit? | Public? | Notes                                    |
| ------------------------------- | --------------- | ------- | ---------------------------------------- |
| `NEXT_PUBLIC_SUPABASE_URL`      | ⚠️ Semi-safe    | ✅ Yes  | Exposed to browser, use RLS for security |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ⚠️ Semi-safe    | ✅ Yes  | Public key, protected by RLS policies    |
| `SUPABASE_SERVICE_ROLE_KEY`     | 🔴 **NEVER**    | ❌ No   | **Bypasses all security** - server-only! |
| `FREE_GEMINI_KEY`               | 🔴 **NEVER**    | ❌ No   | Can incur costs if exposed               |

### Security Layers

1. **Row Level Security (RLS)** in Supabase - your primary defense
2. **API keys** - basic authentication
3. **Environment isolation** - dev/staging/production separation
4. **`.gitignore`** - prevents accidental commits

## ✅ Current Status

Your Supabase environment variables are configured in `.env.local`:

-   `NEXT_PUBLIC_SUPABASE_URL` ✓
-   `NEXT_PUBLIC_SUPABASE_ANON_KEY` ✓
-   `SUPABASE_SERVICE_ROLE_KEY` ✓

**Fixed Issues:**

-   ✅ Lazy-loaded environment variables to prevent Turbopack errors
-   ✅ Lazy-loaded Supabase client initialization
-   ✅ Environment variables now load correctly in Next.js 15

**Note**: `.env.local` takes precedence over `.env` and is the recommended location for local development with Next.js 15/Turbopack.

## 🚀 Quick Start

### 1. Environment Files Setup (IMPORTANT for Next.js 15 + Turbopack)

Your environment variables are now in **`.env.local`**. This file:

-   ✅ Takes precedence over `.env`
-   ✅ Is automatically ignored by git (never committed)
-   ✅ Works reliably with Next.js 15 and Turbopack

### 2. Restart Development Server

**CRITICAL**: After creating `.env.local`, you MUST restart the dev server:

```bash
# Stop the current server (Ctrl+C in terminal)
# Then restart:
npm run dev
```

**Hard refresh your browser** after restart:

-   Windows: `Ctrl+Shift+R`
-   Mac: `Cmd+Shift+R`

### 3. Google OAuth Configuration (Required for "Continue with Google")

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
3. **IMPORTANT**: Add these **Redirect URLs** (all of them):
    ```
    http://localhost:3000/*
    http://localhost:3000/en/auth/callback
    http://localhost:3000/pl/auth/callback
    http://localhost:3000/en/sign-in
    http://localhost:3000/pl/sign-in
    ```
    Or use a wildcard: `http://localhost:3000/**`

### 3. Test Google Sign-In

1. Click "Continue with Google" button
2. You should be redirected to Google's OAuth consent screen
3. After approval, you'll be redirected back to your app

## 🔧 Troubleshooting

### "Missing environment variable: NEXT_PUBLIC_SUPABASE_URL" in browser console

**Cause**: Next.js 15 with Turbopack requires environment variables to be in `.env.local` for reliable loading.

**Solution**:

1. ✅ **I've created `.env.local` for you** with your Supabase credentials
2. **Stop your dev server** (Ctrl+C)
3. **Restart**: `npm run dev`
4. **Hard refresh browser**: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
5. Check browser console - the error should be gone

### "Authentication currently unavailable" error

**Possible Causes & Solutions**:

1. **Development server not restarted after .env.local creation**

    ```bash
    # Stop server with Ctrl+C in your terminal
    # Then restart:
    npm run dev
    ```

2. **Browser cache still has old bundle**

    - Hard refresh browser: `Ctrl+Shift+R` (Windows) or `Cmd+Shift+R` (Mac)
    - Or clear browser cache completely
    - Close all browser tabs and reopen `http://localhost:3000`

3. **Delete `.next` folder and rebuild**

    ```bash
    # Stop server first, then:
    rm -rf .next
    npm run dev
    ```

    On Windows PowerShell:

    ```powershell
    Remove-Item -Recurse -Force .next
    npm run dev
    ```

4. **Verify environment variables loaded in browser console**
    - Press `F12` to open Developer Tools
    - Go to Console tab
    - You should see debug logs with Supabase URL when you visit sign-in page
    - If URL shows as `undefined`, restart server and hard refresh

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

-   ✅ Environment variables configured in `.env.local` (secure)
-   ✅ `.env.example` template created for team sharing
-   ✅ Proper `.gitignore` rules preventing secret leaks
-   ✅ Supabase client initialized
-   ✅ Email/password authentication
-   ✅ Protected routes with auth guards
-   ✅ Graceful fallback when Supabase unavailable
-   ✅ Demo mode warning banner

## 🚨 Emergency: If You Accidentally Commit Secrets

If you accidentally committed your `.env` or `.env.local` with real credentials:

### Immediate Actions (Do ALL of these):

1. **Rotate ALL exposed keys immediately**:

    - Go to [Supabase Dashboard](https://supabase.com/dashboard/project/bgxkroyixepstktekokt/settings/api)
    - Click **Reset** on exposed keys
    - Update your `.env.local` with new keys
    - Restart your dev server

2. **Remove from Git history**:

    ```bash
    # Remove the file from git history (but keep local copy)
    git rm --cached .env .env.local

    # Commit the removal
    git commit -m "Remove accidentally committed secrets"

    # Force push (if already pushed to remote)
    git push origin main --force
    ```

3. **Verify `.gitignore` is working**:

    ```bash
    git status
    # Should NOT see .env or .env.local listed
    ```

4. **Consider the exposure scope**:
    - If it was a public repo → assume keys are compromised
    - If private repo → still rotate as a precaution
    - Check GitHub/GitLab security alerts

### Prevention Checklist:

-   ✅ `.env*` in `.gitignore` (already done)
-   ✅ Use `.env.local` for secrets (already done)
-   ✅ `.env.example` for templates (already done)
-   🔄 Set up pre-commit hooks (optional, recommended)
-   🔄 Use secret scanning tools (GitHub Advanced Security)

## 🔜 Next Steps After Google OAuth Setup

1. Test the full authentication flow
2. Add user profile data
3. Test wardrobe features with real data
4. Configure email templates in Supabase (optional)
5. Set up production environment variables
6. **Review and enable RLS policies** in Supabase for data protection

## 🆘 Need Help?

-   [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
-   [Google OAuth Setup Guide](https://supabase.com/docs/guides/auth/social-login/auth-google)
-   [Row Level Security Guide](https://supabase.com/docs/guides/auth/row-level-security)
-   Check browser console for detailed error messages

---

## 📋 Quick Reference

### File Purposes

| File           | Purpose                       | Commit?  |
| -------------- | ----------------------------- | -------- |
| `.env.example` | Template with placeholders    | ✅ Yes   |
| `.env.local`   | Your actual secrets           | ❌ Never |
| `.env`         | Legacy/fallback (avoid using) | ❌ No    |
| `.gitignore`   | Blocks secret files from git  | ✅ Yes   |

### Current Setup

Your sensitive data is in `.env.local` which is:

-   ✅ Excluded from git automatically
-   ✅ Takes precedence over `.env`
-   ✅ Only exists on your local machine
-   ✅ Perfect for Next.js 15 + Turbopack
-   Check browser console for detailed error messages
