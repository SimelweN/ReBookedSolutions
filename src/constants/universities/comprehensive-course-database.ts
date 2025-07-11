/**
 * COMPREHENSIVE COURSE DATABASE - CONDITIONAL LOADER
 *
 * This file conditionally loads either the full course database or a stub
 * depending on the environment to prevent Workers build failures
 */

// Check if we're in a browser environment
const isBrowser = typeof window !== "undefined";

if (isBrowser) {
  // In browser: dynamically import and re-export the full database
  const fullDatabase = await import("./comprehensive-course-database-full");

  export const UNIVERSITY_ABBREVIATIONS = fullDatabase.UNIVERSITY_ABBREVIATIONS;
  export const ALL_UNIVERSITY_IDS = fullDatabase.ALL_UNIVERSITY_IDS;
  export const COMPREHENSIVE_COURSES = fullDatabase.COMPREHENSIVE_COURSES;
  export const parseExcludeRule = fullDatabase.parseExcludeRule;
  export const parseIncludeRule = fullDatabase.parseIncludeRule;
  export const getUniversitiesForCourse = fullDatabase.getUniversitiesForCourse;
  export const getAPSRequirement = fullDatabase.getAPSRequirement;
  export const courseToDegree = fullDatabase.courseToDegree;
  export const getCoursesForUniversity = fullDatabase.getCoursesForUniversity;
  export const getFacultiesForUniversity =
    fullDatabase.getFacultiesForUniversity;

  export type {
    ComprehensiveCourse,
    AssignmentRule,
  } from "./comprehensive-course-database-full";
} else {
  // In non-browser environments: use the stub
  export * from "./comprehensive-course-database-stub";
}
