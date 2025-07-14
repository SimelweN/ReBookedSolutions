import { Faculty } from "@/types/university";
import { createDegreeId, createFacultyId } from "./base";

// Sol Plaatje University (SPU) - Faculty Data - Comprehensive Update
export const SPU_FACULTIES: Faculty[] = [
  {
    id: createFacultyId("Faculty of Education SPU"),
    name: "Faculty of Education",
    description: "Teacher education and educational programs",
    degrees: [
      {
        id: createDegreeId("BEd Foundation Phase Grade R-3 SPU"),
        name: "Bachelor of Education (Foundation Phase, Grade R–3)",
        faculty: "Education",
        duration: "4 years",
        apsRequirement: 30,
        description: "Foundation phase teaching (Grades R-3)",
        subjects: [
          { name: "English", level: 5, isRequired: true },
          { name: "Mathematics", level: 5, isRequired: true },
        ],
        careerProspects: [
          "Foundation Phase Teacher",
          "Primary School Teacher",
          "Educational Coordinator",
        ],
      },
      {
        id: createDegreeId("BEd Intermediate Phase Grades 4-6 SPU"),
        name: "Bachelor of Education (Intermediate Phase, Grades 4–6)",
        faculty: "Education",
        duration: "4 years",
        apsRequirement: 30,
        description: "Intermediate phase teaching (Grades 4-6)",
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
        id: createDegreeId("BEd Senior FET Phase Grades 7-12 SPU"),
        name: "Bachelor of Education (Senior & FET Phase, Grades 7–12)",
        faculty: "Education",
        duration: "4 years",
        apsRequirement: 30,
        description: "Senior and FET phase teaching (Grades 7-12)",
        subjects: [
          { name: "English", level: 5, isRequired: true },
          { name: "Mathematics", level: 5, isRequired: true },
        ],
        careerProspects: [
          "High School Teacher",
          "Subject Specialist",
          "Educational Manager",
        ],
      },
    ],
  },
  {
    id: createFacultyId("Faculty of Natural Applied Sciences SPU"),
    name: "Faculty of Natural & Applied Sciences",
    description: "Science, technology, and data science programs",
    degrees: [
      {
        id: createDegreeId("BSc SPU"),
        name: "Bachelor of Science (BSc)",
        faculty: "Natural & Applied Sciences",
        duration: "3 years",
        apsRequirement: 30,
        description: "General science qualification",
        subjects: [
          { name: "English", level: 5, isRequired: true },
          { name: "Mathematics", level: 5, isRequired: true },
          { name: "Physical Sciences", level: 5, isRequired: true },
        ],
        careerProspects: [
          "Scientist",
          "Research Assistant",
          "Laboratory Analyst",
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
          { name: "Information Technology", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Data Scientist",
          "Data Analyst",
          "Business Intelligence Analyst",
        ],
      },
    ],
  },
  {
    id: createFacultyId("Faculty of Economic Management Sciences SPU"),
    name: "Faculty of Economic & Management Sciences",
    description: "Economics, business, and management programs",
    degrees: [
      {
        id: createDegreeId("BCom Accounting SPU"),
        name: "Bachelor of Commerce in Accounting",
        faculty: "Economic & Management Sciences",
        duration: "3 years",
        apsRequirement: 30,
        description: "Professional accounting and financial management",
        subjects: [
          { name: "English", level: 5, isRequired: true },
          { name: "Mathematics", level: 5, isRequired: true },
          { name: "Accounting", level: 5, isRequired: true },
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
        description: "Retail business and management",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Retail Manager",
          "Store Manager",
          "Merchandising Manager",
        ],
      },
    ],
  },
  {
    id: createFacultyId("Faculty of Humanities Heritage Studies SPU"),
    name: "Faculty of Humanities & Heritage Studies",
    description: "Humanities, heritage, and cultural programs",
    degrees: [
      {
        id: createDegreeId("BA SPU"),
        name: "Bachelor of Arts (BA)",
        faculty: "Humanities & Heritage Studies",
        duration: "3 years",
        apsRequirement: 30,
        description: "General arts and humanities",
        subjects: [
          { name: "English", level: 5, isRequired: true },
          { name: "Home Language", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Arts Professional",
          "Cultural Worker",
          "Heritage Specialist",
        ],
      },
      {
        id: createDegreeId("Higher Certificate Heritage Studies SPU"),
        name: "Higher Certificate in Heritage Studies",
        faculty: "Humanities & Heritage Studies",
        duration: "1 year",
        apsRequirement: 25,
        description: "Heritage conservation and management",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "History", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Heritage Officer",
          "Museum Assistant",
          "Cultural Guide",
        ],
      },
      {
        id: createDegreeId("Higher Certificate Court Interpreting SPU"),
        name: "Higher Certificate in Court Interpreting",
        faculty: "Humanities & Heritage Studies",
        duration: "1 year",
        apsRequirement: 25,
        description: "Legal interpreting and translation",
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
        description: "ICT with applications development specialization",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Information Technology", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Software Developer",
          "Applications Developer",
          "Systems Analyst",
        ],
      },
    ],
  },
];
