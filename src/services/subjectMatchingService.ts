/**
 * Precise Subject Matching Service
 * Fixes critical issue: Subject matching is too loose causing false positives
 * Enhanced with subject name normalization for better detection
 */

import { normalizeSubjectName } from "@/utils/subjectNormalization";

export interface SubjectMatchResult {
  isMatch: boolean;
  confidence: number; // 0-100
  reason: string;
  alternatives?: string[];
}

export interface SubjectMapping {
  canonical: string;
  synonyms: string[];
  excludes: string[];
}

// Comprehensive subject mappings to prevent false positives
const SUBJECT_MAPPINGS: SubjectMapping[] = [
  {
    canonical: "Mathematics",
    synonyms: ["Maths", "Math", "Pure Mathematics", "Core Mathematics"],
    excludes: ["Mathematical Literacy", "Maths Lit", "Mathematical Studies"],
  },
  {
    canonical: "Mathematical Literacy",
    synonyms: ["Maths Lit", "Mathematical Studies", "Quantitative Literacy"],
    excludes: ["Mathematics", "Maths", "Math", "Pure Mathematics"],
  },
  {
    canonical: "Physical Sciences",
    synonyms: ["Physics", "Physical Science", "Physics and Chemistry"],
    excludes: ["Life Sciences", "Natural Sciences"],
  },
  {
    canonical: "Life Sciences",
    synonyms: ["Biology", "Life Science", "Biological Sciences"],
    excludes: ["Physical Sciences", "Physics"],
  },
  {
    canonical: "English Home Language",
    synonyms: [
      "English HL",
      "English First Additional Language",
      "English FAL",
      "English",
      "English First Language",
    ],
    excludes: ["Afrikaans"],
  },
  {
    canonical: "English",
    synonyms: [
      "English Home Language",
      "English HL",
      "English First Additional Language",
      "English FAL",
      "English First Language",
    ],
    excludes: ["Afrikaans"],
  },
  {
    canonical: "Afrikaans Home Language",
    synonyms: [
      "Afrikaans HL",
      "Afrikaans First Additional Language",
      "Afrikaans FAL",
      "Afrikaans",
    ],
    excludes: ["English"],
  },
  {
    canonical: "Geography",
    synonyms: ["Geo"],
    excludes: ["History", "Economics"],
  },
  {
    canonical: "History",
    synonyms: ["Hist"],
    excludes: ["Geography", "Economics"],
  },
  {
    canonical: "Accounting",
    synonyms: ["Financial Accounting", "Acc"],
    excludes: ["Economics", "Business Studies"],
  },
  {
    canonical: "Economics",
    synonyms: ["Econ"],
    excludes: ["Accounting", "Business Studies"],
  },
  {
    canonical: "Business Studies",
    synonyms: ["Business", "Entrepreneurship"],
    excludes: ["Economics", "Accounting"],
  },
  {
    canonical: "Computer Applications Technology",
    synonyms: ["CAT", "Computer Studies", "Information Technology", "IT"],
    excludes: ["Information Systems"],
  },
  {
    canonical: "Information Technology",
    synonyms: ["IT", "Computer Studies"],
    excludes: ["Computer Applications Technology", "CAT"],
  },
  {
    canonical: "Engineering Graphics and Design",
    synonyms: ["EGD", "Technical Drawing", "Graphics"],
    excludes: ["Visual Arts", "Design"],
  },
  {
    canonical: "Visual Arts",
    synonyms: ["Art", "Fine Arts", "Creative Arts"],
    excludes: ["Engineering Graphics and Design", "EGD"],
  },
];

/**
 * Find the canonical mapping for a subject
 */
function findSubjectMapping(subjectName: string): SubjectMapping | null {
  const normalizedName = subjectName.toLowerCase().trim();

  return (
    SUBJECT_MAPPINGS.find((mapping) => {
      // Check canonical name
      if (mapping.canonical.toLowerCase() === normalizedName) {
        return true;
      }

      // Check synonyms
      return mapping.synonyms.some(
        (synonym) => synonym.toLowerCase() === normalizedName,
      );
    }) || null
  );
}

/**
 * Precise subject matching to prevent false positives
 */
