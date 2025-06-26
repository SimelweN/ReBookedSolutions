import { Faculty } from "@/types/university";
import { createDegreeId, createFacultyId } from "./base";

// University of Mpumalanga (UMP) - Faculty Data
export const UMP_FACULTIES: Faculty[] = [
  {
    id: createFacultyId("Faculty of Education"),
    name: "Faculty of Education",
    description: "Teacher education programs",
    degrees: [
      {
        id: createDegreeId("Bachelor of Education UMP"),
        name: "Bachelor of Education",
        faculty: "Education",
        duration: "4 years",
        apsRequirement: 24,
        description: "Teacher education program",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
        ],
        careerProspects: ["Teacher", "Education Specialist"],
      },
    ],
  },
];
