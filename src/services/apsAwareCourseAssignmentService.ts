import { University, Degree, Faculty, APSSubject } from "@/types/university";

/**
 * MINIMAL STUB FOR APS AWARE COURSE ASSIGNMENT SERVICE
 * Temporary replacement to isolate Workers build issues
 */

export interface APSFilterOptions {
  includeUniversities?: string[];
  excludeUniversities?: string[];
  minAPS?: number;
  maxAPS?: number;
}

export interface AssignmentResult {
  degrees: Degree[];
  universityMatches: Record<string, Degree[]>;
  totalMatches: number;
}

// Stub implementations
export const assignCoursesToUniversities =
  async (): Promise<AssignmentResult> => ({
    degrees: [],
    universityMatches: {},
    totalMatches: 0,
  });

export const getFilteredPrograms = async (
  subjects: APSSubject[],
  options: APSFilterOptions = {},
): Promise<AssignmentResult> => ({
  degrees: [],
  universityMatches: {},
  totalMatches: 0,
});

export const validateCourseAssignments = (): boolean => true;

export const getSystemStatistics = () => ({
  totalCourses: 0,
  totalUniversities: 0,
  assignmentRules: {},
});
