# Email Service Setup Guide

## Overview

ReBooked Solutions uses **Sender.net** for email delivery. The email system is configured to work via Supabase Edge Functions for secure server-side sending.

## Environment Variables

Add these environment variables to your `.env` file (local development) or hosting platform:

### Required for Production

```bash
# Sender.net API Key (server-side only - used in edge functions)
SENDER_API_KEY=your_sender_net_api_key_here

# Optional: Custom from email address
FROM_EMAIL=notifications@yourdomain.com
```

### Optional for Frontend

```bash
# Sender.net API Key (frontend fallback - not recommended for production)
VITE_SENDER_API=your_sender_net_api_key_here
```

## Getting Your Sender.net API Key

1. Sign up at [sender.net](https://www.sender.net/)
2. Go to your dashboard
3. Navigate to Settings > API
4. Create a new API key
5. Copy the key and add it to your environment variables

## How It Works

### Production Setup (Recommended)

1. **Edge Function**: Email requests go through `send-email-notification` edge function
2. **Server-side**: API key is stored securely in Supabase environment variables
3. **Secure**: API key is never exposed to the browser

### Development Fallback

1. **Simulation**: If no API key is configured, emails are simulated (logged only)
2. **Direct API**: In development mode, can attempt direct API calls (may hit CORS)

## Deployment Configuration

### Supabase Edge Functions

Set environment variables in your Supabase project:

```bash
# In Supabase Dashboard > Settings > Edge Functions > Environment Variables
SENDER_API_KEY=your_sender_net_api_key_here
FROM_EMAIL=notifications@yourdomain.com
```

### Vercel/Netlify

Set environment variables in your hosting platform:

```bash
SENDER_API_KEY=your_sender_net_api_key_here
FROM_EMAIL=notifications@yourdomain.com
```

## Testing Email Functionality

Use the Email Service Tester in the admin panel:

1. Go to `/admin` (requires admin access)
2. Navigate to the "Backend Testing" section
3. Scroll to "Email Service Testing"
4. Test with your email address

## Troubleshooting

### Common Issues

1. **"SENDER_API_KEY not configured"**
   - Add the environment variable to your Supabase project
   - Redeploy edge functions after adding the variable

2. **"Edge Function failed"**
   - Check Supabase edge function logs
   - Verify API key is correct and active
   - Ensure CORS headers are properly configured

3. **"Email simulated (no API key configured)"**
   - This is normal in development without API key
   - Add API key for actual email sending

4. **CORS errors in browser**
   - This is expected when trying direct API calls from browser
   - Use edge functions instead (recommended approach)

### Debug Steps

1. **Check Environment Variables**:

   ```javascript
   console.log("SENDER_API_KEY configured:", !!Deno.env.get("SENDER_API_KEY"));
   ```

2. **Test Edge Function Directly**:

   ```bash
   curl -X POST https://your-project.supabase.co/functions/v1/send-email-notification \
     -H "Authorization: Bearer YOUR_ANON_KEY" \
     -H "Content-Type: application/json" \
     -d '{
       "to": "test@example.com",
       "subject": "Test Email",
       "html": "<p>Test message</p>",
       "from": {
         "name": "Test",
         "email": "test@yourdomain.com"
       }
     }'
   ```

3. **Check Supabase Logs**:
   - Go to Supabase Dashboard > Logs > Edge Functions
   - Look for error messages in the `send-email-notification` function

## Email Templates

The system includes pre-built templates for:

- Welcome emails
- Payment confirmations
- Book purchase alerts
- Delivery notifications
- Password reset emails

Templates are customizable in the edge function code.

## Rate Limiting

Sender.net has rate limits based on your plan:

- Free: 15,000 emails/month
- Paid plans: Higher limits

Monitor usage in your Sender.net dashboard.

## Security Best Practices

1. **Never expose API keys in frontend code**
2. **Use edge functions for server-side email sending**
3. **Validate email addresses before sending**
4. **Implement rate limiting to prevent abuse**
5. **Log email activities for debugging**

## Alternative Email Providers

The system can be adapted for other providers:

- **Resend**: Change API endpoints and authentication
- **SendGrid**: Update payload format and headers
- **Mailgun**: Modify authentication and API calls

Update the edge functions and frontend service accordingly.
