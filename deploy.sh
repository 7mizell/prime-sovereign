#!/bin/bash
# Prime Sovereign Listings — Netlify Deploy Script
# Usage: ./deploy.sh [draft|prod]

set -e

PROJECT_DIR="/c/Users/Mjmiz/.openclaw/workspace/mizell-website/prime-sovereign"
cd "$PROJECT_DIR"

MODE="${1:-draft}"

# Load env
if [ -f .env ]; then
  export $(cat .env | grep -v '^#' | xargs)
fi

# Install Netlify CLI if needed
if ! command -v netlify &> /dev/null; then
  echo "Installing Netlify CLI..."
  npm install -g netlify-cli
fi

# Login if token provided
if [ -n "$NETLIFY_AUTH_TOKEN" ]; then
  netlify login --auth-token "$NETLIFY_AUTH_TOKEN"
fi

# Build (no build step for static site, but run npm install for functions)
echo "Installing function dependencies..."
cd netlify/functions
npm install --production 2>/dev/null || true
cd "$PROJECT_DIR"

# Deploy
if [ "$MODE" = "prod" ]; then
  echo "Deploying to PRODUCTION..."
  netlify deploy --prod --dir=site --site="$NETLIFY_SITE_ID"
else
  echo "Deploying DRAFT..."
  netlify deploy --dir=site --site="$NETLIFY_SITE_ID"
fi

echo "Deploy complete!"