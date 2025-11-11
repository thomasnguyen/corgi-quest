#!/bin/bash

# Netlify Environment Variables Setup Script
# Usage: ./set-netlify-env.sh

echo "🚀 Setting up Netlify Environment Variables"
echo ""

# Check if logged in
if ! netlify status &>/dev/null; then
    echo "❌ Not logged in to Netlify. Please run: netlify login"
    exit 1
fi

echo "✅ Logged in to Netlify"
echo ""

# Check if site is linked
if ! netlify status 2>&1 | grep -q "Site ID"; then
    echo "⚠️  Site not linked. Linking now..."
    netlify link
    echo ""
fi

echo "📝 Setting environment variables..."
echo ""

# Set variables (user will need to provide values)
echo "Please provide your values when prompted:"
echo ""

read -p "Enter VITE_CONVEX_URL: " CONVEX_URL
if [ ! -z "$CONVEX_URL" ]; then
    netlify env:set VITE_CONVEX_URL "$CONVEX_URL" --context production,deploy-preview,branch-deploy
    echo "✅ Set VITE_CONVEX_URL"
fi

echo ""

read -p "Enter CLOUDFLARE_WORKER_URL (or press Enter to skip): " WORKER_URL
if [ ! -z "$WORKER_URL" ]; then
    netlify env:set CLOUDFLARE_WORKER_URL "$WORKER_URL" --context production,deploy-preview,branch-deploy
    echo "✅ Set CLOUDFLARE_WORKER_URL"
fi

echo ""

read -p "Enter OPENAI_API_KEY: " OPENAI_KEY
if [ ! -z "$OPENAI_KEY" ]; then
    netlify env:set OPENAI_API_KEY "$OPENAI_KEY" --context production,deploy-preview,branch-deploy
    echo "✅ Set OPENAI_API_KEY"
fi

echo ""

read -p "Enter VITE_SENTRY_DSN (optional, press Enter to skip): " SENTRY_DSN
if [ ! -z "$SENTRY_DSN" ]; then
    netlify env:set VITE_SENTRY_DSN "$SENTRY_DSN" --context production,deploy-preview,branch-deploy
    echo "✅ Set VITE_SENTRY_DSN"
fi

echo ""
echo "🎉 All environment variables set!"
echo ""
echo "📋 Verify your variables:"
netlify env:list
echo ""
echo "💡 To trigger a new deploy: netlify deploy --prod"

