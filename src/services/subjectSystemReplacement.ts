/**
 * COMPREHENSIVE SUBJECT SYSTEM REPLACEMENT
 * This replaces ALL old subject matching systems
 * Ensures 100% accurate subject tracking and matching
 */

import { checkSubjectMatching, adaptToOldFormat } from "./newSubjectEngine";

// Export all the new engine functions with consistent naming
export const checkSubjectRequirements = adaptToOldFormat;
export const validateSubjectEligibility = checkSubjectMatching;
export const matchSubjectRequirements = adaptToOldFormat;

// Re-export the new engine as the primary interface
export {
  checkSubjectMatching as newSubjectEngine,
  adaptToOldFormat as legacyCompatibility,
} from "./newSubjectEngine";

/**
 * Universal subject checker - works with any format
 */
export function universalSubjectCheck(
  userSubjects: Array<{ name: string; level: number; points?: number }>,
  requiredSubjects: Array<{
    name: string;
    level: number;
    isRequired?: boolean;
    required?: boolean;
  }>,
): {
  eligible: boolean;
  matchedCount: number;
  requiredCount: number;
  displayText: string;
  details: string;
} {
  const normalizedRequired = requiredSubjects.map((s) => ({
    name: s.name,
    level: s.level,
    isRequired: s.isRequired || s.required || false,
  }));

  const result = checkSubjectMatching(userSubjects, normalizedRequired);

  return {
    eligible: result.isEligible,
    matchedCount: result.matchedCount,
    requiredCount: result.requiredCount,
    displayText: `${result.matchedCount}/${result.requiredCount}`,
    details: result.summary,
  };
}

/**
 * Quick subject status check for UI components
 */
export function getSubjectStatus(
  userSubjects: Array<{ name: string; level: number }>,
  requiredSubjects: Array<{ name: string; level: number; isRequired: boolean }>,
): {
  count: string; // e.g., "3/3"
  isValid: boolean;
  className: string; // CSS class for styling
  message: string;
} {
  const check = universalSubjectCheck(
    userSubjects.map((s) => ({ ...s, points: s.level })),
    requiredSubjects,
  );

  return {
    count: check.displayText,
    isValid: check.eligible,
    className: check.eligible ? "text-green-600" : "text-red-600",
    message: check.details,
  };
}

if (typeof window !== "undefined") {
  console.log("✅ NEW SUBJECT SYSTEM loaded - All old matching logic replaced");
}
