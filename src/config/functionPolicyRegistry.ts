import { FunctionPolicy } from "@/types/functionFallback";

export const FUNCTION_POLICY_REGISTRY: Record<string, FunctionPolicy> = {
  // Authentication & User Identity
  "auth-sign-in": {
    fallback: false,
    fallbackType: "none",
    useOnly: "Supabase Auth/Client",
    notes: "Authentication must use Supabase only",
  },
  "auth-sign-up": {
    fallback: false,
    fallbackType: "none",
    useOnly: "Supabase Auth/Client",
    notes: "Registration must use Supabase only",
  },
  "auth-sign-out": {
    fallback: false,
    fallbackType: "none",
    useOnly: "Supabase Auth/Client",
    notes: "Sign out must use Supabase only",
  },

  // Payments & Financial Transactions
  "initialize-paystack-payment": {
    fallback: true,
    fallbackType: "queue",
    timeout: 30000,
    retryAttempts: 3,
    notes: "Ensure payments are idempotent to avoid duplication",
  },
  "verify-paystack-payment": {
    fallback: true,
    fallbackType: "queue",
    timeout: 30000,
    retryAttempts: 5,
    notes: "Critical for payment confirmation",
  },
  "create-paystack-subaccount": {
    fallback: true,
    fallbackType: "queue",
    timeout: 20000,
    retryAttempts: 3,
    notes: "Seller account creation",
  },
  "pay-seller": {
    fallback: true,
    
    fallbackType: "queue",
    timeout: 30000,
    retryAttempts: 3,
    notes: "Critical for seller payments",
  },
  "paystack-webhook": {
    fallback: true,
    
    fallbackType: "queue",
    timeout: 15000,
    retryAttempts: 5,
    notes: "Payment status updates",
  },

  // Shipping & Courier APIs
  "get-delivery-quotes": {
    fallback: true,
    
    fallbackType: "cached-rates",
    timeout: 10000,
    retryAttempts: 2,
    cacheEnabled: true,
    cacheTTL: 300000, // 5 minutes
    notes: "Use cached data if live rates are unavailable",
  },
  "courier-guy-quote": {
    fallback: true,
    
    fallbackType: "cached-rates",
    timeout: 8000,
    retryAttempts: 2,
    cacheEnabled: true,
    cacheTTL: 300000,
    notes: "CourierGuy shipping quotes",
  },
  "courier-guy-shipment": {
    fallback: true,
    
    fallbackType: "queue",
    timeout: 15000,
    retryAttempts: 3,
    notes: "Shipment creation",
  },
  "courier-guy-track": {
    fallback: true,
    
    fallbackType: "cached-rates",
    timeout: 8000,
    retryAttempts: 2,
    cacheEnabled: true,
    cacheTTL: 180000, // 3 minutes
    notes: "Package tracking",
  },
  "fastway-quote": {
    fallback: true,
    
    fallbackType: "cached-rates",
    timeout: 8000,
    retryAttempts: 2,
    cacheEnabled: true,
    cacheTTL: 300000,
    notes: "Fastway shipping quotes",
  },
  "fastway-shipment": {
    fallback: true,
    
    fallbackType: "queue",
    timeout: 15000,
    retryAttempts: 3,
    notes: "Fastway shipment creation",
  },
  "fastway-track": {
    fallback: true,
    
    fallbackType: "cached-rates",
    timeout: 8000,
    retryAttempts: 2,
    cacheEnabled: true,
    cacheTTL: 180000,
    notes: "Fastway package tracking",
  },

  // File Upload
  "file-upload": {
    fallback: true,
    
    fallbackType: "store-locally",
    timeout: 60000,
    retryAttempts: 3,
    notes: "Sync file to Supabase storage when connection restores",
  },

  // Order Management
  "create-order": {
    fallback: true,
    
    fallbackType: "queue-order",
    timeout: 15000,
    retryAttempts: 3,
    notes: "Persist locally, retry when backend available",
  },
  "commit-to-sale": {
    fallback: true,
    
    fallbackType: "queue-order",
    timeout: 10000,
    retryAttempts: 3,
    notes: "Seller commitment to sale",
  },
  "decline-commit": {
    fallback: true,
    
    fallbackType: "queue-order",
    timeout: 10000,
    retryAttempts: 3,
    notes: "Order cancellation",
  },
  "mark-collected": {
    fallback: true,
    
    fallbackType: "queue-order",
    timeout: 10000,
    retryAttempts: 3,
    notes: "Order completion",
  },
  "process-book-purchase": {
    fallback: true,
    
    fallbackType: "queue-order",
    timeout: 20000,
    retryAttempts: 3,
    notes: "Book purchase processing",
  },
  "process-multi-seller-purchase": {
    fallback: true,
    
    fallbackType: "queue-order",
    timeout: 30000,
    retryAttempts: 3,
    notes: "Multi-seller cart processing",
  },
  "auto-expire-commits": {
    fallback: true,
    
    fallbackType: "deferred",
    timeout: 5000,
    retryAttempts: 2,
    notes: "Automated order expiry",
  },
  "check-expired-orders": {
    fallback: true,
    
    fallbackType: "deferred",
    timeout: 10000,
    retryAttempts: 2,
    notes: "Order expiry checking",
  },
  "process-order-reminders": {
    fallback: true,
    
    fallbackType: "queue-email",
    timeout: 10000,
    retryAttempts: 2,
    notes: "Order reminder emails",
  },

  // Email & Notifications
  "send-email-notification": {
    fallback: true,
    
    fallbackType: "queue-email",
    timeout: 15000,
    retryAttempts: 3,
    notes: "Backup email provider or store for retry",
  },
  "email-automation": {
    fallback: true,
    
    fallbackType: "queue-email",
    timeout: 10000,
    retryAttempts: 3,
    notes: "Automated email sequences",
  },
  "realtime-notifications": {
    fallback: true,
    vercelAllowed: false,
    fallbackType: "queue",
    timeout: 5000,
    retryAttempts: 2,
    notes: "Real-time user notifications",
  },

  // Analytics & Logs
  "analytics-reporting": {
    fallback: true,
    
    fallbackType: "deferred",
    timeout: 8000,
    retryAttempts: 1,
    notes: "Queue logs and flush in batch",
  },

  // Other Services
  "study-resources-api": {
    fallback: true,
    
    fallbackType: "cached-rates",
    timeout: 10000,
    retryAttempts: 2,
    cacheEnabled: true,
    cacheTTL: 600000, // 10 minutes
    notes: "Study resources and materials",
  },
  "advanced-search": {
    fallback: true,
    
    fallbackType: "cached-rates",
    timeout: 8000,
    retryAttempts: 2,
    cacheEnabled: true,
    cacheTTL: 180000,
    notes: "Enhanced search functionality",
  },
  "dispute-resolution": {
    fallback: true,
    
    fallbackType: "queue",
    timeout: 15000,
    retryAttempts: 3,
    notes: "Conflict resolution system",
  },
  "update-paystack-subaccount": {
    fallback: true,
    
    fallbackType: "queue",
    timeout: 20000,
    retryAttempts: 3,
    notes: "Seller account updates",
  },
};

export const getFunctionPolicy = (functionName: string): FunctionPolicy => {
  return (
    FUNCTION_POLICY_REGISTRY[functionName] || {
      fallback: true,
      
      fallbackType: "queue",
      timeout: 10000,
      retryAttempts: 2,
      notes: "Default policy for unregistered functions",
    }
  );
};

export const isFunctionRegistered = (functionName: string): boolean => {
  return functionName in FUNCTION_POLICY_REGISTRY;
};
