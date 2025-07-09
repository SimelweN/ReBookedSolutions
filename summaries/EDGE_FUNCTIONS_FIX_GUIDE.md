# Edge Functions Fix Guide

## Problem Summary

Your Supabase Edge Functions were returning non-2xx status codes due to:

1. **Environment Variable Issues**: Functions were using non-null assertion (`!`) without proper error handling
2. **Inconsistent Deno Standard Library Versions**: Mixed versions causing compatibility issues
3. **Missing CORS and Error Handling**: Inadequate error responses for debugging
4. **Outdated Supabase Client Versions**: Some functions using outdated client versions

## Fixes Applied

### 1. Created Shared Environment Handler

- **File**: `supabase/functions/_shared/environment.ts`
- **Purpose**: Centralized environment variable validation and error handling
- **Features**:
  - Validates required environment variables
  - Provides clear error messages for missing variables
  - Handles optional variables gracefully

### 2. Enhanced CORS Configuration

- **File**: `supabase/functions/_shared/cors.ts`
- **Updates**:
  - Added support for all HTTP methods (PUT, DELETE)
  - Created standardized error response functions
  - Added timestamp tracking for better debugging

### 3. Fixed Critical Functions

The following functions have been updated with proper error handling:

#### Core Functions

- ✅ `study-resources-api` - Study resources management
- ✅ `advanced-search` - Search functionality with facets
- ✅ `file-upload` - File upload and management

#### Payment Functions

- ✅ `initialize-paystack-payment` - Payment initialization
- ✅ `verify-paystack-payment` - Payment verification
- ✅ `create-order` - Order creation

#### Functions Requiring Manual Update

The following functions need similar updates:

**Payment Functions:**

- `paystack-webhook`
- `create-paystack-subaccount`
- `update-paystack-subaccount`
- `pay-seller`

**Order Management:**

- `process-book-purchase`
- `process-multi-seller-purchase`
- `commit-to-sale`
- `decline-commit`
- `mark-collected`

**Shipping Functions:**

- `courier-guy-quote`
- `courier-guy-shipment`
- `courier-guy-track`
- `fastway-quote`
- `fastway-shipment`
- `fastway-track`

**Communication Functions:**

- `email-automation`
- `send-email-notification`
- `realtime-notifications`

**Admin Functions:**

- `analytics-reporting`
- `dispute-resolution`
- `check-expired-orders`

## Manual Fix Steps for Remaining Functions

For each remaining function, apply these changes:

### 1. Update Imports

```typescript
// OLD
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.50.0";
import { corsHeaders } from "../_shared/cors.ts";

// NEW
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";
import { corsHeaders, createErrorResponse } from "../_shared/cors.ts";
import {
  getEnvironmentConfig,
  validateRequiredEnvVars,
  createEnvironmentError,
} from "../_shared/environment.ts";
```

### 2. Add Environment Validation

```typescript
// Add after imports
const requiredVars = ["SUPABASE_URL", "SUPABASE_SERVICE_ROLE_KEY"]; // Add other required vars
const missingVars = validateRequiredEnvVars(requiredVars);
```

### 3. Update Serve Function

```typescript
serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response("ok", { headers: corsHeaders });
  }

  try {
    // Check environment variables first
    if (missingVars.length > 0) {
      return createEnvironmentError(missingVars);
    }

    const config = getEnvironmentConfig();
    const supabase = createClient(
      config.supabaseUrl,
      config.supabaseServiceKey,
    );

    // For payment functions, also get:
    // const PAYSTACK_SECRET_KEY = config.paystackSecretKey!;

    // Rest of your function logic...
  } catch (error) {
    console.error("Function error:", error);
    return createErrorResponse(error.message || "An unexpected error occurred");
  }
});
```

## Environment Variables Required

Ensure these environment variables are set in your Supabase project:

### Required (Automatically provided by Supabase)

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`

### Optional (Set in Supabase Dashboard > Settings > Edge Functions)

- `PAYSTACK_SECRET_KEY` - For payment functions
- `COURIER_GUY_API_KEY` - For Courier Guy shipping
- `FASTWAY_API_KEY` - For Fastway shipping
- `SMTP_HOST`, `SMTP_PORT`, `SMTP_USER`, `SMTP_PASS` - For email functions

## Deployment Steps

1. **Apply the fixes** to remaining functions using the patterns above
2. **Deploy all functions**:
   ```bash
   supabase functions deploy
   ```
3. **Test each function** individually
4. **Monitor logs** in the Supabase Dashboard

## Testing Your Functions

Test functions using the Supabase Dashboard or curl:

```bash
# Test a function
curl -X POST 'https://your-project-ref.supabase.co/functions/v1/function-name' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json' \
  -d '{"test": "data"}'
```

## Health Check Functions

The following functions are already working correctly:

- ✅ `get-delivery-quotes` - Delivery quote comparison
- ✅ `auto-expire-commits` - Automatic order expiration
- ✅ `process-order-reminders` - Order reminder system

## Next Steps

1. Apply the manual fixes to the remaining functions
2. Test each function after deployment
3. Monitor error logs for any remaining issues
4. Set up proper environment variables for optional services

## Support

If you encounter issues:

1. Check the Supabase Dashboard logs
2. Verify environment variables are set correctly
3. Ensure all imports are using the updated versions
4. Test functions individually to isolate issues

---

The main improvements are:

- ✅ Proper environment variable validation
- ✅ Standardized error handling
- ✅ Consistent Deno and Supabase client versions
- ✅ Better CORS configuration
- ✅ Comprehensive error messages for debugging
