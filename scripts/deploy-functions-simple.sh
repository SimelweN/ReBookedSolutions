#!/bin/bash

# Simple Edge Functions Deployment Script
echo "🚀 Deploying ALL Supabase Edge Functions..."

# Link to your project
npx supabase link --project-ref kbpjqzaqbqukutflwixf

# Deploy all functions at once
npx supabase functions deploy

echo "✅ All functions deployed!"
echo ""
echo "🔧 Don't forget to set these environment variables in Supabase Dashboard:"
echo "VITE_RESEND_API_KEY=re_MZmby9ES_49kBCotYLoaEv6mQNTJvVRRW"
echo "FROM_EMAIL=noreply@rebookedsolutions.co.za"
echo "SUPABASE_SERVICE_ROLE_KEY=your_service_role_key"
