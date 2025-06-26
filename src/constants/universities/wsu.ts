import { Faculty } from "@/types/university";
import { createDegreeId, createFacultyId } from "./base";

// Walter Sisulu University (WSU) - Faculty Data
export const WSU_FACULTIES: Faculty[] = [
  {
    id: createFacultyId("Faculty of Education"),
    name: "Faculty of Education",
    description: "Teacher education and educational sciences",
    degrees: [
      {
        id: createDegreeId("Bachelor of Education WSU"),
        name: "Bachelor of Education",
        faculty: "Education",
        duration: "4 years",
        apsRequirement: 24,
        description: "Professional teacher education program",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Teacher",
          "Education Specialist",
          "Curriculum Developer",
        ],
      },
    ],
  },
  {
    id: createFacultyId("Faculty of Science Engineering and Technology"),
    name: "Faculty of Science, Engineering and Technology",
    description: "Science, engineering, and technology programs",
    degrees: [
      {
        id: createDegreeId("Bachelor of Science WSU"),
        name: "Bachelor of Science",
        faculty: "Science, Engineering and Technology",
        duration: "3 years",
        apsRequirement: 28,
        description: "General science degree with various specializations",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 5, isRequired: true },
          { name: "Physical Sciences", level: 5, isRequired: true },
        ],
        careerProspects: [
          "Scientist",
          "Research Analyst",
          "Laboratory Technician",
        ],
      },
    ],
  },
];
