import { Faculty } from "@/types/university";
import { createDegreeId, createFacultyId } from "./base";

// University of Zululand (UNIZULU) - Faculty Data
export const UNIZULU_FACULTIES: Faculty[] = [
  {
    id: createFacultyId("Faculty of Arts"),
    name: "Faculty of Arts",
    description: "Arts and humanities programs",
    degrees: [
      {
        id: createDegreeId("Bachelor of Arts UNIZULU"),
        name: "Bachelor of Arts",
        faculty: "Arts",
        duration: "3 years",
        apsRequirement: 24,
        description: "Liberal arts program",
        subjects: [{ name: "English", level: 4, isRequired: true }],
        careerProspects: ["Writer", "Journalist", "Communications Specialist"],
      },
    ],
  },
];
