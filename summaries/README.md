# Project Summaries & Documentation

This folder contains all summary files, guides, and comprehensive documentation for the project.

## File Organization

### Edge Functions Documentation

- `EDGE_FUNCTIONS_COMPREHENSIVE_FIX.md` - Complete guide for edge function fixes
- `EDGE_FUNCTIONS_CRITICAL_FIXES.md` - Critical fixes applied to edge functions
- `EDGE_FUNCTIONS_DEEP_DIVE_COMPLETE.md` - Deep dive analysis of edge functions
- `EDGE_FUNCTIONS_DEPLOYMENT_GUIDE.md` - Deployment guide for edge functions
- `EDGE_FUNCTIONS_DEPLOYMENT.md` - Deployment procedures
- `EDGE_FUNCTIONS_FIX_GUIDE.md` - Fix guide for edge functions
- `EDGE_FUNCTIONS_FIX_STATUS_FINAL.md` - Final status of edge function fixes
- `EDGE_FUNCTIONS_SUCCESS_SUMMARY.md` - Summary of successful implementations
- `EDGE_FUNCTIONS_TESTING_GUIDE.md` - Testing procedures for edge functions
- `EDGE_FUNCTIONS_TROUBLESHOOTING.md` - Troubleshooting guide

### Setup & Configuration

- `BACKEND_SETUP.md` - Backend setup instructions
- `SETUP.md` - General project setup guide
- `VERCEL_SETUP.md` - Vercel deployment setup
- `EMAIL_SETUP_GUIDE.md` - Email configuration guide
- `DEV_DASHBOARD_GUIDE.md` - Development dashboard guide

### Bug Fixes & Issue Resolution

- `ADDRESS_FIX_SUMMARY.md` - Address system fixes
- `BUGFIXES_SUMMARY.md` - General bug fixes summary
- `CRITICAL_FIXES_APPLIED.md` - Critical fixes documentation
- `INFINITE_LOOP_COMPREHENSIVE_FIX.md` - Infinite loop issue fixes
- `INFINITE_LOOP_FIX_SUMMARY.md` - Summary of infinite loop fixes
- `MULTI_SELLER_CART_FIXES.md` - Multi-seller cart system fixes

### Comprehensive Documentation

- `COMPREHENSIVE_BACKEND_README.md` - Complete backend documentation

## Function Usage Strategy

This project follows a specific strategy for function placement:

### Authentication Functions

- ❌ **DO NOT** use Vercel API Routes for authentication, login, or sign-up
- ✅ Use Supabase Auth for all authentication logic

### Other Functions

- ✅ **Prefer** Supabase Edge Functions when stable and no webhooks needed
- ✅ **Default** to Vercel API Routes for:
  - Webhooks (Paystack, Courier)
  - Payout handling
  - Internal logic (non-auth)
  - External integrations

## Build Status

- ✅ Build completes successfully
- ✅ No runtime errors in vercel.json
- ⚠️ Lint warnings present (non-blocking)
- ✅ Function strategy compliance verified
