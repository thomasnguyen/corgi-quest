# Netlify Environment Variables Setup Guide

## Required Environment Variables

You need to set these in your Netlify dashboard:

### 1. **VITE_CONVEX_URL** (Required)
- **What it is:** Your Convex deployment URL
- **Format:** `https://your-deployment.convex.cloud`
- **Where to find:** Check your `.env.local` file or Convex dashboard

### 2. **CLOUDFLARE_WORKER_URL** (Required for Firecrawl Tips)
- **What it is:** Your Cloudflare Worker URL
- **Format:** `https://your-worker-name.your-subdomain.workers.dev`
- **Where to find:** After deploying Cloudflare Worker (from `SETUP_STEPS_NOW.md`)

### 3. **OPENAI_API_KEY** (Required for AI Recommendations)
- **What it is:** Your OpenAI API key
- **Format:** `sk-proj-...` (starts with `sk-proj-`)
- **Where to find:** Check your `.env.local` file or OpenAI dashboard

### 4. **VITE_SENTRY_DSN** (Optional - for error monitoring)
- **What it is:** Your Sentry DSN
- **Format:** `https://...@...sentry.io/...`
- **Where to find:** Sentry dashboard → Settings → Client Keys (DSN)

---

## How to Set Them in Netlify

### Step 1: Go to Netlify Dashboard
1. Open https://app.netlify.com
2. Select your Corgi Quest site
3. Go to **Site settings** → **Environment variables**

### Step 2: Add Each Variable
Click **Add variable** and add each one:

| Variable Name | Value | Scope |
|--------------|-------|-------|
| `VITE_CONVEX_URL` | Your Convex URL | All scopes |
| `CLOUDFLARE_WORKER_URL` | Your Worker URL | All scopes |
| `OPENAI_API_KEY` | Your OpenAI key | All scopes |
| `VITE_SENTRY_DSN` | Your Sentry DSN | All scopes (optional) |

**Important Notes:**
- Variable names are **case-sensitive** - use exact names above
- No spaces around the `=` sign
- Click **Save** after adding each variable
- **Scope:** Select "All scopes" (production, deploy previews, branch deploys)

### Step 3: Redeploy
After adding variables:
1. Go to **Deploys** tab
2. Click **Trigger deploy** → **Deploy site**
3. Wait for build to complete

---

## Quick Checklist

- [ ] `VITE_CONVEX_URL` added
- [ ] `CLOUDFLARE_WORKER_URL` added
- [ ] `OPENAI_API_KEY` added
- [ ] `VITE_SENTRY_DSN` added (optional)
- [ ] All variables saved
- [ ] Site redeployed
- [ ] Tested in production

---

## Verify It's Working

After deployment, check:

1. **Open browser console** on your Netlify site
2. You should see: `✅ Convex URL configured: https://...`
3. **Test features:**
   - AI Recommendations should work
   - Firecrawl Tips should work (if Worker URL is set)
   - No console errors about missing env vars

---

## Troubleshooting

### "Missing VITE_CONVEX_URL" error
- Check variable name is exactly `VITE_CONVEX_URL` (not `CONVEX_URL`)
- Make sure it's saved in Netlify
- Redeploy after adding

### Firecrawl Tips not working
- Check `CLOUDFLARE_WORKER_URL` is set
- Verify Worker URL is correct (test it directly in browser)
- Check Worker has `FIRECRAWL_API_KEY` secret set

### AI Recommendations not working
- Check `OPENAI_API_KEY` is set
- Verify key is valid (starts with `sk-proj-`)
- Check OpenAI account has credits

---

## Security Notes

✅ **DO:**
- Set variables in Netlify dashboard (secure)
- Use different keys for production vs development
- Rotate keys periodically

❌ **DON'T:**
- Commit `.env.local` to Git
- Share API keys in chat/email
- Use production keys in development

