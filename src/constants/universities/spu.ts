import { Faculty } from "@/types/university";
import { createDegreeId, createFacultyId } from "./base";

// Sol Plaatje University (SPU) - Faculty Data
export const SPU_FACULTIES: Faculty[] = [
  {
    id: createFacultyId("Faculty of Education SPU"),
    name: "Faculty of Education",
    description: "Teacher education and educational programs",
    degrees: [
      {
        id: createDegreeId("BEd Foundation Phase SPU"),
        name: "Bachelor of Education (Foundation Phase, Grade R–3)",
        faculty: "Education",
        duration: "4 years",
        apsRequirement: 30,
        description: "Teacher education for foundation phase (Grades R-3)",
        subjects: [
          { name: "English", level: 5, isRequired: true },
          { name: "Mathematics", level: 5, isRequired: true },
          { name: "Life Orientation", level: 4, isRequired: false },
        ],
        careerProspects: [
          "Foundation Phase Teacher",
          "Early Childhood Educator",
        ],
      },
      {
        id: createDegreeId("BEd Intermediate Phase SPU"),
        name: "Bachelor of Education (Intermediate Phase, Grades 4–6)",
        faculty: "Education",
        duration: "4 years",
        apsRequirement: 30,
        description: "Teacher education for intermediate phase (Grades 4-6)",
        subjects: [
          { name: "English", level: 5, isRequired: true },
          { name: "Mathematics", level: 5, isRequired: true },
          { name: "Life Orientation", level: 4, isRequired: false },
        ],
        careerProspects: [
          "Intermediate Phase Teacher",
          "Primary School Teacher",
        ],
      },
      {
        id: createDegreeId("BEd Senior FET Phase SPU"),
        name: "Bachelor of Education (Senior & FET Phase, Grades 7–12)",
        faculty: "Education",
        duration: "4 years",
        apsRequirement: 30,
        description:
          "Teacher education for senior phase (Grades 7-9) and FET (Grades 10-12)",
        subjects: [
          { name: "English", level: 5, isRequired: true },
          { name: "Mathematics", level: 5, isRequired: true },
          { name: "Life Orientation", level: 4, isRequired: false },
        ],
        careerProspects: [
          "High School Teacher",
          "Subject Specialist",
          "Education Coordinator",
        ],
      },
    ],
  },
  {
    id: createFacultyId("Faculty of Natural and Applied Sciences SPU"),
    name: "Faculty of Natural & Applied Sciences",
    description: "Science, technology, and applied sciences programs",
    degrees: [
      {
        id: createDegreeId("BSc SPU"),
        name: "Bachelor of Science (BSc)",
        faculty: "Natural & Applied Sciences",
        duration: "3 years",
        apsRequirement: 30,
        description: "General science degree with multiple specializations",
        subjects: [
          { name: "English", level: 5, isRequired: true },
          { name: "Mathematics", level: 5, isRequired: true },
          { name: "Physical Sciences", level: 5, isRequired: true },
        ],
        careerProspects: [
          "Research Scientist",
          "Laboratory Technician",
          "Science Teacher",
        ],
      },
      {
        id: createDegreeId("BSc Data Science SPU"),
        name: "Bachelor of Science in Data Science",
        faculty: "Natural & Applied Sciences",
        duration: "3 years",
        apsRequirement: 30,
        description: "Data science and analytics program",
        subjects: [
          { name: "English", level: 5, isRequired: true },
          { name: "Mathematics", level: 5, isRequired: true },
          { name: "Information Technology", level: 4, isRequired: true },
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
    id: createFacultyId("Faculty of Economic and Management Sciences SPU"),
    name: "Faculty of Economic & Management Sciences (EMS)",
    description: "Business, economics, and management programs",
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
          { name: "Life Orientation", level: 4, isRequired: false },
        ],
        careerProspects: ["Accountant", "Financial Analyst", "Auditor"],
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
          { name: "Life Orientation", level: 4, isRequired: false },
        ],
        careerProspects: ["Economist", "Policy Analyst", "Research Officer"],
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
          { name: "Life Orientation", level: 3, isRequired: false },
        ],
        careerProspects: ["Retail Manager", "Business Owner", "Sales Manager"],
      },
    ],
  },
  {
    id: createFacultyId("Faculty of Humanities and Heritage Studies SPU"),
    name: "Faculty of Humanities & Heritage Studies",
    description: "Liberal arts, heritage, and social sciences programs",
    degrees: [
      {
        id: createDegreeId("BA SPU"),
        name: "Bachelor of Arts (BA)",
        faculty: "Humanities & Heritage Studies",
        duration: "3 years",
        apsRequirement: 30,
        description: "Liberal arts foundation program",
        subjects: [
          { name: "English", level: 5, isRequired: true },
          { name: "Life Orientation", level: 4, isRequired: false },
        ],
        careerProspects: ["Social Worker", "Researcher", "Community Developer"],
      },
      {
        id: createDegreeId("Higher Certificate Heritage Studies SPU"),
        name: "Higher Certificate in Heritage Studies",
        faculty: "Humanities & Heritage Studies",
        duration: "1 year",
        apsRequirement: 25,
        description: "Cultural heritage and museum studies",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Life Orientation", level: 3, isRequired: false },
        ],
        careerProspects: [
          "Museum Assistant",
          "Heritage Officer",
          "Cultural Consultant",
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
          { name: "English", level: 4, isRequired: true },
          { name: "Additional Language", level: 4, isRequired: true },
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
    description: "Information and Communication Technology programs",
    degrees: [
      {
        id: createDegreeId("Diploma ICT Applications Development SPU"),
        name: "Diploma in Information & Communication Technology (Applications Development)",
        faculty: "School of ICT",
        duration: "3 years",
        apsRequirement: 25,
        description: "Software development and applications programming",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Information Technology", level: 4, isRequired: false },
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
