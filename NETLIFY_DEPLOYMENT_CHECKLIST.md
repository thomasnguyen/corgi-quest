# Netlify Deployment Checklist ✅

Use this checklist to ensure a successful deployment of Corgi Quest to Netlify.

## Pre-Deployment Checklist

### 1. Code Preparation
- [x] `netlify.toml` configuration file created
- [x] `.env.example` file created for reference
- [x] `.gitignore` includes `.env.local` (never commit secrets!)
- [x] Build command verified: `npm run build`
- [x] Build output directory confirmed: `.output/public`
- [x] Local build test passed: `npm run build` completes successfully

### 2. Environment Variables Ready
- [ ] Convex deployment URL (`VITE_CONVEX_URL`)
- [ ] OpenAI API key (`OPENAI_API_KEY`)
- [ ] All secrets documented in `.env.example`

### 3. Repository Setup
- [ ] Code pushed to Git repository (GitHub/GitLab/Bitbucket)
- [ ] Main branch is up to date
- [ ] No sensitive data in commit history

## Deployment Steps

### Option A: Deploy via Netlify Dashboard (Recommended)

#### Step 1: Create Netlify Site
- [ ] Log in to [Netlify Dashboard](https://app.netlify.com)
- [ ] Click "Add new site" → "Import an existing project"
- [ ] Connect your Git provider
- [ ] Select your Corgi Quest repository

#### Step 2: Configure Build Settings
- [ ] Build command: `npm run build`
- [ ] Publish directory: `.output/public`
- [ ] Node version: 20 (set in netlify.toml)

#### Step 3: Add Environment Variables
- [ ] Go to Site settings → Environment variables
- [ ] Add `VITE_CONVEX_URL` with your Convex deployment URL
- [ ] Add `OPENAI_API_KEY` with your OpenAI API key
- [ ] Save changes

#### Step 4: Deploy
- [ ] Click "Deploy site"
- [ ] Wait for build to complete (usually 2-5 minutes)
- [ ] Check build logs for any errors

### Option B: Deploy via Netlify CLI

#### Step 1: Install CLI
```bash
npm install -g netlify-cli
```

#### Step 2: Login
```bash
netlify login
```

#### Step 3: Initialize Site
```bash
netlify init
```
- [ ] Follow prompts to create new site or link existing
- [ ] Confirm publish directory: `.output/public`

#### Step 4: Set Environment Variables
```bash
netlify env:set VITE_CONVEX_URL "https://your-deployment.convex.cloud"
netlify env:set OPENAI_API_KEY "sk-proj-your-key"
```

#### Step 5: Deploy
```bash
# Build locally
npm run build

# Deploy to production
netlify deploy --prod
```

## Post-Deployment Verification

### Functional Testing
- [ ] Site loads at Netlify URL (e.g., `https://your-site.netlify.app`)
- [ ] Character selection screen appears
- [ ] Can select a character and proceed to Overview
- [ ] Dog profile displays correctly
- [ ] Stats display with correct values
- [ ] Bottom navigation works (Overview, Quests, Activity, BUMI tabs)
- [ ] Top resource bar shows daily goals and streak
- [ ] Activity feed loads
- [ ] Quests screen displays
- [ ] BUMI character sheet loads

### Real-Time Features
- [ ] Open site in two different browsers/devices
- [ ] Log activity in one browser
- [ ] Verify activity appears in other browser within 1 second
- [ ] Check toast notifications appear
- [ ] Verify mood logging syncs in real-time

### Voice Logging
- [ ] Click "LOG ACTIVITY" button
- [ ] Microphone permission requested
- [ ] Voice interface connects to OpenAI
- [ ] Can speak and receive audio response
- [ ] Activity saves correctly after voice confirmation

### Performance
- [ ] Page load time < 3 seconds
- [ ] No console errors in browser DevTools
- [ ] Images load correctly
- [ ] Animations are smooth
- [ ] Mobile responsive (test on phone)

### Routes
- [ ] `/` (Overview) - works
- [ ] `/select-character` - works
- [ ] `/quests` - works
- [ ] `/activity` - works
- [ ] `/bumi` - works
- [ ] `/stats/PHY` - works (test all stat types)
- [ ] `/quests/1` - works (test quest detail)
- [ ] `/log-activity` - works
- [ ] Direct URL navigation works (no 404s)

## Continuous Deployment Setup

### Automatic Deployments
- [ ] Push to main branch triggers automatic deployment
- [ ] Build status notifications enabled (email/Slack)
- [ ] Deploy previews enabled for pull requests

### Branch Deploys
- [ ] Production branch: `main`
- [ ] Deploy previews: All pull requests
- [ ] Branch deploys: Optional feature branches

## Monitoring & Maintenance

### Build Monitoring
- [ ] Check Netlify dashboard for build status
- [ ] Review build logs for warnings
- [ ] Monitor build time (should be < 5 minutes)

### Performance Monitoring
- [ ] Enable Netlify Analytics (optional)
- [ ] Monitor Core Web Vitals
- [ ] Check CDN cache hit rate

### Error Tracking
- [ ] Check browser console for errors
- [ ] Monitor Convex dashboard for backend errors
- [ ] Set up error alerts (optional: Sentry integration)

## Troubleshooting

### Build Fails
- [ ] Check build logs in Netlify dashboard
- [ ] Verify Node version (should be 20)
- [ ] Confirm all dependencies installed
- [ ] Check environment variables are set correctly

### 404 Errors on Routes
- [ ] Verify `netlify.toml` is in repository root
- [ ] Check redirects configuration in `netlify.toml`
- [ ] Redeploy if needed

### Environment Variables Not Working
- [ ] Verify variable names match exactly (case-sensitive)
- [ ] Check variables are set in Netlify dashboard
- [ ] Redeploy after adding/updating variables
- [ ] Ensure variables start with `VITE_` for client-side access

### Convex Connection Issues
- [ ] Verify `VITE_CONVEX_URL` is correct
- [ ] Check Convex deployment is running
- [ ] Test Convex connection from local environment first
- [ ] Ensure Convex allows connections from Netlify domain

### OpenAI Voice Logging Issues
- [ ] Verify `OPENAI_API_KEY` is set correctly
- [ ] Check OpenAI API key has Realtime API access
- [ ] Test microphone permissions in browser
- [ ] Check browser console for WebSocket errors

## Rollback Procedure

If deployment has critical issues:

1. [ ] Go to Netlify dashboard → Deploys
2. [ ] Find last working deployment
3. [ ] Click "Publish deploy" to rollback
4. [ ] Investigate issue in development
5. [ ] Fix and redeploy

## Custom Domain Setup (Optional)

- [ ] Go to Site settings → Domain management
- [ ] Click "Add custom domain"
- [ ] Follow DNS configuration instructions
- [ ] Wait for SSL certificate provisioning (automatic)
- [ ] Verify HTTPS works on custom domain

## Security Checklist

- [ ] HTTPS enabled (automatic with Netlify)
- [ ] Environment variables stored securely (not in code)
- [ ] `.env.local` in `.gitignore`
- [ ] No API keys in client-side code
- [ ] CORS configured correctly in Convex
- [ ] Content Security Policy configured (optional)

## Documentation

- [ ] Update README with live demo URL
- [ ] Document deployment process for team
- [ ] Add deployment badge to README
- [ ] Create runbook for common issues

## Success Criteria

✅ Deployment is successful when:
- Site is accessible via HTTPS
- All features work correctly
- Real-time sync functions properly
- Voice logging works
- No console errors
- Mobile responsive
- Automatic deployments configured
- Environment variables secured

---

**Deployed on Netlify** 🚀

Last Updated: [Date]
Deployed By: [Your Name]
Deployment URL: [Your Netlify URL]
