import { Faculty } from "@/types/university";

// Helper function to create degree IDs
export function createDegreeId(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .replace(/\s+/g, "-")
    .substring(0, 50);
}

// Helper function to create faculty ID
export function createFacultyId(name: string): string {
  return name
    .toLowerCase()
    .replace(/faculty\s+of\s+/gi, "")
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .replace(/\s+/g, "-");
}

// University identification types
export type UniversityId =
  | "ul"
  | "wsu"
  | "nwu"
  | "unizulu"
  | "spu"
  | "ump"
  | "cput"
  | "cut"
  | "dut"
  | "mut"
  | "tut"
  | "vut";

// Function to get faculties by university ID
// This function will be implemented in the main file to avoid circular imports
export function getFacultiesByUniversityId(
  universityId: UniversityId,
): Faculty[] | null {
  // This is a placeholder - actual implementation is in updated-specific-universities.ts
  // to avoid circular import issues
  throw new Error(
    "Use getFacultiesByUniversityIdLegacy from updated-specific-universities.ts instead",
  );
}
