# Set Netlify Environment Variables via CLI

## Step 1: Login to Netlify

```bash
netlify login
```

This will open your browser to authenticate.

## Step 2: Link Your Site (if not already linked)

```bash
netlify link
```

Follow the prompts to select your site.

## Step 3: Set Environment Variables

Run these commands with your actual values:

```bash
# Convex URL (Required)
netlify env:set VITE_CONVEX_URL "https://your-deployment.convex.cloud" --context production,deploy-preview,branch-deploy

# Cloudflare Worker URL (Required for Firecrawl Tips)
netlify env:set CLOUDFLARE_WORKER_URL "https://your-worker.workers.dev" --context production,deploy-preview,branch-deploy

# OpenAI API Key (Required for AI Recommendations)
netlify env:set OPENAI_API_KEY "sk-proj-your-key-here" --context production,deploy-preview,branch-deploy

# Sentry DSN (Optional)
netlify env:set VITE_SENTRY_DSN "https://xxx@sentry.io/xxx" --context production,deploy-preview,branch-deploy
```

## Step 4: Verify Variables

```bash
netlify env:list
```

## Step 5: Trigger New Deploy

```bash
netlify deploy --prod
```

Or just push to your main branch and Netlify will auto-deploy.

---

## Quick One-Liner (After Login)

If you want to set all at once, you can run:

```bash
netlify env:set VITE_CONVEX_URL "YOUR_VALUE" --context production,deploy-preview,branch-deploy && \
netlify env:set CLOUDFLARE_WORKER_URL "YOUR_VALUE" --context production,deploy-preview,branch-deploy && \
netlify env:set OPENAI_API_KEY "YOUR_VALUE" --context production,deploy-preview,branch-deploy
```

---

## Alternative: Use the Interactive Script

I've created `set-netlify-env.sh` - you can run it and it will prompt you for each value:

```bash
./set-netlify-env.sh
```

