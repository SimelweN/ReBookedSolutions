import { ALL_SOUTH_AFRICAN_UNIVERSITIES } from "@/constants/universities";
import {
  FALLBACK_PROGRAMS,
  UniversityProgram,
} from "@/constants/universityPrograms";

export interface UniversityProgramExtended extends UniversityProgram {
  id: string;
  name: string;
  apsRequired: number;
  universityId: string;
}

// Extract all programs from real university data
export const extractUniversityPrograms = (): UniversityProgramExtended[] => {
  const programs: UniversityProgramExtended[] = [];

  try {
    if (
      !ALL_SOUTH_AFRICAN_UNIVERSITIES ||
      !Array.isArray(ALL_SOUTH_AFRICAN_UNIVERSITIES)
    ) {
      console.warn("No university data available, using fallback");
      return convertFallbackPrograms();
    }

    ALL_SOUTH_AFRICAN_UNIVERSITIES.forEach((university) => {
      if (university.faculties && Array.isArray(university.faculties)) {
        university.faculties.forEach((faculty) => {
          if (faculty.degrees && Array.isArray(faculty.degrees)) {
            faculty.degrees.forEach((degree) => {
              programs.push({
                id: degree.id || `${university.id}-${degree.name}`,
                name: degree.name,
                apsRequired: degree.apsRequirement || 0,
                universityId: university.id || university.name,
                faculty: faculty.name,
                university: university.fullName || university.name,
                abbreviation: university.abbreviation || university.name,
                location: `${university.location || "Unknown"}, ${university.province || "Unknown"}`,
                program: degree.name,
                aps: degree.apsRequirement || 0,
                duration: degree.duration || "Not specified",
                description:
                  degree.description ||
                  `Study ${degree.name} at ${university.name}`,
              });
            });
          }
        });
      }
    });

    if (import.meta.env.DEV && programs.length > 0) {
      console.log(
        `✅ Extracted ${programs.length} programs from ${ALL_SOUTH_AFRICAN_UNIVERSITIES.length} universities`,
      );
    }

    // If no programs found, use fallback
    if (programs.length === 0) {
      console.warn(
        "No programs extracted from university data, using fallback",
      );
      return convertFallbackPrograms();
    }
  } catch (error) {
    if (import.meta.env.DEV) {
      console.error("Error in extractUniversityPrograms:", error);
    }
    return convertFallbackPrograms();
  }

  return programs;
};

// Convert fallback programs to extended format
function convertFallbackPrograms(): UniversityProgramExtended[] {
  return FALLBACK_PROGRAMS.map((program, index) => ({
    ...program,
    id: `fallback-${index}`,
    name: program.program,
    apsRequired: program.aps,
    universityId: program.abbreviation.toLowerCase(),
  }));
}

// Calculate APS total from subjects
export const calculateAPSTotal = (subjects: Record<string, number>): number => {
  const values = Object.values(subjects).filter((value) => value > 0);
  return values.length >= 6 ? values.reduce((sum, value) => sum + value, 0) : 0;
};

// Analyze degree eligibility
export const analyzeDegreeEligibility = (
  programs: UniversityProgramExtended[],
  totalAPS: number,
) => {
  return programs.map((program) => ({
    ...program,
    eligible: totalAPS >= program.apsRequired,
    apsGap: Math.max(0, program.apsRequired - totalAPS),
    overqualified: totalAPS > program.apsRequired + 5,
  }));
};

// Group programs by university
export const groupProgramsByUniversity = (
  programs: UniversityProgramExtended[],
) => {
  const grouped = programs.reduce(
    (acc, program) => {
      const key = program.abbreviation;
      if (!acc[key]) {
        acc[key] = {
          university: program.university,
          abbreviation: program.abbreviation,
          location: program.location,
          programs: [],
          eligiblePrograms: 0,
        };
      }
      acc[key].programs.push(program);
      return acc;
    },
    {} as Record<string, any>,
  );

  return Object.values(grouped);
};

// Calculate university statistics
export const calculateUniversityStats = (
  universityMatches: any[],
  totalAPS: number,
) => {
  return universityMatches
    .map((uni) => {
      const eligiblePrograms = uni.programs.filter(
        (p: any) => totalAPS >= p.aps,
      ).length;
      const avgAPS = Math.round(
        uni.programs.reduce(
          (sum: number, p: { aps: number }) => sum + p.aps,
          0,
        ) / uni.programs.length,
      );

      let competitiveness: "High" | "Moderate" | "Accessible" = "Accessible";
      if (avgAPS >= 30) competitiveness = "High";
      else if (avgAPS >= 24) competitiveness = "Moderate";

      return {
        ...uni,
        eligiblePrograms,
        averageAPS: avgAPS,
        competitiveness,
      };
    })
    .sort((a, b) => b.eligiblePrograms - a.eligiblePrograms);
};

// Calculate overall statistics
export const calculateOverallStats = (
  degreeAnalysis: any[],
  universityMatches: any[],
  totalAPS: number,
) => {
  const totalDegrees = degreeAnalysis.length;
  const eligibleCount =
    totalAPS > 0 ? degreeAnalysis.filter((d) => d.eligible).length : 0;
  const eligibilityRate =
    totalDegrees > 0 && totalAPS > 0
      ? Math.round((eligibleCount / totalDegrees) * 100)
      : 0;
  const topUniversities = universityMatches.filter(
    (u) => u.eligiblePrograms > 0,
  ).length;
  const averageRequirement =
    totalDegrees > 0
      ? Math.round(
          degreeAnalysis.reduce((sum, d) => sum + d.apsRequirement, 0) /
            totalDegrees,
        )
      : 0;

  return {
    totalDegrees,
    eligibleCount,
    eligibilityRate: isNaN(eligibilityRate) ? 0 : eligibilityRate,
    topUniversities,
    averageRequirement: isNaN(averageRequirement) ? 0 : averageRequirement,
    performancePercentile:
      isNaN(totalAPS) || totalAPS === 0
        ? 0
        : Math.min(100, Math.round((totalAPS / 42) * 100)),
  };
};

// Filter programs by various criteria
export const filterPrograms = (
  programs: UniversityProgramExtended[],
  filters: {
    searchTerm?: string;
    minAPS?: number;
    maxAPS?: number;
    faculty?: string;
    university?: string;
  },
) => {
  return programs.filter((program) => {
    const matchesSearch =
      !filters.searchTerm ||
      program.program
        .toLowerCase()
        .includes(filters.searchTerm.toLowerCase()) ||
      program.university
        .toLowerCase()
        .includes(filters.searchTerm.toLowerCase()) ||
      program.faculty.toLowerCase().includes(filters.searchTerm.toLowerCase());

    const matchesMinAPS = !filters.minAPS || program.aps >= filters.minAPS;
    const matchesMaxAPS = !filters.maxAPS || program.aps <= filters.maxAPS;
    const matchesFaculty =
      !filters.faculty || program.faculty === filters.faculty;
    const matchesUniversity =
      !filters.university || program.university === filters.university;

    return (
      matchesSearch &&
      matchesMinAPS &&
      matchesMaxAPS &&
      matchesFaculty &&
      matchesUniversity
    );
  });
};
