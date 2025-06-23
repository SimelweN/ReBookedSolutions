/**
 * Test utility to verify error handling works correctly
 */

import { safeLogError } from "./errorHandling";

export const testErrorHandling = () => {
  console.log("🧪 Testing error handling...");

  // Test 1: Regular Error object
  const regularError = new Error("This is a test error");
  regularError.name = "TestError";
  safeLogError("Test Regular Error", regularError);

  // Test 2: Supabase-style error object
  const supabaseError = {
    message: "Database connection failed",
    code: "CONN_FAILED",
    details: "Unable to establish connection to database",
    hint: "Check your network connection",
  };
  safeLogError("Test Supabase Error", supabaseError);

  // Test 3: Network error
  const networkError = new Error("Failed to fetch");
  networkError.name = "NetworkError";
  safeLogError("Test Network Error", networkError);

  // Test 4: String error
  safeLogError("Test String Error", "This is a simple string error");

  // Test 5: Null/undefined
  safeLogError("Test Null Error", null);
  safeLogError("Test Undefined Error", undefined);

  // Test 6: Complex object with circular reference
  const complexObj: any = { message: "Complex error" };
  complexObj.self = complexObj; // Circular reference
  safeLogError("Test Complex Error", complexObj);

  console.log("✅ Error handling test completed");
};

// Make available globally in dev mode
if (import.meta.env.DEV && typeof window !== "undefined") {
  (window as any).testErrorHandling = testErrorHandling;
  console.log("🛠️ Test utility available: call testErrorHandling() in console");
}

export default testErrorHandling;
