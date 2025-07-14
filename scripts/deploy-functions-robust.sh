#!/bin/bash

# Robust Edge Functions Deployment Script
# Handles common deployment issues and provides detailed diagnostics

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

echo -e "${CYAN}🚀 Robust Supabase Edge Functions Deployment${NC}"
echo "=============================================="
echo ""

PROJECT_REF="kbpjqzaqbqukutflwixf"

# Helper function for logging
log_info() {
    echo -e "${BLUE}ℹ️  $1${NC}"
}

log_success() {
    echo -e "${GREEN}✅ $1${NC}"
}

log_warning() {
    echo -e "${YELLOW}⚠️  $1${NC}"
}

log_error() {
    echo -e "${RED}❌ $1${NC}"
}

# Pre-deployment checks
echo -e "${CYAN}📋 Pre-deployment Diagnostics${NC}"
echo "==============================="

# Check if we're in the right directory
if [ ! -d "supabase/functions" ]; then
    log_error "supabase/functions directory not found!"
    log_info "Please run this script from the project root directory"
    exit 1
fi
log_success "Project structure verified"

# Check Supabase CLI
log_info "Checking Supabase CLI..."
if command -v supabase &> /dev/null; then
    SUPABASE_VERSION=$(npx supabase --version 2>/dev/null || echo "unknown")
    log_success "Supabase CLI found (version: $SUPABASE_VERSION)"
else
    log_error "Supabase CLI not found"
    log_info "Install with: npm install -g supabase"
    exit 1
fi

# Check Docker
log_info "Checking Docker..."
if command -v docker &> /dev/null; then
    if docker ps >/dev/null 2>&1; then
        log_success "Docker is running"
    else
        log_warning "Docker is installed but not running"
        log_info "Please start Docker Desktop and wait for it to be ready"
        log_info "Then run: docker ps (should show no errors)"
        echo ""
        echo "On Windows/Mac: Open Docker Desktop app"
        echo "On Linux: sudo systemctl start docker"
        echo ""
        read -p "Press Enter when Docker is running, or Ctrl+C to exit..."
        echo ""
    fi
else
    log_warning "Docker not found or not accessible"
    log_info "Supabase CLI requires Docker for Edge Functions"
    log_info "Install Docker Desktop from docker.com"
fi

# Check authentication
log_info "Checking Supabase authentication..."
if npx supabase projects list >/dev/null 2>&1; then
    log_success "Authenticated with Supabase"
else
    log_warning "Not authenticated with Supabase"
    log_info "Running login process..."
    npx supabase login
fi

# Check project link
log_info "Checking project link..."
if npx supabase status >/dev/null 2>&1; then
    log_success "Project is linked"
else
    log_warning "Project not linked"
    log_info "Linking to project $PROJECT_REF..."
    npx supabase link --project-ref $PROJECT_REF
fi

echo ""
echo -e "${CYAN}📦 Function Deployment${NC}"
echo "======================"

# Core functions to deploy (in dependency order)
CORE_FUNCTIONS=(
    "send-email-notification"
    "email-automation"
    "paystack-webhook"
    "study-resources-api"
)