export function matchSubjects(
  userSubject: string,
  requiredSubject: string,
): SubjectMatchResult {
  // First normalize both subject names to standard forms
  const userStandard = normalizeSubjectName(userSubject);
  const requiredStandard = normalizeSubjectName(requiredSubject);

  const userNormalized = userStandard.toLowerCase().trim();
  const requiredNormalized = requiredStandard.toLowerCase().trim();

  // Exact match after normalization - highest confidence
  if (userNormalized === requiredNormalized) {
    return {
      isMatch: true,
      confidence: 100,
      reason:
        userStandard === userSubject
          ? "Exact match"
          : `Normalized match: ${userSubject} → ${userStandard}`,
    };
  }

  // Special case: Generic "English" requirement should match any English language subject
  if (requiredStandard === "English" && userStandard.includes("English")) {
    return {
      isMatch: true,
      confidence: 95,
      reason: `${userSubject} satisfies English language requirement`,
    };
  }

  // Special case: User has generic "English" but requirement is specific (rare but possible)
  if (userStandard === "English" && requiredStandard.includes("English")) {
    return {
      isMatch: true,
      confidence: 90,
      reason: `English language subject satisfies ${requiredSubject} requirement`,
    };
  }

  // Find mappings for both subjects using standardized names
  const userMapping = findSubjectMapping(userStandard);
  const requiredMapping = findSubjectMapping(requiredStandard);

  // Both subjects have mappings
  if (userMapping && requiredMapping) {
    // Same canonical subject - high confidence
    if (userMapping.canonical === requiredMapping.canonical) {
      return {
        isMatch: true,
        confidence: 95,
        reason: `Both are ${userMapping.canonical}`,
      };
    }

    // Check if explicitly excluded - prevents false positives
    if (
      userMapping.excludes.some(
        (excluded) =>
          excluded.toLowerCase() === requiredMapping.canonical.toLowerCase(),
      )
    ) {
      return {
        isMatch: false,
        confidence: 100,
        reason: `${userSubject} explicitly cannot substitute for ${requiredSubject}`,
        alternatives: requiredMapping.synonyms,
      };
    }
  }

  // User subject has mapping, required doesn't
  if (userMapping && !requiredMapping) {
    // Check if user's synonyms include the required subject
    if (
      userMapping.synonyms.some(
        (synonym) => synonym.toLowerCase() === requiredNormalized,
      )
    ) {
      return {
        isMatch: true,
        confidence: 85,
        reason: `${userSubject} includes ${requiredSubject}`,
      };
    }

    // Check if required subject is in user's canonical name
    if (userMapping.canonical.toLowerCase().includes(requiredNormalized)) {
      return {
        isMatch: true,
        confidence: 75,
        reason: `${requiredSubject} is part of ${userMapping.canonical}`,
      };
    }
  }

  // Required subject has mapping, user doesn't
  if (!userMapping && requiredMapping) {
    // Check if required's synonyms include the user subject
    if (
      requiredMapping.synonyms.some(
        (synonym) => synonym.toLowerCase() === userNormalized,
      )
    ) {
      return {
        isMatch: true,
        confidence: 85,
        reason: `${requiredSubject} includes ${userSubject}`,
      };
    }

    // Check if user subject is in required's canonical name
    if (requiredMapping.canonical.toLowerCase().includes(userNormalized)) {
      return {
        isMatch: true,
        confidence: 75,
        reason: `${userSubject} is part of ${requiredMapping.canonical}`,
      };
    }
  }

  // Enhanced English language subject matching
  const userLower = userStandard.toLowerCase();
  const requiredLower = requiredStandard.toLowerCase();

  // Handle English language subjects more comprehensively
  const englishVariants = [
    "english",
    "english home language",
    "english hl",
    "english first additional language",
    "english fal",
  ];
  const isUserEnglish = englishVariants.some(
    (variant) => userLower.includes(variant) || userLower === variant,
  );
  const isRequiredEnglish = englishVariants.some(
    (variant) => requiredLower.includes(variant) || requiredLower === variant,
  );

  if (isUserEnglish && isRequiredEnglish) {
    return {
      isMatch: true,
      confidence: 92,
      reason: `English language subject match: "${userSubject}" satisfies "${requiredSubject}" requirement`,
    };
  }

  // Handle Mathematics variants
  const mathVariants = [
    "mathematics",
    "maths",
    "math",
    "mathematical literacy",
  ];
  const isUserMath = mathVariants.some(
    (variant) => userLower.includes(variant) || userLower === variant,
  );
  const isRequiredMath = mathVariants.some(
    (variant) => requiredLower.includes(variant) || requiredLower === variant,
  );

  if (isUserMath && isRequiredMath) {
    // Check for Mathematical Literacy vs Mathematics mismatch
    const userIsMathLit = userLower.includes("literacy");
    const requiredIsMathLit = requiredLower.includes("literacy");

    if (userIsMathLit !== requiredIsMathLit) {
      return {
        isMatch: false,
        confidence: 100,
        reason: `${userSubject} cannot substitute for ${requiredSubject} - different math types`,
        alternatives: requiredIsMathLit
          ? ["Mathematical Literacy"]
          : ["Mathematics"],
      };
    }

    return {
      isMatch: true,
      confidence: 94,
      reason: `Mathematics subject match: "${userSubject}" satisfies "${requiredSubject}" requirement`,
    };
  }

  // Partial match as last resort - very low confidence
  if (
    userNormalized.includes(requiredNormalized) ||
    requiredNormalized.includes(userNormalized)
  ) {
    // But not if one is much shorter (prevents "Math" matching "Mathematical Literacy")
    const lengthRatio =
      Math.min(userNormalized.length, requiredNormalized.length) /
      Math.max(userNormalized.length, requiredNormalized.length);

    if (lengthRatio > 0.6) {
      return {
        isMatch: true,
        confidence: 45,
        reason: `Partial match - please verify this is correct`,
        alternatives: requiredMapping?.synonyms || [],
      };
    }
  }

  // No match
  return {
    isMatch: false,
    confidence: 100,
    reason: `${userSubject} does not match ${requiredSubject}`,
    alternatives: requiredMapping?.synonyms || [],
  };
}

