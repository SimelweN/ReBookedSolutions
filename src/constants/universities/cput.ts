import { Faculty } from "@/types/university";
import { createDegreeId, createFacultyId } from "./base";

// Cape Peninsula University of Technology (CPUT) - Faculty Data
export const CPUT_FACULTIES: Faculty[] = [
  {
    id: createFacultyId("Faculty of Engineering"),
    name: "Faculty of Engineering",
    description: "Engineering and technology programs",
    degrees: [
      {
        id: createDegreeId("Diploma Civil Engineering CPUT"),
        name: "Diploma in Civil Engineering",
        faculty: "Engineering",
        duration: "3 years",
        apsRequirement: 26,
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
