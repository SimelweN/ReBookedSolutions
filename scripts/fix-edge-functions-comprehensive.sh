#!/bin/bash

# Comprehensive Edge Functions Fix and Deployment Script
# This script diagnoses and fixes common Supabase Edge Function issues

# Color codes for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

# Configuration
PROJECT_REF="kbpjqzaqbqukutflwixf"
FUNCTIONS_DIR="supabase/functions"

# Logging functions
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

log_section() {
    echo ""
    echo -e "${CYAN}$1${NC}"
    echo "$(printf '%.0s=' {1..50})"
}

# Function to check prerequisites
check_prerequisites() {
    log_section "🔍 Checking Prerequisites"
    
    # Check if Supabase CLI is installed
    if ! command -v supabase &> /dev/null; then
        log_error "Supabase CLI is not installed. Please install it first:"
        echo "  npm install -g supabase"
        exit 1
    else
        SUPABASE_VERSION=$(supabase --version | cut -d' ' -f2)
        log_success "Supabase CLI installed: v$SUPABASE_VERSION"
    fi
    
    # Check if Deno is installed (optional but recommended for local testing)
    if command -v deno &> /dev/null; then
        DENO_VERSION=$(deno --version | head -n1 | cut -d' ' -f2)
        log_success "Deno installed: v$DENO_VERSION"
    else
        log_warning "Deno not found. Install for local testing: https://deno.land/manual/getting_started/installation"
    fi
    
    # Check if Docker is running (required for local function development)
    if command -v docker &> /dev/null && docker info &> /dev/null; then
        log_success "Docker is running"
    else
        log_warning "Docker not running. Start Docker for local function development."
    fi
    
    # Check if we're in a Supabase project
    if [ ! -f "supabase/config.toml" ]; then
        log_error "Not in a Supabase project directory. Run 'supabase init' first."
        exit 1
    else
        log_success "Supabase project detected"
    fi
}

# Function to validate project linking
validate_project_link() {
    log_section "🔗 Validating Project Link"
    
    # Check if project is linked
    if supabase status &> /dev/null; then
        log_success "Project is linked and accessible"
        
        # Show project info
        PROJECT_INFO=$(supabase projects list 2>/dev/null | grep "$PROJECT_REF" || echo "")
        if [ -n "$PROJECT_INFO" ]; then
            log_info "Project: $PROJECT_INFO"
        fi
    else
        log_warning "Project not linked or not accessible"
        log_info "Attempting to link project..."
        
        if supabase link --project-ref "$PROJECT_REF"; then
            log_success "Project linked successfully"
        else
            log_error "Failed to link project. Please check your credentials and project ref."
            echo "Try: supabase link --project-ref $PROJECT_REF"
            exit 1
        fi
    fi
}

