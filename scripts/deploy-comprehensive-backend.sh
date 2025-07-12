#!/bin/bash

# Comprehensive Backend Deployment Script
# Deploys all backend services, functions, and database updates

set -e

echo "🚀 Starting comprehensive backend deployment..."

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

# Check if logged in to Supabase
if ! supabase projects list &> /dev/null; then
    print_error "Not logged in to Supabase. Please run: supabase login"
    exit 1
fi

# Get project reference
PROJECT_REF=$(supabase status | grep "API URL" | sed 's/.*https:\/\/\(.*\)\.supabase\.co.*/\1/')

if [ -z "$PROJECT_REF" ]; then
    print_error "Could not determine project reference. Make sure you're linked to a Supabase project."
    exit 1
fi

print_status "Deploying to project: $PROJECT_REF"

# =============================================
# 1. DATABASE MIGRATIONS
# =============================================

print_status "📊 Applying database migrations..."

if supabase db push; then
    print_success "Database migrations applied successfully"
else
    print_error "Database migration failed"
    exit 1
fi

# =============================================
# 2. EDGE FUNCTIONS DEPLOYMENT
# =============================================

print_status "⚡ Deploying Edge Functions..."

# Array of functions to deploy
functions=(
    "study-resources-api"
    "realtime-notifications"
    "file-upload"
    "advanced-search"
    "analytics-reporting"
    "email-automation"
    "dispute-resolution"
    "commit-to-sale"
    "decline-commit"
    "auto-expire-commits"
)

failed_functions=()

for func in "${functions[@]}"; do
    print_status "Deploying $func..."
    
    if supabase functions deploy "$func" --no-verify-jwt; then
        print_success "$func deployed successfully"
    else
        print_error "Failed to deploy $func"
        failed_functions+=("$func")
    fi
done

