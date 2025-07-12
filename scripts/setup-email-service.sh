#!/bin/bash

# Email Service Setup Helper
# This script helps configure the email service for ReBooked Solutions

set -e

echo "🔧 Email Service Setup Helper"
echo "==============================="
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}⚠️  .env file not found. Creating one...${NC}"
    touch .env
fi

echo "📧 Email Service Configuration"
echo "------------------------------"
echo ""

# Function to update or add environment variable
update_env_var() {
    local var_name=$1
    local var_value=$2
    local env_file=${3:-.env}

    if grep -q "^${var_name}=" "$env_file"; then
        # Variable exists, update it
        if [[ "$OSTYPE" == "darwin"* ]]; then
            # macOS
            sed -i '' "s/^${var_name}=.*/${var_name}=${var_value}/" "$env_file"
        else
            # Linux
            sed -i "s/^${var_name}=.*/${var_name}=${var_value}/" "$env_file"
        fi
        echo -e "${GREEN}✅ Updated ${var_name} in ${env_file}${NC}"
    else
        # Variable doesn't exist, add it
        echo "${var_name}=${var_value}" >> "$env_file"
        echo -e "${GREEN}✅ Added ${var_name} to ${env_file}${NC}"
    fi
}

# Check current configuration
echo "🔍 Current Email Configuration:"
echo "------------------------------"

if grep -q "VITE_SENDER_API=" .env 2>/dev/null; then
    CURRENT_API_KEY=$(grep "VITE_SENDER_API=" .env | cut -d'=' -f2)
    if [ -n "$CURRENT_API_KEY" ] && [ "$CURRENT_API_KEY" != "demo-sender-api-key" ]; then
        echo -e "${GREEN}✅ VITE_SENDER_API: Configured${NC}"
    else
        echo -e "${YELLOW}⚠️  VITE_SENDER_API: Demo key or empty${NC}"
    fi
else
    echo -e "${RED}❌ VITE_SENDER_API: Not configured${NC}"
fi

echo ""

# Get Sender.net API Key
echo "🔑 Sender.net API Key Setup"
echo "----------------------------"
echo ""
echo "To get your Sender.net API key:"
echo "1. Go to https://www.sender.net/"
echo "2. Sign up or log in to your account"
echo "3. Navigate to Settings > API"
echo "4. Create a new API key"
echo "5. Copy the API key"
echo ""

read -p "Enter your Sender.net API key (or press Enter to use demo key): " API_KEY

if [ -z "$API_KEY" ]; then
    API_KEY="demo-sender-api-key"
    echo -e "${YELLOW}⚠️  Using demo API key. Emails will be simulated.${NC}"
else
    echo -e "${GREEN}✅ Using your Sender.net API key.${NC}"
fi

# Update .env file
update_env_var "VITE_SENDER_API" "$API_KEY"

# Ask about FROM_EMAIL
echo ""
echo "📮 From Email Address"
echo "---------------------"
echo ""
echo "Optional: Set a custom 'from' email address for your emails."
echo "Default: notifications@rebooked.co.za"
echo ""

read -p "Enter custom from email (or press Enter for default): " FROM_EMAIL

if [ -n "$FROM_EMAIL" ]; then
    update_env_var "FROM_EMAIL" "$FROM_EMAIL"
    echo -e "${GREEN}✅ Custom from email configured: $FROM_EMAIL${NC}"
else
    echo -e "${BLUE}ℹ️  Using default from email: notifications@rebooked.co.za${NC}"
fi

echo ""
echo "🚀 Setup Complete!"
echo "=================="
echo ""
echo "Email service has been configured. Here's what to do next:"
echo ""
echo "1. 🔄 Restart your development server:"
echo "   yarn dev"
echo ""
echo "2. 🧪 Test the email service:"
echo "   - Go to /admin in your browser"
echo "   - Navigate to 'Backend Testing'"
echo "   - Use the 'Email Service Testing' section"
echo ""
echo "3. 🌐 For production deployment:"
echo "   - Add SENDER_API_KEY to your Supabase project environment variables"
echo "   - Add FROM_EMAIL to your Supabase project environment variables"
echo "   - Redeploy your edge functions"
echo ""
echo "   Supabase Environment Variables:"
echo "   SENDER_API_KEY=your_actual_sender_api_key"
echo "   FROM_EMAIL=noreply@rebookedsolutions.co.za"
echo ""
echo "📖 For detailed setup instructions, see EMAIL_SETUP_GUIDE.md"
echo ""

# Check if this is a git repository and suggest committing
if [ -d .git ]; then
    echo "💡 Tip: Remember to add your .env file to .gitignore to keep your API keys secure!"
    if ! grep -q "\.env" .gitignore 2>/dev/null; then
        echo "   Add this line to your .gitignore file: .env"
    fi
fi

echo -e "${GREEN}🎉 Email service setup complete!${NC}"
