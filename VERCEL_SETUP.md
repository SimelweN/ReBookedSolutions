# 🚀 Vercel API Routes Setup Guide

This guide will help you replace Supabase Edge Functions with Vercel Serverless Functions for better reliability and auto-deployment.

## ✅ Prerequisites

- [x] GitHub repository connected to Vercel
- [x] Node.js 18+ installed
- [x] Vercel CLI installed: `npm i -g vercel`
- [x] Supabase project with URL and Service Role Key

## 🛠️ Step 1: Install Dependencies

```bash
# Add Vercel Node runtime and formidable for file uploads
yarn add @vercel/node formidable
yarn add -D vercel @types/formidable
```

## 🔧 Step 2: Environment Variables

### Local Development (.env.local)

```bash
cp .env.vercel.example .env.local
# Edit .env.local with your actual values
```

### Vercel Dashboard Setup

1. Go to [vercel.com](https://vercel.com) → Your Project → Settings → Environment Variables
2. Add these required variables:

| Variable                    | Value                     | Required |
| --------------------------- | ------------------------- | -------- |
| `SUPABASE_URL`              | Your Supabase project URL | ✅       |
| `SUPABASE_SERVICE_ROLE_KEY` | Your service role key     | ✅       |
| `PAYSTACK_SECRET_KEY`       | Your Paystack secret key  | ✅       |
| `SENDER_API_KEY`            | Sender.net API key        | ⚠️       |
| `RESEND_API_KEY`            | Resend API key            | ⚠️       |
| `FROM_EMAIL`                | Your sender email         | ⚠️       |

**Note**: You need at least one email provider (Sender or Resend) for notifications.

### Vercel CLI Setup (Alternative)

```bash
vercel login
vercel env add SUPABASE_URL
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add PAYSTACK_SECRET_KEY
# ... add other variables
```

## 🚀 Step 3: Deploy to Vercel

### Option A: GitHub Integration (Recommended)

1. Connect your repository to Vercel
2. Push your code to GitHub
3. Vercel will auto-deploy on every push

### Option B: Manual Deployment

```bash
# Deploy to production
vercel --prod

# Deploy to preview
vercel
```

## 🔄 Step 4: Update Frontend to Use New API

### Option 1: Use the API Service (Recommended)

```typescript
import { apiService } from "@/services/apiService";

// Verify payment
const result = await apiService.verifyPaystackPayment(reference, orderId);

// Initialize payment
const payment = await apiService.initializePaystackPayment({
  email: "user@example.com",
  amount: 100,
  metadata: { orderId: "123" },
});

// Upload file
const formData = new FormData();
formData.append("file", file);
formData.append("userId", userId);
const upload = await apiService.uploadFile(formData);
```

### Option 2: Direct API Calls

```typescript
// Replace Supabase edge function calls
const { data, error } = await supabase.functions.invoke(
  "verify-paystack-payment",
  {
    body: { reference },
  },
);

// With direct API calls
const response = await fetch("/api/verify-paystack-payment", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ reference }),
});
const data = await response.json();
```

## 📋 Step 5: Available API Endpoints

| Endpoint                           | Method | Purpose                          | Status |
| ---------------------------------- | ------ | -------------------------------- | ------ |
| `/api/verify-paystack-payment`     | POST   | Verify Paystack payments         | ✅     |
| `/api/initialize-paystack-payment` | POST   | Initialize payments              | ✅     |
| `/api/file-upload`                 | POST   | Upload files to Supabase Storage | ✅     |
| `/api/send-email-notification`     | POST   | Send emails with templates       | ✅     |
| `/api/get-delivery-quotes`         | POST   | Get shipping quotes              | ✅     |
| `/api/pay-seller`                  | POST   | Process seller payouts           | 🔄     |
| `/api/commit-to-sale`              | POST   | Handle order commitments         | 🔄     |

## 🧪 Step 6: Testing

### Health Checks

```bash
# Test local development
curl http://localhost:3000/api/get-delivery-quotes

# Test production
curl https://your-app.vercel.app/api/get-delivery-quotes
```

### Frontend Health Check

```typescript
import { apiService } from "@/services/apiService";

const health = await apiService.healthCheck();
console.log("API Health:", health);
// { supabase: false, vercel: true }
```

## 🔄 Step 7: Migration Strategy

### Phase 1: Parallel Running

- Keep both Supabase Edge Functions and Vercel API
- Use environment variable to switch: `VITE_USE_VERCEL_API=true`
- Test thoroughly in production

### Phase 2: Gradual Migration

```typescript
// The API service automatically falls back to Vercel if Supabase fails
await apiService.verifyPaystackPayment(reference); // Tries Supabase first, falls back to Vercel
```

### Phase 3: Full Migration

- Set `VITE_USE_VERCEL_API=true` permanently
- Remove Supabase Edge Functions
- Update all components to use `apiService`

## 🐛 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure `vercel.json` has proper CORS headers
   - Check API route headers

2. **Environment Variables Not Working**
   - Redeploy after adding variables in Vercel Dashboard
   - Check variable names match exactly

3. **File Upload Fails**
   - Ensure `formidable` is installed
   - Check file size limits (10MB default)

4. **Payment Verification Fails**
   - Verify Paystack secret key is correct
   - Check if test/live mode matches

### Debug API Issues

```typescript
// Enable debug mode
localStorage.setItem("debugApi", "true");

// Check current API mode
console.log(apiService.getCurrentMode()); // 'vercel' or 'supabase'

// Force switch to Vercel
apiService.switchToVercelApi();
```

## 📈 Benefits of Vercel API Routes

✅ **Auto-deployment** - Deploy on every git push  
✅ **Better reliability** - No edge function timeout issues  
✅ **Easier debugging** - Standard Node.js environment  
✅ **Environment management** - Built-in secrets management  
✅ **Scalability** - Automatic scaling and global CDN  
✅ **Monitoring** - Built-in function logs and analytics

## 🔗 Useful Links

- [Vercel Functions Documentation](https://vercel.com/docs/functions)
- [Vercel Environment Variables](https://vercel.com/docs/concepts/projects/environment-variables)
- [API Service Source Code](./src/services/apiService.ts)
- [Vercel Configuration](./vercel.json)

## 🆘 Support

If you encounter issues:

1. Check the Vercel Function logs in your dashboard
2. Verify environment variables are set correctly
3. Test API endpoints directly with curl/Postman
4. Check the console for detailed error messages

Happy deploying! 🎉
