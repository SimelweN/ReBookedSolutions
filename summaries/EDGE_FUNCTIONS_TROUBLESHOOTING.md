# Edge Functions Deployment Troubleshooting Guide

## 🔍 Issue Analysis

The error "The system cannot find the path specified" and "Entrypoint path does not exist" typically indicates one of these problems:

1. **Docker Issues**: Supabase CLI requires Docker to build and deploy Edge Functions
2. **File Path Issues**: Edge functions need specific file structure
3. **Environment Issues**: Missing environment variables or improper Supabase CLI setup

## ✅ Verification Steps

### 1. Check Docker Installation and Status

```bash
# Check if Docker is installed
docker --version

# Check if Docker is running
docker ps

# If Docker isn't running, start it:
# - On Windows: Open Docker Desktop
# - On macOS: Open Docker Desktop
# - On Linux: sudo systemctl start docker
```

### 2. Verify Supabase CLI Setup

```bash
# Check if Supabase CLI is installed
npx supabase --version

# Login to Supabase (if not already logged in)
npx supabase login

# Check current project link
npx supabase status

# Link to project if needed
npx supabase link --project-ref kbpjqzaqbqukutflwixf
```

### 3. Verify Function File Structure

All functions should have this structure:

```
supabase/functions/
├── _shared/
│   └── cors.ts
├── function-name/
│   └── index.ts
└── ...
```

## 🔧 Fix Steps

### Step 1: Ensure Docker is Running

**Windows/macOS:**

1. Open Docker Desktop application
2. Wait for it to fully start (green status in bottom bar)
3. Verify with: `docker ps`

**Linux:**

```bash
sudo systemctl start docker
sudo systemctl enable docker
```

### Step 2: Verify All Function Files Exist

Run this verification script to check all functions:

```bash
#!/bin/bash

echo "🔍 Checking Edge Function Structure..."

FUNCTIONS=(
    "advanced-search"
    "analytics-reporting"
    "auto-expire-commits"
    "check-expired-orders"
    "commit-to-sale"
    "courier-guy-quote"
    "courier-guy-shipment"
    "courier-guy-track"
    "create-order"
    "create-paystack-subaccount"
    "decline-commit"
    "dispute-resolution"
    "email-automation"
    "fastway-quote"
    "fastway-shipment"
    "fastway-track"
    "file-upload"
    "get-delivery-quotes"
    "initialize-paystack-payment"
    "mark-collected"
    "pay-seller"
    "paystack-webhook"
    "process-book-purchase"
    "process-multi-seller-purchase"
    "process-order-reminders"
    "realtime-notifications"
    "send-email-notification"
    "study-resources-api"
    "update-paystack-subaccount"
    "verify-paystack-payment"
)

for func in "${FUNCTIONS[@]}"; do
    if [ -f "supabase/functions/$func/index.ts" ]; then
        echo "✅ $func/index.ts exists"
    else
        echo "❌ $func/index.ts MISSING"
    fi
done

echo ""
echo "🔍 Checking shared files..."
if [ -f "supabase/functions/_shared/cors.ts" ]; then
    echo "✅ _shared/cors.ts exists"
else
    echo "❌ _shared/cors.ts MISSING"
fi
```

### Step 3: Test Single Function Deployment

Start with deploying one function to test:

```bash
# Test with a simple function first
npx supabase functions deploy email-automation --debug

# If successful, deploy another
npx supabase functions deploy study-resources-api --debug
```

### Step 4: Deploy All Functions

If individual functions work, deploy all:

```bash
# Use the provided deployment script
chmod +x scripts/deploy-all-edge-functions.sh
./scripts/deploy-all-edge-functions.sh
```

## 🚨 Common Issues and Solutions

### Issue 1: "Docker is not running"

**Solution:** Start Docker Desktop and wait for it to be fully ready

### Issue 2: "Not logged in to Supabase"

**Solution:** Run `npx supabase login` and follow the prompts

### Issue 3: "Project not linked"

**Solution:** Run `npx supabase link --project-ref kbpjqzaqbqukutflwixf`

### Issue 4: "Permission denied" errors

**Solution:**

```bash
# Make scripts executable
chmod +x scripts/*.sh

# On Windows, you might need to run in Git Bash or WSL
```

### Issue 5: "Function build failed"

**Solution:** Check function code for syntax errors:

```bash
# Deploy with debug for more info
npx supabase functions deploy function-name --debug
```

## 🧪 Testing Deployed Functions

After deployment, test functions:

```bash
# Test function with curl
curl -X POST \
  'https://kbpjqzaqbqukutflwixf.supabase.co/functions/v1/email-automation?action=templates' \
  -H 'Authorization: Bearer YOUR_ANON_KEY' \
  -H 'Content-Type: application/json'
```

## 📋 Environment Variables to Set

In Supabase Dashboard → Functions → Environment Variables:

```
VITE_RESEND_API_KEY=re_MZmby9ES_49kBCotYLoaEv6mQNTJvVRRW
FROM_EMAIL=noreply@rebookedsolutions.co.za
PAYSTACK_SECRET_KEY=your_paystack_secret_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## 🔗 Useful Commands

```bash
# Check function logs
npx supabase functions logs

# List deployed functions
npx supabase functions list

# Delete a function
npx supabase functions delete function-name

# Reset local environment
npx supabase stop
npx supabase start
```

## 🆘 If All Else Fails

1. **Reset Supabase CLI:**

   ```bash
   npx supabase stop --no-backup
   npx supabase start
   npx supabase link --project-ref kbpjqzaqbqukutflwixf
   ```

2. **Restart Docker:**
   - Completely quit and restart Docker Desktop
   - Wait for it to be fully ready

3. **Use Alternative Deployment:**
   - Deploy functions one by one manually
   - Use Supabase Dashboard UI for deployment

4. **Check Supabase Status:**
   - Visit status.supabase.com to check for service issues

## 📞 Additional Support

If issues persist:

1. Check Supabase Discord/Support
2. Review function logs in Supabase Dashboard
3. Test with minimal function first
4. Ensure all dependencies are correctly installed

Remember: The functions exist and are properly coded - this is primarily a deployment environment issue that can be resolved by ensuring Docker is running and the Supabase CLI is properly configured.