/**
 * Validate subject level requirements
 * Level represents APS points (1-7) where 7=80%+, 6=70%+, 5=60%+, etc.
 */
export function validateSubjectLevel(
  userLevel: number,
  requiredLevel: number,
  subjectName: string,
): {
  isValid: boolean;
  reason: string;
  gap?: number;
} {
  console.log(
    `🔍 Level validation for ${subjectName}: User=${userLevel}, Required=${requiredLevel}`,
  );

  // Ensure valid level range
  if (
    userLevel < 1 ||
    userLevel > 7 ||
    requiredLevel < 1 ||
    requiredLevel > 7
  ) {
    console.log(`❌ Invalid level range for ${subjectName}`);
    return {
      isValid: false,
      reason: `Invalid level values for ${subjectName} (levels must be 1-7). User: ${userLevel}, Required: ${requiredLevel}`,
    };
  }

  if (userLevel >= requiredLevel) {
    console.log(`✅ Level requirement met for ${subjectName}`);
    return {
      isValid: true,
      reason: `${subjectName} Level ${userLevel} meets requirement (Level ${requiredLevel})`,
    };
  }

  const gap = requiredLevel - userLevel;
  console.log(`❌ Level requirement NOT met for ${subjectName}, gap: ${gap}`);
  return {
    isValid: false,
    reason: `${subjectName} Level ${userLevel} is below requirement (Level ${requiredLevel}). Need ${gap} more level${gap > 1 ? "s" : ""}.`,
    gap,
  };
}

/**
 * Comprehensive subject requirement check
 */
