import { Faculty } from "@/types/university";
import { createDegreeId, createFacultyId } from "./base";

// Cape Peninsula University of Technology (CPUT) - Faculty Data - Comprehensive Update
export const CPUT_FACULTIES: Faculty[] = [
  {
    id: createFacultyId("Faculty of Agriculture Natural Sciences CPUT"),
    name: "Faculty of Agriculture & Natural Sciences",
    description: "Agricultural, scientific, and environmental programs",
    degrees: [
      {
        id: createDegreeId("Diploma Agriculture CPUT"),
        name: "Diploma in Agriculture",
        faculty: "Agriculture & Natural Sciences",
        duration: "3 years",
        apsRequirement: 28,
        description:
          "Agriculture qualification (28 APS with Maths / 29 APS with Tech Maths; mainstream requires 30 APS w/Maths or 31 APS w/Tech Maths)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Life Sciences", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Agricultural Technician",
          "Farm Manager",
          "Agricultural Advisor",
        ],
      },
      {
        id: createDegreeId("Diploma Agricultural Management CPUT"),
        name: "Diploma in Agricultural Management",
        faculty: "Agriculture & Natural Sciences",
        duration: "3 years",
        apsRequirement: 28,
        description:
          "Agricultural management (28 APS w/Maths / 29 APS Tech Maths / 30 APS Maths Literacy; mainstream 30/31/32 APS respectively)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Life Sciences", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Agricultural Manager",
          "Farm Supervisor",
          "Agricultural Consultant",
        ],
      },
      {
        id: createDegreeId("Diploma Analytical Chemistry CPUT"),
        name: "Diploma in Analytical Chemistry",
        faculty: "Agriculture & Natural Sciences",
        duration: "3 years",
        apsRequirement: 28,
        description:
          "Analytical chemistry (28 APS Maths or 29 APS Tech Maths; mainstream 30/31 APS)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 5, isRequired: true },
          { name: "Physical Sciences", level: 5, isRequired: true },
        ],
        careerProspects: [
          "Analytical Chemist",
          "Laboratory Technician",
          "Quality Control Analyst",
        ],
      },
      {
        id: createDegreeId("Diploma Biotechnology CPUT"),
        name: "Diploma in Biotechnology",
        faculty: "Agriculture & Natural Sciences",
        duration: "3 years",
        apsRequirement: 28,
        description:
          "Biotechnology (28 APS Maths or 29 APS Tech Maths; mainstream 30/31 APS)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Life Sciences", level: 5, isRequired: true },
          { name: "Physical Sciences", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Biotechnologist",
          "Research Technician",
          "Laboratory Scientist",
        ],
      },
      {
        id: createDegreeId("Diploma Consumer Science Food Nutrition CPUT"),
        name: "Diploma in Consumer Science: Food & Nutrition",
        faculty: "Agriculture & Natural Sciences",
        duration: "3 years",
        apsRequirement: 26,
        description:
          "Consumer science with food and nutrition (26 APS Maths / 27 APS Tech Maths; mainstream 28/29 APS)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Life Sciences", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Food Scientist",
          "Nutritionist",
          "Food Safety Officer",
        ],
      },
      {
        id: createDegreeId("Diploma Environmental Management CPUT"),
        name: "Diploma in Environmental Management",
        faculty: "Agriculture & Natural Sciences",
        duration: "3 years",
        apsRequirement: 26,
        description:
          "Environmental management (26 APS Maths / 27 APS Tech Maths / 28 APS Maths Lit; mainstream 28/29/30 APS)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Life Sciences", level: 4, isRequired: true },
          { name: "Geography", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Environmental Manager",
          "Conservation Officer",
          "Environmental Consultant",
        ],
      },
    ],
  },
  {
    id: createFacultyId("Faculty of Health Wellness Sciences CPUT"),
    name: "Faculty of Health & Wellness Sciences",
    description: "Health and medical science programs",
    degrees: [
      {
        id: createDegreeId("BHSc Medical Laboratory Science CPUT"),
        name: "Bachelor of Health Sciences: Medical Laboratory Science",
        faculty: "Health & Wellness Sciences",
        duration: "4 years",
        apsRequirement: 38,
        description:
          "Medical laboratory science (38+ APS Mainstream / 30–37 APS Extended)",
        subjects: [
          { name: "English", level: 5, isRequired: true },
          { name: "Mathematics", level: 6, isRequired: true },
          { name: "Life Sciences", level: 6, isRequired: true },
          { name: "Physical Sciences", level: 5, isRequired: true },
        ],
        careerProspects: [
          "Medical Laboratory Scientist",
          "Clinical Laboratory Technologist",
          "Research Scientist",
        ],
      },
    ],
  },
];
