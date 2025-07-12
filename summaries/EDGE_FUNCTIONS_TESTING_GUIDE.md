# Edge Functions Testing Guide

## Overview

A comprehensive edge functions health checker has been created to test all deployed Supabase edge functions in your project.

## Access the Tester

1. **Navigate to Dev Dashboard**: Go to `/dev-dashboard` in your browser
2. **Backend Tab**: Click on the "Backend" tab
3. **Edge Functions Health Check**: Click on the "Edge Functions Health Check" sub-tab

## Features

### 🎯 **Comprehensive Function Coverage**

Tests all 30+ edge functions across categories:

- **Core Services**: Study resources, search, file upload
- **Payment & Commerce**: Paystack integration, payments, subaccounts
- **Order Management**: Order creation, purchase processing, commits
- **Shipping & Logistics**: Delivery quotes, courier integrations, tracking
- **Communication**: Email automation, notifications
- **Analytics**: Reporting and metrics
- **Administration**: Dispute resolution
- **Background Jobs**: Auto-expiry, reminders

### 🔧 **Testing Controls**

- **Test Timeout**: Configurable timeout (1-30 seconds)
- **Batch Size**: Test 1-10 functions simultaneously
- **Category Filter**: Test specific function categories or all
- **Individual Testing**: Test single functions manually

### 📊 **Real-time Results**

- **Status Tracking**: Idle → Running → Success/Failed/Timeout
- **Performance Metrics**: Response times for each function
- **Detailed Responses**: View full API responses
- **Summary Statistics**: Total, passed, failed, running, timeout counts

### 🏥 **Health Check Types**

- **Health Endpoint**: Tests functions with health check support
- **Error Interpretation**: Distinguishes between deployment issues and configuration needs
- **Timeout Detection**: Identifies slow or unresponsive functions

## Test Results Interpretation

### ✅ **Success States**

- **Function healthy and responsive**: Perfect working state
- **Function deployed (needs authentication)**: Deployed but requires auth
- **Function deployed (needs valid data)**: Deployed but needs proper request data

### ❌ **Error States**

- **Function not deployed or unavailable**: Not deployed to Supabase
- **Function timeout**: Slow response or hung process
- **Error: [specific message]**: Function-specific errors

## Quick Health Check

**Run All Functions Test:**

1. Set timeout to 10000ms (10 seconds)
2. Set batch size to 3
3. Select "all" category
4. Click "Test All Functions"
5. Wait for progress bar to complete

## Function Categories

| Category          | Functions | Purpose                     |
| ----------------- | --------- | --------------------------- |
| **Core**          | 3         | Essential app functionality |
| **Payment**       | 6         | Paystack payment processing |
| **Orders**        | 6         | Order lifecycle management  |
| **Shipping**      | 7         | Delivery and tracking       |
| **Communication** | 3         | Email and notifications     |
| **Analytics**     | 1         | Reporting and metrics       |
| **Admin**         | 1         | Administrative tools        |
| **Background**    | 3         | Scheduled tasks             |

## Troubleshooting

### Common Issues

1. **All functions fail**: Check Supabase connection and API keys
2. **Specific category fails**: Check category-specific configurations
3. **Timeouts**: Increase timeout value or check function performance
4. **Auth errors**: Verify user permissions and function security

### Environment Check

- Verify `VITE_SUPABASE_URL` is set
- Verify `VITE_SUPABASE_ANON_KEY` is set
- Check if you're logged in with admin privileges

## Next Steps

After running the health check:

1. **Review failed functions** for deployment issues
2. **Check timeout functions** for performance problems
3. **Verify configuration** for functions needing auth/data
4. **Monitor response times** for optimization opportunities

The tester provides a comprehensive overview of your edge functions deployment status and helps identify any issues that need attention.
