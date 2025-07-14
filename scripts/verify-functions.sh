#!/bin/bash

# Function Structure Verification Script
# Checks if all Edge Functions have proper index.ts files

set -e

echo "🔍 Verifying Edge Function Structure"
echo "====================================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# List of expected functions
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

MISSING=0
EXISTS=0
TOTAL=${#FUNCTIONS[@]}

echo "📋 Checking $TOTAL Edge Functions..."
echo ""

for func in "${FUNCTIONS[@]}"; do
    if [ -f "supabase/functions/$func/index.ts" ]; then
        echo -e "${GREEN}✅ $func/index.ts${NC}"
        ((EXISTS++))
    else
        echo -e "${RED}❌ $func/index.ts MISSING${NC}"
        ((MISSING++))
    fi
done

echo ""
echo "🔍 Checking shared files..."
if [ -f "supabase/functions/_shared/cors.ts" ]; then
    echo -e "${GREEN}✅ _shared/cors.ts${NC}"
else
    echo -e "${RED}❌ _shared/cors.ts MISSING${NC}"
    ((MISSING++))
fi

echo ""
echo "📊 Summary"
echo "=========="
echo -e "${GREEN}✅ Found: $EXISTS${NC}"
echo -e "${RED}❌ Missing: $MISSING${NC}"
echo -e "${BLUE}📁 Total Expected: $TOTAL${NC}"

if [ $MISSING -eq 0 ]; then
    echo ""
    echo -e "${GREEN}🎉 All Edge Function files are present!${NC}"
    echo ""
    echo "🔧 Next steps to resolve deployment issues:"
    echo "1. Ensure Docker is running: docker --version && docker ps"
    echo "2. Login to Supabase: npx supabase login"
    echo "3. Link project: npx supabase link --project-ref kbpjqzaqbqukutflwixf"
    echo "4. Try deploying one function: npx supabase functions deploy email-automation --debug"
    echo ""
    echo "📖 See EDGE_FUNCTIONS_TROUBLESHOOTING.md for detailed guidance"
else
    echo ""
    echo -e "${YELLOW}⚠️ Some function files are missing${NC}"
    echo "This could cause deployment failures."
    echo ""
    echo "🔧 To fix missing files, you would need to create them."
    echo "However, based on the error message, the main issue is likely:"
    echo "1. Docker not running"
    echo "2. Supabase CLI not properly configured"
    echo "3. Environment/permission issues"
fi

echo ""
echo "🔍 Additional Checks"
echo "==================="

# Check if supabase directory exists
if [ -d "supabase" ]; then
    echo -e "${GREEN}✅ supabase/ directory exists${NC}"
else
    echo -e "${RED}❌ supabase/ directory missing${NC}"
fi

# Check if functions directory exists
if [ -d "supabase/functions" ]; then
    echo -e "${GREEN}✅ supabase/functions/ directory exists${NC}"
else
    echo -e "${RED}❌ supabase/functions/ directory missing${NC}"
fi

# Check if config.toml exists
if [ -f "supabase/config.toml" ]; then
    echo -e "${GREEN}✅ supabase/config.toml exists${NC}"
else
    echo -e "${RED}❌ supabase/config.toml missing${NC}"
fi

echo ""
echo "🚀 If all files are present, the issue is likely environment-related."
echo "See the troubleshooting guide for Docker and Supabase CLI setup."
