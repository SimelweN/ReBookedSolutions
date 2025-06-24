/**
 * Subject Name Standardization Utility
 * Fixes subject detection issues by normalizing subject names to standard forms
 */

import { SOUTH_AFRICAN_SUBJECTS } from "@/constants/subjects";

interface SubjectMapping {
  standard: string;
  aliases: string[];
}

// Comprehensive subject name mappings for standardization
const SUBJECT_NORMALIZATIONS: SubjectMapping[] = [
  {
    standard: "Mathematics",
    aliases: [
      "Maths",
      "Math",
      "Pure Mathematics",
      "Core Mathematics",
      "Technical Mathematics",
    ],
  },
  {
    standard: "Mathematical Literacy",
    aliases: [
      "Maths Lit",
      "Mathematical Studies",
      "Quantitative Literacy",
      "Maths Literacy",
    ],
  },
  {
    standard: "English Home Language",
    aliases: ["English HL", "English", "English First Language"],
  },
  {
    standard: "English",
    aliases: [
      "English Home Language",
      "English HL",
      "English First Additional Language",
      "English FAL",
    ],
  },
  {
    standard: "English First Additional Language",
    aliases: ["English FAL", "English Additional"],
  },
  {
    standard: "Afrikaans Home Language",
    aliases: ["Afrikaans HL", "Afrikaans", "Afrikaans First Language"],
  },
  {
    standard: "Afrikaans First Additional Language",
    aliases: ["Afrikaans FAL", "Afrikaans Additional"],
  },
  {
    standard: "Physical Sciences",
    aliases: ["Physics", "Physical Science", "Physics and Chemistry"],
  },
  {
    standard: "Life Sciences",
    aliases: ["Biology", "Life Science", "Biological Sciences"],
  },
  {
    standard: "Computer Applications Technology",
    aliases: ["CAT", "Computer Studies", "Computer Technology"],
  },
  {
    standard: "Information Technology",
    aliases: ["IT", "Information Systems"],
  },
  {
    standard: "Engineering Graphics and Design",
    aliases: ["EGD", "Technical Drawing", "Graphics and Design"],
  },
  {
    standard: "Business Studies",
    aliases: ["Business", "Business Management", "Entrepreneurship"],
  },
  {
    standard: "Visual Arts",
    aliases: ["Art", "Fine Arts", "Creative Arts"],
  },
];

/**
 * Normalize a subject name to its standard form
 */
export function normalizeSubjectName(subjectName: string): string {
  if (!subjectName || typeof subjectName !== "string") {
    return subjectName;
  }

  const cleaned = subjectName.trim();

  // Check if it's already a standard subject name
  if (SOUTH_AFRICAN_SUBJECTS.includes(cleaned)) {
    return cleaned;
  }

  // Find mapping for this subject
  const mapping = SUBJECT_NORMALIZATIONS.find((m) =>
    m.aliases.some((alias) => alias.toLowerCase() === cleaned.toLowerCase()),
  );

  if (mapping) {
    return mapping.standard;
  }

  // If no mapping found, check for partial matches
  const lowerCleaned = cleaned.toLowerCase();

  // Check for home language patterns
  if (lowerCleaned.includes("home language") || lowerCleaned.includes("hl")) {
    if (lowerCleaned.includes("english")) {
      return "English Home Language";
    }
    if (lowerCleaned.includes("afrikaans")) {
      return "Afrikaans Home Language";
    }
  }

  // Check for first additional language patterns
  if (
    lowerCleaned.includes("first additional") ||
    lowerCleaned.includes("fal")
  ) {
    if (lowerCleaned.includes("english")) {
      return "English First Additional Language";
    }
    if (lowerCleaned.includes("afrikaans")) {
      return "Afrikaans First Additional Language";
    }
  }

  // Check for common abbreviations and variations
  if (lowerCleaned === "maths" || lowerCleaned === "math") {
    return "Mathematics";
  }

  if (lowerCleaned === "physics") {
    return "Physical Sciences";
  }

  if (lowerCleaned === "biology") {
    return "Life Sciences";
  }

  // Special case: generic "english" should remain as "English" to match requirements
  if (lowerCleaned === "english") {
    return "English";
  }

  // Additional common subject variations
  if (
    lowerCleaned === "maths literacy" ||
    lowerCleaned === "mathematical literacy"
  ) {
    return "Mathematical Literacy";
  }

  if (lowerCleaned === "business") {
    return "Business Studies";
  }

  if (lowerCleaned === "cat") {
    return "Computer Applications Technology";
  }

  if (lowerCleaned === "it") {
    return "Information Technology";
  }

  if (lowerCleaned === "egd") {
    return "Engineering Graphics and Design";
  }

  // Handle language subjects more robustly
  if (lowerCleaned.includes("afrikaans") && lowerCleaned.includes("home")) {
    return "Afrikaans Home Language";
  }

  if (
    lowerCleaned.includes("afrikaans") &&
    (lowerCleaned.includes("first") || lowerCleaned.includes("fal"))
  ) {
    return "Afrikaans First Additional Language";
  }

  // Return original if no normalization found
  return cleaned;
}

/**
 * Validate that a subject name is recognized
 */
export function isValidSubjectName(subjectName: string): boolean {
  const normalized = normalizeSubjectName(subjectName);
  return SOUTH_AFRICAN_SUBJECTS.includes(normalized);
}

/**
 * Get suggestions for a subject name
 */
export function getSubjectSuggestions(partialName: string): string[] {
  if (!partialName || typeof partialName !== "string") {
    return [];
  }

  const lower = partialName.toLowerCase();

  // Find subjects that start with the partial name
  const startsWith = SOUTH_AFRICAN_SUBJECTS.filter((subject) =>
    subject.toLowerCase().startsWith(lower),
  );

  // Find subjects that contain the partial name
  const contains = SOUTH_AFRICAN_SUBJECTS.filter(
    (subject) =>
      subject.toLowerCase().includes(lower) && !startsWith.includes(subject),
  );

  return [...startsWith.slice(0, 5), ...contains.slice(0, 5)];
}

/**
 * Get the canonical form of all aliases for a subject
 */
export function getSubjectAliases(standardName: string): string[] {
  const mapping = SUBJECT_NORMALIZATIONS.find(
    (m) => m.standard === standardName,
  );
  return mapping ? [standardName, ...mapping.aliases] : [standardName];
}