export function checkSubjectRequirements(
  userSubjects: Array<{ name: string; level: number; points: number }>,
  requiredSubjects: Array<{ name: string; level: number; isRequired: boolean }>,
): {
  isEligible: boolean;
  matchedSubjects: Array<{
    required: string;
    matched: string;
    confidence: number;
    levelValid: boolean;
  }>;
  missingSubjects: Array<{
    name: string;
    level: number;
    alternatives: string[];
  }>;
  details: string;
} {
  console.log("🔍 Subject Requirements Check:", {
    userSubjects: userSubjects.map((s) => ({ name: s.name, level: s.level })),
    requiredSubjects: requiredSubjects
      .filter((s) => s.isRequired)
      .map((s) => ({ name: s.name, level: s.level })),
  });

  const matchedSubjects: any[] = [];
  const missingSubjects: any[] = [];

  for (const required of requiredSubjects.filter((s) => s.isRequired)) {
    let bestMatch: any = null;
    let bestMatchConfidence = 0;

    // Find best matching user subject
    console.log(
      `🔍 Looking for matches for required subject: ${required.name} (Level ${required.level})`,
    );

    for (const userSubject of userSubjects) {
      let matchResult = matchSubjects(userSubject.name, required.name);

      // Enhanced direct matching for common cases
      if (!matchResult.isMatch || matchResult.confidence < 50) {
        const userLower = userSubject.name.toLowerCase().trim();
        const reqLower = required.name.toLowerCase().trim();

        // Enhanced English language matching - handle all variants
        const englishVariants = [
          "english",
          "english home language",
          "english hl",
          "english first additional language",
          "english fal",
        ];
        const userIsEnglish = englishVariants.some(
          (variant) => userLower.includes(variant) || userLower === variant,
        );
        const reqIsEnglish = englishVariants.some(
          (variant) => reqLower.includes(variant) || reqLower === variant,
        );

        if (userIsEnglish && reqIsEnglish) {
          matchResult = {
            isMatch: true,
            confidence: 95,
            reason: `English language match: ${userSubject.name} satisfies ${required.name}`,
          };
        }
        // Enhanced Mathematics matching
        else if (
          (reqLower === "mathematics" || reqLower === "maths") &&
          (userLower === "mathematics" ||
            userLower === "maths" ||
            userLower === "math")
        ) {
          matchResult = {
            isMatch: true,
            confidence: 98,
            reason: `Mathematics match: ${userSubject.name} satisfies ${required.name}`,
          };
        }
        // Physical Sciences matching
        else if (
          (reqLower === "physical sciences" || reqLower === "physics") &&
          (userLower === "physical sciences" || userLower === "physics")
        ) {
          matchResult = {
            isMatch: true,
            confidence: 98,
            reason: `Physical Sciences match: ${userSubject.name} satisfies ${required.name}`,
          };
        }
        // Life Sciences matching
        else if (
          (reqLower === "life sciences" || reqLower === "biology") &&
          (userLower === "life sciences" || userLower === "biology")
        ) {
          matchResult = {
            isMatch: true,
            confidence: 98,
            reason: `Life Sciences match: ${userSubject.name} satisfies ${required.name}`,
          };
        }
        // Generic matching for exact name matches (case insensitive)
        else if (userLower === reqLower) {
          matchResult = {
            isMatch: true,
            confidence: 100,
            reason: `Exact match (case insensitive): ${userSubject.name} = ${required.name}`,
          };
        }
        // Partial matching for subjects with common words
        else if (userLower.includes(reqLower) || reqLower.includes(userLower)) {
          const confidence = Math.max(
            60,
            (Math.min(userLower.length, reqLower.length) /
              Math.max(userLower.length, reqLower.length)) *
              100,
          );
          matchResult = {
            isMatch: true,
            confidence: Math.floor(confidence),
            reason: `Partial match: ${userSubject.name} contains ${required.name}`,
          };
        }
      }

      console.log(
        `  📝 Checking: "${userSubject.name}" (Level ${userSubject.level}) vs "${required.name}"`,
      );
      console.log(
        `    Match: ${matchResult.isMatch}, Confidence: ${matchResult.confidence}, Reason: ${matchResult.reason}`,
      );

      if (matchResult.isMatch && matchResult.confidence > bestMatchConfidence) {
        const levelCheck = validateSubjectLevel(
          userSubject.level,
          required.level,
          required.name,
        );

        console.log(
          `    ✅ Level Check: ${levelCheck.isValid}, Reason: ${levelCheck.reason}`,
        );

        bestMatch = {
          required: required.name,
          matched: userSubject.name,
          confidence: matchResult.confidence,
          levelValid: levelCheck.isValid,
          userLevel: userSubject.level,
          requiredLevel: required.level,
          matchReason: matchResult.reason,
          levelReason: levelCheck.reason,
        };
        bestMatchConfidence = matchResult.confidence;
      }
    }

    // If no match found, check for any possible matches with low confidence for debugging
    if (!bestMatch) {
      const debugMatches = userSubjects
        .map((userSubject) => ({
          user: userSubject.name,
          required: required.name,
          matchResult: matchSubjects(userSubject.name, required.name),
        }))
        .filter((debug) => debug.matchResult.confidence > 0);

      if (debugMatches.length > 0) {
        console.log(
          `Debug: Potential matches for ${required.name}:`,
          debugMatches,
        );
      }
    }

    if (bestMatch) {
      matchedSubjects.push(bestMatch);
    } else {
      // Before marking as missing, try one more comprehensive check
      // Check if any user subject could possibly match with lower confidence threshold
      let fallbackMatch = null;

      for (const userSubject of userSubjects) {
        const matchResult = matchSubjects(userSubject.name, required.name);

        // Accept matches with confidence >= 40 as fallback
        if (matchResult.isMatch && matchResult.confidence >= 40) {
          const levelCheck = validateSubjectLevel(
            userSubject.level,
            required.level,
            required.name,
          );

          fallbackMatch = {
            required: required.name,
            matched: userSubject.name,
            confidence: matchResult.confidence,
            levelValid: levelCheck.isValid,
            userLevel: userSubject.level,
            requiredLevel: required.level,
            matchReason: matchResult.reason,
            levelReason: levelCheck.reason,
          };
          break; // Take first acceptable fallback match
        }
      }

      if (fallbackMatch) {
        matchedSubjects.push(fallbackMatch);
      } else {
        // Find alternatives from mapping
        const mapping = findSubjectMapping(required.name);
        missingSubjects.push({
          name: required.name,
          level: required.level,
          alternatives: mapping?.synonyms || [],
        });
      }
    }
  }

  // Check if all required subjects are matched with valid levels
  const validMatches = matchedSubjects.filter((m) => m.levelValid);
  const isEligible =
    missingSubjects.length === 0 &&
    validMatches.length === requiredSubjects.filter((s) => s.isRequired).length;

  // Generate detailed explanation
  let details = "";
  if (isEligible) {
    details = "All subject requirements met";
  } else {
    const issues: string[] = [];

    if (missingSubjects.length > 0) {
      issues.push(
        `Missing: ${missingSubjects.map((s) => `${s.name} (Level ${s.level})`).join(", ")}`,
      );
    }

    const invalidLevels = matchedSubjects.filter((m) => !m.levelValid);
    if (invalidLevels.length > 0) {
      issues.push(
        `Insufficient levels: ${invalidLevels.map((m) => `${m.required} (need Level ${m.requiredLevel}, have Level ${m.userLevel})`).join(", ")}`,
      );
    }

    details = issues.join("; ");
  }

  console.log("📊 Final Results:", {
    isEligible,
    matchedSubjectsCount: matchedSubjects.length,
    validMatchesCount: validMatches.length,
    missingSubjectsCount: missingSubjects.length,
    matchedSubjects: matchedSubjects.map((m) => ({
      required: m.required,
      matched: m.matched,
      levelValid: m.levelValid,
      userLevel: m.userLevel,
      requiredLevel: m.requiredLevel,
    })),
    missingSubjects: missingSubjects.map((m) => ({
      name: m.name,
      level: m.level,
    })),
    details,
  });

  return {
    isEligible,
    matchedSubjects,
    missingSubjects,
    details,
  };
}