# Additional functions
ALL_FUNCTIONS=(
    "send-email-notification"
    "email-automation"
    "paystack-webhook"
    "study-resources-api"
    "advanced-search"
    "file-upload"
    "realtime-notifications"
    "analytics-reporting"
    "dispute-resolution"
    "create-order"
    "process-book-purchase"
    "process-multi-seller-purchase"
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

# Ask user for deployment scope
echo "Choose deployment scope:"
echo "1) Deploy core functions only (recommended for testing)"
echo "2) Deploy all functions"
echo "3) Deploy specific function"
echo ""
read -p "Enter choice (1-3): " DEPLOY_CHOICE

case $DEPLOY_CHOICE in
    1)
        FUNCTIONS_TO_DEPLOY=("${CORE_FUNCTIONS[@]}")
        log_info "Deploying core functions only"
        ;;
    2)
        FUNCTIONS_TO_DEPLOY=("${ALL_FUNCTIONS[@]}")
        log_info "Deploying all functions"
        ;;
    3)
        echo "Available functions:"
        for i in "${!ALL_FUNCTIONS[@]}"; do
            echo "$((i+1))) ${ALL_FUNCTIONS[i]}"
        done
        echo ""
        read -p "Enter function number: " FUNC_NUM
        if [[ $FUNC_NUM -ge 1 && $FUNC_NUM -le ${#ALL_FUNCTIONS[@]} ]]; then
            FUNC_INDEX=$((FUNC_NUM-1))
            FUNCTIONS_TO_DEPLOY=("${ALL_FUNCTIONS[FUNC_INDEX]}")
            log_info "Deploying single function: ${ALL_FUNCTIONS[FUNC_INDEX]}"
        else
            log_error "Invalid function number"
            exit 1
        fi
        ;;
    *)
        log_error "Invalid choice"
        exit 1
        ;;
esac

echo ""
log_info "Starting deployment of ${#FUNCTIONS_TO_DEPLOY[@]} function(s)..."

DEPLOYED=0
FAILED=0
FAILED_FUNCTIONS=()

for func in "${FUNCTIONS_TO_DEPLOY[@]}"; do
    echo ""
    echo -e "${BLUE}🚀 Deploying: $func${NC}"
    echo "$(printf '%.0s-' {1..40})"
    
    # Check if function exists
    if [ ! -f "supabase/functions/$func/index.ts" ]; then
        log_error "Function file not found: supabase/functions/$func/index.ts"
        ((FAILED++))
        FAILED_FUNCTIONS+=("$func (file not found)")
        continue
    fi
    
    # Deploy with detailed output
    if npx supabase functions deploy $func --debug; then
        log_success "Successfully deployed: $func"
        ((DEPLOYED++))
    else
        log_error "Failed to deploy: $func"
        ((FAILED++))
        FAILED_FUNCTIONS+=("$func")
        
        # Ask if user wants to continue
        echo ""
        read -p "Continue with remaining functions? (y/n): " CONTINUE
        if [[ $CONTINUE != "y" && $CONTINUE != "Y" ]]; then
            break
        fi
    fi
done

echo ""
echo -e "${CYAN}📊 Deployment Summary${NC}"
echo "====================="
echo -e "${GREEN}✅ Successfully deployed: $DEPLOYED${NC}"
echo -e "${RED}❌ Failed: $FAILED${NC}"
echo -e "${BLUE}📁 Total attempted: ${#FUNCTIONS_TO_DEPLOY[@]}${NC}"

if [ $FAILED -gt 0 ]; then
    echo ""
    echo -e "${RED}❌ Failed Functions:${NC}"
    for failed_func in "${FAILED_FUNCTIONS[@]}"; do
        echo "   • $failed_func"
    done
    
    echo ""
    echo -e "${YELLOW}🔧 Troubleshooting Failed Deployments:${NC}"
    echo "1. Check function syntax: Review the index.ts file for errors"
    echo "2. Verify Docker: Ensure Docker is running and accessible"
    echo "3. Check logs: npx supabase functions logs function-name"
    echo "4. Retry single function: npx supabase functions deploy function-name --debug"
    echo "5. Review error messages above for specific issues"
fi

if [ $DEPLOYED -gt 0 ]; then
    echo ""
    echo -e "${GREEN}🎉 Deployment completed with $DEPLOYED successful function(s)!${NC}"
    echo ""
    echo -e "${CYAN}🌐 Function URLs:${NC}"
    for func in "${FUNCTIONS_TO_DEPLOY[@]}"; do
        # Only show URLs for successfully deployed functions
        if [[ ! " ${FAILED_FUNCTIONS[@]} " =~ " ${func} " ]]; then
            echo "   • https://$PROJECT_REF.supabase.co/functions/v1/$func"
        fi
    done
    
    echo ""
    echo -e "${CYAN}🔧 Next Steps:${NC}"
    echo "1. Set environment variables in Supabase Dashboard"
    echo "2. Test functions using the dev dashboard or curl"
    echo "3. Check function logs if any issues occur"
    echo "4. See EDGE_FUNCTIONS_TROUBLESHOOTING.md for detailed guidance"
fi

echo ""
echo -e "${CYAN}📋 Important Environment Variables to Set:${NC}"
echo "============================================="
echo "Go to: https://supabase.com/dashboard/project/$PROJECT_REF/settings/functions"
echo ""
echo "Required variables:"
echo "• VITE_RESEND_API_KEY=re_MZmby9ES_49kBCotYLoaEv6mQNTJvVRRW"
echo "• FROM_EMAIL=noreply@rebookedsolutions.co.za"
echo "• PAYSTACK_SECRET_KEY=your_paystack_secret_key"
echo "• SUPABASE_SERVICE_ROLE_KEY=your_service_role_key"

echo ""
echo -e "${GREEN}✨ Deployment script completed!${NC}"
