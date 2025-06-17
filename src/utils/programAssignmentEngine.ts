import { University, Faculty, Degree } from "@/types/university";
import {
  ProgramAssignmentRule,
  ALL_PROGRAM_ASSIGNMENT_RULES,
  UNIVERSITY_ABBREVIATIONS,
} from "@/constants/universities/program-assignment-rules";

/**
 * PROGRAM ASSIGNMENT ENGINE
 *
 * This utility applies the program assignment rules to generate
 * comprehensive university programs based on "all" and "exclude" rules.
 */

// Reverse mapping from university IDs to abbreviations
const UNIVERSITY_ID_TO_ABBREVIATION: { [key: string]: string } = {
  uct: "UCT",
  wits: "WITS",
  stellenbosch: "SU",
  pretoria: "UP",
  ukzn: "UKZN",
  johannesburg: "UJ",
  northwest: "NWU",
  freestate: "UFS",
  rhodes: "RU",
  unisa: "UNISA",
  fortHare: "UFH",
  venda: "UNIVEN",
  zululand: "UNIZULU",
  limpopo: "UL",
  westernCape: "UWC",
  mpumalanga: "UMP",
  nelsonMandela: "NMMU",
  capeTownTech: "CPUT",
  durbanTech: "DUT",
  tshwaneTech: "TUT",
  vaalTech: "VUT",
  centralTech: "CUT",
  mangosuthuTech: "MUT",
};

// List of all South African university IDs
const ALL_SA_UNIVERSITY_IDS = Object.keys(UNIVERSITY_ID_TO_ABBREVIATION);

/**
 * Check if a program should be assigned to a specific university
 */
export function shouldAssignProgram(
  program: ProgramAssignmentRule,
  universityId: string,
): boolean {
  try {
    // If program is marked "all", assign to every university
    if (program.assignmentRule === "all") {
      return true;
    }

    // If program has exclusion list, check if university is excluded
    if (
      typeof program.assignmentRule === "object" &&
      program.assignmentRule.exclude
    ) {
      const isExcluded = program.assignmentRule.exclude.includes(universityId);
      return !isExcluded; // Assign if NOT excluded
    }

    // Default: don't assign if rule is unclear
    return false;
  } catch (error) {
    console.warn(
      `Error checking program assignment for ${program.id} at ${universityId}:`,
      error,
    );
    return false;
  }
}

/**
 * Get the APS requirement for a program at a specific university
 */
export function getUniversitySpecificAPS(
  program: ProgramAssignmentRule,
  universityId: string,
): number {
  try {
    // Check if there are university-specific APS requirements
    if (
      program.universitySpecificAPS &&
      program.universitySpecificAPS[universityId]
    ) {
      return program.universitySpecificAPS[universityId];
    }

    // Return default APS requirement
    return program.apsRequirement;
  } catch (error) {
    console.warn(
      `Error getting APS for ${program.id} at ${universityId}:`,
      error,
    );
    return program.apsRequirement;
  }
}

/**
 * Convert a ProgramAssignmentRule to a Degree object
 */
export function convertProgramToDegree(
  program: ProgramAssignmentRule,
  universityId: string,
): Degree {
  try {
    const apsRequirement = getUniversitySpecificAPS(program, universityId);

    return {
      id: program.id,
      name: program.name,
      code: program.id.toUpperCase().replace(/-/g, ""),
      faculty: program.faculty,
      duration: program.duration,
      apsRequirement,
      description: program.description,
      subjects: program.subjects || [],
      careerProspects: program.careerProspects || [],
    };
  } catch (error) {
    console.warn(`Error converting program ${program.id} to degree:`, error);

    // Return a minimal valid degree object
    return {
      id: program.id || "unknown-program",
      name: program.name || "Unknown Program",
      code: (program.id || "unknown").toUpperCase(),
      faculty: program.faculty || "General",
      duration: program.duration || "3 years",
      apsRequirement: program.apsRequirement || 24,
      description: program.description || "Program description unavailable.",
      subjects: [],
      careerProspects: ["General career opportunities"],
    };
  }
}

/**
 * Generate programs for a specific university based on assignment rules
 */
