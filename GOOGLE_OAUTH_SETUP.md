# Google Cloud Console OAuth Configuration

## Issue: OAuth Redirects to localhost Despite Supabase Configuration

If you've correctly configured Supabase but still get redirected to `localhost:3000`, the issue is likely in your **Google Cloud Console** OAuth settings. Google has its own whitelist of redirect URIs that must match your mobile IP.

---

## Step-by-Step Fix: Google Cloud Console

### 1. Access Google Cloud Console

1. Go to: https://console.cloud.google.com/
2. Select your project (the one used for OAuth)
3. If you don't know which project, check your Supabase Dashboard:
    - Authentication → Providers → Google
    - Look for the Client ID to identify the project

### 2. Navigate to OAuth Credentials

1. In the left sidebar, click: **APIs & Services**
2. Click: **Credentials**
3. Find your OAuth 2.0 Client ID in the list
    - It's usually named something like "Web client 1" or "Supabase OAuth"
4. Click on the credential name to edit it

### 3. Update Authorized Redirect URIs

In the OAuth client configuration, you'll see two sections:

#### **Authorized JavaScript origins** (Optional but recommended)

Add:

```
http://192.168.50.36:3000
http://localhost:3000
```

#### **Authorized redirect URIs** (CRITICAL - This is the main fix!)

You need to add your mobile IP addresses. Add ALL of these:

```
https://bgxkroyixepstktekokt.supabase.co/auth/v1/callback
http://192.168.50.36:3000/en/auth/callback
http://192.168.50.36:3000/pl/auth/callback
http://192.168.50.36:3000/no/auth/callback
http://localhost:3000/en/auth/callback
http://localhost:3000/pl/auth/callback
http://localhost:3000/no/auth/callback
```

**Important Notes:**

-   The Supabase callback URL (`https://bgxkroyixepstktekokt.supabase.co/auth/v1/callback`) must ALWAYS be included
-   Keep localhost URLs for when you test on your computer
-   Add your mobile IP URLs for mobile testing

### 4. Save Changes

1. Click **Save** at the bottom
2. Wait 5-10 minutes for Google to propagate the changes
3. Clear your mobile browser cache

---

## How OAuth Flow Works (Understanding the Issue)

```
┌─────────────────────────────────────────────────────────────────┐
│                    OAuth Redirect Chain                          │
└─────────────────────────────────────────────────────────────────┘

1. User clicks "Login with Google" on: http://192.168.50.36:3000/pl/sign-in
   ↓
2. Browser redirects to Google OAuth with redirect_uri parameter
   ↓
3. Google checks if redirect_uri is in allowed list (Google Cloud Console)
   ↓
   ├─ ✅ If FOUND: Redirects to that URI after login
   └─ ❌ If NOT FOUND: Falls back to first URL in list (often localhost!)
   ↓
4. Google redirects to: https://bgxkroyixepstktekokt.supabase.co/auth/v1/callback
   ↓
5. Supabase processes auth, then redirects to your app's callback
   ↓
   ├─ Uses "Site URL" from Supabase config as base
   └─ Or uses the redirect_uri originally passed to Google
   ↓
6. Final redirect to: http://192.168.50.36:3000/pl/auth/callback (if configured correctly)
```

**The Problem:** If Google Cloud Console doesn't have your mobile IP in the redirect URIs list, Google will reject it and use the first available URL (usually localhost).

---

## Verification Steps

### After Adding URIs to Google Cloud Console:

1. **Wait 5-10 minutes** for Google's servers to update
2. **Clear browser cache** on mobile (or use incognito mode)
3. **Restart dev server**:
    ```powershell
    # Stop with Ctrl+C, then:
    npm run dev
    ```

### Test the Flow:

1. On mobile, go to: `http://192.168.50.36:3000/pl/sign-in`
2. Open browser console (remote debugging)
3. Click "Continue with Google"
4. Check the logs:
    ```
    🔐 OAuth Debug:
      - Current origin: http://192.168.50.36:3000
      - Redirect URL: http://192.168.50.36:3000/pl/auth/callback
    ```
5. After Google login, check the URL bar:
    - ✅ Should be: `http://192.168.50.36:3000/pl/auth/callback?code=...`
    - ❌ If it's: `http://localhost:3000/...` → Google Cloud Console URIs not saved/propagated yet

---

## Common Issues

### Issue 1: "Redirect URI mismatch" Error from Google

**Error message:**

```
Error 400: redirect_uri_mismatch
The redirect URI in the request: http://192.168.50.36:3000/pl/auth/callback
does not match the ones authorized for the OAuth client.
```

**Solution:**

-   The URI is not in Google Cloud Console's Authorized Redirect URIs list
-   Add it exactly as shown above
-   Make sure there are no typos or extra spaces
-   Wait 5-10 minutes after saving

