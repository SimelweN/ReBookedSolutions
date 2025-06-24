/**
 * FIXED Subject Matching Service
 * Specifically designed for dropdown-selected subjects
 * Addresses critical bug: Incorrect subject counting and eligibility logic
 */

/**
 * Comprehensive subject equivalency mapping for dropdown selections
 * This handles all the subjects that can be selected from the dropdown
 */
const SUBJECT_EQUIVALENCIES: Record<string, string[]> = {
  // English Language variants
  English: [
    "English",
    "English Home Language",
    "English HL",
    "English First Additional Language",
    "English FAL",
    "English First Language",
    "English Second Language",
  ],
  "English Home Language": [
    "English",
    "English Home Language",
    "English HL",
    "English First Additional Language",
    "English FAL",
  ],
  "English First Additional Language": [
    "English",
    "English Home Language",
    "English HL",
    "English First Additional Language",
    "English FAL",
  ],

  // Mathematics variants
  Mathematics: [
    "Mathematics",
    "Maths",
    "Math",
    "Pure Mathematics",
    "Core Mathematics",
  ],
  "Mathematical Literacy": [
    "Mathematical Literacy",
    "Maths Lit",
    "Mathematical Studies",
    "Quantitative Literacy",
  ],

  // Sciences
  "Physical Sciences": [
    "Physical Sciences",
    "Physical Science",
    "Physics",
    "Chemistry",
    "Physics and Chemistry",
  ],
  "Life Sciences": [
    "Life Sciences",
    "Life Science",
    "Biology",
    "Biological Sciences",
  ],

  // Other subjects
  Geography: ["Geography", "Geo"],
  History: ["History", "Hist"],
  Accounting: ["Accounting", "Financial Accounting", "Acc"],
  Economics: ["Economics", "Econ"],
  "Business Studies": ["Business Studies", "Business", "Entrepreneurship"],
  "Computer Applications Technology": [
    "Computer Applications Technology",
    "CAT",
    "Computer Studies",
    "Information Technology",
    "IT",
  ],
  "Information Technology": [
    "Information Technology",
    "IT",
    "Computer Studies",
  ],
  "Engineering Graphics and Design": [
    "Engineering Graphics and Design",
    "EGD",
    "Technical Drawing",
    "Graphics",
  ],
  "Visual Arts": ["Visual Arts", "Art", "Fine Arts", "Creative Arts"],
  "Afrikaans Home Language": [
    "Afrikaans Home Language",
    "Afrikaans HL",
    "Afrikaans",
  ],
  "Afrikaans First Additional Language": [
    "Afrikaans First Additional Language",
    "Afrikaans FAL",
    "Afrikaans",
  ],
  "Life Orientation": ["Life Orientation", "LO", "Life Skills"],
  "Agricultural Sciences": ["Agricultural Sciences", "Agriculture"],
  Tourism: ["Tourism"],
  "Consumer Studies": ["Consumer Studies"],
  "Hospitality Studies": ["Hospitality Studies"],
  Design: ["Design"],
  "Dramatic Arts": ["Dramatic Arts", "Drama"],
  Music: ["Music"],
  "Dance Studies": ["Dance Studies", "Dance"],
};

/**
 * Fast subject matching specifically for dropdown selections
 * Returns true if subjects are equivalent (case-insensitive)
 */
function isSubjectMatch(userSubject: string, requiredSubject: string): boolean {
  const userNormalized = userSubject.trim().toLowerCase();
  const requiredNormalized = requiredSubject.trim().toLowerCase();

  // Direct match
  if (userNormalized === requiredNormalized) {
    return true;
  }

  // Check equivalencies for both subjects
  for (const [canonical, equivalents] of Object.entries(
    SUBJECT_EQUIVALENCIES,
  )) {
    const canonicalLower = canonical.toLowerCase();
    const equivalentsLower = equivalents.map((e) => e.toLowerCase());

    // If user subject matches this group
    const userInGroup =
      canonicalLower === userNormalized ||
      equivalentsLower.includes(userNormalized);

    // If required subject matches this group
    const requiredInGroup =
      canonicalLower === requiredNormalized ||
      equivalentsLower.includes(requiredNormalized);

    // If both are in the same equivalency group, they match
    if (userInGroup && requiredInGroup) {
      return true;
    }
  }

  // Special case: Generic "English" requirement should accept any English variant
  if (requiredNormalized === "english" && userNormalized.includes("english")) {
    return true;
  }

  // Special case: Generic "Mathematics" requirement should accept any math variant
  if (
    requiredNormalized === "mathematics" &&
    (userNormalized.includes("math") || userNormalized === "maths")
  ) {
    return true;
  }

  // Partial matching for common abbreviations
  const commonAbbreviations: Record<string, string> = {
    maths: "mathematics",
    math: "mathematics",
    geo: "geography",
    hist: "history",
    acc: "accounting",
    econ: "economics",
    cat: "computer applications technology",
    it: "information technology",
    egd: "engineering graphics and design",
    lo: "life orientation",
  };

  const userAbbrev = commonAbbreviations[userNormalized];
  const requiredAbbrev = commonAbbreviations[requiredNormalized];

  if (userAbbrev && userAbbrev === requiredNormalized) {
    return true;
  }

  if (requiredAbbrev && requiredAbbrev === userNormalized) {
    return true;
  }

  return false;
}

