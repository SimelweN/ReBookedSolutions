import { University, Faculty, Degree } from "@/types/university";

/**
 * WORKERS-COMPATIBLE STUB FOR COMPREHENSIVE COURSE DATABASE
 *
 * This file provides empty stubs for all exports to prevent Workers build failures
 * The actual data loading is handled dynamically in browser environments
 */

// Types
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

// Empty exports for Workers compatibility
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
  apsRequired: getAPSRequirement(course, universityId),
});

export const getCoursesForUniversity = (
  universityId: string,
): ComprehensiveCourse[] => [];

export const getFacultiesForUniversity = (
  universityId: string,
): Faculty[] => [];
