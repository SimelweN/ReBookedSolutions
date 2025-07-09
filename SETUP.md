# ReBooked Platform Setup Guide

This guide will help you set up the ReBooked platform from scratch with all required services and configurations.

## Quick Start

### Option 1: Interactive Setup (Recommended)

```bash
npm run setup
```

### Option 2: Check Current Setup

```bash
npm run check-setup
```

### Option 3: Manual Setup

Follow the detailed instructions below.

## Prerequisites

- Node.js 18+ installed
- A Supabase account
- A Paystack account (for payments)
- A Google Cloud account (for Maps API)
- An email service provider account

## Environment Variables Setup

Copy the demo environment file and configure it:

```bash
cp .env.demo .env
```

### Required Environment Variables

#### Database (Supabase) - **CRITICAL**

```
VITE_SUPABASE_URL=your_supabase_project_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

**How to get these:**

1. Go to [supabase.com](https://supabase.com)
2. Create a new project
3. Go to Settings → API
4. Copy the URL and anon key
5. Copy the service_role key (keep this secret!)

#### Payment Processing (Paystack) - **CRITICAL**

```
VITE_PAYSTACK_PUBLIC_KEY=pk_test_your_test_key
PAYSTACK_SECRET_KEY=sk_test_your_secret_key
```

**How to get these:**

1. Go to [paystack.com](https://paystack.com)
2. Create an account and verify your business
3. Go to Settings → API Keys & Webhooks
4. Copy your test keys (use live keys for production)

#### Google Maps API - **HIGH PRIORITY**

```
VITE_GOOGLE_MAPS_API_KEY=your_google_maps_api_key
```

**How to get this:**

1. Go to [Google Cloud Console](https://console.cloud.google.com)
2. Enable the Maps JavaScript API and Places API
3. Create credentials → API Key
4. Restrict the key to your domains

#### Email Service - **MEDIUM PRIORITY**

```
EMAIL_SERVICE_API_KEY=your_email_service_key
VITE_EMAIL_SENDER=your_sender_email
```

#### Shipping Providers - **MEDIUM PRIORITY**

```
COURIER_GUY_API_KEY=your_courier_guy_key
FASTWAY_API_KEY=your_fastway_key
```

## Database Setup

### Automatic Setup

```bash
npm run setup-db
```

### Manual Setup

1. Open your Supabase project dashboard
2. Go to SQL Editor
3. Run the script from `scripts/setup-database.sql`

This will create:

- All required tables with proper relationships
- Row Level Security (RLS) policies
- Database functions and triggers
- Indexes for performance
- Initial admin user setup

## Service Configuration

### 1. Supabase Configuration

After setting up your database:

1. **Enable Authentication Providers:**
   - Go to Authentication → Providers
   - Configure email/password authentication
   - Optionally enable Google, GitHub, etc.

2. **Configure Email Templates:**
   - Go to Authentication → Email Templates
   - Customize confirmation and recovery emails

3. **Set up Storage:**
   - Go to Storage
   - Create buckets for: `book-images`, `profile-pictures`, `study-resources`
   - Set appropriate policies

### 2. Paystack Configuration

1. **Webhook Setup:**
   - Go to Settings → API Keys & Webhooks
   - Add webhook URL: `https://your-supabase-project.supabase.co/functions/v1/paystack-webhook`
   - Select events: `charge.success`, `transfer.success`, `transfer.failed`

2. **Subaccount Setup:**
   - Enable split payments if using multi-seller functionality
   - Configure settlement preferences

### 3. Google Maps Setup

1. **Enable Required APIs:**
   - Maps JavaScript API
   - Places API
   - Geocoding API

2. **Configure API Key Restrictions:**
   - Application restrictions: HTTP referrers
   - Add your domain(s)
   - API restrictions: Select only the APIs you need

### 4. Email Service Setup

The platform supports multiple email providers. Configure your preferred one:

#### SendGrid

```
EMAIL_SERVICE_API_KEY=your_sendgrid_api_key
EMAIL_SERVICE_PROVIDER=sendgrid
```

#### Mailgun

```
EMAIL_SERVICE_API_KEY=your_mailgun_api_key
EMAIL_SERVICE_PROVIDER=mailgun
```

### 5. Shipping Provider Setup

#### Courier Guy

1. Register at courierguy.co.za
2. Get API credentials
3. Configure pickup locations

#### Fastway

1. Register at fastway.co.za
2. Get API credentials
3. Set up franchise preferences

## Verification

### Automated Health Check

```bash
npm run validate
```

This will check:

- ✅ Environment variables are set
- ✅ Database connection works
- ✅ Payment provider is configured
- ✅ Maps API is accessible
- ✅ Email service is working
- ✅ Shipping providers are configured

### Manual Verification

1. **Start the application:**

   ```bash
   npm run dev
   ```

2. **Check the startup screen:**
   - The app should show a setup checker if services aren't configured
   - Green checkmarks indicate working services
   - Red X marks show configuration issues

3. **Test core functionality:**
   - User registration/login
   - Book listing and search
   - Payment processing (test mode)
   - Location autocomplete
   - Email notifications

## Production Deployment

### Environment Variables for Production

1. **Switch to production keys:**

   ```
   VITE_PAYSTACK_PUBLIC_KEY=pk_live_your_live_key
   PAYSTACK_SECRET_KEY=sk_live_your_live_key
   ```

2. **Configure production URLs:**

   ```
   VITE_APP_URL=https://yourdomain.com
   VITE_SUPABASE_URL=your_production_supabase_url
   ```

3. **Set up monitoring:**
   ```
   SENTRY_DSN=your_sentry_dsn
   LOG_LEVEL=error
   ```

### Security Checklist

- [ ] All API keys are properly restricted
- [ ] Database RLS policies are enabled
- [ ] CORS is configured correctly
- [ ] SSL certificates are installed
- [ ] Environment variables are secure
- [ ] Webhook endpoints are secured
- [ ] File upload size limits are set
- [ ] Rate limiting is configured

## Troubleshooting

### Common Issues

#### "Database connection failed"

- Check your Supabase URL and keys
- Ensure your database is running
- Verify RLS policies allow access

#### "Payment initialization failed"

- Verify Paystack keys are correct
- Check if webhook URL is accessible
- Ensure test mode is properly configured

#### "Maps not loading"

- Check if Google Maps API key is valid
- Verify required APIs are enabled
- Check browser console for specific errors

#### "Email delivery failed"

- Verify email service credentials
- Check spam folders
- Ensure sender domain is verified

### Getting Help

1. **Check the startup checker** - It provides specific guidance for each service
2. **Review browser console** - Look for specific error messages
3. **Check service status pages** - Verify if external services are down
4. **Review logs** - Check application and service logs for details

### Support

- Create an issue in the project repository
- Include relevant error messages
- Specify which services are failing
- Provide environment details (without sensitive information)

## Development Tips

### Local Development

- Use test/sandbox keys for all external services
- Enable verbose logging: `LOG_LEVEL=debug`
- Use mock data when services are unavailable

### Testing

```bash
# Run all tests
npm test

# Test specific components
npm test -- --grep "payment"

# Run integration tests
npm run test:integration
```

### Debugging

- Enable React DevTools
- Use Supabase dashboard for database debugging
- Check service provider dashboards for API call logs
- Monitor network requests in browser DevTools

---

**Note:** This setup guide assumes you're using the latest version of the ReBooked platform. Some steps may vary depending on your specific configuration needs.
