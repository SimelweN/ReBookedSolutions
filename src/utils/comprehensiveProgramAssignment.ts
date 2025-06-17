import { University } from "@/types/university";
import {
  assignAllCoursesToUniversities as assignCoursesToUniversities,
  getCoursesForUniversity,
  getCourseAllocationStats,
  COMPREHENSIVE_COURSES,
  UNIVERSITY_MAPPINGS,
} from "@/constants/universities/complete-course-allocation";

/**
 * Main assignment function that applies comprehensive course allocation
 * to all universities based on the complete course list provided by the user.
 *
 * This function ensures ALL courses are properly assigned to universities
 * according to their allocation rules (all, exclude, includeOnly).
 */
export function assignComprehensivePrograms(
  universities: University[],
): University[] {
  return assignCoursesToUniversities(universities);
}

// Re-export utility functions for external use
export {
  getCoursesForUniversity,
  getCourseAllocationStats,
  COMPREHENSIVE_COURSES,
  UNIVERSITY_MAPPINGS,
};

/**
 * Legacy function name support - kept for compatibility
 */
export const assignAllCoursesToUniversities = assignComprehensivePrograms;
