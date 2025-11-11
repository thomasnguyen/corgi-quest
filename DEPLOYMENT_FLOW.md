# Corgi Quest Deployment Flow 🚀

Visual guide to understand the deployment architecture and flow.

## Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     Developer Workflow                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ git push
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Git Repository (GitHub)                   │
│                                                              │
│  ┌────────────────────────────────────────────────────┐    │
│  │  main branch                                       │    │
│  │  - src/                                            │    │
│  │  - convex/                                         │    │
│  │  - netlify.toml                                    │    │
│  │  - package.json                                    │    │
│  └────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ webhook trigger
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Netlify Build System                      │
│                                                              │
│  1. Clone repository                                         │
│  2. Install dependencies (npm ci)                            │
│  3. Set environment variables                                │
│  4. Run build command (npm run build)                        │
│  5. Optimize assets                                          │
│  6. Deploy to CDN                                            │
│                                                              │
│  Build Output: .output/public/                               │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ deploy
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Netlify CDN (Global)                      │
│                                                              │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │   US East    │  │   Europe     │  │   Asia       │     │
│  │   Edge Node  │  │   Edge Node  │  │   Edge Node  │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
│                                                              │
│  - HTTPS enabled                                             │
│  - Asset caching                                             │
│  - DDoS protection                                           │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ HTTPS request
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    End Users (Browsers)                      │
│                                                              │
│  ┌────────────────┐         ┌────────────────┐             │
│  │  User A        │         │  User B        │             │
│  │  (Desktop)     │         │  (Mobile)      │             │
│  └────────────────┘         └────────────────┘             │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ WebSocket
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    Convex Backend                            │
│                                                              │
│  - Real-time database                                        │
│  - WebSocket subscriptions                                   │
│  - Mutations & queries                                       │
│  - Scheduled functions                                       │
└─────────────────────────────────────────────────────────────┘
                              │
                              │ API calls
                              ▼
┌─────────────────────────────────────────────────────────────┐
│                    OpenAI Realtime API                       │
│                                                              │
│  - Voice processing                                          │
│  - Function calling                                          │
│  - Audio streaming                                           │
└─────────────────────────────────────────────────────────────┘
```

## Deployment Flow Steps

### 1. Code Changes
```
Developer → Write Code → Commit → Push to GitHub
```

### 2. Automatic Build Trigger
```
GitHub → Webhook → Netlify Build System
```

### 3. Build Process
```
Netlify:
  ├─ Clone repository
  ├─ Install dependencies (npm ci)
  ├─ Load environment variables
  │  ├─ VITE_CONVEX_URL
  │  └─ OPENAI_API_KEY
  ├─ Run build (npm run build)
  │  ├─ Vite builds client bundle
  │  ├─ TanStack Start builds SSR
  │  └─ Nitro builds server
  ├─ Output: .output/public/
  └─ Deploy to CDN
```

### 4. CDN Distribution
```
Netlify CDN:
  ├─ Upload assets to edge nodes
  ├─ Enable HTTPS
  ├─ Configure caching
  └─ Update DNS
```

### 5. User Access
```
User → HTTPS Request → Netlify CDN → Serve App
                                    ↓
                              Load React App
                                    ↓
                         Connect to Convex (WebSocket)
                                    ↓
                              Real-time Sync
```

## Environment Variables Flow

```
Developer → .env.local (local dev)
                │
                ├─ VITE_CONVEX_URL
                ├─ OPENAI_API_KEY
                └─ CONVEX_DEPLOYMENT

Netlify Dashboard → Environment Variables
                │
                ├─ VITE_CONVEX_URL (production)
                └─ OPENAI_API_KEY (production)
                        │
                        ▼
                  Build Process
                        │
                        ▼
                  Injected into App
                        │
                        ▼
                  Runtime Access
```

## Real-Time Data Flow

```
User A (Browser)
    │
    │ Log Activity
    ▼
Convex Mutation
    │
    │ Update Database
    ▼
Convex Query Subscription
    │
    │ Push Update via WebSocket
    ▼
