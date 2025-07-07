# Complete Backend Setup for 48-Hour Commit System

## 🎯 Overview

This guide provides everything needed to set up the complete backend for the 48-hour commit system including Edge Functions, database schema, and automated processes.

## 📦 What's Included

### Edge Functions

1. **`commit-to-sale`** - Handles seller commitments with validation, notifications, and book status updates
2. **`decline-commit`** - Handles seller declining orders with refunds and notifications
3. **`auto-expire-commits`** - Cron job that automatically expires and refunds uncommitted orders after 48 hours

### Database Schema

- Enhanced `transactions` and `orders` tables with commit-related columns
- `order_notifications` table for real-time notifications
- Indexes for optimal query performance
- Triggers for automatic deadline setting
- Views and functions for analytics

### Deployment Scripts

- Automated deployment script for all Edge Functions
- Database migration files
- Environment configuration templates

## 🚀 Quick Start

### 1. Prerequisites

```bash
# Install Supabase CLI
npm install -g supabase

# Login to Supabase
supabase login

# Link your project
supabase link --project-ref YOUR_PROJECT_REF
```

### 2. Environment Setup

```bash
# Copy environment template
cp supabase/.env.example .env

# Edit .env with your actual values
# Required:
# - SUPABASE_URL
# - SUPABASE_SERVICE_ROLE_KEY
# - PAYSTACK_SECRET_KEY (for refunds)
```

### 3. Deploy Everything

```bash
# Run the deployment script
./scripts/deploy-edge-functions.sh

# Or deploy manually:
supabase functions deploy commit-to-sale
supabase functions deploy decline-commit
supabase functions deploy auto-expire-commits
supabase db push
```

## 📋 Edge Function Details

### commit-to-sale Function

**Purpose**: Handles seller commitments to sales

**Endpoint**: `POST /functions/v1/commit-to-sale`

**Request Body**:

```json
{
  "transactionId": "uuid",
  "sellerId": "uuid"
}
```

**Features**:

- ✅ Validates seller permissions
- ✅ Checks 48-hour deadline
- ✅ Updates order/transaction status to "committed"
- ✅ Marks books as sold
- ✅ Creates notifications for buyer and seller
- ✅ Prevents double-commits
- ✅ Handles both `transactions` and `orders` tables

### decline-commit Function

**Purpose**: Handles seller declining orders

**Endpoint**: `POST /functions/v1/decline-commit`

**Request Body**:

```json
{
  "transactionId": "uuid",
  "sellerId": "uuid",
  "reason": "optional reason"
}
```

**Features**:

- ✅ Validates seller permissions
- ✅ Updates status to "declined_by_seller"
- ✅ Relists book as available
- ✅ Processes automatic Paystack refund
- ✅ Creates notifications for buyer and seller
- ✅ Requires confirmation in UI

### auto-expire-commits Function

**Purpose**: Automatically expires uncommitted orders after 48 hours

**Endpoint**: `POST /functions/v1/auto-expire-commits` (cron job)

**Schedule**: Every 6 hours

**Features**:

- ✅ Finds all orders past 48-hour deadline
- ✅ Updates status to "expired"
- ✅ Processes automatic Paystack refunds
- ✅ Relists books as available
- ✅ Creates notifications for both parties
- ✅ Handles both `transactions` and `orders` tables
- ✅ Processes in batches for performance

## 🗄️ Database Schema

### Enhanced Tables

#### transactions / orders

```sql
-- New commit-related columns added:
commit_deadline TIMESTAMPTZ,     -- When seller must commit by
expires_at TIMESTAMPTZ,          -- Same as commit_deadline
seller_committed BOOLEAN,        -- Has seller committed
committed_at TIMESTAMPTZ,        -- When commitment was made
declined_at TIMESTAMPTZ,         -- When order was declined
decline_reason TEXT,             -- Reason for declining
refund_reference TEXT,           -- Paystack refund reference
refunded_at TIMESTAMPTZ         -- When refund was processed
```

#### order_notifications (new)

```sql
CREATE TABLE order_notifications (
  id UUID PRIMARY KEY,
  order_id UUID NOT NULL,
  user_id UUID NOT NULL,
  type TEXT NOT NULL,              -- sale_committed, sale_declined, etc.
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW()
);
```

### Automatic Triggers

**Commit Deadline Trigger**: Automatically sets 48-hour deadline when order status becomes "paid"

**Notification Trigger**: Sends real-time notifications on commit status changes

### Performance Indexes

- Optimized queries for pending commits by seller
- Fast lookups by commit deadline for cron job
- Efficient notification retrieval by user

## ⚙️ Configuration

