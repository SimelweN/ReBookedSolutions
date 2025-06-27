import { Faculty } from "@/types/university";
import { createDegreeId, createFacultyId } from "./base";

// Sol Plaatje University (SPU) - Faculty Data - Complete Update
export const SPU_FACULTIES: Faculty[] = [
  {
    id: createFacultyId("Faculty of Education SPU"),
    name: "Faculty of Education",
    description: "Teacher education and educational development programs",
    degrees: [
      {
        id: createDegreeId("BEd Foundation Phase Grade R 3 SPU"),
        name: "Bachelor of Education (Foundation Phase, Grade R–3)",
        faculty: "Education",
        duration: "4 years",
        apsRequirement: 30,
        description: "Foundation phase teaching for early childhood education",
        subjects: [
          { name: "English", level: 5, isRequired: true },
          { name: "Mathematics", level: 5, isRequired: true },
        ],
        careerProspects: [
          "Foundation Phase Teacher",
          "Early Childhood Educator",
          "Educational Specialist",
        ],
      },
      {
        id: createDegreeId("BEd Intermediate Phase Grades 4 6 SPU"),
        name: "Bachelor of Education (Intermediate Phase, Grades 4–6)",
        faculty: "Education",
        duration: "4 years",
        apsRequirement: 30,
        description: "Intermediate phase teaching for primary education",
        subjects: [
          { name: "English", level: 5, isRequired: true },
          { name: "Mathematics", level: 5, isRequired: true },
        ],
        careerProspects: [
          "Intermediate Phase Teacher",
          "Primary School Teacher",
          "Subject Specialist",
        ],
      },
      {
        id: createDegreeId("BEd Senior FET Phase Grades 7 12 SPU"),
        name: "Bachelor of Education (Senior & FET Phase, Grades 7–12)",
        faculty: "Education",
        duration: "4 years",
        apsRequirement: 30,
        description: "Senior phase and FET teaching for secondary education",
        subjects: [
          { name: "English", level: 5, isRequired: true },
          { name: "Mathematics", level: 5, isRequired: true },
        ],
        careerProspects: [
          "High School Teacher",
          "Subject Specialist",
          "Educational Consultant",
        ],
      },
    ],
  },
  {
    id: createFacultyId("Faculty of Natural Applied Sciences SPU"),
    name: "Faculty of Natural & Applied Sciences",
    description: "Natural sciences, mathematics, and data science programs",
    degrees: [
      {
        id: createDegreeId("BSc SPU"),
        name: "Bachelor of Science (BSc)",
        faculty: "Natural & Applied Sciences",
        duration: "3 years",
        apsRequirement: 30,
        description: "General science foundation with various specializations",
        subjects: [
          { name: "English", level: 5, isRequired: true },
          { name: "Mathematics", level: 5, isRequired: true },
          { name: "Physical Sciences", level: 5, isRequired: true },
        ],
        careerProspects: [
          "Scientist",
          "Research Assistant",
          "Laboratory Technician",
        ],
      },
      {
        id: createDegreeId("BSc Data Science SPU"),
        name: "Bachelor of Science in Data Science",
        faculty: "Natural & Applied Sciences",
        duration: "3 years",
        apsRequirement: 30,
        description: "Data science and analytics",
        subjects: [
          { name: "English", level: 5, isRequired: true },
          { name: "Mathematics", level: 6, isRequired: true },
        ],
        careerProspects: [
          "Data Scientist",
          "Data Analyst",
          "Machine Learning Engineer",
        ],
      },
    ],
  },
  {
    id: createFacultyId("Faculty of Economic Management Sciences EMS SPU"),
    name: "Faculty of Economic & Management Sciences (EMS)",
    description: "Economics, business, and management programs",
    degrees: [
      {
        id: createDegreeId("BCom Accounting SPU"),
        name: "Bachelor of Commerce in Accounting",
        faculty: "Economic & Management Sciences",
        duration: "3 years",
        apsRequirement: 30,
        description: "Accounting and financial management",
        subjects: [
          { name: "English", level: 5, isRequired: true },
          { name: "Mathematics", level: 5, isRequired: true },
          { name: "Accounting", level: 4, isRequired: true },
        ],
        careerProspects: ["Accountant", "Financial Manager", "Auditor"],
      },
      {
        id: createDegreeId("BCom Economics SPU"),
        name: "Bachelor of Commerce in Economics",
        faculty: "Economic & Management Sciences",
        duration: "3 years",
        apsRequirement: 30,
        description: "Economic theory and analysis",
        subjects: [
          { name: "English", level: 5, isRequired: true },
          { name: "Mathematics", level: 5, isRequired: true },
        ],
        careerProspects: ["Economist", "Economic Analyst", "Policy Researcher"],
      },
      {
        id: createDegreeId("Diploma Retail Business Management SPU"),
        name: "Diploma in Retail Business Management",
        faculty: "Economic & Management Sciences",
        duration: "3 years",
        apsRequirement: 25,
        description: "Retail management and business operations",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
        ],
        careerProspects: ["Retail Manager", "Store Manager", "Merchandiser"],
      },
    ],
  },
  {
    id: createFacultyId("Faculty of Humanities Heritage Studies SPU"),
    name: "Faculty of Humanities & Heritage Studies",
    description: "Humanities, heritage, and cultural studies programs",
    degrees: [
      {
        id: createDegreeId("Bachelor Arts BA SPU"),
        name: "Bachelor of Arts (BA)",
        faculty: "Humanities & Heritage Studies",
        duration: "3 years",
        apsRequirement: 30,
        description: "General arts and humanities",
        subjects: [{ name: "English", level: 5, isRequired: true }],
        careerProspects: [
          "Administrative Officer",
          "Communications Officer",
          "Research Assistant",
        ],
      },
      {
        id: createDegreeId("Higher Certificate Heritage Studies SPU"),
        name: "Higher Certificate in Heritage Studies",
        faculty: "Humanities & Heritage Studies",
        duration: "1 year",
        apsRequirement: 25,
        description: "Heritage preservation and cultural studies",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "History", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Heritage Officer",
          "Museum Assistant",
          "Cultural Coordinator",
        ],
      },
      {
        id: createDegreeId("Higher Certificate Court Interpreting SPU"),
        name: "Higher Certificate in Court Interpreting",
        faculty: "Humanities & Heritage Studies",
        duration: "1 year",
        apsRequirement: 25,
        description: "Court interpreting and legal translation",
        subjects: [
          { name: "English", level: 5, isRequired: true },
          { name: "Home Language", level: 5, isRequired: true },
        ],
        careerProspects: [
          "Court Interpreter",
          "Legal Translator",
          "Language Specialist",
        ],
      },
    ],
  },
  {
    id: createFacultyId("School of ICT SPU"),
    name: "School of ICT",
    description: "Information and communication technology programs",
    degrees: [
      {
        id: createDegreeId("Diploma ICT Applications Development SPU"),
        name: "Diploma in Information & Communication Technology (Applications Development)",
        faculty: "ICT",
        duration: "3 years",
        apsRequirement: 25,
        description: "ICT applications development and programming",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Software Developer",
          "Applications Developer",
          "IT Specialist",
        ],
      },
    ],
  },
];
