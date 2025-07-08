#!/bin/bash

# Comprehensive Edge Functions Deployment Script
# This script deploys all Supabase Edge Functions for ReBooked Solutions

set -e

echo "🚀 Deploying All Supabase Edge Functions"
echo "========================================"
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Project configuration
PROJECT_REF="kbpjqzaqbqukutflwixf"

echo "📋 Pre-deployment checklist:"
echo "----------------------------"
echo "1. ✅ Supabase CLI installed"
echo "2. 🔑 Login to Supabase (run: npx supabase login)"
echo "3. 🔗 Link to project (run: npx supabase link --project-ref $PROJECT_REF)"
echo ""

# Check if logged in
echo "🔍 Checking Supabase authentication..."
if ! npx supabase projects list >/dev/null 2>&1; then
    echo -e "${RED}❌ Not logged in to Supabase${NC}"
    echo -e "${YELLOW}Please run: npx supabase login${NC}"
    exit 1
fi
echo -e "${GREEN}✅ Authenticated with Supabase${NC}"

# Link to project if not already linked
echo "🔗 Linking to project..."
npx supabase link --project-ref $PROJECT_REF || {
    echo -e "${YELLOW}⚠️ Already linked or link failed${NC}"
}

# List of functions to deploy (in priority order)
FUNCTIONS=(
    "_shared"
    "send-email-notification"
    "email-automation"
    "study-resources-api"
    "advanced-search"
    "file-upload"
    "realtime-notifications"
    "analytics-reporting"
    "dispute-resolution"
    "create-order"
    "process-book-purchase"
    "process-multi-seller-purchase"
    "paystack-webhook"
    "initialize-paystack-payment"
    "verify-paystack-payment"
    "create-paystack-subaccount"
    "update-paystack-subaccount"
    "pay-seller"
    "commit-to-sale"
    "decline-commit"
    "auto-expire-commits"
    "check-expired-orders"
    "process-order-reminders"
    "mark-collected"
    "get-delivery-quotes"
    "courier-guy-quote"
    "courier-guy-shipment"
    "courier-guy-track"
    "fastway-quote"
    "fastway-shipment"
    "fastway-track"
)

echo ""
echo "📦 Deploying ${#FUNCTIONS[@]} Edge Functions..."
echo "============================================="

# Deploy functions
DEPLOYED=0
FAILED=0

for func in "${FUNCTIONS[@]}"; do
    echo ""
    echo -e "${BLUE}🚀 Deploying: ${func}${NC}"
    echo "----------------------------"

    if npx supabase functions deploy $func; then
        echo -e "${GREEN}✅ Successfully deployed: ${func}${NC}"
        ((DEPLOYED++))
    else
        echo -e "${RED}❌ Failed to deploy: ${func}${NC}"
        ((FAILED++))
    fi
done

echo ""
echo "📊 Deployment Summary"
echo "===================="
echo -e "${GREEN}✅ Deployed: $DEPLOYED${NC}"
echo -e "${RED}❌ Failed: $FAILED${NC}"
echo -e "${BLUE}📁 Total: ${#FUNCTIONS[@]}${NC}"

if [ $FAILED -eq 0 ]; then
    echo ""
    echo -e "${GREEN}🎉 All Edge Functions deployed successfully!${NC}"
    echo ""
    echo "🔧 Next steps:"
    echo "1. Set environment variables in Supabase Dashboard"
    echo "2. Test the functions using the dev dashboard"
    echo "3. Check function logs if any issues occur"
else
    echo ""
    echo -e "${YELLOW}⚠️ Some functions failed to deploy${NC}"
    echo "Check the errors above and retry failed functions"
fi

echo ""
echo "🌐 Environment Variables to set in Supabase Dashboard:"
echo "======================================================"
echo "VITE_RESEND_API_KEY=re_MZmby9ES_49kBCotYLoaEv6mQNTJvVRRW"
echo "SENDER_API_KEY=your_sender_api_key_if_needed"
echo "FROM_EMAIL=noreply@rebookedsolutions.co.za"
echo "SUPABASE_SERVICE_ROLE_KEY=your_service_role_key"
echo ""
echo "📍 Set these at: https://supabase.com/dashboard/project/$PROJECT_REF/settings/functions"
echo ""
echo "✨ Deployment script complete!"