export function generateUniversityPrograms(universityId: string): Degree[] {
  try {
    const assignedPrograms: Degree[] = [];

    for (const program of ALL_PROGRAM_ASSIGNMENT_RULES) {
      if (shouldAssignProgram(program, universityId)) {
        const degree = convertProgramToDegree(program, universityId);
        assignedPrograms.push(degree);
      }
    }

    return assignedPrograms;
  } catch (error) {
    console.error(
      `Error generating programs for university ${universityId}:`,
      error,
    );
    return [];
  }
}

/**
 * Group programs by faculty for a university
 */
export function groupProgramsByFaculty(programs: Degree[]): Faculty[] {
  try {
    const facultyMap = new Map<string, Degree[]>();

    // Group programs by faculty
    for (const program of programs) {
      const facultyName = program.faculty || "General";

      if (!facultyMap.has(facultyName)) {
        facultyMap.set(facultyName, []);
      }

      facultyMap.get(facultyName)!.push(program);
    }

    // Convert to Faculty objects
    const faculties: Faculty[] = [];

    for (const [facultyName, degrees] of facultyMap.entries()) {
      const faculty: Faculty = {
        id: facultyName
          .toLowerCase()
          .replace(/\s+/g, "-")
          .replace(/[^a-z0-9-]/g, ""),
        name: facultyName,
        description: getFacultyDescription(facultyName),
        degrees: degrees.sort((a, b) => a.name.localeCompare(b.name)), // Sort alphabetically
      };

      faculties.push(faculty);
    }

    // Sort faculties alphabetically
    return faculties.sort((a, b) => a.name.localeCompare(b.name));
  } catch (error) {
    console.error("Error grouping programs by faculty:", error);
    return [];
  }
}

/**
 * Get description for a faculty
 */
function getFacultyDescription(facultyName: string): string {
  const descriptions: { [key: string]: string } = {
    Engineering:
      "Faculty offering engineering programs including civil, mechanical, electrical, and specialized engineering disciplines.",
    "Health Sciences":
      "Faculty providing medical, nursing, pharmacy, and health-related professional programs.",
    Humanities:
      "Faculty offering arts, languages, social sciences, and cultural studies programs.",
    Commerce:
      "Faculty providing business, economics, finance, and management programs.",
    Law: "Faculty offering legal studies, criminal justice, and specialized law programs.",
    Science:
      "Faculty providing natural sciences, mathematics, computer science, and research-oriented programs.",
    Education:
      "Faculty offering teacher training and educational leadership programs across all phases.",
    Agriculture:
      "Faculty providing agricultural sciences, food technology, and rural development programs.",
    "Information Technology":
      "Faculty offering computer science, software engineering, and technology programs.",
    "Built Environment":
      "Faculty providing architecture, planning, construction, and property studies programs.",
    "Engineering Technology":
      "Faculty offering practical and vocational engineering programs.",
    "Business Technology":
      "Faculty providing practical business and administrative programs.",
    "Hospitality Technology":
      "Faculty offering hospitality and tourism management programs.",
    "Tourism Technology":
      "Faculty providing tourism and travel industry programs.",
    "Public Administration Technology":
      "Faculty offering public sector and municipal management programs.",
    "Design Technology":
      "Faculty providing design and creative technology programs.",
    "Health Technology":
      "Faculty offering health-related technical and vocational programs.",
    "Food Technology":
      "Faculty providing food processing and quality control programs.",
  };

  return (
    descriptions[facultyName] ||
    `Faculty offering ${facultyName.toLowerCase()} programs and courses.`
  );
}

/**
 * Apply assignment rules to generate complete university data
 */
export function applyProgramAssignmentRules(
  universities: University[],
): University[] {
  try {
    const updatedUniversities: University[] = [];

    for (const university of universities) {
      try {
        // Generate programs for this university
        const programs = generateUniversityPrograms(university.id);

        // Group programs by faculty
        const faculties = groupProgramsByFaculty(programs);

        // Create updated university with assigned programs
        const updatedUniversity: University = {
          ...university,
          faculties: faculties,
        };

        updatedUniversities.push(updatedUniversity);
      } catch (universityError) {
        console.warn(
          `Error processing university ${university.id}:`,
          universityError,
        );

        // Keep original university data if there's an error
        updatedUniversities.push(university);
      }
    }

    return updatedUniversities;
  } catch (error) {
    console.error("Error applying program assignment rules:", error);
    return universities; // Return original data if there's a general error
  }
}

