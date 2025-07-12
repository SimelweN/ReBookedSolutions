#!/bin/bash

# Vercel ignore script to prevent unnecessary builds
# Exit code 1 means "ignore", exit code 0 means "build"

echo "🔍 Checking deployment conditions..."
echo "VERCEL_ENV: $VERCEL_ENV"
echo "VERCEL_GIT_COMMIT_MESSAGE: $VERCEL_GIT_COMMIT_MESSAGE"

# Only skip if explicitly marked to skip with [skip-deploy] in commit message
if [[ "$VERCEL_GIT_COMMIT_MESSAGE" == *"[skip-deploy]"* ]]; then
  echo "🚫 Skipping deployment due to [skip-deploy] flag"
  exit 1
fi

# Build for all cases (production, preview, development)
echo "✅ Proceeding with build"
exit 0
