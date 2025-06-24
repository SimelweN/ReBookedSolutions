import { APSSubject } from "@/types/university";

export interface SubjectRequirement {
  name: string;
  minimumLevel: number; // APS level (1-7)
  alternatives?: string[]; // Alternative subject names
  isRequired: boolean;
}

export interface ProgramRequirements {
  minimumAPS: number;
  requiredSubjects: SubjectRequirement[];
  recommendedSubjects?: SubjectRequirement[];
}

export interface EligibilityResult {
  isEligible: boolean;
  apsGap: number;
  subjectMatch: {
    hasAllRequired: boolean;
    missingSubjects: string[];
    satisfiedSubjects: string[];
    matchPercentage: number;
  };
  recommendation: string;
  details: string[];
}

/**
 * Enhanced APS and subject matching logic
 * Fixes issues with incorrect eligibility calculations
 */
export class EnhancedAPSMatching {
  /**
   * Normalize subject names for better matching
   */
  private static normalizeSubjectName(name: string): string {
    return name
      .toLowerCase()
      .trim()
      .replace(/\s+/g, " ")
      .replace(/[^\w\s]/g, "")
      .replace(/\bmaths?\b/gi, "mathematics")
      .replace(/\benglish?\b/gi, "english")
      .replace(/\bphysical science\b/gi, "physics")
      .replace(/\blife science\b/gi, "biology");
  }

  /**
   * Check if a user subject matches a required subject
   */
  private static doesSubjectMatch(
    userSubject: APSSubject,
    requirement: SubjectRequirement,
  ): boolean {
    const normalizedUserSubject = this.normalizeSubjectName(userSubject.name);
    const normalizedRequired = this.normalizeSubjectName(requirement.name);

    // Direct match
    if (normalizedUserSubject === normalizedRequired) {
      return userSubject.level >= requirement.minimumLevel;
    }

    // Check alternatives
    if (requirement.alternatives) {
      for (const alt of requirement.alternatives) {
        const normalizedAlt = this.normalizeSubjectName(alt);
        if (normalizedUserSubject === normalizedAlt) {
          return userSubject.level >= requirement.minimumLevel;
        }
      }
    }

    // Partial matching for common variations
    if (
      normalizedUserSubject.includes(normalizedRequired) ||
      normalizedRequired.includes(normalizedUserSubject)
    ) {
      return userSubject.level >= requirement.minimumLevel;
    }

    return false;
  }

  /**
   * Calculate comprehensive eligibility for a program
   */
  static calculateEligibility(
    userAPS: number,
    userSubjects: APSSubject[],
    programRequirements: ProgramRequirements,
  ): EligibilityResult {
    const result: EligibilityResult = {
      isEligible: false,
      apsGap: programRequirements.minimumAPS - userAPS,
      subjectMatch: {
        hasAllRequired: false,
        missingSubjects: [],
        satisfiedSubjects: [],
        matchPercentage: 0,
      },
      recommendation: "",
      details: [],
    };

    // Check APS requirement
    const meetsAPS = userAPS >= programRequirements.minimumAPS;
    if (!meetsAPS) {
      result.details.push(
        `APS too low: need ${programRequirements.minimumAPS}, have ${userAPS} (gap: ${result.apsGap})`,
      );
    } else {
      result.details.push(
        `APS requirement met: ${userAPS}/${programRequirements.minimumAPS}`,
      );
    }

    // Check subject requirements
    const requiredSubjects = programRequirements.requiredSubjects.filter(
      (s) => s.isRequired,
    );
    const satisfiedSubjects: string[] = [];
    const missingSubjects: string[] = [];

    for (const requirement of requiredSubjects) {
      const isMatched = userSubjects.some((userSubject) =>
        this.doesSubjectMatch(userSubject, requirement),
      );

      if (isMatched) {
        satisfiedSubjects.push(requirement.name);
        result.details.push(`✓ ${requirement.name} requirement satisfied`);
      } else {
        missingSubjects.push(requirement.name);
        result.details.push(
          `✗ Missing: ${requirement.name} (level ${requirement.minimumLevel}+)`,
        );
      }
    }

    // Calculate match percentage
    const matchPercentage =
      requiredSubjects.length > 0
        ? Math.round((satisfiedSubjects.length / requiredSubjects.length) * 100)
        : 100;

    result.subjectMatch = {
      hasAllRequired: missingSubjects.length === 0,
      missingSubjects,
      satisfiedSubjects,
      matchPercentage,
    };

    // Determine overall eligibility
    result.isEligible = meetsAPS && result.subjectMatch.hasAllRequired;

    // Generate recommendation
    if (result.isEligible) {
      result.recommendation = "You qualify for this program!";
    } else if (!meetsAPS && !result.subjectMatch.hasAllRequired) {
      result.recommendation = `Improve your APS (need ${Math.abs(result.apsGap)} more points) and complete missing subjects: ${missingSubjects.join(", ")}`;
    } else if (!meetsAPS) {
      result.recommendation = `Your subjects match, but you need ${Math.abs(result.apsGap)} more APS points`;
    } else {
      result.recommendation = `Your APS is sufficient, but you need these subjects: ${missingSubjects.join(", ")}`;
    }

    return result;
  }

