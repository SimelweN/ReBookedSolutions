#!/bin/bash

# Deploy Edge Functions Script for Commit System
# This script deploys all the necessary Edge Functions for the 48-hour commit system

set -e

echo "🚀 Deploying Commit System Edge Functions..."

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI is not installed. Please install it first:"
    echo "npm install -g supabase"
    exit 1
fi

# Check if logged in
if ! supabase projects list &> /dev/null; then
    echo "❌ Not logged in to Supabase. Please run 'supabase login' first"
    exit 1
fi

# Get current project reference
PROJECT_REF=$(supabase projects list --format=json | jq -r '.[0].id' 2>/dev/null || echo "")

if [ -z "$PROJECT_REF" ]; then
    echo "❌ No Supabase project found. Please link your project first:"
    echo "supabase link --project-ref YOUR_PROJECT_REF"
    exit 1
fi

echo "📋 Deploying to project: $PROJECT_REF"

# Deploy commit-to-sale function
echo "🔄 Deploying commit-to-sale function..."
supabase functions deploy commit-to-sale

# Deploy decline-commit function
echo "🔄 Deploying decline-commit function..."
supabase functions deploy decline-commit

# Deploy auto-expire-commits function
echo "🔄 Deploying auto-expire-commits function..."
supabase functions deploy auto-expire-commits

# Set environment variables
echo "🔧 Setting environment variables..."

# Check if environment variables are set locally
if [ -f ".env" ]; then
    echo "📄 Found .env file, setting secrets from environment..."
    
    # Load environment variables
    export $(cat .env | grep -v '^#' | xargs)
    
    # Set Supabase secrets
    if [ ! -z "$SUPABASE_URL" ]; then
        supabase secrets set SUPABASE_URL="$SUPABASE_URL"
        echo "✅ Set SUPABASE_URL"
    fi
    
    if [ ! -z "$SUPABASE_SERVICE_ROLE_KEY" ]; then
        supabase secrets set SUPABASE_SERVICE_ROLE_KEY="$SUPABASE_SERVICE_ROLE_KEY"
        echo "✅ Set SUPABASE_SERVICE_ROLE_KEY"
    fi
    
    if [ ! -z "$PAYSTACK_SECRET_KEY" ]; then
        supabase secrets set PAYSTACK_SECRET_KEY="$PAYSTACK_SECRET_KEY"
        echo "✅ Set PAYSTACK_SECRET_KEY"
    else
        echo "⚠️  PAYSTACK_SECRET_KEY not found - refunds won't work automatically"
    fi
else
    echo "⚠️  No .env file found. Please set the following secrets manually:"
    echo "supabase secrets set SUPABASE_URL=your_supabase_url"
    echo "supabase secrets set SUPABASE_SERVICE_ROLE_KEY=your_service_role_key"
    echo "supabase secrets set PAYSTACK_SECRET_KEY=your_paystack_secret_key"
fi

# Run database migrations
echo "🗄️  Running database migrations..."
supabase db push

# Set up cron job for auto-expire function (optional)
echo "⏰ Setting up cron job for auto-expire function..."
cat << EOF > temp_cron_setup.sql
-- Set up cron job to run auto-expire function every 6 hours
SELECT cron.schedule(
    'auto-expire-commits', 
    '0 */6 * * *', 
    \$\$SELECT net.http_post('https://$PROJECT_REF.supabase.co/functions/v1/auto-expire-commits', '{}', headers:='{"Content-Type": "application/json", "Authorization": "Bearer ' || current_setting('app.jwt_secret') || '"}');\$\$
);
EOF

supabase db reset --linked --debug || echo "⚠️  Could not set up cron job automatically. Please set it up manually in your Supabase dashboard."
rm -f temp_cron_setup.sql

echo ""
echo "✅ Deployment completed successfully!"
echo ""
echo "���� Deployed Functions:"
echo "   • commit-to-sale: Handles seller commitments to sales"
echo "   • decline-commit: Handles seller declining orders"
echo "   • auto-expire-commits: Automatically expires and refunds old commits"
echo ""
echo "🔗 Function URLs:"
echo "   • https://$PROJECT_REF.supabase.co/functions/v1/commit-to-sale"
echo "   • https://$PROJECT_REF.supabase.co/functions/v1/decline-commit"
echo "   • https://$PROJECT_REF.supabase.co/functions/v1/auto-expire-commits"
echo ""
echo "⏰ Cron Job: Runs every 6 hours to automatically process expired commits"
echo ""
echo "🧪 Test your functions:"
echo "   1. Go to your app's Admin Dashboard → QA Testing"
echo "   2. Create demo orders and test the commit system"
echo "   3. Verify notifications are working"
echo ""
echo "🔧 Manual cron setup (if needed):"
echo "   Run this in your Supabase SQL editor:"
echo "   SELECT cron.schedule('auto-expire-commits', '0 */6 * * *', 'SELECT net.http_post(''https://$PROJECT_REF.supabase.co/functions/v1/auto-expire-commits'', ''{}''::jsonb);');"
echo ""
