#!/bin/bash

# Vercel ignore script to prevent unnecessary builds
# Exit code 1 means "ignore", exit code 0 means "build"

# Check if this is a deployment we want to ignore
if [[ "$VERCEL_ENV" == "preview" ]] && [[ "$VERCEL_GIT_COMMIT_MESSAGE" == *"[skip-deploy]"* ]]; then
  echo "🚫 Skipping preview deployment due to [skip-deploy] flag"
  exit 1
fi

# Always build for production
if [[ "$VERCEL_ENV" == "production" ]]; then
  echo "✅ Building for production"
  exit 0
fi

# Check if only documentation was changed
if git diff HEAD~ --name-only | grep -qE "^(README|docs/|\.md$|netlify\.toml|wrangler\.json)"; then
  echo "📚 Only documentation/config files changed, skipping build"
  exit 1
fi

# Build for all other cases
echo "✅ Building deployment"
exit 0
