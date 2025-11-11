# Fix Deployment Issues - Quick Guide

## The Problem
Your site has 404 errors for assets because **Netlify is serving a cached/incomplete build** and environment variables aren't set.

## The Solution - 4 Steps

### Step 1: Set Environment Variables in Netlify

1. Go to your Netlify dashboard: https://app.netlify.com
2. Select your Corgi Quest site
3. Go to **Site settings** → **Environment variables**
4. Add these variables:

```
VITE_CONVEX_URL = https://gallant-starling-548.convex.cloud
```

```
OPENAI_API_KEY = [Your OpenAI API key from .env.local]
```

**Note**: Get your actual API key from your local `.env.local` file

⚠️ **IMPORTANT**: Make sure the variable name is exactly `VITE_CONVEX_URL` (not `CONVEX_URL`)

### Step 2: Clear Deploy Cache

1. Go to **Site settings** → **Build & deploy** → **Build settings**
2. Scroll down and click **Clear cache and retry deploy**
3. OR: Click **Trigger deploy** → **Clear cache and deploy site**

### Step 3: Trigger a Fresh Deploy

After clearing cache:

1. Go to **Deploys** tab
2. Click **Trigger deploy** → **Deploy site**
3. Wait for build to complete (2-3 minutes)
4. Watch the build logs - should see "Nitro Server built" at the end

### Step 4: Verify It Works

1. Open your Netlify site URL
2. Open browser DevTools (F12) → Console tab
3. You should see: `✅ Convex URL configured: https://gallant-starling-548.convex.cloud`
4. The character selection screen should appear
5. CSS should be loaded (black/white design)

## If It Still Doesn't Work

### Check Browser Console
Open DevTools (F12) and look for errors. Common issues:

1. **"Missing VITE_CONVEX_URL"** → Environment variable not set correctly
2. **"Failed to fetch"** → Convex deployment might be down
3. **CSS not loading** → Clear browser cache (Ctrl+Shift+R)

### Verify Environment Variables
In Netlify dashboard:
- Site settings → Environment variables
- Make sure `VITE_CONVEX_URL` is listed
- Click "Edit" to verify the value is correct

### Check Build Logs
In Netlify dashboard:
- Deploys tab → Click on latest deploy
- Scroll through build logs
- Look for any errors during build

## Quick Test Commands

After deployment, test these URLs:

```
https://your-site.netlify.app/              → Should show character selection
https://your-site.netlify.app/select-character  → Character selection
```

## Still Stuck?

Share:
1. Your Netlify site URL
2. Screenshot of browser console (F12)
3. Screenshot of Netlify environment variables page

---

**Next Steps After It Works:**
- Test character selection
- Test activity logging
- Test real-time sync between two browsers
- Test voice logging
