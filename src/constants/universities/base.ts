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
export function getFacultiesByUniversityId(
  universityId: UniversityId,
): Faculty[] | null {
  // Import functions will be defined in individual university modules
  switch (universityId) {
    case "ul":
      return require("./ul").UL_FACULTIES;
    case "wsu":
      return require("./wsu").WSU_FACULTIES;
    case "nwu":
      return require("./nwu").NWU_FACULTIES;
    case "unizulu":
      return require("./unizulu").UNIZULU_FACULTIES;
    case "spu":
      return require("./spu").SPU_FACULTIES;
    case "ump":
      return require("./ump").UMP_FACULTIES;
    case "cput":
      return require("./cput").CPUT_FACULTIES;
    case "cut":
      return require("./cut").CUT_FACULTIES;
    case "dut":
      return require("./dut").DUT_FACULTIES;
    case "mut":
      return require("./mut").MUT_FACULTIES;
    case "tut":
      return require("./tut").TUT_FACULTIES;
    case "vut":
      return require("./vut").VUT_FACULTIES;
    default:
      return null;
  }
}
