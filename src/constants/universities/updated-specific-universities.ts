import { Faculty } from "@/types/university";
import { getFacultiesByUniversityId, UniversityId } from "./base";

// Import all faculty data from modular files
import { UL_FACULTIES } from "./ul";
import { WSU_FACULTIES } from "./wsu";
import { NWU_FACULTIES } from "./nwu";
import { UNIZULU_FACULTIES } from "./unizulu";
import { SPU_FACULTIES } from "./spu";
import { UMP_FACULTIES } from "./ump";
import { CPUT_FACULTIES } from "./cput";
import { CUT_FACULTIES } from "./cut";
import { DUT_FACULTIES } from "./dut";
import { MUT_FACULTIES } from "./mut";
import { TUT_FACULTIES } from "./tut";
import { VUT_FACULTIES } from "./vut";
import { UJ_FACULTIES } from "./uj";
import { UP_FACULTIES } from "./up";
import { WITS_FACULTIES } from "./wits";
import { SU_FACULTIES } from "./su";
import { UKZN_FACULTIES } from "./ukzn";
import { UWC_FACULTIES } from "./uwc";
import { UNIVEN_FACULTIES } from "./univen";
import { UFS_FACULTIES } from "./ufs";

/**
 * MODULAR UNIVERSITY DATA SYSTEM
 *
 * This file provides a clean interface to university faculty data.
 * Each university's data is now maintained in its own module for better organization.
 */

// Function to get faculties by university ID
export function getFacultiesByUniversityIdLegacy(
  universityId: string,
): Faculty[] | null {
  switch (universityId.toLowerCase()) {
    case "ul":
      return UL_FACULTIES;
    case "wsu":
      return WSU_FACULTIES;
    case "nwu":
      return NWU_FACULTIES;
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
    case "uj":
      return UJ_FACULTIES;
    case "up":
      return UP_FACULTIES;
    case "wits":
      return WITS_FACULTIES;
    case "su":
      return SU_FACULTIES;
    case "ukzn":
      return UKZN_FACULTIES;
    case "uwc":
      return UWC_FACULTIES;
    case "univen":
      return UNIVEN_FACULTIES;
    case "ufs":
      return UFS_FACULTIES;
    default:
      return null;
  }
}

// Export all faculty arrays for backward compatibility
export {
  UL_FACULTIES,
  WSU_FACULTIES,
  NWU_FACULTIES,
  UNIZULU_FACULTIES,
  SPU_FACULTIES,
  UMP_FACULTIES,
  CPUT_FACULTIES,
  CUT_FACULTIES,
  DUT_FACULTIES,
  MUT_FACULTIES,
  TUT_FACULTIES,
  VUT_FACULTIES,
  UJ_FACULTIES,
  UP_FACULTIES,
  WITS_FACULTIES,
  SU_FACULTIES,
  UKZN_FACULTIES,
  UWC_FACULTIES,
  UNIVEN_FACULTIES,
  UFS_FACULTIES,
};

// Export the new modular function
export { getFacultiesByUniversityId };

// Legacy function name for backward compatibility
export { getFacultiesByUniversityIdLegacy as getUpdatedUniversityFaculties };

// List of universities that have been updated with specific data
export const UPDATED_UNIVERSITIES: UniversityId[] = [
  "ul",
  "wsu",
  "nwu",
  "unizulu",
  "spu",
  "ump",
  "cput",
  "cut",
  "dut",
  "mut",
  "tut",
  "vut",
  "uj",
  "up",
  "wits",
  "su",
  "ukzn",
  "uwc",
  "univen",
  "ufs",
];

// Export university metadata
export const UNIVERSITY_METADATA = {
  ul: {
    name: "University of Limpopo",
    type: "Traditional University",
    province: "Limpopo",
  },
  wsu: {
    name: "Walter Sisulu University",
    type: "Comprehensive University",
    province: "Eastern Cape",
  },
  nwu: {
    name: "North-West University",
    type: "Traditional University",
    province: "North West",
  },
  unizulu: {
    name: "University of Zululand",
    type: "Traditional University",
    province: "KwaZulu-Natal",
  },
  spu: {
    name: "Sol Plaatje University",
    type: "Traditional University",
    province: "Northern Cape",
  },
  ump: {
    name: "University of Mpumalanga",
    type: "Traditional University",
    province: "Mpumalanga",
  },
  cput: {
    name: "Cape Peninsula University of Technology",
    type: "University of Technology",
    province: "Western Cape",
  },
  cut: {
    name: "Central University of Technology",
    type: "University of Technology",
    province: "Free State",
  },
  dut: {
    name: "Durban University of Technology",
    type: "University of Technology",
    province: "KwaZulu-Natal",
  },
  mut: {
    name: "Mangosuthu University of Technology",
    type: "University of Technology",
    province: "KwaZulu-Natal",
  },
  tut: {
    name: "Tshwane University of Technology",
    type: "University of Technology",
    province: "Gauteng",
  },
  vut: {
    name: "Vaal University of Technology",
    type: "University of Technology",
    province: "Gauteng",
  },
  uj: {
    name: "University of Johannesburg",
    type: "Comprehensive University",
    province: "Gauteng",
  },
  up: {
    name: "University of Pretoria",
    type: "Traditional University",
    province: "Gauteng",
  },
  wits: {
    name: "University of the Witwatersrand",
    type: "Traditional University",
    province: "Gauteng",
  },
  su: {
    name: "Stellenbosch University",
    type: "Traditional University",
    province: "Western Cape",
  },
  ukzn: {
    name: "University of KwaZulu-Natal",
    type: "Traditional University",
    province: "KwaZulu-Natal",
  },
  uwc: {
    name: "University of Western Cape",
    type: "Traditional University",
    province: "Western Cape",
  },
  univen: {
    name: "University of VENDA",
    type: "Comprehensive University",
    province: "Limpopo",
  },
  ufs: {
    name: "University of Free State",
    type: "Traditional University",
    province: "Free State",
  },
} as const;