### Environment Variables (Required)

```bash
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
PAYSTACK_SECRET_KEY=sk_test_your_paystack_key  # For refunds
```

### Cron Job Setup

```sql
-- Run in Supabase SQL Editor to set up automatic expiry
SELECT cron.schedule(
  'auto-expire-commits',
  '0 */6 * * *',  -- Every 6 hours
  'SELECT net.http_post(''https://YOUR_PROJECT.supabase.co/functions/v1/auto-expire-commits'', ''{}''::jsonb);'
);
```

## 🧪 Testing

### QA Dashboard Testing

1. Go to Admin Dashboard → QA Testing
2. Use "Create Demo Order" to generate test orders
3. Test commit and decline functionality
4. Verify notifications are created
5. Test auto-expire functionality

### Manual Testing Flow

1. **Create Order**: Buyer purchases a book
2. **Check Pending**: Seller sees pending commit in profile
3. **Test Commit**: Seller clicks "Commit to Sale"
4. **Test Decline**: Seller clicks "Decline Order"
5. **Test Expiry**: Wait for cron job or trigger manually

### Monitoring

```sql
-- Check pending commits
SELECT * FROM pending_commits;

-- Get commit statistics
SELECT * FROM get_commit_stats();

-- View recent notifications
SELECT * FROM order_notifications ORDER BY created_at DESC LIMIT 10;
```

## 🔧 Troubleshooting

### Edge Functions Not Working

```bash
# Check function logs
supabase functions logs commit-to-sale

# Redeploy
supabase functions deploy commit-to-sale --no-verify-jwt
```

### Database Issues

```bash
# Reset and reapply migrations
supabase db reset --linked

# Check migration status
supabase db diff
```

### Missing Refunds

- Verify `PAYSTACK_SECRET_KEY` is set correctly
- Check Paystack dashboard for refund status
- Review function logs for refund errors

### Cron Job Not Running

```sql
-- Check if cron extension is enabled
SELECT * FROM pg_extension WHERE extname = 'pg_cron';

-- View scheduled jobs
SELECT * FROM cron.job;

-- Manually trigger auto-expire
SELECT net.http_post('https://YOUR_PROJECT.supabase.co/functions/v1/auto-expire-commits', '{}');
```

## 📊 Analytics and Monitoring

### Built-in Analytics

```sql
-- Commit statistics for all sellers
SELECT * FROM get_commit_stats();

-- Commit statistics for specific seller
SELECT * FROM get_commit_stats('seller_uuid_here');

-- Recent activity
SELECT
  type,
  COUNT(*) as count,
  DATE_TRUNC('day', created_at) as date
FROM order_notifications
WHERE created_at > NOW() - INTERVAL '7 days'
GROUP BY type, DATE_TRUNC('day', created_at)
ORDER BY date DESC;
```

### Performance Monitoring

- Monitor Edge Function execution times
- Track commit rates and patterns
- Alert on high decline rates
- Monitor refund success rates

## 🔒 Security

### Authentication

- All Edge Functions validate JWT tokens
- Users can only commit/decline their own sales
- Service role required for admin operations

### Data Protection

- Row Level Security (RLS) enabled on all tables
- Sensitive data like Paystack keys stored as secrets
- Audit trail for all commit operations

## 📚 API Reference

### Frontend Integration

```typescript
// Commit to sale
const result = await CommitSystemService.commitToSale(transactionId, sellerId);

// Decline commit
const result = await CommitSystemService.declineCommit(transactionId, sellerId);

// Get pending commits
const commits = await CommitSystemService.getPendingCommits(sellerId);
```

### Direct Edge Function Calls

```javascript
// Call Edge Function directly
const { data, error } = await supabase.functions.invoke("commit-to-sale", {
  body: { transactionId, sellerId },
  headers: { Authorization: `Bearer ${session.access_token}` },
});
```

## 🎯 Success Metrics

### System Health

- ✅ Commit rate > 80%
- ✅ Auto-expire processing < 5 minutes
- ✅ Refund success rate > 95%
- ✅ Notification delivery > 99%

### User Experience

- ✅ Sellers receive instant notifications
- ✅ Buyers get automatic refunds for expired orders
- ✅ Clear UI feedback for all actions
- ✅ No manual intervention required

## 🆘 Support

If you encounter issues:

1. **Check the QA Dashboard** for system testing
2. **Review function logs** in Supabase dashboard
3. **Verify environment variables** are set correctly
4. **Test with demo data** before production use
5. **Monitor database performance** and indexes

The system is designed to be fully automated and handle edge cases gracefully. The local fallback ensures functionality even without Edge Functions deployed.
