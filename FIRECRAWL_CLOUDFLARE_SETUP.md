# Firecrawl + Cloudflare Integration Guide

This guide explains how to set up Firecrawl with Cloudflare Workers for your Corgi Quest app.

## Architecture Overview

```
TanStack Start Server Function
       │
       ▼
Cloudflare Worker (Edge)
       │
       ▼
Firecrawl API
       │
       ▼
Training Tips (JSON)
```

## Step 1: Set Up Cloudflare Worker

### 1.1 Install Wrangler CLI

```bash
npm install -g wrangler
# or
npm install --save-dev wrangler
```

### 1.2 Login to Cloudflare

```bash
wrangler login
```

This will open your browser to authenticate with Cloudflare.

### 1.3 Deploy the Worker

Navigate to the `cloudflare-worker` directory:

```bash
cd cloudflare-worker
```

Set your Firecrawl API key as a secret:

```bash
wrangler secret put FIRECRAWL_API_KEY
```

When prompted, paste your Firecrawl API key (get it from https://firecrawl.dev).

Deploy the worker:

```bash
npm run deploy
# or
wrangler deploy
```

After deployment, you'll get a URL like:
```
https://corgi-quest-training-tips.your-subdomain.workers.dev
```

### 1.4 Test the Worker

Test it directly:

```bash
curl "https://corgi-quest-training-tips.your-subdomain.workers.dev?topic=basic-training"
```

Or use the dev server:

```bash
npm run dev
```

## Step 2: Configure Environment Variables

### 2.1 Add to Your App's Environment

Add the Cloudflare Worker URL to your environment variables:

**For local development** (`.env.local` or `.env`):
```bash
CLOUDFLARE_WORKER_URL=https://corgi-quest-training-tips.your-subdomain.workers.dev
```

**For Netlify** (in Netlify dashboard):
1. Go to Site settings → Environment variables
2. Add `CLOUDFLARE_WORKER_URL` with your worker URL

**For production** (`.env.production`):
```bash
CLOUDFLARE_WORKER_URL=https://corgi-quest-training-tips.your-subdomain.workers.dev
```

## Step 3: Use in Your App

### 3.1 Call from a Component

```typescript
import { fetchTrainingTips } from '@/routes/api/fetch-tips'

// In your component
const tips = await fetchTrainingTips({ 
  topics: ['basic-training', 'socialization'] 
})
```

### 3.2 Use in a Convex Action (for cron jobs)

```typescript
// convex/actions.ts
import { action } from './_generated/server'

export const fetchAndStoreTips = action({
  handler: async (ctx) => {
    // Call your TanStack Start server function
    // Note: You'll need to make an HTTP request to your deployed app
    const response = await fetch(
      `${process.env.APP_URL}/api/fetch-tips?topics=basic-training,socialization`
    )
    const tips = await response.json()
    
    // Store in Convex database
    // ... your storage logic
  },
})
```

## Step 4: Get Firecrawl API Key

1. Go to https://firecrawl.dev
2. Sign up for an account
3. Navigate to your API keys section
4. Copy your API key
5. Add it to Cloudflare Worker secrets (see Step 1.3)

## Benefits of This Architecture

1. **Edge Caching**: Cloudflare Worker caches responses for 1 hour, reducing Firecrawl API calls
2. **Rate Limiting**: Cloudflare can help manage rate limits
3. **Sponsor Synergy**: Demonstrates both Cloudflare and Firecrawl integration
4. **Error Handling**: Graceful fallback if either service is unavailable
5. **Performance**: Edge computing reduces latency

## Troubleshooting

### Worker returns 500 error
- Check that `FIRECRAWL_API_KEY` is set: `wrangler secret list`
- Verify your Firecrawl API key is valid
- Check worker logs: `wrangler tail`

### Tips not appearing in app
- Verify `CLOUDFLARE_WORKER_URL` is set in environment variables
- Check browser console for errors
- Test worker URL directly with curl
- Check that fallback tips are working

### CORS errors
- The worker already includes CORS headers
- If issues persist, check your app's origin matches allowed origins

## Monitoring

View worker logs in real-time:

```bash
wrangler tail
```

View in Cloudflare dashboard:
1. Go to Workers & Pages
2. Click on your worker
3. Go to Logs tab

## Cost Considerations

- **Cloudflare Workers**: Free tier includes 100,000 requests/day
- **Firecrawl**: Check their pricing at https://firecrawl.dev/pricing
- **Caching**: Worker caches for 1 hour, reducing API calls

## Next Steps

1. Set up daily cron job in Convex to fetch tips
2. Store tips in Convex database
3. Display tips in Quests screen
4. Add "Powered by Cloudflare" and "Powered by Firecrawl" badges

