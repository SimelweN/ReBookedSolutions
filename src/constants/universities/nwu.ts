import { Faculty } from "@/types/university";
import { createDegreeId, createFacultyId } from "./base";

// North-West University (NWU) - Faculty Data
export const NWU_FACULTIES: Faculty[] = [
  {
    id: createFacultyId("Faculty of Economic and Management Sciences"),
    name: "Faculty of Economic and Management Sciences",
    description: "Commerce, economics, and business management programs",
    degrees: [
      {
        id: createDegreeId("Bachelor of Commerce Accounting NWU"),
        name: "Bachelor of Commerce in Accounting",
        faculty: "Economic and Management Sciences",
        duration: "3 years",
        apsRequirement: 30,
        description: "Professional accounting program",
        subjects: [
          { name: "English", level: 5, isRequired: true },
          { name: "Mathematics", level: 5, isRequired: true },
        ],
        careerProspects: [
          "Chartered Accountant",
          "Financial Manager",
          "Auditor",
        ],
      },
    ],
  },
  {
    id: createFacultyId("Faculty of Engineering"),
    name: "Faculty of Engineering",
    description: "Engineering programs",
    degrees: [
      {
        id: createDegreeId("Bachelor of Engineering NWU"),
        name: "Bachelor of Engineering",
        faculty: "Engineering",
        duration: "4 years",
        apsRequirement: 35,
        description: "Professional engineering program",
        subjects: [
          { name: "English", level: 5, isRequired: true },
          { name: "Mathematics", level: 6, isRequired: true },
          { name: "Physical Sciences", level: 6, isRequired: true },
        ],
        careerProspects: [
          "Professional Engineer",
          "Design Engineer",
          "Project Manager",
        ],
      },
    ],
  },
];
