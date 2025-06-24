/**
 * Test Fixed Subject Matching
 * Verify that the new subject matching logic works correctly
 */

import { checkSubjectEligibility } from "@/services/fixedSubjectMatching";

export function testFixedSubjectMatching(): void {
  console.log("🧪 Testing Fixed Subject Matching Logic...");

  // Test Case 1: User selects proper subjects from dropdown
  const userSubjects1 = [
    { name: "English Home Language", level: 6, points: 6 },
    { name: "Mathematics", level: 6, points: 6 },
    { name: "Physical Sciences", level: 5, points: 5 },
    { name: "Life Sciences", level: 5, points: 5 },
  ];

  const programRequirements1 = [
    { name: "English", level: 4, isRequired: true },
    { name: "Mathematics", level: 5, isRequired: true },
    { name: "Physical Sciences", level: 4, isRequired: true },
  ];

  const result1 = checkSubjectEligibility(userSubjects1, programRequirements1);

  console.log("📝 Test Case 1 - Should show 3/3 subjects matched:");
  console.log({
    isEligible: result1.isEligible,
    matchedCount: result1.matchedCount,
    requiredCount: result1.requiredCount,
    display: `${result1.matchedCount}/${result1.requiredCount}`,
    shouldBe: "3/3",
    passed:
      result1.matchedCount === 3 &&
      result1.requiredCount === 3 &&
      result1.isEligible,
  });

  // Test Case 2: User missing one subject
  const userSubjects2 = [
    { name: "English Home Language", level: 6, points: 6 },
    { name: "Mathematics", level: 6, points: 6 },
    { name: "Geography", level: 5, points: 5 }, // Wrong subject
  ];

  const programRequirements2 = [
    { name: "English", level: 4, isRequired: true },
    { name: "Mathematics", level: 5, isRequired: true },
    { name: "Physical Sciences", level: 4, isRequired: true },
  ];

  const result2 = checkSubjectEligibility(userSubjects2, programRequirements2);

  console.log("📝 Test Case 2 - Should show 2/3 subjects matched:");
  console.log({
    isEligible: result2.isEligible,
    matchedCount: result2.matchedCount,
    requiredCount: result2.requiredCount,
    display: `${result2.matchedCount}/${result2.requiredCount}`,
    shouldBe: "2/3",
    passed:
      result2.matchedCount === 2 &&
      result2.requiredCount === 3 &&
      !result2.isEligible,
  });

  // Test Case 3: Level too low
  const userSubjects3 = [
    { name: "English Home Language", level: 6, points: 6 },
    { name: "Mathematics", level: 3, points: 3 }, // Level too low
    { name: "Physical Sciences", level: 5, points: 5 },
  ];

  const programRequirements3 = [
    { name: "English", level: 4, isRequired: true },
    { name: "Mathematics", level: 5, isRequired: true },
    { name: "Physical Sciences", level: 4, isRequired: true },
  ];

  const result3 = checkSubjectEligibility(userSubjects3, programRequirements3);

  console.log(
    "📝 Test Case 3 - Should show 2/3 subjects matched (Math level too low):",
  );
  console.log({
    isEligible: result3.isEligible,
    matchedCount: result3.matchedCount,
    requiredCount: result3.requiredCount,
    display: `${result3.matchedCount}/${result3.requiredCount}`,
    shouldBe: "2/3",
    passed:
      result3.matchedCount === 2 &&
      result3.requiredCount === 3 &&
      !result3.isEligible,
  });

  // Test Case 4: Different English variants should match
  const userSubjects4 = [
    { name: "English First Additional Language", level: 6, points: 6 },
    { name: "Maths", level: 6, points: 6 },
    { name: "Physics", level: 5, points: 5 },
  ];

  const programRequirements4 = [
    { name: "English Home Language", level: 4, isRequired: true },
    { name: "Mathematics", level: 5, isRequired: true },
    { name: "Physical Sciences", level: 4, isRequired: true },
  ];

  const result4 = checkSubjectEligibility(userSubjects4, programRequirements4);

  console.log(
    "📝 Test Case 4 - Should show 3/3 subjects matched (variant names):",
  );
  console.log({
    isEligible: result4.isEligible,
    matchedCount: result4.matchedCount,
    requiredCount: result4.requiredCount,
    display: `${result4.matchedCount}/${result4.requiredCount}`,
    shouldBe: "3/3",
    passed:
      result4.matchedCount === 3 &&
      result4.requiredCount === 3 &&
      result4.isEligible,
  });

  // Summary
  const allTests = [result1, result2, result3, result4];
  const expectedResults = [
    { matchedCount: 3, requiredCount: 3, isEligible: true },
    { matchedCount: 2, requiredCount: 3, isEligible: false },
    { matchedCount: 2, requiredCount: 3, isEligible: false },
    { matchedCount: 3, requiredCount: 3, isEligible: true },
  ];

  let passedTests = 0;
  for (let i = 0; i < allTests.length; i++) {
    const actual = allTests[i];
    const expected = expectedResults[i];

    if (
      actual.matchedCount === expected.matchedCount &&
      actual.requiredCount === expected.requiredCount &&
      actual.isEligible === expected.isEligible
    ) {
      passedTests++;
    }
  }

  console.log(
    `\n✅ Fixed Subject Matching Test Results: ${passedTests}/${allTests.length} tests passed`,
  );

  if (passedTests === allTests.length) {
    console.log(
      "🎉 All tests passed! Subject matching logic is working correctly.",
    );
  } else {
    console.log(
      "❌ Some tests failed. Subject matching logic needs further fixes.",
    );
  }
}

// Auto-run test in development
if (typeof window !== "undefined" && import.meta.env.DEV) {
  setTimeout(() => {
    console.log("🚀 Running fixed subject matching tests...");
    testFixedSubjectMatching();
  }, 2000);
}
