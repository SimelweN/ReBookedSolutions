import { Faculty } from "@/types/university";
import { createDegreeId, createFacultyId } from "./base";

// Cape Peninsula University of Technology (CPUT) - Faculty Data
export const CPUT_FACULTIES: Faculty[] = [
  {
    id: createFacultyId("Faculty of Agriculture and Natural Sciences CPUT"),
    name: "Faculty of Agriculture & Natural Sciences",
    description:
      "Agriculture, environmental sciences, and natural sciences programs",
    degrees: [
      {
        id: createDegreeId("Diploma Agriculture CPUT"),
        name: "Diploma in Agriculture",
        faculty: "Agriculture & Natural Sciences",
        duration: "3 years",
        apsRequirement: 28,
        description:
          "Agriculture diploma with Maths (mainstream requires 30 APS)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Life Sciences", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Agricultural Technician",
          "Farm Manager",
          "Agricultural Consultant",
        ],
      },
      {
        id: createDegreeId("Diploma Agriculture Tech Maths CPUT"),
        name: "Diploma in Agriculture - Tech Maths",
        faculty: "Agriculture & Natural Sciences",
        duration: "3 years",
        apsRequirement: 29,
        description:
          "Agriculture diploma with Technical Mathematics (mainstream requires 31 APS)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Technical Mathematics", level: 4, isRequired: true },
          { name: "Life Sciences", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Agricultural Technician",
          "Farm Manager",
          "Agricultural Consultant",
        ],
      },
      {
        id: createDegreeId("Diploma Agricultural Management CPUT"),
        name: "Diploma in Agricultural Management",
        faculty: "Agriculture & Natural Sciences",
        duration: "3 years",
        apsRequirement: 28,
        description:
          "Agricultural management with Maths (mainstream 30/31/32 APS respectively)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Life Sciences", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Agricultural Manager",
          "Farm Supervisor",
          "Agricultural Business Manager",
        ],
      },
      {
        id: createDegreeId("Diploma Agricultural Management Tech Maths CPUT"),
        name: "Diploma in Agricultural Management - Tech Maths",
        faculty: "Agriculture & Natural Sciences",
        duration: "3 years",
        apsRequirement: 29,
        description: "Agricultural management with Technical Mathematics",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Technical Mathematics", level: 4, isRequired: true },
          { name: "Life Sciences", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Agricultural Manager",
          "Farm Supervisor",
          "Agricultural Business Manager",
        ],
      },
      {
        id: createDegreeId("Diploma Agricultural Management Math Lit CPUT"),
        name: "Diploma in Agricultural Management - Math Lit",
        faculty: "Agriculture & Natural Sciences",
        duration: "3 years",
        apsRequirement: 30,
        description: "Agricultural management with Mathematics Literacy",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematical Literacy", level: 4, isRequired: true },
          { name: "Life Sciences", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Agricultural Manager",
          "Farm Supervisor",
          "Agricultural Business Manager",
        ],
      },
      {
        id: createDegreeId("Diploma Analytical Chemistry CPUT"),
        name: "Diploma in Analytical Chemistry",
        faculty: "Agriculture & Natural Sciences",
        duration: "3 years",
        apsRequirement: 28,
        description: "Analytical chemistry with Maths (mainstream 30/31 APS)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Physical Sciences", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Analytical Chemist",
          "Laboratory Technician",
          "Quality Control Analyst",
        ],
      },
      {
        id: createDegreeId("Diploma Analytical Chemistry Tech Maths CPUT"),
        name: "Diploma in Analytical Chemistry - Tech Maths",
        faculty: "Agriculture & Natural Sciences",
        duration: "3 years",
        apsRequirement: 29,
        description: "Analytical chemistry with Technical Mathematics",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Technical Mathematics", level: 4, isRequired: true },
          { name: "Physical Sciences", level: 4, isRequired: true },
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
        description: "Biotechnology with Maths (mainstream 30/31 APS)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Life Sciences", level: 4, isRequired: true },
          { name: "Physical Sciences", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Biotechnologist",
          "Research Technician",
          "Quality Control Specialist",
        ],
      },
      {
        id: createDegreeId("Diploma Biotechnology Tech Maths CPUT"),
        name: "Diploma in Biotechnology - Tech Maths",
        faculty: "Agriculture & Natural Sciences",
        duration: "3 years",
        apsRequirement: 29,
        description: "Biotechnology with Technical Mathematics",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Technical Mathematics", level: 4, isRequired: true },
          { name: "Life Sciences", level: 4, isRequired: true },
          { name: "Physical Sciences", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Biotechnologist",
          "Research Technician",
          "Quality Control Specialist",
        ],
      },
      {
        id: createDegreeId("Diploma Consumer Science Food Nutrition CPUT"),
        name: "Diploma in Consumer Science: Food & Nutrition",
        faculty: "Agriculture & Natural Sciences",
        duration: "3 years",
        apsRequirement: 26,
        description: "Consumer science with Maths (mainstream 28/29 APS)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 3, isRequired: true },
          { name: "Life Sciences", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Nutritionist",
          "Food Technologist",
          "Consumer Advisor",
        ],
      },
      {
        id: createDegreeId(
          "Diploma Consumer Science Food Nutrition Tech Maths CPUT",
        ),
        name: "Diploma in Consumer Science: Food & Nutrition - Tech Maths",
        faculty: "Agriculture & Natural Sciences",
        duration: "3 years",
        apsRequirement: 27,
        description: "Consumer science with Technical Mathematics",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Technical Mathematics", level: 3, isRequired: true },
          { name: "Life Sciences", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Nutritionist",
          "Food Technologist",
          "Consumer Advisor",
        ],
      },
      {
        id: createDegreeId("Diploma Environmental Management CPUT"),
        name: "Diploma in Environmental Management",
        faculty: "Agriculture & Natural Sciences",
        duration: "3 years",
        apsRequirement: 26,
        description:
          "Environmental management with Maths (mainstream 28/29/30 APS)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 3, isRequired: true },
          { name: "Life Sciences", level: 4, isRequired: true },
          { name: "Geography", level: 4, isRequired: false },
        ],
        careerProspects: [
          "Environmental Manager",
          "Conservation Officer",
          "Sustainability Consultant",
        ],
      },
      {
        id: createDegreeId("Diploma Environmental Management Tech Maths CPUT"),
        name: "Diploma in Environmental Management - Tech Maths",
        faculty: "Agriculture & Natural Sciences",
        duration: "3 years",
        apsRequirement: 27,
        description: "Environmental management with Technical Mathematics",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Technical Mathematics", level: 3, isRequired: true },
          { name: "Life Sciences", level: 4, isRequired: true },
          { name: "Geography", level: 4, isRequired: false },
        ],
        careerProspects: [
          "Environmental Manager",
          "Conservation Officer",
          "Sustainability Consultant",
        ],
      },
      {
        id: createDegreeId("Diploma Environmental Management Math Lit CPUT"),
        name: "Diploma in Environmental Management - Math Lit",
        faculty: "Agriculture & Natural Sciences",
        duration: "3 years",
        apsRequirement: 28,
        description: "Environmental management with Mathematics Literacy",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematical Literacy", level: 4, isRequired: true },
          { name: "Life Sciences", level: 4, isRequired: true },
          { name: "Geography", level: 4, isRequired: false },
        ],
        careerProspects: [
          "Environmental Manager",
          "Conservation Officer",
          "Sustainability Consultant",
        ],
      },
    ],
  },
  {
    id: createFacultyId("Faculty of Health and Wellness Sciences CPUT"),
    name: "Faculty of Health & Wellness Sciences",
    description: "Health sciences and medical technology programs",
    degrees: [
      {
        id: createDegreeId("BHealthSci Medical Laboratory Science CPUT"),
        name: "Bachelor of Health Sciences: Medical Laboratory Science",
        faculty: "Health & Wellness Sciences",
        duration: "4 years",
        apsRequirement: 38,
        description:
          "Medical laboratory science - Mainstream (30-37 APS for Extended)",
        subjects: [
          { name: "English", level: 5, isRequired: true },
          { name: "Mathematics", level: 5, isRequired: true },
          { name: "Physical Sciences", level: 5, isRequired: true },
          { name: "Life Sciences", level: 5, isRequired: true },
        ],
        careerProspects: [
          "Medical Laboratory Scientist",
          "Clinical Laboratory Technologist",
          "Research Scientist",
        ],
      },
      {
        id: createDegreeId(
          "BHealthSci Medical Laboratory Science Extended CPUT",
        ),
        name: "Bachelor of Health Sciences: Medical Laboratory Science (Extended)",
        faculty: "Health & Wellness Sciences",
        duration: "5 years",
        apsRequirement: 30,
        description:
          "Extended medical laboratory science program (30-37 APS range)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Physical Sciences", level: 4, isRequired: true },
          { name: "Life Sciences", level: 4, isRequired: true },
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