### Issue 2: Still Redirects to localhost After Adding URIs

**Possible causes:**

1. **Google changes not propagated yet** - Wait 10 minutes, try again
2. **Browser cache** - Use incognito mode or clear cache completely
3. **Wrong project** - Verify you edited the correct OAuth client in Google Cloud Console
4. **Supabase still using localhost Site URL** - Double-check Supabase Auth → URL Configuration → Site URL

### Issue 3: URIs Keep Getting Reset

**If your URIs disappear after saving:**

1. Check if you have multiple OAuth clients - you might be editing the wrong one
2. Verify you have permission to edit the project
3. Check if there's a conflicting redirect URI (remove duplicates)

---

## Finding Your Google Cloud Project

### If you don't know which Google Cloud project is used:

1. **Check Supabase Dashboard:**

    - Go to: Authentication → Providers → Google
    - Look at the "Client ID" field
    - Copy the Client ID (looks like: `123456789-abcdef.apps.googleusercontent.com`)

2. **Search in Google Cloud Console:**

    - Go to: https://console.cloud.google.com/apis/credentials
    - Use the search bar to find your Client ID
    - This will show you which project it belongs to

3. **Check your Supabase project settings:**
    - The Google OAuth client was likely created automatically by Supabase
    - Or you created it manually following Supabase docs

---

## Alternative: Create New OAuth Client

If you can't find the right OAuth client or keep having issues:

### 1. Create New OAuth 2.0 Client ID

1. Go to Google Cloud Console → APIs & Services → Credentials
2. Click: **+ CREATE CREDENTIALS** → **OAuth 2.0 Client ID**
3. Application type: **Web application**
4. Name: "YourStylist Development"
5. Add Authorized redirect URIs:
    ```
    https://bgxkroyixepstktekokt.supabase.co/auth/v1/callback
    http://192.168.50.36:3000/en/auth/callback
    http://192.168.50.36:3000/pl/auth/callback
    http://192.168.50.36:3000/no/auth/callback
    http://localhost:3000/en/auth/callback
    http://localhost:3000/pl/auth/callback
    http://localhost:3000/no/auth/callback
    ```
6. Click **CREATE**

### 2. Update Supabase with New Credentials

1. Copy the Client ID and Client Secret
2. Go to Supabase Dashboard → Authentication → Providers → Google
3. Enable Google provider
4. Paste the new Client ID and Client Secret
5. Save

---

## Testing Checklist

After completing all steps:

-   [ ] Added mobile IP redirect URIs to Google Cloud Console
-   [ ] Saved and waited 10 minutes
-   [ ] Updated Supabase Site URL to mobile IP
-   [ ] Added mobile IP redirect URIs to Supabase
-   [ ] Restarted development server
-   [ ] Cleared mobile browser cache
-   [ ] Tested in incognito mode
-   [ ] Checked console logs for OAuth debug messages
-   [ ] Successfully logged in and redirected to mobile IP (not localhost)

---

## Debug Commands

### Check what redirect URI is being sent to Google:

In your mobile browser console (or remote debugging), run:

```javascript
// Before clicking Google login, intercept the redirect
window.addEventListener("beforeunload", (e) => {
	if (e.target.activeElement.href?.includes("accounts.google.com")) {
		console.log("Google OAuth URL:", e.target.activeElement.href);
	}
});
```

### Check Google Cloud Console API:

```bash
# List all OAuth clients (requires gcloud CLI)
gcloud auth application-default login
gcloud projects list
gcloud alpha iap oauth-clients list
```

---

## Production Deployment

When deploying to production:

### Google Cloud Console:

1. Add your production domain redirect URIs:
    ```
    https://yourdomain.com/en/auth/callback
    https://yourdomain.com/pl/auth/callback
    https://yourdomain.com/no/auth/callback
    ```
2. Keep the Supabase callback URL:
    ```
    https://bgxkroyixepstktekokt.supabase.co/auth/v1/callback
    ```

### Supabase Dashboard:

1. Update Site URL to production domain
2. Add production redirect URIs
3. Update environment variables in production

---

## Additional Resources

-   [Google OAuth 2.0 Documentation](https://developers.google.com/identity/protocols/oauth2)
-   [Supabase Google OAuth Guide](https://supabase.com/docs/guides/auth/social-login/auth-google)
-   [OAuth Redirect URI Rules](https://developers.google.com/identity/protocols/oauth2/web-server#uri-validation)

---

## Summary

**The root cause:** Even though Supabase is configured correctly, Google OAuth has its own separate list of allowed redirect URIs in Google Cloud Console. If your mobile IP isn't in that list, Google will reject the redirect and fall back to localhost.

**The fix:** Add all your redirect URIs (both mobile IP and localhost) to the Google Cloud Console OAuth client configuration under "Authorized redirect URIs".
