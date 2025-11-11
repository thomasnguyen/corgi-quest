# Corgi Quest - Netlify Deployment Guide

This guide walks you through deploying Corgi Quest to Netlify with CI/CD.

## Prerequisites

1. A Netlify account (sign up at https://netlify.com)
2. Node.js 20+ installed
3. Git repository pushed to GitHub/GitLab/Bitbucket
4. Convex deployment URL
5. OpenAI API key

## Step 1: Install Netlify CLI (Optional for manual deployment)

```bash
npm install -g netlify-cli
```

## Step 2: Configure Environment Variables

Before deploying, you need to set up environment variables in Netlify:

1. Go to your Netlify dashboard
2. Navigate to Site settings > Environment variables
3. Add the following variables:

```
VITE_CONVEX_URL=https://your-convex-deployment.convex.cloud
OPENAI_API_KEY=sk-proj-your-openai-api-key
```

**Important:** Never commit your `.env.local` file to version control!

## Step 3: Deploy via Netlify Dashboard (Recommended)

### Option A: Connect Git Repository

1. Log in to Netlify dashboard
2. Click "Add new site" > "Import an existing project"
3. Connect your Git provider (GitHub, GitLab, or Bitbucket)
4. Select your Corgi Quest repository
5. Configure build settings:
   - **Build command:** `npm run build`
   - **Publish directory:** `.output/public`
   - **Node version:** 20
6. Add environment variables (see Step 2)
7. Click "Deploy site"

Netlify will automatically:
- Build your site on every push to main branch
- Generate a unique URL (e.g., `your-site-name.netlify.app`)
- Enable HTTPS automatically
- Set up continuous deployment

### Option B: Manual Deploy via CLI

If you prefer to deploy manually:

```bash
# Login to Netlify
netlify login

# Initialize Netlify site (first time only)
netlify init

# Build the project
npm run build

# Deploy to production
netlify deploy --prod
```

Follow the prompts to:
- Create a new site or link to existing
- Confirm publish directory: `.output/public`

## Step 4: Verify Deployment

1. Visit your Netlify site URL (e.g., `https://your-site-name.netlify.app`)
2. Test the following:
   - ✅ App loads correctly
   - ✅ Character selection works
   - ✅ Real-time sync with Convex works
   - ✅ Voice logging with OpenAI works
   - ✅ All routes are accessible (no 404s)

## Step 5: Configure Custom Domain (Optional)

1. Go to Site settings > Domain management
2. Click "Add custom domain"
3. Follow instructions to configure DNS
4. Netlify will automatically provision SSL certificate

## Continuous Deployment

Once connected to Git, Netlify automatically:
- Deploys on every push to main branch
- Creates deploy previews for pull requests
- Rolls back to previous versions if needed

### Deploy Previews

Every pull request gets a unique preview URL:
- Test changes before merging
- Share with team for review
- Automatically deleted after PR is merged

### GitHub Actions CI/CD (Optional)

A GitHub Actions workflow is included in `.github/workflows/deploy.yml` for additional CI/CD capabilities:

**Setup:**
1. Go to your GitHub repository → Settings → Secrets and variables → Actions
2. Add the following secrets:
   - `NETLIFY_AUTH_TOKEN` - Get from Netlify dashboard → User settings → Applications
   - `NETLIFY_SITE_ID` - Get from Netlify dashboard → Site settings → General
   - `VITE_CONVEX_URL` - Your Convex deployment URL
   - `OPENAI_API_KEY` - Your OpenAI API key

**Features:**
- ✅ Runs tests before deployment
- ✅ Builds project with environment variables
- ✅ Deploys to Netlify automatically
- ✅ Comments on pull requests with preview URL
- ✅ Fails deployment if tests fail

**Note:** You can use either Netlify's built-in CI/CD or GitHub Actions. Both work great!

## Troubleshooting

### Build Fails

**Issue:** Build command fails
**Solution:** Check build logs in Netlify dashboard. Common issues:
- Missing environment variables
- Node version mismatch (ensure Node 20+)
- Dependencies not installed

### 404 on Routes

**Issue:** Direct navigation to routes returns 404
**Solution:** The `netlify.toml` file includes redirects configuration. Ensure it's committed to your repo.

### Environment Variables Not Working

**Issue:** App can't connect to Convex or OpenAI
**Solution:** 
- Verify environment variables are set in Netlify dashboard
- Ensure variable names match exactly (case-sensitive)
- Redeploy after adding/updating variables

### Convex Connection Issues

**Issue:** Real-time sync not working
**Solution:**
- Verify `VITE_CONVEX_URL` is correct
- Check Convex deployment is running
- Ensure Convex allows connections from Netlify domain

## Build Configuration

The `netlify.toml` file configures:
- Build command: `npm run build`
- Publish directory: `.output/public`
- Node version: 20
- SPA redirects for client-side routing
- Environment-specific settings

## Performance Optimization

Netlify automatically provides:
- ✅ Global CDN distribution
- ✅ Automatic HTTPS
- ✅ Asset optimization
- ✅ Instant cache invalidation
- ✅ Atomic deploys (no downtime)

## Monitoring

View deployment status:
- Netlify dashboard > Deploys
- Build logs for each deployment
- Deploy notifications via email/Slack

## Rollback

If a deployment has issues:
1. Go to Deploys in Netlify dashboard
2. Find a previous working deployment
3. Click "Publish deploy" to rollback

## Resources

- [Netlify Documentation](https://docs.netlify.com/)
- [TanStack Start Deployment Guide](https://tanstack.com/start/latest/docs/deployment)
- [Convex Production Deployment](https://docs.convex.dev/production)

---

**Deployed on Netlify** 🚀
