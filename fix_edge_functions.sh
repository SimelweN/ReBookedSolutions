#!/bin/bash

# Functions that need to be fixed to follow the working pattern
functions=(
  "create-order"
  "verify-paystack-payment" 
  "file-upload"
  "email-automation"
  "analytics-reporting"
  "commit-to-sale"
  "decline-commit"
  "check-expired-orders"
  "create-paystack-subaccount"
  "update-paystack-subaccount"
  "pay-seller"
  "process-book-purchase"
  "process-multi-seller-purchase"
  "mark-collected"
  "courier-guy-shipment"
  "courier-guy-track"
  "fastway-quote"
  "fastway-shipment"
  "fastway-track"
  "send-email-notification"
  "realtime-notifications"
  "dispute-resolution"
)

for func in "${functions[@]}"; do
  file_path="supabase/functions/$func/index.ts"
  if [ -f "$file_path" ]; then
    echo "Fixing $func..."
    
    # Create backup
    cp "$file_path" "$file_path.backup"
    
    # Replace problematic imports with simple ones
    sed -i 's/import { corsHeaders, createErrorResponse } from "\.\.\/\._shared\/cors\.ts";/const corsHeaders = {\n  "Access-Control-Allow-Origin": "*",\n  "Access-Control-Allow-Headers":\n    "authorization, x-client-info, apikey, content-type",\n};/' "$file_path"
    
    # Remove environment utility imports
    sed -i '/import {/,/} from "\.\.\/\._shared\/environment\.ts";/d' "$file_path"
    
    # Fix response for OPTIONS
    sed -i 's/return new Response(null, { headers: corsHeaders });/return new Response("ok", { headers: corsHeaders });/' "$file_path"
    
    echo "Fixed $func"
  else
    echo "File not found: $file_path"
  fi
done

echo "All functions fixed!"
