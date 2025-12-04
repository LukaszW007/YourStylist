# Mobile Testing Setup Guide

## Issue: OAuth Redirects to localhost Instead of Mobile IP

When testing Google OAuth on a mobile device, Supabase redirects back to `localhost:3000` instead of your mobile IP address (e.g., `192.168.50.36:3000`).

## Solution: Configure Supabase for Mobile Testing

### ⚠️ CRITICAL: There are TWO different settings you need to change!

1. **Site URL** (main redirect base URL) - This is what you're missing!
2. **Redirect URLs** (whitelist of allowed paths) - You already added these ✅

### Step 1: Update Supabase Site URL (THE MISSING STEP!)

**This is NOT the same as the Redirect URLs list!**

1. Go to your Supabase Dashboard: https://supabase.com/dashboard/project/bgxkroyixepstktekokt

2. Navigate to: **Authentication → URL Configuration**

3. Scroll to the TOP of the page - you should see a section called:
    ```
    Site URL
    ```
4. This field looks like a single text input (NOT a list like Redirect URLs)

5. It currently says:

    ```
    http://localhost:3000
    ```

6. **Change this SINGLE field** to:

    ```
    http://192.168.50.36:3000
    ```

7. Click **Save** (there should be a Save button near this field)

**Visual Clue**: The Site URL is typically the FIRST setting on the URL Configuration page, above the Redirect URLs list.

**What it does**: This tells Supabase which domain to use as the base for ALL OAuth redirects. Even if you have the correct URLs in the Redirect URLs whitelist, Supabase will still use the Site URL as the base.> ⚠️ **Important**: This is for development only. Change it back to localhost when testing on your computer, or set it to your production domain when deploying.

### Step 1.5: Can't Find Site URL Setting?

If you don't see a "Site URL" field, it might be under a different name or location:

**Alternative locations to check:**

-   **Authentication → Settings** (not URL Configuration)
-   Look for: "Site URL", "Base URL", "Application URL", or "Default URL"
-   Sometimes it's under **Project Settings → General**

**If you still can't find it**, you may need to:

1. Contact Supabase support
2. Or use the Supabase Management API to update it programmatically
3. Or use an ngrok tunnel instead (see Alternative section below)

### Step 2: Verify Mobile Redirect URLs (You Already Did This! ✅)

In the same **URL Configuration** page, verify these are in **Redirect URLs**:

```
http://192.168.50.36:3000/en/auth/callback
http://192.168.50.36:3000/pl/auth/callback
http://192.168.50.36:3000/no/auth/callback
http://192.168.50.36:3000/**
```

### Step 3: Restart Your Development Server

After making changes in Supabase Dashboard:

```powershell
# Stop the server (Ctrl+C)
# Then restart:
npm run dev
```

### Step 4: Test OAuth on Mobile

1. Open your mobile browser
2. Navigate to: `http://192.168.50.36:3000/pl/sign-in`
3. Click "Continue with Google"
4. After Google authentication, you should be redirected back to `192.168.50.36:3000/pl/auth/callback`

## Alternative: Use ngrok for Persistent URL

If you need to test frequently, consider using ngrok instead of IP addresses:

```powershell
# Install ngrok
winget install ngrok

# Start tunnel
ngrok http 3000
```

Then use the ngrok URL (e.g., `https://abc123.ngrok.io`) in Supabase Site URL and Redirect URLs.

## Code Changes Already Applied

✅ **next.config.ts**: Added `allowedDevOrigins: ["http://192.168.50.36:3000"]`
✅ **client.ts**: Added PKCE flow type for better OAuth handling
✅ **auth.ts**: Uses `window.location.origin` to preserve current URL

## Cross-Origin Warning Fixed

The warning:

```
⚠ Cross origin request detected from 192.168.50.36 to /_next/* resource
```

Has been fixed by adding `allowedDevOrigins` to `next.config.ts`.

## Testing Checklist

-   [ ] Updated Site URL in Supabase Dashboard
-   [ ] Added mobile IP redirect URLs
-   [ ] Restarted development server
-   [ ] Cleared browser cache on mobile
-   [ ] Tested Google OAuth login
-   [ ] Verified redirect back to mobile IP
-   [ ] Tested scanner at `/pl/wardrobe/scan`
-   [ ] Tested home page at `/pl`

## Debugging Steps

### Before Testing, Check the Console Logs:

When you click "Continue with Google" on your mobile device, check the browser console:

1. On mobile Chrome: Menu → More tools → Remote devices (or use desktop Chrome DevTools)
2. Look for the log message:

    ```
    🔐 OAuth Debug:
      - Current origin: http://192.168.50.36:3000
      - Redirect URL: http://192.168.50.36:3000/pl/auth/callback
    ```

3. **If the origin shows `localhost`**, your mobile browser is somehow resolving to localhost (clear cache)
4. **If the origin shows `192.168.50.36` but you still get redirected to localhost**, then Supabase Site URL is still set to localhost

### How to Check Current Supabase Site URL:

Run this in your browser console on mobile:

```javascript
// This will show what Supabase thinks the Site URL is
fetch("https://bgxkroyixepstktekokt.supabase.co/auth/v1/settings")
	.then((r) => r.json())
	.then((data) => console.log("Site URL:", data));
```

## Troubleshooting

### Still redirecting to localhost?

1. **Double-check Supabase Site URL**: Make sure it's ACTUALLY saved (sometimes UI doesn't save properly)
2. **Clear mobile browser cache**: Settings → Clear browsing data → All time
3. **Try incognito/private mode**: This bypasses cache completely
4. **Check console logs**: Look for the "🔐 OAuth Debug" message
5. **Verify network**: Ensure mobile and computer are on same WiFi network
6. **Try force-refresh**: After changing Site URL, wait 2-3 minutes for Supabase to propagate changes

### Can't save garments after login?

This should be fixed now that OAuth works properly. The "User not authenticated" error was caused by the failed OAuth redirect.

### Cross-origin errors persist?

1. Restart the development server
2. Make sure `allowedDevOrigins` is in next.config.ts
3. Clear Next.js cache: `rm -rf .next`

## Production Deployment

When deploying to production:

1. Change Site URL to your production domain (e.g., `https://yourstylist.app`)
2. Update Redirect URLs to production URLs
3. Remove `allowedDevOrigins` or update to production domains
4. Set proper CORS headers in production
