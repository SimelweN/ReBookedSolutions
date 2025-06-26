import { Faculty } from "@/types/university";
import { createDegreeId, createFacultyId } from "./base";

// Tshwane University of Technology (TUT) - Faculty Data
export const TUT_FACULTIES: Faculty[] = [
  {
    id: createFacultyId("Faculty of Engineering Built Environment"),
    name: "Faculty of Engineering & the Built Environment",
    description: "Engineering and construction technology programs",
    degrees: [
      {
        id: createDegreeId("Diploma Engineering Various Disciplines TUT"),
        name: "Diploma in Engineering (various disciplines)",
        faculty: "Engineering & the Built Environment",
        duration: "3 years",
        apsRequirement: 22,
        description: "Engineering diplomas",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Physical Sciences", level: 4, isRequired: true },
        ],
        careerProspects: ["Engineering Technician", "Technical Officer"],
      },
    ],
  },
];
