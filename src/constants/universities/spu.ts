import { Faculty } from "@/types/university";
import { createDegreeId, createFacultyId } from "./base";

// Sol Plaatje University (SPU) - Faculty Data
export const SPU_FACULTIES: Faculty[] = [
  {
    id: createFacultyId("Faculty of Humanities"),
    name: "Faculty of Humanities",
    description: "Humanities and social sciences",
    degrees: [
      {
        id: createDegreeId("Bachelor of Arts SPU"),
        name: "Bachelor of Arts",
        faculty: "Humanities",
        duration: "3 years",
        apsRequirement: 24,
        description: "Liberal arts program",
        subjects: [{ name: "English", level: 4, isRequired: true }],
        careerProspects: ["Writer", "Journalist", "Social Worker"],
      },
    ],
  },
];
