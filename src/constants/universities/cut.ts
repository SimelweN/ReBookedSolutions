import { Faculty } from "@/types/university";
import { createDegreeId, createFacultyId } from "./base";

// Central University of Technology (CUT) - Faculty Data
export const CUT_FACULTIES: Faculty[] = [
  {
    id: createFacultyId(
      "Faculty of Engineering Built Environment Information Technology",
    ),
    name: "Faculty of Engineering, Built Environment & Information Technology",
    description:
      "Engineering, construction, and information technology programs",
    degrees: [
      {
        id: createDegreeId("Diploma Civil Engineering CUT"),
        name: "Diploma in Civil Engineering",
        faculty: "Engineering, Built Environment & Information Technology",
        duration: "3 years",
        apsRequirement: 27,
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
