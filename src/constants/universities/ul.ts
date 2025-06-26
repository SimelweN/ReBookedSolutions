import { Faculty } from "@/types/university";
import { createDegreeId, createFacultyId } from "./base";

// University of Limpopo (UL) - Faculty Data
export const UL_FACULTIES: Faculty[] = [
  {
    id: createFacultyId("Faculty of Humanities"),
    name: "Faculty of Humanities",
    description:
      "Humanities programs focusing on education, social sciences, and communication studies",
    degrees: [
      {
        id: createDegreeId("Bachelor of Education BEd"),
        name: "Bachelor of Education (BEd)",
        faculty: "Humanities",
        duration: "4 years",
        apsRequirement: 24,
        description: "Professional teacher education program",
        subjects: [
          { name: "English", level: 5, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Teacher",
          "Education Specialist",
          "Curriculum Developer",
        ],
      },
      {
        id: createDegreeId("Bachelor of Arts BA"),
        name: "Bachelor of Arts (BA)",
        faculty: "Humanities",
        duration: "3 years",
        apsRequirement: 24,
        description: "Liberal arts and humanities program",
        subjects: [
          { name: "English", level: 5, isRequired: true },
          { name: "History", level: 4, isRequired: false },
        ],
        careerProspects: ["Writer", "Journalist", "Communications Specialist"],
      },
    ],
  },
  {
    id: createFacultyId("Faculty of Science and Agriculture"),
    name: "Faculty of Science and Agriculture",
    description: "Natural sciences, agriculture, and environmental programs",
    degrees: [
      {
        id: createDegreeId("Bachelor of Science BSc"),
        name: "Bachelor of Science (BSc)",
        faculty: "Science and Agriculture",
        duration: "3 years",
        apsRequirement: 30,
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
      {
        id: createDegreeId("Bachelor of Agriculture BAgric"),
        name: "Bachelor of Agriculture (BAgric)",
        faculty: "Science and Agriculture",
        duration: "4 years",
        apsRequirement: 26,
        description: "Agricultural science and management program",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Life Sciences", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Agricultural Manager",
          "Farm Consultant",
          "Agricultural Researcher",
        ],
      },
    ],
  },
  {
    id: createFacultyId("Faculty of Management and Law"),
    name: "Faculty of Management and Law",
    description: "Business management, economics, and law programs",
    degrees: [
      {
        id: createDegreeId("Bachelor of Commerce BCom"),
        name: "Bachelor of Commerce (BCom)",
        faculty: "Management and Law",
        duration: "3 years",
        apsRequirement: 26,
        description: "Commerce and business studies program",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Business Manager",
          "Financial Analyst",
          "Marketing Specialist",
        ],
      },
      {
        id: createDegreeId("Bachelor of Laws LLB"),
        name: "Bachelor of Laws (LLB)",
        faculty: "Management and Law",
        duration: "4 years",
        apsRequirement: 32,
        description: "Professional law degree",
        subjects: [
          { name: "English", level: 6, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
        ],
        careerProspects: ["Lawyer", "Legal Advisor", "Magistrate"],
      },
    ],
  },
  {
    id: createFacultyId("Faculty of Health Sciences"),
    name: "Faculty of Health Sciences",
    description: "Medical and health-related programs",
    degrees: [
      {
        id: createDegreeId("Bachelor of Medicine and Surgery MBChB"),
        name: "Bachelor of Medicine and Surgery (MBChB)",
        faculty: "Health Sciences",
        duration: "6 years",
        apsRequirement: 40,
        description: "Medical degree program",
        subjects: [
          { name: "English", level: 6, isRequired: true },
          { name: "Mathematics", level: 6, isRequired: true },
          { name: "Physical Sciences", level: 6, isRequired: true },
          { name: "Life Sciences", level: 6, isRequired: true },
        ],
        careerProspects: [
          "Medical Doctor",
          "Specialist Physician",
          "Medical Researcher",
        ],
      },
      {
        id: createDegreeId("Bachelor of Pharmacy BPharm"),
        name: "Bachelor of Pharmacy (BPharm)",
        faculty: "Health Sciences",
        duration: "4 years",
        apsRequirement: 35,
        description: "Pharmaceutical sciences program",
        subjects: [
          { name: "English", level: 5, isRequired: true },
          { name: "Mathematics", level: 5, isRequired: true },
          { name: "Physical Sciences", level: 5, isRequired: true },
          { name: "Life Sciences", level: 5, isRequired: true },
        ],
        careerProspects: [
          "Pharmacist",
          "Pharmaceutical Researcher",
          "Clinical Pharmacist",
        ],
      },
    ],
  },
];
