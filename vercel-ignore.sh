#!/bin/bash

# Vercel ignore script to prevent unnecessary builds
# Exit code 1 means "ignore", exit code 0 means "build"

# Always build for production
if [[ "$VERCEL_ENV" == "production" ]]; then
  echo "✅ Building for production"
  exit 0
fi

# Only skip if explicitly marked to skip with [skip-deploy] in commit message
if [[ "$VERCEL_GIT_COMMIT_MESSAGE" == *"[skip-deploy]"* ]]; then
  echo "🚫 Skipping deployment due to [skip-deploy] flag"
  exit 1
fi

# Build for all other cases (including preview deployments)
echo "✅ Building deployment"
exit 0
