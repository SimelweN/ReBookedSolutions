/**
 * Test utility for debugging login errors
 * Use in browser console to test error handling
 */

export const testLoginErrorHandling = () => {
  console.log("🧪 Testing login error handling...");

  // Test different error types
  const testErrors = [
    new Error("Test error message"),
    { message: "Object with message property" },
    { error: "Object with error property" },
    { error_description: "Object with error_description" },
    "String error",
    { complex: { nested: "Complex object" } },
    "[object Object]",
    null,
    undefined,
  ];

  testErrors.forEach((error, index) => {
    try {
      // Import getErrorMessage dynamically
      import("./errorUtils").then(({ getErrorMessage }) => {
        const result = getErrorMessage(error, "Fallback message");
        console.log(`Test ${index + 1}:`, {
          input: error,
          output: result,
          isObjectObject: result === "[object Object]",
        });
      });
    } catch (testError) {
      console.error(`Test ${index + 1} failed:`, testError);
    }
  });
};

// Make available globally for console testing
if (typeof window !== "undefined") {
  (window as any).testLoginErrorHandling = testLoginErrorHandling;
}