User B (Browser)
    │
    │ Receive Update
    ▼
UI Updates Instantly
```

## Deployment Strategies

### Strategy 1: Continuous Deployment (Recommended)
```
main branch → Auto Deploy to Production
feature/* → Deploy Preview (PR)
```

### Strategy 2: Manual Deployment
```
Developer → Build Locally → Deploy via CLI
```

### Strategy 3: Staged Deployment
```
develop branch → Staging Environment
main branch → Production Environment
```

## Build Optimization

```
Source Code (src/)
    │
    ▼
Vite Build
    │
    ├─ Code splitting
    ├─ Tree shaking
    ├─ Minification
    └─ Asset optimization
    │
    ▼
Output (.output/public/)
    │
    ├─ index.html
    ├─ assets/
    │   ├─ main-[hash].js (373 kB gzipped)
    │   ├─ log-activity-[hash].js (768 kB gzipped)
    │   └─ styles-[hash].css (47 kB gzipped)
    └─ public assets
    │
    ▼
Netlify CDN
    │
    ├─ Brotli compression
    ├─ HTTP/2 push
    └─ Edge caching
```

## Rollback Flow

```
Issue Detected
    │
    ▼
Netlify Dashboard
    │
    ├─ View Deploy History
    ├─ Select Previous Deploy
    └─ Click "Publish Deploy"
    │
    ▼
Instant Rollback
    │
    └─ Previous version live
```

## Monitoring Flow

```
Production Site
    │
    ├─ Netlify Analytics
    │   ├─ Page views
    │   ├─ Bandwidth
    │   └─ Build time
    │
    ├─ Browser Console
    │   ├─ JavaScript errors
    │   └─ Network requests
    │
    └─ Convex Dashboard
        ├─ Query performance
        ├─ Mutation logs
        └─ Function errors
```

## Security Flow

```
User Request (HTTP)
    │
    ▼
Netlify Edge
    │
    ├─ Force HTTPS redirect
    ├─ DDoS protection
    ├─ Rate limiting
    └─ Security headers
    │
    ▼
Application
    │
    ├─ Environment variables (server-side)
    ├─ API keys (not in client code)
    └─ CORS (Convex handles)
    │
    ▼
Secure Response
```

## Performance Flow

```
User Request
    │
    ▼
Nearest CDN Edge Node
    │
    ├─ Cache Hit? → Serve from cache (< 50ms)
    │
    └─ Cache Miss? → Fetch from origin
                        │
                        ├─ Build assets
                        ├─ Cache at edge
                        └─ Serve to user
```

## CI/CD Pipeline (GitHub Actions)

```
Push to main
    │
    ▼
GitHub Actions Trigger
    │
    ├─ Checkout code
    ├─ Setup Node 20
    ├─ Install dependencies
    ├─ Run tests
    │   ├─ Pass → Continue
    │   └─ Fail → Stop deployment
    ├─ Build project
    └─ Deploy to Netlify
    │
    ▼
Deployment Complete
    │
    └─ Comment on PR with preview URL
```

## Troubleshooting Flow

```
Deployment Fails
    │
    ├─ Check Build Logs
    │   ├─ Dependency errors? → Fix package.json
    │   ├─ Build errors? → Fix code
    │   └─ Env vars missing? → Add to Netlify
    │
    ├─ Test Locally
    │   └─ npm run build
    │
    └─ Redeploy
```

## Summary

**Key Points:**
- ✅ Automatic deployments on push to main
- ✅ Deploy previews for pull requests
- ✅ Global CDN distribution
- ✅ HTTPS enabled automatically
- ✅ Environment variables secured
- ✅ Real-time sync via Convex WebSocket
- ✅ Instant rollback capability
- ✅ Zero-downtime deployments

**Deployment Time:**
- Build: ~2-5 minutes
- CDN propagation: Instant
- Total: ~5 minutes from push to live

**Uptime:**
- Netlify SLA: 99.9%
- Atomic deploys: No downtime
- Instant rollback: < 1 minute

---

**Deployed on Netlify** 🚀
