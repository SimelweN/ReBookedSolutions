import { Faculty } from "@/types/university";
import { createDegreeId, createFacultyId } from "./base";

// Mangosuthu University of Technology (MUT) - Faculty Data
export const MUT_FACULTIES: Faculty[] = [
  {
    id: createFacultyId("Faculty of Engineering"),
    name: "Faculty of Engineering",
    description: "Engineering technology programs",
    degrees: [
      {
        id: createDegreeId("Diploma Civil Engineering MUT"),
        name: "Diploma in Civil Engineering",
        faculty: "Engineering",
        duration: "3 years",
        apsRequirement: 20,
        description: "Civil engineering technology",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Physical Sciences", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Civil Engineering Technician",
          "Construction Supervisor",
        ],
      },
    ],
  },
];
