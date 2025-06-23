/**
 * Debug utility for testing subject matching logic
 * Use this to quickly test and verify subject matching scenarios
 */

import {
  matchSubjects,
  validateSubjectLevel,
  checkSubjectRequirements,
} from "../services/subjectMatchingService";

/**
 * Test the exact scenario from the user's issue
 */
export function testUserScenario() {
  console.log("=== Testing User's Exact Scenario ===");

  // User's subjects (as they would appear in the system)
  const userSubjects = [
    { name: "English Home Language", level: 5, points: 5 },
    { name: "Mathematics", level: 4, points: 4 },
    // Add more subjects that the user might have
  ];

  // Program requirements (as they appear in the course database)
  const programRequirements = [
    { name: "English", level: 5, isRequired: true },
    { name: "Mathematics", level: 4, isRequired: true },
  ];

  console.log("📝 User Subjects:", userSubjects);
  console.log("📋 Program Requirements:", programRequirements);

  // Test individual subject matches
  console.log("\n🔍 Individual Subject Matching:");

  // Test English matching
  const englishMatch = matchSubjects("English Home Language", "English");
  console.log("English Test:", {
    userSubject: "English Home Language",
    requiredSubject: "English",
    result: englishMatch,
  });

  // Test Mathematics matching
  const mathMatch = matchSubjects("Mathematics", "Mathematics");
  console.log("Math Test:", {
    userSubject: "Mathematics",
    requiredSubject: "Mathematics",
    result: mathMatch,
  });

  // Test level validation
  console.log("\n📊 Level Validation:");
  const englishLevel = validateSubjectLevel(5, 5, "English");
  const mathLevel = validateSubjectLevel(4, 4, "Mathematics");

  console.log("English Level Check:", englishLevel);
  console.log("Math Level Check:", mathLevel);

  // Test complete requirement checking
  console.log("\n🎯 Complete Requirement Check:");
  const result = checkSubjectRequirements(userSubjects, programRequirements);

  console.log("Final Result:", {
    isEligible: result.isEligible,
    matchedCount: result.matchedSubjects.length,
    requiredCount: programRequirements.filter((s) => s.isRequired).length,
    matchedSubjects: result.matchedSubjects,
    missingSubjects: result.missingSubjects,
    details: result.details,
  });

  return result;
}

/**
 * Quick function to disable all debug logs
 */
export function disableDebugLogs() {
  const originalConsoleLog = console.log;
  console.log = (...args) => {
    // Only show logs that don't start with debug emojis
    if (typeof args[0] === "string" && !args[0].match(/^[🔍📝📋🎯✅❌📊]/)) {
      originalConsoleLog(...args);
    }
  };
}

// Run test automatically in development
if (typeof window !== "undefined" && import.meta.env.DEV) {
  setTimeout(() => {
    console.log("🚀 Running automatic subject matching debug test...");
    testUserScenario();
  }, 2000);
}
