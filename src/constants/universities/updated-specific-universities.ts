import { Faculty, Degree } from "@/types/university";

/**
 * UPDATED SPECIFIC UNIVERSITY DATA - CLEARED FOR MANUAL ENTRY
 *
 * All faculty and program data has been removed. Universities will be populated
 * manually with accurate faculty and program information.
 */

// Helper function to create degree IDs
function createDegreeId(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .replace(/\s+/g, "-")
    .substring(0, 50);
}

// Helper function to create faculty ID
function createFacultyId(name: string): string {
  return name
    .toLowerCase()
    .replace(/faculty\s+of\s+/gi, "")
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .replace(/\s+/g, "-");
}

// Empty faculty arrays for universities - to be populated manually
export const UL_FACULTIES: Faculty[] = [];
export const NWU_FACULTIES: Faculty[] = [];
export const WSU_FACULTIES: Faculty[] = [];
export const UNIZULU_FACULTIES: Faculty[] = [];
export const SPU_FACULTIES: Faculty[] = [];
export const UMP_FACULTIES: Faculty[] = [];
export const CPUT_FACULTIES: Faculty[] = [];
export const CUT_FACULTIES: Faculty[] = [];
export const DUT_FACULTIES: Faculty[] = [];
export const MUT_FACULTIES: Faculty[] = [];
export const TUT_FACULTIES: Faculty[] = [];
export const VUT_FACULTIES: Faculty[] = [];

// Function to get updated university faculties
export function getUpdatedUniversityFaculties(
  universityId: string,
): Faculty[] | null {
  switch (universityId) {
    case "ul":
      return UL_FACULTIES;
    case "nwu":
      return NWU_FACULTIES;
    case "wsu":
      return WSU_FACULTIES;
    case "unizulu":
      return UNIZULU_FACULTIES;
    case "spu":
      return SPU_FACULTIES;
    case "ump":
      return UMP_FACULTIES;
    case "cput":
      return CPUT_FACULTIES;
    case "cut":
      return CUT_FACULTIES;
    case "dut":
      return DUT_FACULTIES;
    case "mut":
      return MUT_FACULTIES;
    case "tut":
      return TUT_FACULTIES;
    case "vut":
      return VUT_FACULTIES;
    default:
      return null;
  }
}

// Export all faculty arrays (getUpdatedUniversityFaculties already exported above)
export {
  UL_FACULTIES,
  NWU_FACULTIES,
  WSU_FACULTIES,
  UNIZULU_FACULTIES,
  SPU_FACULTIES,
  UMP_FACULTIES,
  CPUT_FACULTIES,
  CUT_FACULTIES,
  DUT_FACULTIES,
  MUT_FACULTIES,
  TUT_FACULTIES,
  VUT_FACULTIES,
};

// List of universities that have been updated with specific data
export const UPDATED_UNIVERSITIES = [
  "ul", // University of Limpopo
  "nwu", // North-West University
  "wsu", // Walter Sisulu University
  "unizulu", // University of Zululand
  "spu", // Sol Plaatje University
  "ump", // University of Mpumalanga
  "cput", // Cape Peninsula University of Technology
  "cut", // Central University of Technology
  "dut", // Durban University of Technology
  "mut", // Mangosuthu University of Technology
  "tut", // Tshwane University of Technology
  "vut", // Vaal University of Technology
];
