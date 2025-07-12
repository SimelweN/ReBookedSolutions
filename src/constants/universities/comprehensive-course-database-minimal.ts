import { University, Faculty, Degree } from "@/types/university";

/**
 * MINIMAL STUB FOR COMPREHENSIVE COURSE DATABASE
 * Temporary replacement to isolate Workers build issues
 */

export type AssignmentRule = {
  type: "all" | "exclude" | "include_only";
  universities?: string[];
};

export interface ComprehensiveCourse {
  name: string;
  faculty: string;
  description: string;
  duration: string;
  defaultAps: number;
  assignmentRule: AssignmentRule;
  universitySpecificAps?: Record<string, number>;
  subjects: Array<{
    name: string;
    level: number;
    isRequired: boolean;
  }>;
  careerProspects: string[];
}

// Minimal exports to prevent build errors
export const UNIVERSITY_ABBREVIATIONS = {};
export const ALL_UNIVERSITY_IDS: string[] = [];
export const COMPREHENSIVE_COURSES: ComprehensiveCourse[] = [];

// Stub functions
export const parseExcludeRule = (universities: string): AssignmentRule => ({
  type: "exclude",
  universities: universities.split(", ").map((u) => u.trim()),
});

export const parseIncludeRule = (universities: string): AssignmentRule => ({
  type: "include_only",
  universities: universities.split(", ").map((u) => u.trim()),
});

export const getUniversitiesForCourse = (courseName: string): string[] => [];
export const getAPSRequirement = (
  course: ComprehensiveCourse,
  universityId: string,
): number => 30;
export const courseToDegree = (
  course: ComprehensiveCourse,
  universityId: string,
): Degree => ({
  id: course.name.toLowerCase().replace(/\s+/g, "-"),
  name: course.name,
  description: course.description,
  duration: course.duration,
  requirements: course.subjects,
  careerProspects: course.careerProspects,
  apsRequired: 30,
});
export const getCoursesForUniversity = (
  universityId: string,
): ComprehensiveCourse[] => [];
export const getFacultiesForUniversity = (
  universityId: string,
): Faculty[] => [];
