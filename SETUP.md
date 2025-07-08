# ReBooked Solutions - Complete Setup Guide

This guide will help you set up ReBooked Solutions from scratch with all required services.

## 🚀 Quick Setup (Recommended)

### Option 1: Automated Setup

```bash
# Clone the repository
git clone [your-repo-url]
cd rebooked-solutions

# Install dependencies
npm install

# Run automated setup check
npm run check-setup

# Run interactive setup
npm run setup
```

### Option 2: Manual Setup

Follow the sections below for manual configuration.

## 📋 Prerequisites

- Node.js 18+ and npm
- Supabase account (free tier available)
- Paystack account (South African payment gateway)
- Google Cloud account (for Maps API)

## 🗄️ Database Setup (Supabase)

### 1. Create Supabase Project

1. Go to [supabase.com/dashboard](https://supabase.com/dashboard)
2. Click "New Project"
3. Fill in project details
4. Wait for project to be created

### 2. Get Database Credentials

1. In your project dashboard, go to **Settings > API**
2. Copy the following:
   - Project URL
   - Anon/Public key

### 3. Set Up Database Tables

1. Go to **SQL Editor** in your Supabase dashboard
2. Copy the entire content from `scripts/setup-database.sql`
3. Paste and execute the script
4. Verify tables are created in **Table Editor**

## 💳 Payment Setup (Paystack)

### 1. Create Paystack Account

1. Go to [dashboard.paystack.com](https://dashboard.paystack.com)
2. Sign up with South African business details
3. Complete email verification

### 2. Get API Keys

1. Go to **Settings > API Keys & Webhooks**
2. Copy your **Test Public Key** (starts with `pk_test_`)
3. For production, complete verification and use Live keys

### 3. Test Cards (Development)

- **Successful payment**: 4084084084084081
- **Insufficient funds**: 4000000000000002
- **Declined**: 4000000000000069

## 🗺️ Google Maps Setup (Optional)

### 1. Create Google Cloud Project

1. Go to [console.cloud.google.com](https://console.cloud.google.com)
2. Create new project or select existing
3. Enable billing (required for Maps API)

### 2. Enable APIs

Enable these APIs in **APIs & Services > Library**:

- Maps JavaScript API
- Places API
- Geocoding API

### 3. Create API Key

1. Go to **APIs & Services > Credentials**
2. Click **Create Credentials > API Key**
3. **Important**: Restrict the key:
   - Application restrictions: HTTP referrers
   - Add: `http://localhost:*` and `https://yourdomain.com/*`
   - API restrictions: Select only the 3 APIs above

## 📧 Email Service Setup (Optional)

### Option 1: Sender.net

1. Sign up at [sender.net](https://sender.net)
2. Get API key from account settings
3. Verify domain for production

### Option 2: Resend

1. Sign up at [resend.com](https://resend.com)
2. Get API key from dashboard
3. Add domain for production

## 🚚 Shipping Setup (Optional)

### Courier Guy

1. Contact Courier Guy for API access
2. Get API credentials
3. Configure in environment

### Fastway

1. Contact Fastway for API access
2. Get API credentials
3. Configure in environment

## ⚙️ Environment Configuration

### 1. Create Environment File

```bash
cp .env.example .env
```

### 2. Fill in Required Variables

```bash
# Database & Authentication (REQUIRED)
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...

# Payment Processing (REQUIRED)
VITE_PAYSTACK_PUBLIC_KEY=pk_test_37c77bb59dc7a6b3a3b836a74ebc3b9f59e25de7

# Google Maps (Optional)
VITE_GOOGLE_MAPS_API_KEY=AIzaSyBNLrJhOMz6idD05pzfn5lhA-TAw-mAZCU

# Email Service (Optional)
VITE_SENDER_API=your-sender-api-key

# Shipping Services (Optional)
VITE_COURIER_GUY_API_KEY=your-courier-guy-key
VITE_FASTWAY_API_KEY=your-fastway-key

# App Configuration
VITE_APP_URL=http://localhost:5173
NODE_ENV=development
```

## 🔍 Verification

### 1. Check Configuration

```bash
npm run check-setup
```

### 2. Test Application

```bash
npm run dev
```

### 3. Verify Features

- [ ] User registration/login works
- [ ] Database operations work
- [ ] Payment system loads (test mode)
- [ ] Address autocomplete works (if Maps configured)
- [ ] Email notifications work (if email configured)

## 🚀 Deployment

### Vercel

1. Push code to GitHub
2. Connect to Vercel
3. Add environment variables in Vercel dashboard
4. Deploy

### Netlify

1. Push code to GitHub
2. Connect to Netlify
3. Add environment variables in site settings
4. Deploy

### Custom Server

1. Build application: `npm run build`
2. Serve static files from `dist/` folder
3. Configure environment variables on server

## 🔧 Production Configuration

### Security Checklist

- [ ] Use production Supabase instance
- [ ] Use live Paystack keys (after verification)
- [ ] Restrict Google Maps API key to production domains
- [ ] Enable RLS policies in Supabase
- [ ] Configure proper CORS settings
- [ ] Set up monitoring and error tracking

### Performance Optimization

- [ ] Enable Supabase connection pooling
- [ ] Configure CDN for static assets
- [ ] Set up database indexes
- [ ] Enable gzip compression
- [ ] Configure caching headers

## 🆘 Troubleshooting

### Common Issues

#### Database Connection Failed

```
Check:
- Supabase URL format: https://xxx.supabase.co
- Anon key starts with: eyJ
- RLS policies are properly set
```

#### Payment Issues

```
Check:
- Paystack key starts with: pk_test_ or pk_live_
- Key is not truncated
- Test with valid test card numbers
```

#### Maps Not Working

```
Check:
- API key starts with: AIza
- Required APIs are enabled
- Billing is enabled in Google Cloud
- Key restrictions are properly set
```

### Getting Help

1. **Check System Status**: Run `npm run check-setup`
2. **View Logs**: Check browser console for errors
3. **Verify Environment**: Ensure all required variables are set
4. **Test Individual Services**: Use browser dev tools to test API calls

### Support Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Paystack Documentation](https://paystack.com/docs)
- [Google Maps Documentation](https://developers.google.com/maps/documentation)

## 📝 Development Notes

### Project Structure

```
src/
├── components/     # React components
├── pages/         # Page components
├── services/      # API services
├── utils/         # Utility functions
├── config/        # Configuration files
└── hooks/         # Custom React hooks

supabase/
├── migrations/    # Database migrations
└── functions/     # Edge functions

scripts/
├── setup-database.sql  # Database setup
└── auto-setup.js      # Setup checker
```

### Key Files

- `src/config/environment.ts` - Environment configuration
- `src/integrations/supabase/client.ts` - Database client
- `src/contexts/AuthContext.tsx` - Authentication
- `src/utils/databaseSetup.ts` - Database utilities

### Development Commands

```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run lint         # Check code quality
npm run check-setup  # Verify configuration
npm run setup        # Interactive setup
```

---

## 🎉 You're Ready!

Once you've completed the setup, your ReBooked Solutions platform should be fully functional with:

- ✅ User authentication and profiles
- ✅ Book listing and marketplace
- ✅ Payment processing
- ✅ Order management
- ✅ Address autocomplete (if Maps configured)
- ✅ Email notifications (if email configured)
- ✅ Shipping calculations (if shipping configured)

Happy selling! 📚
