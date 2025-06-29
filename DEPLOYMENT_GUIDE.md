# Deployment Troubleshooting Guide

## ReBooked Solutions - Deployment Documentation

This guide helps diagnose and resolve common deployment issues for the ReBooked Solutions platform.

## Quick Diagnostics

Visit `/deployment-help` or `/support/deployment` in your application to run automated diagnostics.

## Common Issues and Solutions

### 1. No Deployment or Failed Deployment

**Problem:** The project may not exist, or the latest deployment failed.

**Solution:**

1. Check your Vercel dashboard under that deployment name
2. Log into Vercel → Find the project → Look at the Deployments section
3. Confirm whether a "Production" or "Preview" deployment exists and succeeds
4. Review the latest Deployment Log for errors

### 2. GitHub Link Issues

**Problem:** The GitHub repo might be renamed, private, or deleted, causing the build to fail.

**Solution:**

1. Verify the repository exists and is accessible
2. Check if Vercel has proper permissions to access the repository
3. Re-link the repository if necessary
4. Ensure the repository wasn't renamed or moved

### 3. Build Errors

**Problem:** React/Vite framework project build might be failing silently.

**Common build issues:**

- Missing dependencies
- TypeScript errors
- Environment variable issues
- Node version mismatches
- Build script errors

**Solution:**

1. Review the Deployment Logs in the Vercel dashboard
2. Look for specific error messages
3. Test the build locally: `yarn build`
4. Check for missing dependencies: `yarn install`

### 4. Domain Misconfiguration

**Problem:** The custom subdomain might not be pointing correctly.

**Solution:**

1. Check DNS configuration and domain settings
2. Verify DNS records point to Vercel
3. Check domain configuration in Vercel dashboard
4. Ensure SSL certificate is active
5. Wait for DNS propagation (up to 24-48 hours)

### 5. Environment Variables Missing

**Problem:** Required environment variables are not set in the deployment environment.

**Required variables for ReBooked Solutions:**

- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_ANON_KEY`
- `VITE_GOOGLE_MAPS_API_KEY`
- `VITE_PAYSTACK_PUBLIC_KEY`

**Solution:**

1. Set environment variables in Vercel project settings
2. Go to Project Settings → Environment Variables
3. Add each required variable for all environments (Production, Preview, Development)

## Optimal Configuration

### vercel.json

```json
{
  "buildCommand": "yarn build",
  "outputDirectory": "dist",
  "installCommand": "yarn install",
  "devCommand": "yarn dev",
  "framework": "vite",
  "rewrites": [
    {
      "source": "/((?!api/).*)",
      "destination": "/index.html"
    }
  ],
  "headers": [
    {
      "source": "/assets/(.*)",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=31536000, immutable"
        }
      ]
    }
  ]
}
```

### package.json Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "vite build",
    "preview": "vite preview",
    "lint": "eslint ."
  }
}
```

## Deployment Checklist

Before deploying, ensure:

- [ ] All required environment variables are set
- [ ] `package.json` has correct build scripts
- [ ] `vercel.json` is properly configured
- [ ] No TypeScript errors: `yarn build`
- [ ] No linting errors: `yarn lint`
- [ ] All dependencies are installed: `yarn install`
- [ ] Repository is accessible to Vercel
- [ ] Domain configuration is correct (if using custom domain)

## Monitoring and Health Checks

The application includes automated health checks that monitor:

1. **Domain Accessibility** - Verifies domains are responding
2. **Build Assets** - Checks critical assets are accessible
3. **Environment Variables** - Validates required variables are set
4. **Performance** - Monitors page load times

Access these checks at `/deployment-help` in your application.

## Emergency Procedures

### If deployment is completely broken:

1. **Rollback to previous version:**
   - Go to Vercel dashboard
   - Find the last working deployment
   - Click "Redeploy"

2. **Force redeploy:**
   - Push a new commit to trigger deployment
   - Or manually trigger redeploy from Vercel dashboard

3. **Check environment variables:**
   - Verify all required variables are set
   - Check for typos in variable names
   - Ensure variables are set for correct environment

### If application loads but has runtime errors:

1. Check browser console for JavaScript errors
2. Verify API endpoints are working
3. Check database connectivity
4. Validate authentication configuration

## Performance Optimization

For better deployment performance:

1. **Enable caching headers** (already configured in vercel.json)
2. **Optimize bundle size:**
   - Remove unused dependencies
   - Implement code splitting
   - Use dynamic imports for heavy components

3. **Use Vercel Analytics:**
   - Monitor Core Web Vitals
   - Track user interactions
   - Identify performance bottlenecks

## Support Resources

- **Vercel Documentation:** https://vercel.com/docs
- **Vite Documentation:** https://vitejs.dev/guide/
- **Application Status:** `/system-status`
- **Deployment Diagnostics:** `/deployment-help`

## Troubleshooting Commands

```bash
# Local development
yarn install
yarn dev

# Build testing
yarn build
yarn preview

# Linting
yarn lint

# Check for build issues
yarn build --mode development
```

## Getting Help

If you're still experiencing issues:

1. Generate a troubleshooting report from `/deployment-help`
2. Check Vercel deployment logs
3. Review browser console errors
4. Contact support with specific error messages

---

_Last updated: January 2025_
_Version: 2.0.0_
