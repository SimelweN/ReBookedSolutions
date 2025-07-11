import { APSSubject } from "@/types/university";

/**
 * MINIMAL STUB FOR ENHANCED VALIDATION
 * Temporary replacement to isolate Workers build issues
 */

export interface ValidationError {
  type: "error" | "warning" | "info";
  code: string;
  message: string;
  context?: string;
  suggestion?: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationError[];
}

// Stub implementations
export const validateUniversityPrograms = (): ValidationResult => ({
  isValid: true,
  errors: [],
  warnings: [],
});

export const validateCourseAssignments = (): ValidationResult => ({
  isValid: true,
  errors: [],
  warnings: [],
});

export const validateAPSCalculations = (
  subjects: APSSubject[],
): ValidationResult => ({
  isValid: true,
  errors: [],
  warnings: [],
});

export const validateUniversityData = (): ValidationResult => ({
  isValid: true,
  errors: [],
  warnings: [],
});

export const runFullValidation = (): ValidationResult => ({
  isValid: true,
  errors: [],
  warnings: [],
});
