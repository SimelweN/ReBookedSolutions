# Payment System Setup Guide

This guide covers all steps needed to set up the Paystack payment system for the ReBooked Solutions platform.

## 1. Frontend Environment Variables

Create a `.env.local` file in your project root with:

```bash
# Required Paystack Configuration
VITE_PAYSTACK_PUBLIC_KEY=pk_test_your-paystack-public-key

# Supabase Configuration
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key

# Optional
VITE_GOOGLE_MAPS_API_KEY=your-google-maps-api-key
VITE_APP_URL=http://localhost:8080
```

## 2. Supabase Backend Setup

### Database Tables

Run the following SQL migrations in Supabase SQL Editor:

1. **Orders Table**: Already created in `supabase/migrations/20250130000001_fix_orders_table_for_paystack.sql`
2. **Banking Details**: Already created in previous migrations
3. **Payout Logs**: Already created for seller payouts

### Environment Variables in Supabase

Set these in Supabase Dashboard > Settings > Environment Variables:

```bash
PAYSTACK_SECRET_KEY=sk_test_your-paystack-secret-key
```

### Edge Functions

Deploy the required Supabase Edge Functions:

```bash
# Initialize Paystack payment
supabase functions deploy initialize-paystack-payment

# Verify Paystack payment
supabase functions deploy verify-paystack-payment

# Handle Paystack webhooks
supabase functions deploy paystack-webhook

# Create Paystack subaccounts for sellers
supabase functions deploy create-paystack-subaccount
```

## 3. Paystack Dashboard Configuration

### Webhook Setup

1. Go to Paystack Dashboard > Settings > Webhooks
2. Add webhook URL: `https://your-project.supabase.co/functions/v1/paystack-webhook`
3. Select events: `charge.success`, `transfer.success`, `transfer.failed`

### Test Mode Configuration

For development:

- Use test keys (pk_test_xxx and sk_test_xxx)
- Test with Paystack test cards
- Use test bank details for transfers

### Production Configuration

For production:

- Switch to live keys (pk_live_xxx and sk_live_xxx)
- Set up business verification
- Configure settlement account

## 4. Frontend Integration Status

✅ **PaystackPaymentButton Component** - Ready
✅ **PaystackPaymentService** - Ready  
✅ **Order Creation** - Ready
✅ **Payment Verification** - Ready
✅ **Error Handling** - Enhanced
✅ **Loading States** - Implemented

## 5. Testing the Payment System

### Test Cards (Paystack Test Mode)

```
Successful Payment:
Card: 4084084084084081
CVV: 408
Expiry: Any future date

Failed Payment:
Card: 4084084084084082
CVV: 408
Expiry: Any future date
```

### Test Flow

1. Add items to cart
2. Go to checkout
3. Fill shipping information
4. Click "Pay with Paystack"
5. Use test card details
6. Verify order creation in database
7. Check payment verification

## 6. Troubleshooting

### Common Issues

**"Paystack public key not configured"**

- Check `.env.local` file has `VITE_PAYSTACK_PUBLIC_KEY`
- Restart development server after adding environment variables

**"Failed to create order: undefined"**

- ✅ Fixed with enhanced error handling
- Check Supabase database connection
- Verify orders table exists

**Payment popup doesn't open**

- Check browser console for JavaScript errors
- Verify Paystack script loads correctly
- Check network connectivity

### Error Logs

Check these locations for errors:

- Browser console (F12)
- Supabase Edge Functions logs
- Paystack Dashboard webhook logs

## 7. Production Deployment

### Fly.io Deployment

Set environment variables:

```bash
fly secrets set VITE_PAYSTACK_PUBLIC_KEY="pk_live_your-live-key"
fly secrets set VITE_SUPABASE_URL="https://your-project.supabase.co"
fly secrets set VITE_SUPABASE_ANON_KEY="your-anon-key"
fly deploy
```

### Supabase Production

- Set `PAYSTACK_SECRET_KEY` to live secret key
- Deploy edge functions to production
- Update webhook URLs to production URLs

## 8. Security Considerations

✅ **API Keys**: Public key only exposed to frontend
✅ **Secret Key**: Stored securely in Supabase environment
✅ **Webhook Verification**: Implemented in webhook handler
✅ **RLS Policies**: Applied to orders table
✅ **Input Validation**: All payment data validated

## 9. Monitoring

### Key Metrics to Monitor

- Payment success rate
- Order creation rate
- Failed payment reasons
- Webhook delivery success
- Database performance

### Alerts to Set Up

- Payment processing errors
- High failed payment rate
- Webhook delivery failures
- Database connection issues

---

## Quick Start Checklist

- [ ] Set `VITE_PAYSTACK_PUBLIC_KEY` in environment
- [ ] Set `PAYSTACK_SECRET_KEY` in Supabase
- [ ] Deploy edge functions
- [ ] Set up webhooks in Paystack
- [ ] Test payment flow
- [ ] Monitor for errors

For issues, check the error logs and this troubleshooting guide.