# Function to check environment variables and secrets
check_environment() {
    log_section "🔑 Checking Environment Variables and Secrets"
    
    # Required environment variables for edge functions
    REQUIRED_SECRETS=(
        "SUPABASE_URL"
        "SUPABASE_SERVICE_ROLE_KEY"
        "PAYSTACK_SECRET_KEY"
    )
    
    OPTIONAL_SECRETS=(
        "SENDER_API_KEY"
        "RESEND_API_KEY"
        "FROM_EMAIL"
        "COURIER_GUY_API_KEY"
        "FASTWAY_API_KEY"
        "SHIPLOGIC_API_KEY"
    )
    
    # Check secrets (this requires appropriate permissions)
    log_info "Checking for required secrets..."
    MISSING_SECRETS=()
    
    # Note: We can't directly read secrets, but we can list them
    if command -v supabase &> /dev/null; then
        SECRETS_LIST=$(supabase secrets list 2>/dev/null || echo "")
        
        for secret in "${REQUIRED_SECRETS[@]}"; do
            if [[ "$SECRETS_LIST" == *"$secret"* ]]; then
                log_success "✓ $secret is set"
            else
                log_warning "✗ $secret is missing"
                MISSING_SECRETS+=("$secret")
            fi
        done
        
        for secret in "${OPTIONAL_SECRETS[@]}"; do
            if [[ "$SECRETS_LIST" == *"$secret"* ]]; then
                log_success "✓ $secret is set (optional)"
            else
                log_info "○ $secret not set (optional)"
            fi
        done
    else
        log_warning "Cannot check secrets - insufficient permissions"
    fi
    
    if [ ${#MISSING_SECRETS[@]} -gt 0 ]; then
        log_warning "Missing required secrets. Set them using:"
        for secret in "${MISSING_SECRETS[@]}"; do
            echo "  supabase secrets set $secret=your_value_here"
        done
        echo ""
        read -p "Continue anyway? (y/N): " -n 1 -r
        echo ""
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
}

# Function to validate edge function code
validate_function_code() {
    log_section "🔍 Validating Edge Function Code"
    
    if [ ! -d "$FUNCTIONS_DIR" ]; then
        log_error "Functions directory not found: $FUNCTIONS_DIR"
        exit 1
    fi
    
    TOTAL_FUNCTIONS=0
    VALID_FUNCTIONS=0
    INVALID_FUNCTIONS=()
    
    for func_dir in "$FUNCTIONS_DIR"/*; do
        if [ -d "$func_dir" ] && [ "$(basename "$func_dir")" != "_shared" ]; then
            TOTAL_FUNCTIONS=$((TOTAL_FUNCTIONS + 1))
            func_name=$(basename "$func_dir")
            
            # Check if index.ts exists
            if [ -f "$func_dir/index.ts" ]; then
                log_info "Validating $func_name..."
                
                # Basic syntax check using Deno (if available)
                if command -v deno &> /dev/null; then
                    if deno check "$func_dir/index.ts" &> /dev/null; then
                        log_success "✓ $func_name: Syntax valid"
                        VALID_FUNCTIONS=$((VALID_FUNCTIONS + 1))
                    else
                        log_error "✗ $func_name: Syntax errors found"
                        INVALID_FUNCTIONS+=("$func_name")
                        # Show the error
                        echo "Syntax check output:"
                        deno check "$func_dir/index.ts" 2>&1 | head -5
                    fi
                else
                    log_info "✓ $func_name: index.ts exists (syntax not checked - Deno not available)"
                    VALID_FUNCTIONS=$((VALID_FUNCTIONS + 1))
                fi
            else
                log_error "✗ $func_name: Missing index.ts"
                INVALID_FUNCTIONS+=("$func_name")
            fi
        fi
    done
    
    log_info "Functions validation summary:"
    log_success "Valid: $VALID_FUNCTIONS/$TOTAL_FUNCTIONS"
    
    if [ ${#INVALID_FUNCTIONS[@]} -gt 0 ]; then
        log_error "Invalid functions: ${INVALID_FUNCTIONS[*]}"
        echo ""
        read -p "Continue with deployment anyway? (y/N): " -n 1 -r
        echo ""
        if [[ ! $REPLY =~ ^[Yy]$ ]]; then
            exit 1
        fi
    fi
}

# Function to check current deployment status
check_deployment_status() {
    log_section "📋 Checking Current Deployment Status"
    
    # Get list of deployed functions
    DEPLOYED_FUNCTIONS=$(supabase functions list 2>/dev/null | tail -n +2 | awk '{print $1}' || echo "")
    
    if [ -z "$DEPLOYED_FUNCTIONS" ]; then
        log_warning "No functions currently deployed"
        return
    fi
    
    log_info "Currently deployed functions:"
    echo "$DEPLOYED_FUNCTIONS" | while read -r func; do
        if [ -n "$func" ]; then
            # Test the function
            log_info "Testing function: $func"
            
            # Try a basic health check or OPTIONS request
            FUNCTION_URL="https://$PROJECT_REF.supabase.co/functions/v1/$func"
            
            # Test with a simple OPTIONS request (should always work)
            HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" -X OPTIONS "$FUNCTION_URL" -H "Authorization: Bearer $SUPABASE_ANON_KEY" || echo "000")
            
            case $HTTP_STATUS in
                200|204) log_success "✓ $func: Responding (HTTP $HTTP_STATUS)" ;;
                400|401|403) log_warning "⚠ $func: Responding but may have auth/validation issues (HTTP $HTTP_STATUS)" ;;
                404) log_error "✗ $func: Not found (HTTP $HTTP_STATUS)" ;;
                405) log_warning "⚠ $func: Method not allowed - function exists but doesn't handle OPTIONS (HTTP $HTTP_STATUS)" ;;
                500|502|503) log_error "✗ $func: Server error (HTTP $HTTP_STATUS)" ;;
                000) log_error "✗ $func: Connection failed" ;;
                *) log_warning "? $func: Unexpected response (HTTP $HTTP_STATUS)" ;;
            esac
        fi
    done
}

# Function to deploy functions with better error handling
deploy_functions() {
    log_section "🚀 Deploying Edge Functions"
    
    # List of core functions to deploy (in priority order)
    CORE_FUNCTIONS=(
        "verify-paystack-payment"
        "initialize-paystack-payment"
        "file-upload"
        "send-email-notification"
        "get-delivery-quotes"
        "study-resources-api"
    )
    
    # List of business logic functions
    BUSINESS_FUNCTIONS=(
        "commit-to-sale"
        "decline-commit"
        "pay-seller"
        "create-paystack-subaccount"
        "process-book-purchase"
        "mark-collected"
        "auto-expire-commits"
    )
    
    # List of integration functions
    INTEGRATION_FUNCTIONS=(
        "email-automation"
        "courier-guy-quote"
        "courier-guy-shipment"
        "courier-guy-track"
        "fastway-quote"
        "fastway-shipment"
        "fastway-track"
    )
    
    echo "Select deployment scope:"
    echo "1) Core functions only (recommended for testing)"
    echo "2) Core + Business functions"
    echo "3) All functions"
    echo "4) Specific function"
    echo ""
    read -p "Enter choice (1-4): " -n 1 -r
    echo ""
    
    FUNCTIONS_TO_DEPLOY=()
    
    case $REPLY in
        1)
            FUNCTIONS_TO_DEPLOY=("${CORE_FUNCTIONS[@]}")
            log_info "Deploying core functions only"
            ;;
        2)
            FUNCTIONS_TO_DEPLOY=("${CORE_FUNCTIONS[@]}" "${BUSINESS_FUNCTIONS[@]}")
            log_info "Deploying core + business functions"
            ;;
        3)
            FUNCTIONS_TO_DEPLOY=("${CORE_FUNCTIONS[@]}" "${BUSINESS_FUNCTIONS[@]}" "${INTEGRATION_FUNCTIONS[@]}")
            log_info "Deploying all functions"
            ;;
        4)
            echo "Available functions:"
            for i, func in enumerate("${CORE_FUNCTIONS[@]}" "${BUSINESS_FUNCTIONS[@]}" "${INTEGRATION_FUNCTIONS[@]}"); do
                echo "  $((i+1))) $func"
            done
            echo ""
            read -p "Enter function name: " func_name
            if [ -d "$FUNCTIONS_DIR/$func_name" ]; then
                FUNCTIONS_TO_DEPLOY=("$func_name")
                log_info "Deploying single function: $func_name"
            else
                log_error "Function not found: $func_name"
                exit 1
            fi
            ;;
        *)
            log_error "Invalid choice"
            exit 1
            ;;
    esac
    
    DEPLOYED=0
    FAILED=0
    FAILED_FUNCTIONS=()
    
    for func in "${FUNCTIONS_TO_DEPLOY[@]}"; do
        if [ ! -d "$FUNCTIONS_DIR/$func" ]; then
            log_warning "Function directory not found: $func (skipping)"
            continue
        fi
        
        echo ""
        log_info "Deploying function: $func"
        echo "$(printf '%.0s-' {1..40})"
        
        # Deploy with debug output
        if npx supabase functions deploy "$func" --debug; then
            log_success "Successfully deployed: $func"
            DEPLOYED=$((DEPLOYED + 1))
        else
            log_error "Failed to deploy: $func"
            FAILED=$((FAILED + 1))
            FAILED_FUNCTIONS+=("$func")
        fi
        
        # Small delay between deployments
        sleep 2
    done
    
    echo ""
    log_section "📊 Deployment Summary"
    log_success "Successfully deployed: $DEPLOYED"
    log_error "Failed: $FAILED"
    
    if [ ${#FAILED_FUNCTIONS[@]} -gt 0 ]; then
        log_warning "Failed functions: ${FAILED_FUNCTIONS[*]}"
        echo ""
        echo "Troubleshooting tips for failed deployments:"
        echo "1. Check function syntax with: deno check supabase/functions/FUNCTION_NAME/index.ts"
        echo "2. Test locally with: supabase functions serve FUNCTION_NAME"
        echo "3. Check logs with: supabase functions logs FUNCTION_NAME"
        echo "4. Verify imports and dependencies"
        echo "5. Ensure all required secrets are set"
    fi
}

# Function to run post-deployment tests
run_post_deployment_tests() {
    log_section "🧪 Running Post-Deployment Tests"
    
    # Test core functions with simple requests
    CORE_TESTS=(
        "get-delivery-quotes:POST:{\"test\":true}"
        "study-resources-api:POST:{\"action\":\"health\"}"
        "send-email-notification:GET:"
        "file-upload:GET:"
        "verify-paystack-payment:GET:"
    )
    
    SUPABASE_ANON_KEY=$(grep SUPABASE_ANON_KEY .env 2>/dev/null | cut -d'=' -f2 || echo "")
    if [ -z "$SUPABASE_ANON_KEY" ]; then
        log_warning "SUPABASE_ANON_KEY not found in .env file. Skipping API tests."
        return
    fi
    
    for test in "${CORE_TESTS[@]}"; do
        IFS=':' read -r func_name method body <<< "$test"
        
        log_info "Testing $func_name with $method request..."
        
        FUNCTION_URL="https://$PROJECT_REF.supabase.co/functions/v1/$func_name"
        
        if [ "$method" = "GET" ]; then
            HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
                -X GET "$FUNCTION_URL" \
                -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
                -H "Content-Type: application/json")
        else
            HTTP_STATUS=$(curl -s -o /dev/null -w "%{http_code}" \
                -X POST "$FUNCTION_URL" \
                -H "Authorization: Bearer $SUPABASE_ANON_KEY" \
                -H "Content-Type: application/json" \
                -d "$body")
        fi
        
        case $HTTP_STATUS in
            200|201|204) log_success "✓ $func_name: Test passed (HTTP $HTTP_STATUS)" ;;
            400|401|403|422) log_warning "⚠ $func_name: Expected validation error (HTTP $HTTP_STATUS)" ;;
            404) log_error "✗ $func_name: Not found (HTTP $HTTP_STATUS)" ;;
            405) log_warning "⚠ $func_name: Method not allowed (HTTP $HTTP_STATUS)" ;;
            500|502|503) log_error "✗ $func_name: Server error (HTTP $HTTP_STATUS)" ;;
            *) log_warning "? $func_name: Unexpected response (HTTP $HTTP_STATUS)" ;;
        esac
    done
}

# Function to provide troubleshooting guidance
provide_troubleshooting_guidance() {
    log_section "🔧 Troubleshooting Guidance"
    
    echo "If you're still experiencing issues, try these steps:"
    echo ""
    echo "1. Check function logs:"
    echo "   supabase functions logs FUNCTION_NAME"
    echo ""
    echo "2. Test functions locally:"
    echo "   supabase functions serve FUNCTION_NAME"
    echo "   curl -X POST http://localhost:54321/functions/v1/FUNCTION_NAME"
    echo ""
    echo "3. Verify secrets are set:"
    echo "   supabase secrets list"
    echo "   supabase secrets set SECRET_NAME=value"
    echo ""
    echo "4. Check project linking:"
    echo "   supabase status"
    echo "   supabase link --project-ref $PROJECT_REF"
    echo ""
    echo "5. Update Supabase CLI:"
    echo "   npm update -g supabase"
    echo ""
    echo "6. Check Supabase status page:"
    echo "   https://status.supabase.com/"
    echo ""
    echo "7. Review function code for common issues:"
    echo "   - Syntax errors"
    echo "   - Import path issues"
    echo "   - Missing environment variables"
    echo "   - CORS configuration"
    echo "   - Request/response format"
}

# Main execution
main() {
    echo -e "${CYAN}🛠️  Supabase Edge Functions Comprehensive Fix${NC}"
    echo "=============================================="
    echo ""
    
    check_prerequisites
    validate_project_link
    check_environment
    validate_function_code
    check_deployment_status
    
    echo ""
    read -p "Proceed with deployment? (y/N): " -n 1 -r
    echo ""
    
    if [[ $REPLY =~ ^[Yy]$ ]]; then
        deploy_functions
        run_post_deployment_tests
    else
        log_info "Deployment skipped by user"
    fi
    
    provide_troubleshooting_guidance
    
    echo ""
    log_success "Script completed! Check the output above for any issues."
}

# Run the main function
main "$@"
