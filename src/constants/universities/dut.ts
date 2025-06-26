import { Faculty } from "@/types/university";
import { createDegreeId, createFacultyId } from "./base";

// Durban University of Technology (DUT) - Faculty Data
export const DUT_FACULTIES: Faculty[] = [
  {
    id: createFacultyId("Engineering Built Environment"),
    name: "Engineering & Built Environment",
    description: "Engineering and construction technology programs",
    degrees: [
      {
        id: createDegreeId(
          "Diploma Engineering Civil Electrical Mechanical DUT",
        ),
        name: "Diploma in Engineering (Civil/Electrical/Mechanical)",
        faculty: "Engineering & Built Environment",
        duration: "3 years",
        apsRequirement: 24,
        description: "Engineering diploma programs",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Physical Sciences", level: 4, isRequired: true },
        ],
        careerProspects: ["Engineering Technician", "Project Technician"],
      },
    ],
  },
];