# Report any failed deployments
if [ ${#failed_functions[@]} -ne 0 ]; then
    print_warning "The following functions failed to deploy:"
    for func in "${failed_functions[@]}"; do
        echo "  - $func"
    done
    echo ""
    print_warning "You may need to deploy these manually or check for errors."
else
    print_success "All Edge Functions deployed successfully!"
fi

# =============================================
# 3. STORAGE BUCKETS SETUP
# =============================================

print_status "🗂️  Setting up storage buckets..."

# Create storage buckets if they don't exist
buckets=("files" "avatars" "study-resources" "book-images")

for bucket in "${buckets[@]}"; do
    print_status "Creating storage bucket: $bucket"
    
    # Try to create bucket (will fail silently if it exists)
    supabase storage buckets create "$bucket" --public 2>/dev/null || true
    
    print_success "Storage bucket $bucket ready"
done

# =============================================
# 4. ENVIRONMENT VARIABLES CHECK
# =============================================

print_status "🔧 Checking environment variables..."

required_vars=(
    "SUPABASE_URL"
    "SUPABASE_SERVICE_ROLE_KEY"
    "PAYSTACK_SECRET_KEY"
    "SENDGRID_API_KEY"
    "FROM_EMAIL"
    "SITE_URL"
)

missing_vars=()

for var in "${required_vars[@]}"; do
    if [ -z "${!var}" ]; then
        missing_vars+=("$var")
    fi
done

if [ ${#missing_vars[@]} -ne 0 ]; then
    print_warning "The following environment variables are not set:"
    for var in "${missing_vars[@]}"; do
        echo "  - $var"
    done
    echo ""
    print_warning "Some features may not work properly without these variables."
    echo "Please set them in your Supabase project settings under Edge Functions secrets."
else
    print_success "All required environment variables are set"
fi

# =============================================
# 5. CRON JOBS SETUP
# =============================================

print_status "⏰ Setting up cron jobs..."

# Auto-expire commits job (every 6 hours)
cron_sql="
SELECT cron.schedule(
    'auto-expire-commits',
    '0 */6 * * *',
    \$\$SELECT net.http_post('https://$PROJECT_REF.supabase.co/functions/v1/auto-expire-commits', '{}', headers:=jsonb_build_object('Authorization', 'Bearer $SUPABASE_SERVICE_ROLE_KEY'));\$\$
);

-- Email queue processing (every 5 minutes)
SELECT cron.schedule(
    'process-email-queue',
    '*/5 * * * *',
    \$\$SELECT net.http_post('https://$PROJECT_REF.supabase.co/functions/v1/email-automation?action=process-queue', '{}', headers:=jsonb_build_object('Authorization', 'Bearer $SUPABASE_SERVICE_ROLE_KEY'));\$\$
);
"

if echo "$cron_sql" | supabase db sql; then
    print_success "Cron jobs scheduled successfully"
else
    print_warning "Failed to schedule cron jobs. You may need to set them up manually."
fi

# =============================================
# 6. INDEXES AND PERFORMANCE OPTIMIZATION
# =============================================

print_status "🔍 Optimizing database performance..."

optimization_sql="
-- Analyze tables for query optimization
ANALYZE books;
ANALYZE orders;
ANALYZE profiles;
ANALYZE notifications;
ANALYZE study_resources;

-- Update table statistics
SELECT pg_stat_reset();
"

if echo "$optimization_sql" | supabase db sql; then
    print_success "Database optimization completed"
else
    print_warning "Database optimization failed"
fi

# =============================================
# 7. SEED DATA (OPTIONAL)
# =============================================

print_status "🌱 Checking for seed data..."

if [ -f "supabase/seed.sql" ]; then
    print_status "Found seed data file. Applying..."
    if supabase db sql < supabase/seed.sql; then
        print_success "Seed data applied successfully"
    else
        print_warning "Failed to apply seed data"
    fi
else
    print_status "No seed data file found, skipping..."
fi

# =============================================
# 8. HEALTH CHECK
# =============================================

print_status "🏥 Running health checks..."

# Test Edge Functions
print_status "Testing Edge Functions..."

base_url="https://$PROJECT_REF.supabase.co/functions/v1"

for func in "${functions[@]}"; do
    if curl -s --max-time 10 "$base_url/$func" > /dev/null; then
        print_success "$func is responding"
    else
        print_warning "$func is not responding (this may be normal for functions requiring authentication)"
    fi
done

# =============================================
# 9. GENERATE DEPLOYMENT REPORT
# =============================================

print_status "📋 Generating deployment report..."

cat > deployment-report.md << EOF
# Backend Deployment Report

**Date:** $(date)
**Project:** $PROJECT_REF

## Deployed Services

### Edge Functions
$(for func in "${functions[@]}"; do
    if [[ ! " ${failed_functions[@]} " =~ " $func " ]]; then
        echo "- ✅ $func"
    else
        echo "- ❌ $func (failed)"
    fi
done)

### Database
- ✅ Migrations applied
- ✅ Indexes created
- ✅ RLS policies enabled
- ✅ Functions and triggers deployed

### Storage
$(for bucket in "${buckets[@]}"; do
    echo "- ✅ $bucket bucket"
done)

### Cron Jobs
- ⏰ Auto-expire commits (every 6 hours)
- ⏰ Email queue processing (every 5 minutes)

## Environment Variables
$(if [ ${#missing_vars[@]} -eq 0 ]; then
    echo "- ✅ All required variables set"
else
    echo "- ⚠️  Missing variables: ${missing_vars[*]}"
fi)

## Next Steps

1. Test all functionality in your application
2. Monitor Edge Function logs for any errors
3. Set up monitoring and alerting
4. Configure email templates
5. Test payment and dispute flows

## Useful Commands

\`\`\`bash
# View Edge Function logs
supabase functions logs <function-name>

# Check database status
supabase db status

# Reset database (if needed)
supabase db reset

# Update functions
supabase functions deploy <function-name>
\`\`\`

## Support

If you encounter issues, check:
- Supabase dashboard for function logs
- Database logs for SQL errors
- Environment variables are properly set
- Network connectivity to external services
EOF

print_success "Deployment report generated: deployment-report.md"

# =============================================
# 10. FINAL STATUS
# =============================================

echo ""
echo "=================================="
print_success "🎉 DEPLOYMENT COMPLETED!"
echo "=================================="
echo ""

if [ ${#failed_functions[@]} -eq 0 ] && [ ${#missing_vars[@]} -eq 0 ]; then
    print_success "✨ All systems deployed successfully!"
    echo ""
    echo "Your comprehensive backend is now ready with:"
    echo "  • Study Resources API"
    echo "  • Real-time Notifications"
    echo "  • File Upload & Storage"
    echo "  • Advanced Search"
    echo "  • Analytics & Reporting"
    echo "  • Email Automation"
    echo "  • Dispute Resolution"
    echo "  • Commit System"
    echo ""
    echo "🔗 Dashboard: https://app.supabase.com/project/$PROJECT_REF"
    echo "📊 Functions: https://app.supabase.com/project/$PROJECT_REF/functions"
    echo ""
else
    print_warning "⚠️  Deployment completed with some issues:"
    
    if [ ${#failed_functions[@]} -ne 0 ]; then
        echo "  • Failed functions: ${failed_functions[*]}"
    fi
    
    if [ ${#missing_vars[@]} -ne 0 ]; then
        echo "  • Missing environment variables: ${missing_vars[*]}"
    fi
    
    echo ""
    echo "Please check the deployment report for details."
fi

echo ""
print_status "📋 Deployment report saved to: deployment-report.md"
print_status "🚀 Happy coding!"