/**
 * Check if user's subject level meets requirement
 * APS Level: 1-7 where 7=80%+, 6=70%+, 5=60%+, etc.
 */
function meetsLevelRequirement(
  userLevel: number,
  requiredLevel: number,
): boolean {
  return userLevel >= requiredLevel;
}

/**
 * FIXED subject requirement checking for dropdown selections
 * Returns accurate counts and eligibility status
 */
export function checkSubjectEligibility(
  userSubjects: Array<{ name: string; level: number; points: number }>,
  requiredSubjects: Array<{ name: string; level: number; isRequired: boolean }>,
): {
  isEligible: boolean;
  matchedCount: number;
  requiredCount: number;
  matchedSubjects: Array<{
    required: string;
    matched: string;
    levelMet: boolean;
    userLevel: number;
    requiredLevel: number;
  }>;
  missingSubjects: Array<{
    name: string;
    level: number;
  }>;
  details: string;
} {
  // Filter to only required subjects
  const onlyRequired = requiredSubjects.filter((s) => s.isRequired);
  const matchedSubjects: any[] = [];
  const missingSubjects: any[] = [];

  console.log("🔍 Fixed Subject Eligibility Check:", {
    userSubjects: userSubjects.map((s) => ({ name: s.name, level: s.level })),
    requiredSubjects: onlyRequired.map((s) => ({
      name: s.name,
      level: s.level,
    })),
  });

  // For each required subject, find the best match
  for (const required of onlyRequired) {
    let bestMatch: any = null;

    // Look for matching subject in user's subjects
    for (const userSubject of userSubjects) {
      if (isSubjectMatch(userSubject.name, required.name)) {
        const levelMet = meetsLevelRequirement(
          userSubject.level,
          required.level,
        );

        console.log(
          `✅ Found match: "${userSubject.name}" (Level ${userSubject.level}) matches "${required.name}" (Level ${required.level}), Level Met: ${levelMet}`,
        );

        bestMatch = {
          required: required.name,
          matched: userSubject.name,
          levelMet,
          userLevel: userSubject.level,
          requiredLevel: required.level,
        };
        break; // Take first match (could be improved to take best match)
      }
    }

    if (bestMatch) {
      matchedSubjects.push(bestMatch);
    } else {
      console.log(
        `❌ No match found for required subject: "${required.name}" (Level ${required.level})`,
      );
      missingSubjects.push({
        name: required.name,
        level: required.level,
      });
    }
  }

  // Calculate eligibility
  const validMatches = matchedSubjects.filter((m) => m.levelMet);
  const matchedCount = validMatches.length;
  const requiredCount = onlyRequired.length;
  const isEligible = matchedCount === requiredCount;

  // Generate details
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

    const invalidLevels = matchedSubjects.filter((m) => !m.levelMet);
    if (invalidLevels.length > 0) {
      issues.push(
        `Level too low: ${invalidLevels.map((m) => `${m.required} (need ${m.requiredLevel}, have ${m.userLevel})`).join(", ")}`,
      );
    }

    details = issues.join("; ");
  }

  console.log("📊 Fixed Eligibility Results:", {
    isEligible,
    matchedCount,
    requiredCount,
    validMatches: validMatches.length,
    totalMatches: matchedSubjects.length,
    details,
  });

  return {
    isEligible,
    matchedCount,
    requiredCount,
    matchedSubjects,
    missingSubjects,
    details,
  };
}

/**
 * Convert old format to new format for backward compatibility
 */
export function convertToFixedFormat(
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
  const result = checkSubjectEligibility(userSubjects, requiredSubjects);

  return {
    isEligible: result.isEligible,
    matchedSubjects: result.matchedSubjects.map((m) => ({
      required: m.required,
      matched: m.matched,
      confidence: 100, // Fixed logic provides 100% confidence
      levelValid: m.levelMet,
    })),
    missingSubjects: result.missingSubjects.map((m) => ({
      name: m.name,
      level: m.level,
      alternatives: SUBJECT_EQUIVALENCIES[m.name] || [],
    })),
    details: result.details,
  };
}