/**
 * Get statistics about program assignment
 */
export function getProgramAssignmentStatistics(universityId?: string): {
  totalPrograms: number;
  programsByFaculty: { [faculty: string]: number };
  averageAPS: number;
  apsRange: { min: number; max: number };
} {
  try {
    let programs: Degree[];

    if (universityId) {
      programs = generateUniversityPrograms(universityId);
    } else {
      // Get all programs across all universities (unique programs)
      const allPrograms = new Map<string, Degree>();

      for (const universityId of ALL_SA_UNIVERSITY_IDS) {
        const universityPrograms = generateUniversityPrograms(universityId);
        for (const program of universityPrograms) {
          allPrograms.set(program.id, program);
        }
      }

      programs = Array.from(allPrograms.values());
    }

    // Calculate statistics
    const programsByFaculty: { [faculty: string]: number } = {};
    let totalAPS = 0;
    let minAPS = Infinity;
    let maxAPS = -Infinity;

    for (const program of programs) {
      // Faculty count
      const faculty = program.faculty || "General";
      programsByFaculty[faculty] = (programsByFaculty[faculty] || 0) + 1;

      // APS statistics
      totalAPS += program.apsRequirement;
      minAPS = Math.min(minAPS, program.apsRequirement);
      maxAPS = Math.max(maxAPS, program.apsRequirement);
    }

    return {
      totalPrograms: programs.length,
      programsByFaculty,
      averageAPS:
        programs.length > 0 ? Math.round(totalAPS / programs.length) : 0,
      apsRange: {
        min: minAPS === Infinity ? 0 : minAPS,
        max: maxAPS === -Infinity ? 0 : maxAPS,
      },
    };
  } catch (error) {
    console.error("Error calculating program assignment statistics:", error);
    return {
      totalPrograms: 0,
      programsByFaculty: {},
      averageAPS: 0,
      apsRange: { min: 0, max: 0 },
    };
  }
}

/**
 * Validate program assignment rules
 */
export function validateProgramAssignmentRules(): {
  isValid: boolean;
  errors: string[];
  warnings: string[];
} {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    // Check for duplicate program IDs
    const programIds = new Set<string>();
    for (const program of ALL_PROGRAM_ASSIGNMENT_RULES) {
      if (programIds.has(program.id)) {
        errors.push(`Duplicate program ID: ${program.id}`);
      }
      programIds.add(program.id);
    }

    // Check for invalid university IDs in exclusion lists
    for (const program of ALL_PROGRAM_ASSIGNMENT_RULES) {
      if (
        typeof program.assignmentRule === "object" &&
        program.assignmentRule.exclude
      ) {
        for (const excludedUniversityId of program.assignmentRule.exclude) {
          if (!ALL_SA_UNIVERSITY_IDS.includes(excludedUniversityId)) {
            warnings.push(
              `Program ${program.id} excludes unknown university: ${excludedUniversityId}`,
            );
          }
        }
      }
    }

    // Check for programs with no assignment to any university
    for (const program of ALL_PROGRAM_ASSIGNMENT_RULES) {
      const assignedToCount = ALL_SA_UNIVERSITY_IDS.filter((universityId) =>
        shouldAssignProgram(program, universityId),
      ).length;

      if (assignedToCount === 0) {
        errors.push(`Program ${program.id} is not assigned to any university`);
      }
    }

    // Check for universities with no programs
    for (const universityId of ALL_SA_UNIVERSITY_IDS) {
      const programCount = generateUniversityPrograms(universityId).length;
      if (programCount === 0) {
        warnings.push(`University ${universityId} has no assigned programs`);
      }
    }
  } catch (error) {
    errors.push(`Validation error: ${error}`);
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings,
  };
}

// Export validation results for development
if (import.meta.env.DEV) {
  const validation = validateProgramAssignmentRules();

  if (!validation.isValid) {
    console.error("Program Assignment Validation Errors:", validation.errors);
  }

  if (validation.warnings.length > 0) {
    console.warn(
      "Program Assignment Validation Warnings:",
      validation.warnings,
    );
  }

  // Log statistics
  const stats = getProgramAssignmentStatistics();
  console.log("Program Assignment Statistics:", stats);
}
