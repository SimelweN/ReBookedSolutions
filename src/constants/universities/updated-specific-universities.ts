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
import { UCT_FACULTIES } from "./uct";
import { RHODES_FACULTIES } from "./rhodes";
import {
  UFH_FACULTIES,
  UNISA_FACULTIES,
  NMU_FACULTIES,
  SMU_FACULTIES,
} from "./missing-universities-fix";

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
    case "stellenbosch":
      return SU_FACULTIES;
    case "ukzn":
      return UKZN_FACULTIES;
    case "uwc":
      return UWC_FACULTIES;
    case "univen":
      return UNIVEN_FACULTIES;
    case "ufs":
      return UFS_FACULTIES;
    // UCT with real faculty data
    case "uct":
      return UCT_FACULTIES;
    case "ru":
    case "rhodes":
      return RHODES_FACULTIES;
    case "ufh":
      return UFH_FACULTIES;
    case "unisa":
      return UNISA_FACULTIES;
    case "nmu":
      return NMU_FACULTIES;
    case "smu":
      return SMU_FACULTIES;
    default:
      return null;
  }
}

// Helper function to create generic faculties for universities without specific data
function getGenericUniversityFaculties(
  universityName: string,
  universityId: string,
): Faculty[] {
  return [
    {
      id: `${universityId}-humanities`,
      name: "Faculty of Humanities",
      description: "Liberal arts, languages, and social sciences programs",
      degrees: [
        {
          id: `${universityId}-ba`,
          name: "Bachelor of Arts",
          faculty: "Faculty of Humanities",
          duration: "3 years",
          apsRequirement: 26,
          description:
            "Comprehensive liberal arts education with various specialization options",
          subjects: [
            { name: "English", level: 4, isRequired: true },
            {
              name: "Mathematics or Mathematical Literacy",
              level: 3,
              isRequired: true,
            },
          ],
          careerProspects: [
            "Social Worker",
            "Teacher",
            "Journalist",
            "Government Official",
            "Non-profit Manager",
          ],
        },
        {
          id: `${universityId}-psychology`,
          name: "Bachelor of Psychology",
          faculty: "Faculty of Humanities",
          duration: "3 years",
          apsRequirement: 30,
          description: "Study of human behavior and mental processes",
          subjects: [
            { name: "English", level: 4, isRequired: true },
            { name: "Mathematics", level: 4, isRequired: true },
            { name: "Life Sciences", level: 4, isRequired: false },
          ],
          careerProspects: [
            "Psychologist",
            "Counselor",
            "Researcher",
            "HR Specialist",
            "Social Worker",
          ],
        },
      ],
    },
    {
      id: `${universityId}-science`,
      name: "Faculty of Science",
      description:
        "Natural sciences, mathematics, and computer science programs",
      degrees: [
        {
          id: `${universityId}-bsc`,
          name: "Bachelor of Science",
          faculty: "Faculty of Science",
          duration: "3 years",
          apsRequirement: 30,
          description:
            "Foundation in scientific principles with specialization options",
          subjects: [
            { name: "English", level: 4, isRequired: true },
            { name: "Mathematics", level: 5, isRequired: true },
            { name: "Physical Sciences", level: 4, isRequired: true },
            { name: "Life Sciences", level: 4, isRequired: false },
          ],
          careerProspects: [
            "Research Scientist",
            "Laboratory Technician",
            "Data Analyst",
            "Environmental Consultant",
            "Science Teacher",
          ],
        },
        {
          id: `${universityId}-computer-science`,
          name: "Bachelor of Computer Science",
          faculty: "Faculty of Science",
          duration: "3 years",
          apsRequirement: 35,
          description:
            "Computer programming, software development, and information technology",
          subjects: [
            { name: "English", level: 4, isRequired: true },
            { name: "Mathematics", level: 6, isRequired: true },
            { name: "Physical Sciences", level: 4, isRequired: false },
            { name: "Information Technology", level: 5, isRequired: false },
          ],
          careerProspects: [
            "Software Developer",
            "System Analyst",
            "IT Consultant",
            "Cybersecurity Specialist",
            "Data Scientist",
          ],
        },
      ],
    },
    {
      id: `${universityId}-commerce`,
      name: "Faculty of Commerce",
      description: "Business, economics, and management programs",
      degrees: [
        {
          id: `${universityId}-bcom`,
          name: "Bachelor of Commerce",
          faculty: "Faculty of Commerce",
          duration: "3 years",
          apsRequirement: 28,
          description:
            "Business fundamentals with specialization in various commercial fields",
          subjects: [
            { name: "English", level: 4, isRequired: true },
            { name: "Mathematics", level: 4, isRequired: true },
            { name: "Accounting", level: 4, isRequired: false },
            { name: "Business Studies", level: 4, isRequired: false },
          ],
          careerProspects: [
            "Business Analyst",
            "Financial Advisor",
            "Marketing Manager",
            "Accountant",
            "Entrepreneur",
          ],
        },
        {
          id: `${universityId}-economics`,
          name: "Bachelor of Economics",
          faculty: "Faculty of Commerce",
          duration: "3 years",
          apsRequirement: 32,
          description: "Economic theory and policy analysis",
          subjects: [
            { name: "English", level: 4, isRequired: true },
            { name: "Mathematics", level: 5, isRequired: true },
            { name: "Economics", level: 4, isRequired: false },
          ],
          careerProspects: [
            "Economist",
            "Policy Analyst",
            "Financial Analyst",
            "Investment Advisor",
            "Research Economist",
          ],
        },
      ],
    },
  ];
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
  UCT_FACULTIES,
  RHODES_FACULTIES,
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
