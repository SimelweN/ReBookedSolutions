/**
 * Quick test to verify validation error handling is working correctly
 * This can be removed after verification
 */

import { validateAPSSubjectsEnhanced } from "./enhancedValidation";
import { APSSubject } from "@/types/university";

// Test function to verify error object handling
export function testValidationErrorHandling() {
  // Create test subjects that will trigger validation errors
  const invalidSubjects: APSSubject[] = [
    { name: "", marks: -5, level: 0, points: 0 }, // Invalid: empty name, negative marks
    { name: "Test Subject", marks: 150, level: 10, points: 10 }, // Invalid: marks > 100, level > 7
  ];

  const result = validateAPSSubjectsEnhanced(invalidSubjects);

  console.log("Validation Test Results:");
  console.log("IsValid:", result.isValid);
  console.log("Errors (objects):", result.errors);
  console.log(
    "Error messages (strings):",
    result.errors.map((error) => error.message),
  );

  // Test the conversion logic used in the component
  const errorMessages = result.errors.map((error) =>
    typeof error === "string" ? error : error.message || "Unknown error",
  );

  console.log("Converted error messages:", errorMessages);

  return {
    originalErrors: result.errors,
    convertedMessages: errorMessages,
    isValid: result.isValid,
  };
}

// Auto-run test in development
if (import.meta.env.DEV) {
  console.log("Running validation error test...");
  testValidationErrorHandling();
}
