# Firecrawl + Cloudflare Setup - Do This Now

## Step 1: Get Your Firecrawl API Key (2 minutes)

1. Go to https://firecrawl.dev
2. Sign up or log in
3. Go to your dashboard → API Keys
4. Copy your API key (starts with `fc-`)

## Step 2: Deploy Cloudflare Worker (5 minutes)

Open terminal and run:

```bash
# Navigate to worker directory
cd cloudflare-worker

# Install dependencies
npm install

# Login to Cloudflare (opens browser)
npx wrangler login

# Add your Firecrawl API key as a secret
npx wrangler secret put FIRECRAWL_API_KEY
# When prompted, paste your Firecrawl API key

# Deploy the worker
npx wrangler deploy
```

**IMPORTANT:** After deployment, copy the URL it gives you. It looks like:
```
https://corgi-quest-training-tips.your-subdomain.workers.dev
```

## Step 3: Add Environment Variable (1 minute)

### For Local Development:

Create or edit `.env.local` in your project root:

```bash
CLOUDFLARE_WORKER_URL=https://corgi-quest-training-tips.your-subdomain.workers.dev
```

Replace with YOUR actual worker URL from Step 2.

### For Netlify (Production):

1. Go to your Netlify dashboard
2. Site settings → Environment variables
3. Add new variable:
   - Key: `CLOUDFLARE_WORKER_URL`
   - Value: `https://corgi-quest-training-tips.your-subdomain.workers.dev`

## Step 4: Test It Works (1 minute)

```bash
# Test the worker directly
curl "https://your-worker-url.workers.dev?topic=basic-training"

# Or test from your app (after restarting dev server)
# The server function is at: src/routes/api/fetch-tips.ts
```

## Step 5: Restart Your Dev Server

```bash
# Stop current server (Ctrl+C)
# Then restart
npm run dev
```

## ✅ Done!

Your integration is now set up. The server function at `src/routes/api/fetch-tips.ts` will automatically use your Cloudflare Worker.

---

## Troubleshooting

**Worker returns 500:**
- Check secret is set: `npx wrangler secret list`
- Verify your Firecrawl API key is correct

**Can't find worker URL:**
- Check Cloudflare dashboard → Workers & Pages
- Your worker should be listed there

**Environment variable not working:**
- Make sure you restarted your dev server
- Check `.env.local` is in project root (not in a subfolder)

