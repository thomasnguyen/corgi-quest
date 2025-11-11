# Quick Deploy Guide 🚀

Fast reference for deploying Corgi Quest to Netlify.

## Prerequisites

```bash
# Ensure you have Node 20+
node --version

# Install Netlify CLI globally (optional for manual deploy)
npm install -g netlify-cli
```

## Method 1: Netlify Dashboard (Easiest)

1. **Push to GitHub**
   ```bash
   git add .
   git commit -m "Ready for deployment"
   git push origin main
   ```

2. **Connect to Netlify**
   - Go to https://app.netlify.com
   - Click "Add new site" → "Import an existing project"
   - Select your repository
   - Build settings are auto-detected from `netlify.toml`

3. **Add Environment Variables**
   - Site settings → Environment variables
   - Add `VITE_CONVEX_URL`
   - Add `OPENAI_API_KEY`

4. **Deploy**
   - Click "Deploy site"
   - Done! ✅

## Method 2: Netlify CLI (Manual)

```bash
# 1. Login to Netlify
netlify login

# 2. Initialize site (first time only)
netlify init

# 3. Set environment variables
netlify env:set VITE_CONVEX_URL "https://your-deployment.convex.cloud"
netlify env:set OPENAI_API_KEY "sk-proj-your-key"

# 4. Build locally
npm run build

# 5. Deploy to production
netlify deploy --prod
```

## Method 3: One-Command Deploy

```bash
# Build and deploy in one command
npm run build && netlify deploy --prod --dir=.output/public
```

## Verify Deployment

```bash
# Open deployed site in browser
netlify open:site

# Check deployment status
netlify status

# View recent deploys
netlify deploy:list
```

## Update Deployment

```bash
# After making changes
git add .
git commit -m "Update feature"
git push origin main

# Netlify automatically deploys! 🎉
```

## Troubleshooting

### Build fails?
```bash
# Test build locally first
npm run build

# Check for errors
npm run test
```

### Environment variables not working?
```bash
# List current environment variables
netlify env:list

# Set a variable
netlify env:set VARIABLE_NAME "value"

# Redeploy
netlify deploy --prod
```

### Need to rollback?
```bash
# View deploy history
netlify deploy:list

# Rollback to specific deploy
netlify rollback
```

## Useful Commands

```bash
# View build logs
netlify logs

# Open Netlify dashboard
netlify open

# Open site in browser
netlify open:site

# Link to existing site
netlify link

# Unlink from site
netlify unlink
```

## Environment Variables Reference

Required variables:
- `VITE_CONVEX_URL` - Your Convex deployment URL
- `OPENAI_API_KEY` - Your OpenAI API key

## Build Configuration

From `netlify.toml`:
- **Build command:** `npm run build`
- **Publish directory:** `.output/public`
- **Node version:** 20

## Support

- [Netlify Docs](https://docs.netlify.com/)
- [TanStack Start Docs](https://tanstack.com/start)
- [Convex Docs](https://docs.convex.dev/)

---

**That's it!** Your site should be live at `https://your-site.netlify.app` 🎉
