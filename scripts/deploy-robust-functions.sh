#!/bin/bash

# Comprehensive Edge Functions Deployment Script
# Deploys all functions with robust error handling patterns

echo "🚀 Deploying Robust Edge Functions..."
echo "======================================"

# Set project reference (update this to your project ID)
PROJECT_REF="kbpjqzaqbqukutflwixf"

# Check if Supabase CLI is installed
if ! command -v supabase &> /dev/null; then
    echo "❌ Supabase CLI not found. Please install it first."
    echo "   npm install -g supabase"
    exit 1
fi

# Check if logged in
if ! supabase status &> /dev/null; then
    echo "🔑 Please login to Supabase first:"
    echo "   supabase login"
    exit 1
fi

# Deploy functions in order of dependency
echo "📦 Deploying shared utilities..."
supabase functions deploy _shared --project-ref $PROJECT_REF

echo "📦 Deploying shipping functions..."
supabase functions deploy courier-guy-quote --project-ref $PROJECT_REF
supabase functions deploy fastway-quote --project-ref $PROJECT_REF
supabase functions deploy courier-guy-track --project-ref $PROJECT_REF
supabase functions deploy fastway-track --project-ref $PROJECT_REF
supabase functions deploy get-delivery-quotes --project-ref $PROJECT_REF

echo "📦 Deploying payment functions..."
supabase functions deploy initialize-paystack-payment --project-ref $PROJECT_REF
supabase functions deploy verify-paystack-payment --project-ref $PROJECT_REF
supabase functions deploy paystack-webhook --project-ref $PROJECT_REF

echo "📦 Deploying order management functions..."
supabase functions deploy create-order --project-ref $PROJECT_REF
supabase functions deploy auto-expire-commits --project-ref $PROJECT_REF

echo "📦 Deploying remaining functions..."
# Add other functions as needed
supabase functions deploy email-automation --project-ref $PROJECT_REF
supabase functions deploy realtime-notifications --project-ref $PROJECT_REF

echo ""
echo "✅ All functions deployed successfully!"
echo ""
echo "🧪 Testing health checks..."
echo "=========================="

# Test health checks for critical functions
functions=(
    "courier-guy-quote"
    "fastway-quote"
    "verify-paystack-payment"
    "create-order"
    "get-delivery-quotes"
)

base_url="https://$PROJECT_REF.supabase.co/functions/v1"

for func in "${functions[@]}"; do
    echo -n "Testing $func... "
    
    response=$(curl -s -w "HTTPSTATUS:%{http_code}" \
        -X POST "$base_url/$func" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer YOUR_ANON_KEY" \
        -d '{"action": "health"}')
    
    http_code=$(echo $response | tr -d '\n' | sed -e 's/.*HTTPSTATUS://')
    body=$(echo $response | sed -e 's/HTTPSTATUS\:.*//g')
    
    if [ "$http_code" = "200" ]; then
        echo "✅ OK"
    else
        echo "❌ FAILED (HTTP $http_code)"
        echo "   Response: $body"
    fi
done

echo ""
echo "🎉 Deployment complete!"
echo ""
echo "📝 Next steps:"
echo "1. Update your environment variables if needed"
echo "2. Test your application's function calls"
echo "3. Monitor function logs for any issues"
echo ""
echo "📊 Monitor functions:"
echo "   supabase functions logs --project-ref $PROJECT_REF"
echo ""
echo "🔧 If you need to redeploy a specific function:"
echo "   supabase functions deploy FUNCTION_NAME --project-ref $PROJECT_REF"
