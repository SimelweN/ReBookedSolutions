/**
 * Lazy-loading wrapper for comprehensive course database
 * This prevents the large dataset from being loaded immediately during Workers builds
 */

// Re-export types and constants that are safe
export type { ComprehensiveCourse } from "./comprehensive-course-database";

// Cache for loaded data
let cachedData: any = null;

// Lazy loader function
const loadCourseDatabase = async () => {
  if (cachedData) return cachedData;

  // Dynamic import to avoid immediate loading
  const module = await import("./comprehensive-course-database");
  cachedData = module;
  return module;
};

// Lazy-loading exports
export const getComprehensiveCourses = async () => {
  const module = await loadCourseDatabase();
  return module.COMPREHENSIVE_COURSES;
};

export const getUniversityAbbreviations = async () => {
  const module = await loadCourseDatabase();
  return module.UNIVERSITY_ABBREVIATIONS;
};

export const getAllUniversityIds = async () => {
  const module = await loadCourseDatabase();
  return module.ALL_UNIVERSITY_IDS;
};

export const getUniversitiesForCourse = async (courseName: string) => {
  const module = await loadCourseDatabase();
  return module.getUniversitiesForCourse(courseName);
};

export const getAPSRequirement = async (course: any, universityId: string) => {
  const module = await loadCourseDatabase();
  return module.getAPSRequirement(course, universityId);
};

export const courseToDegree = async (course: any, universityId: string) => {
  const module = await loadCourseDatabase();
  return module.courseToDegree(course, universityId);
};

export const getCoursesForUniversity = async (universityId: string) => {
  const module = await loadCourseDatabase();
  return module.getCoursesForUniversity(universityId);
};

export const getFacultiesForUniversity = async (universityId: string) => {
  const module = await loadCourseDatabase();
  return module.getFacultiesForUniversity(universityId);
};

// Synchronous fallback for environments that need immediate access
export const getComprehensiveCoursesSync = () => {
  if (cachedData) {
    return cachedData.COMPREHENSIVE_COURSES;
  }

  // In Workers environment, return empty array to prevent build failures
  if (typeof window === "undefined") {
    console.warn("Comprehensive courses not loaded in this environment");
    return [];
  }

  // In browser, this shouldn't be called, but provide fallback
  throw new Error("Use getComprehensiveCourses() async function instead");
};
