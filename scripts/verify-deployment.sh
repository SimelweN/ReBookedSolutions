#!/bin/bash

# Backend Deployment Verification Script
# Verifies that all Edge Functions are deployed and working correctly

set -e

echo "🔍 Verifying Backend Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    print_error "Supabase CLI is not installed. Please install it first:"
    echo "npm install -g supabase"
    exit 1
fi

# Get project reference
PROJECT_REF=$(supabase status | grep "API URL" | sed 's/.*https:\/\/\(.*\)\.supabase\.co.*/\1/')

if [ -z "$PROJECT_REF" ]; then
    print_error "Could not determine project reference. Make sure you're linked to a Supabase project."
    exit 1
fi

print_status "Checking deployment for project: $PROJECT_REF"

# List of functions to verify
functions=(
    "study-resources-api"
    "realtime-notifications"
    "file-upload"
    "advanced-search"
    "analytics-reporting"
    "email-automation"
    "dispute-resolution"
)

# Check deployed functions
print_status "📋 Checking deployed Edge Functions..."

deployed_functions=()
missing_functions=()

# Get list of deployed functions
deployed_list=$(supabase functions list 2>/dev/null | tail -n +2 | awk '{print $1}' || echo "")

for func in "${functions[@]}"; do
    if echo "$deployed_list" | grep -q "^$func$"; then
        deployed_functions+=("$func")
        print_success "✅ $func - Deployed"
    else
        missing_functions+=("$func")
        print_error "❌ $func - Missing"
    fi
done

# Summary
echo ""
echo "========================================"
echo "📊 DEPLOYMENT SUMMARY"
echo "========================================"
echo "Deployed: ${#deployed_functions[@]}/${#functions[@]} functions"
echo "Missing: ${#missing_functions[@]} functions"
echo ""

if [ ${#missing_functions[@]} -eq 0 ]; then
    print_success "🎉 All Edge Functions are deployed!"
else
    print_warning "⚠️ Missing functions:"
    for func in "${missing_functions[@]}"; do
        echo "  - $func"
    done
    echo ""
    print_status "To deploy missing functions, run:"
    for func in "${missing_functions[@]}"; do
        echo "  supabase functions deploy $func"
    done
fi

# Test function endpoints
print_status "🔗 Testing function endpoints..."

base_url="https://$PROJECT_REF.supabase.co/functions/v1"
working_functions=()
failed_functions=()

for func in "${deployed_functions[@]}"; do
    print_status "Testing $func..."
    
    if curl -s --max-time 10 "$base_url/$func" > /dev/null 2>&1; then
        working_functions+=("$func")
        print_success "✅ $func responds"
    else
        failed_functions+=("$func")
        print_warning "⚠️ $func not responding (may require authentication)"
    fi
done

# Check database tables
print_status "🗄️ Checking database tables..."

required_tables=(
    "study_resources"
    "study_resource_ratings"
    "file_uploads"
    "search_analytics"
    "email_queue"
    "email_logs"
)

existing_tables=()
missing_tables=()

# This would require a more complex check, for now we'll assume they exist
# In a real implementation, you'd query the database

print_status "Database table check skipped (requires database access)"

# Check environment variables
print_status "🔧 Checking required environment variables..."

required_vars=(
    "SUPABASE_URL"
    "SUPABASE_SERVICE_ROLE_KEY"
    "PAYSTACK_SECRET_KEY"
    "SENDGRID_API_KEY"
    "FROM_EMAIL"
    "SITE_URL"
)

# Note: We can't check env vars from CLI, this would be done in the functions themselves
print_status "Environment variable check skipped (check in Supabase dashboard)"

# Generate verification report
echo ""
echo "========================================"
echo "📋 VERIFICATION REPORT"
echo "========================================"
echo "Date: $(date)"
echo "Project: $PROJECT_REF"
echo ""
echo "Edge Functions:"
echo "  ✅ Deployed: ${#deployed_functions[@]}"
echo "  ❌ Missing: ${#missing_functions[@]}"
echo "  🔗 Responding: ${#working_functions[@]}"
echo "  ⚠️ Not responding: ${#failed_functions[@]}"
echo ""

if [ ${#missing_functions[@]} -eq 0 ] && [ ${#failed_functions[@]} -eq 0 ]; then
    print_success "🎉 Deployment verification successful!"
    echo ""
    echo "Next steps:"
    echo "1. Test the backend integration in your app"
    echo "2. Check function logs for any runtime errors"
    echo "3. Verify all environment variables are set"
    echo "4. Run the backend integration test component"
else
    print_warning "⚠️ Issues found that need attention:"
    
    if [ ${#missing_functions[@]} -ne 0 ]; then
        echo "Missing functions: ${missing_functions[*]}"
    fi
    
    if [ ${#failed_functions[@]} -ne 0 ]; then
        echo "Non-responding functions: ${failed_functions[*]}"
    fi
    
    echo ""
    echo "Troubleshooting steps:"
    echo "1. Deploy missing functions"
    echo "2. Check function logs: supabase functions logs <function-name>"
    echo "3. Verify environment variables in Supabase dashboard"
    echo "4. Check network connectivity"
fi

echo ""
print_status "Run 'supabase functions logs' to check for any runtime errors"
print_status "View full logs at: https://app.supabase.com/project/$PROJECT_REF/functions"
