/**
 * Test utility for debugging login errors
 * Use in browser console to test error handling
 */

export const testLoginErrorHandling = () => {
  console.log("�� Testing login error handling...");

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
      import("./errorUtils").then(({ getErrorMessage, logError }) => {
        const result = getErrorMessage(error, "Fallback message");
        console.log(`Test ${index + 1}:`, {
          input: error,
          output: result,
          isObjectObject: result === "[object Object]",
        });

        // Test the logging function too
        console.log(`Testing logError for test ${index + 1}:`);
        logError(`Test ${index + 1}`, error);
      });
    } catch (testError) {
      console.error(`Test ${index + 1} failed:`, testError);
    }
  });
};

/**
 * Test login error simulation
 */
export const simulateLoginError = () => {
  console.log("🧪 Simulating login error scenarios...");

  // Simulate different Supabase error formats
  const supabaseErrors = [
    { message: "Invalid login credentials" },
    {
      error: "Email not confirmed",
      error_description: "Please verify your email",
    },
    {
      status: 400,
      statusText: "Bad Request",
      error: { message: "Validation failed" },
    },
    new Error("Network connection failed"),
  ];

  supabaseErrors.forEach((error, index) => {
    console.log(`\n--- Simulating Supabase Error ${index + 1} ---`);
    console.log("Input error:", error);

    // Test the login error handling logic
    let errorMessage = "Login failed";

    if (error instanceof Error) {
      errorMessage = error.message;
    } else if (typeof error === "string") {
      errorMessage = error;
    } else if (error && typeof error === "object") {
      const errorObj = error as any;
      errorMessage =
        errorObj.message ||
        errorObj.error_description ||
        errorObj.error ||
        errorObj.details ||
        JSON.stringify(error, null, 2) ||
        "Login failed - please try again";
    } else {
      errorMessage = String(error) || "Login failed";
    }

    console.log("Extracted message:", errorMessage);
    console.log(
      "Contains [object Object]:",
      errorMessage.includes("[object Object]"),
    );
  });
};

// Make available globally for console testing
if (typeof window !== "undefined") {
  (window as any).testLoginErrorHandling = testLoginErrorHandling;
}