/**
 * Get subject alternatives for user guidance
 */
export function getSubjectAlternatives(subjectName: string): string[] {
  const mapping = findSubjectMapping(subjectName);
  return mapping?.synonyms || [];
}

/**
 * Test function to verify subject matching works correctly
 * This helps identify matching issues during development
 */
export function testSubjectMatching(): void {
  console.log("=== Subject Matching Test Results ===");

  // Test cases that should match
  const testCases = [
    { user: "English Home Language", required: "English", shouldMatch: true },
    {
      user: "English First Additional Language",
      required: "English",
      shouldMatch: true,
    },
    { user: "Mathematics", required: "Mathematics", shouldMatch: true },
    { user: "Maths", required: "Mathematics", shouldMatch: true },
    {
      user: "Physical Sciences",
      required: "Physical Sciences",
      shouldMatch: true,
    },
    { user: "Physics", required: "Physical Sciences", shouldMatch: true },
    { user: "Life Sciences", required: "Life Sciences", shouldMatch: true },
    { user: "Biology", required: "Life Sciences", shouldMatch: true },
  ];

  testCases.forEach((testCase) => {
    const result = matchSubjects(testCase.user, testCase.required);
    const status =
      result.isMatch === testCase.shouldMatch ? "✅ PASS" : "❌ FAIL";
    console.log(
      `${status}: "${testCase.user}" vs "${testCase.required}" - Match: ${result.isMatch}, Confidence: ${result.confidence}, Reason: ${result.reason}`,
    );
  });

  console.log("=== End Test Results ===");
}

// Uncomment this line to run tests in development
if (typeof window !== "undefined" && import.meta.env.DEV) {
  // testSubjectMatching();
}