  /**
   * Get common program requirements for popular fields
   */
  static getCommonProgramRequirements(
    programName: string,
  ): ProgramRequirements {
    const normalizedProgram = this.normalizeSubjectName(programName);

    // Engineering programs
    if (
      normalizedProgram.includes("engineering") ||
      normalizedProgram.includes("engineer")
    ) {
      return {
        minimumAPS: 35,
        requiredSubjects: [
          { name: "Mathematics", minimumLevel: 6, isRequired: true },
          {
            name: "Physical Science",
            minimumLevel: 6,
            alternatives: ["Physics"],
            isRequired: true,
          },
          {
            name: "English",
            minimumLevel: 4,
            alternatives: [
              "English Home Language",
              "English First Additional Language",
            ],
            isRequired: true,
          },
        ],
      };
    }

    // Medicine programs
    if (
      normalizedProgram.includes("medicine") ||
      normalizedProgram.includes("medical")
    ) {
      return {
        minimumAPS: 40,
        requiredSubjects: [
          { name: "Mathematics", minimumLevel: 6, isRequired: true },
          {
            name: "Physical Science",
            minimumLevel: 6,
            alternatives: ["Physics"],
            isRequired: true,
          },
          {
            name: "Life Science",
            minimumLevel: 6,
            alternatives: ["Biology"],
            isRequired: true,
          },
          {
            name: "English",
            minimumLevel: 6,
            alternatives: ["English Home Language"],
            isRequired: true,
          },
        ],
      };
    }

    // Business/Commerce programs
    if (
      normalizedProgram.includes("business") ||
      normalizedProgram.includes("commerce") ||
      normalizedProgram.includes("accounting") ||
      normalizedProgram.includes("economics")
    ) {
      return {
        minimumAPS: 30,
        requiredSubjects: [
          {
            name: "Mathematics",
            minimumLevel: 4,
            alternatives: ["Mathematical Literacy"],
            isRequired: true,
          },
          {
            name: "English",
            minimumLevel: 4,
            alternatives: [
              "English Home Language",
              "English First Additional Language",
            ],
            isRequired: true,
          },
        ],
      };
    }

    // Science programs
    if (
      normalizedProgram.includes("science") ||
      normalizedProgram.includes("biology") ||
      normalizedProgram.includes("chemistry") ||
      normalizedProgram.includes("physics")
    ) {
      return {
        minimumAPS: 32,
        requiredSubjects: [
          { name: "Mathematics", minimumLevel: 5, isRequired: true },
          {
            name: "Physical Science",
            minimumLevel: 5,
            alternatives: ["Physics"],
            isRequired: true,
          },
          {
            name: "English",
            minimumLevel: 4,
            alternatives: [
              "English Home Language",
              "English First Additional Language",
            ],
            isRequired: true,
          },
        ],
      };
    }

    // Law programs
    if (
      normalizedProgram.includes("law") ||
      normalizedProgram.includes("legal")
    ) {
      return {
        minimumAPS: 35,
        requiredSubjects: [
          {
            name: "English",
            minimumLevel: 6,
            alternatives: ["English Home Language"],
            isRequired: true,
          },
        ],
      };
    }

    // Education programs
    if (
      normalizedProgram.includes("education") ||
      normalizedProgram.includes("teaching")
    ) {
      return {
        minimumAPS: 28,
        requiredSubjects: [
          {
            name: "English",
            minimumLevel: 4,
            alternatives: [
              "English Home Language",
              "English First Additional Language",
            ],
            isRequired: true,
          },
        ],
      };
    }

    // Arts/Humanities programs
    if (
      normalizedProgram.includes("arts") ||
      normalizedProgram.includes("humanities") ||
      normalizedProgram.includes("social") ||
      normalizedProgram.includes("language")
    ) {
      return {
        minimumAPS: 26,
        requiredSubjects: [
          {
            name: "English",
            minimumLevel: 4,
            alternatives: [
              "English Home Language",
              "English First Additional Language",
            ],
            isRequired: true,
          },
        ],
      };
    }

    // Default/Generic program requirements
    return {
      minimumAPS: 24,
      requiredSubjects: [
        {
          name: "English",
          minimumLevel: 4,
          alternatives: [
            "English Home Language",
            "English First Additional Language",
          ],
          isRequired: true,
        },
      ],
    };
  }

  /**
   * Batch check eligibility for multiple programs
   */
  static checkMultiplePrograms(
    userAPS: number,
    userSubjects: APSSubject[],
    programs: Array<{ name: string; requirements?: ProgramRequirements }>,
  ): Array<{ program: string; eligibility: EligibilityResult }> {
    return programs.map((program) => ({
      program: program.name,
      eligibility: this.calculateEligibility(
        userAPS,
        userSubjects,
        program.requirements || this.getCommonProgramRequirements(program.name),
      ),
    }));
  }

  /**
   * Get subjects that would improve eligibility
   */
  static getSuggestedSubjects(
    userSubjects: APSSubject[],
    programRequirements: ProgramRequirements,
  ): string[] {
    const userSubjectNames = userSubjects.map((s) =>
      this.normalizeSubjectName(s.name),
    );
    const suggestions: string[] = [];

    for (const requirement of programRequirements.requiredSubjects) {
      const hasSubject = userSubjects.some((userSubject) =>
        this.doesSubjectMatch(userSubject, requirement),
      );

      if (!hasSubject) {
        suggestions.push(requirement.name);
      }
    }

    return suggestions;
  }
}

export default EnhancedAPSMatching;
