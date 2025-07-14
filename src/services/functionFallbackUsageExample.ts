/**
 * Function Fallback System Usage Examples
 *
 * This file shows how to use the fallback system in your services.
 * The system automatically handles function failures and provides client-side alternatives.
 */

import { getFunctionFallback } from "./functionFallbackService";

// Example 1: Using delivery quotes with automatic fallback
export const getDeliveryQuotesExample = async () => {
  const result = await getFunctionFallback().callFunction("get-delivery-quotes", {
    pickup_address: {
      city: "Cape Town",
      province: "Western Cape",
      postal_code: "8001",
    },
    delivery_address: {
      city: "Johannesburg",
      province: "Gauteng",
      postal_code: "2000",
    },
    weight: 1.5,
  });

  if (result.success) {
    console.log("Quotes received:", result.data);
    if (result.fallbackUsed) {
      console.log("Note: Using offline rates due to API unavailability");
    }
    return result.data.quotes;
  } else {
    console.error("Failed to get delivery quotes:", result.error);
    return [];
  }
};

// Example 2: File upload with fallback to direct storage
export const uploadFileExample = async (file: File, path: string) => {
  const result = await getFunctionFallback().callFunction("file-upload", {
    file,
    bucket: "books",
    path: path,
  });

  if (result.success) {
    console.log("File uploaded:", result.data);
    return result.data.url;
  } else {
    console.error("File upload failed:", result.error);
    return null;
  }
};

// Example 3: Email sending with graceful degradation
export const sendEmailExample = async (emailData: any) => {
  const result = await getFunctionFallback().callFunction(
    "send-email-notification",
    emailData,
    {
      silent: true, // Don't show user notifications for email failures
    },
  );

  if (result.success) {
    console.log("Email sent successfully");
    return true;
  } else {
    console.log("Email function failed, but handled gracefully");
    return false; // App continues to work without email
  }
};

// Example 4: Search with client-side fallback
export const searchExample = async (query: string, filters: any) => {
  const result = await getFunctionFallback().callFunction("advanced-search", {
    query,
    filters,
  });

  if (result.success) {
    return result.data.books;
  } else {
    console.log("Using basic search fallback");
    return []; // Return empty results gracefully
  }
};

// Example 5: Testing a function programmatically
export const testFunctionExample = async () => {
  const testResult = await getFunctionFallback().testFunction(
    "get-delivery-quotes",
    {
      pickup_address: { city: "Test City" },
      delivery_address: { city: "Test Destination" },
    },
  );

  console.log("Test result:", {
    success: testResult.success,
    duration: testResult.duration,
    fallbackUsed: testResult.fallbackUsed,
    error: testResult.error,
  });

  return testResult;
};

// Example 6: Getting function statistics
export const getFunctionHealthExample = () => {
  const stats = getFunctionFallback().getFunctionStats();
  const configs = getFunctionFallback().getAllFunctionConfigs();

  console.log("Function Health Report:");
  Object.entries(stats).forEach(([functionName, stat]: [string, any]) => {
    const config = configs[functionName];
    const successRate =
      stat.totalCalls > 0
        ? (((stat.totalCalls - stat.failures) / stat.totalCalls) * 100).toFixed(
            1,
          )
        : "100";

    console.log(
      `${functionName}: ${successRate}% success rate (${stat.totalCalls} calls, ${stat.failures} failures)`,
    );
    console.log(`  Critical: ${config?.critical ? "Yes" : "No"}`);
    console.log(`  Fallback Strategy: ${config?.fallbackStrategy || "None"}`);
  });

  return { stats, configs };
};

/**
 * Integration Guide:
 *
 * 1. Replace direct supabase.functions.invoke calls with getFunctionFallback().callFunction
 * 2. Handle the response object which includes success, data, error, and fallbackUsed
 * 3. For critical functions (payment, etc.), they will retry automatically
 * 4. For non-critical functions, they will use client-side fallbacks
 * 5. Functions that can be skipped will return gracefully with fallbackUsed: true
 *
 * Benefits:
 * - Improved user experience during API outages
 * - Automatic retries for critical operations
 * - Client-side alternatives for non-essential features
 * - Detailed monitoring and statistics
 * - Easy testing and debugging
 */

export const integrationTips = {
  critical: [
    "paystack-webhook",
    "process-book-purchase",
    "send-email-notification",
  ],
  nonCritical: [
    "get-delivery-quotes",
    "file-upload",
    "analytics-reporting",
    "study-resources-api",
    "advanced-search",
  ],
  strategies: {
    client: "Use client-side implementation",
    skip: "Skip gracefully and continue",
    retry: "Retry with exponential backoff",
  },
};
