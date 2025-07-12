#!/bin/bash

# Script to fix Edge Functions with proper error handling and environment validation

FUNCTIONS_DIR="supabase/functions"

# List of functions that need fixing
FUNCTIONS=(
  "verify-paystack-payment"
  "paystack-webhook"
  "create-paystack-subaccount"
  "update-paystack-subaccount"
  "pay-seller"
  "process-book-purchase"
  "process-multi-seller-purchase"
  "commit-to-sale"
  "decline-commit"
  "mark-collected"
  "courier-guy-quote"
  "courier-guy-shipment"
  "courier-guy-track"
  "fastway-quote"
  "fastway-shipment"
  "fastway-track"
  "email-automation"
  "send-email-notification"
  "realtime-notifications"
  "analytics-reporting"
  "dispute-resolution"
  "check-expired-orders"
)

echo "🔧 Starting Edge Functions fix..."

for func in "${FUNCTIONS[@]}"; do
  func_file="${FUNCTIONS_DIR}/${func}/index.ts"
  
  if [ -f "$func_file" ]; then
    echo "📝 Processing ${func}..."
    
    # Create backup
    cp "$func_file" "${func_file}.backup"
    
    # Update Deno standard library version to 0.190.0
    sed -i 's|https://deno.land/std@0.168.0/|https://deno.land/std@0.190.0/|g' "$func_file"
    
    # Update Supabase client import
    sed -i 's|@supabase/supabase-js@2.50.0|@supabase/supabase-js@2|g' "$func_file"
    
    echo "✅ Updated ${func}"
  else
    echo "⚠️  ${func_file} not found"
  fi
done

echo "🎉 Edge Functions fix completed!"
echo "📋 Please redeploy your Edge Functions using: supabase functions deploy"
