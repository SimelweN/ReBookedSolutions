import { Faculty } from "@/types/university";
import { createDegreeId, createFacultyId } from "./base";

// Mangosuthu University of Technology (MUT) - Faculty Data - Complete Update
export const MUT_FACULTIES: Faculty[] = [
  {
    id: createFacultyId("Faculty of Engineering MUT"),
    name: "Faculty of Engineering",
    description: "Engineering technology and applied sciences programs",
    degrees: [
      {
        id: createDegreeId("Diploma Civil Engineering MUT"),
        name: "Diploma in Civil Engineering",
        faculty: "Engineering",
        duration: "3 years",
        apsRequirement: 20,
        description:
          "Civil engineering diploma with 50% Maths & Physical Science",
        subjects: [
          { name: "English", level: 3, isRequired: true },
          { name: "Mathematics", level: 3, isRequired: true },
          { name: "Physical Sciences", level: 3, isRequired: true },
        ],
        careerProspects: [
          "Civil Engineering Technician",
          "Construction Supervisor",
          "Infrastructure Technician",
        ],
      },
      {
        id: createDegreeId("Diploma Mechanical Engineering MUT"),
        name: "Diploma in Mechanical Engineering",
        faculty: "Engineering",
        duration: "3 years",
        apsRequirement: 20,
        description:
          "Mechanical engineering diploma with subject-level requirements",
        subjects: [
          { name: "English", level: 3, isRequired: true },
          { name: "Mathematics", level: 3, isRequired: true },
          { name: "Physical Sciences", level: 3, isRequired: true },
        ],
        careerProspects: [
          "Mechanical Engineering Technician",
          "Manufacturing Technologist",
          "Maintenance Technician",
        ],
      },
      {
        id: createDegreeId("Diploma Electrical Engineering MUT"),
        name: "Diploma in Electrical Engineering",
        faculty: "Engineering",
        duration: "3 years",
        apsRequirement: 20,
        description:
          "Electrical engineering diploma with subject-level requirements",
        subjects: [
          { name: "English", level: 3, isRequired: true },
          { name: "Mathematics", level: 3, isRequired: true },
          { name: "Physical Sciences", level: 3, isRequired: true },
        ],
        careerProspects: [
          "Electrical Engineering Technician",
          "Power Systems Technician",
          "Electronics Technician",
        ],
      },
      {
        id: createDegreeId("Diploma Chemical Engineering MUT"),
        name: "Diploma in Chemical Engineering",
        faculty: "Engineering",
        duration: "3 years",
        apsRequirement: 20,
        description:
          "Chemical engineering diploma with subject-level requirements",
        subjects: [
          { name: "English", level: 3, isRequired: true },
          { name: "Mathematics", level: 3, isRequired: true },
          { name: "Physical Sciences", level: 3, isRequired: true },
        ],
        careerProspects: [
          "Chemical Engineering Technician",
          "Process Technician",
          "Quality Control Technician",
        ],
      },
      {
        id: createDegreeId("BEngTech MUT"),
        name: "Bachelor of Engineering Technology (BEngTech)",
        faculty: "Engineering",
        duration: "4 years",
        apsRequirement: 25,
        description:
          "Engineering technology degree requiring strong 50%+ in Maths, Physics & English",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Physical Sciences", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Engineering Technologist",
          "Design Engineer",
          "Project Engineer",
        ],
      },
    ],
  },
  {
    id: createFacultyId("Faculty of Management Sciences MUT"),
    name: "Faculty of Management Sciences",
    description: "Business management and commercial programs",
    degrees: [
      {
        id: createDegreeId("Diploma Accounting MUT"),
        name: "Diploma in Accounting",
        faculty: "Management Sciences",
        duration: "3 years",
        apsRequirement: 25,
        description:
          "Accounting and financial management with subject requirements in Maths or Maths Lit",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 3, isRequired: true },
          { name: "Mathematical Literacy", level: 4, isRequired: false },
        ],
        careerProspects: ["Accountant", "Bookkeeper", "Financial Clerk"],
      },
      {
        id: createDegreeId("Diploma Marketing MUT"),
        name: "Diploma in Marketing",
        faculty: "Management Sciences",
        duration: "3 years",
        apsRequirement: 25,
        description:
          "Marketing and sales management with subject requirements in Maths or Maths Lit",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 3, isRequired: true },
          { name: "Mathematical Literacy", level: 4, isRequired: false },
        ],
        careerProspects: [
          "Marketing Coordinator",
          "Sales Representative",
          "Brand Assistant",
        ],
      },
      {
        id: createDegreeId("Diploma Public Management MUT"),
        name: "Diploma in Public Management",
        faculty: "Management Sciences",
        duration: "3 years",
        apsRequirement: 25,
        description:
          "Public management with subject requirements in Maths or Maths Lit",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 3, isRequired: true },
          { name: "Mathematical Literacy", level: 4, isRequired: false },
        ],
        careerProspects: [
          "Public Manager",
          "Government Officer",
          "Municipal Administrator",
        ],
      },
      {
        id: createDegreeId("Diploma HR MUT"),
        name: "Diploma in HR",
        faculty: "Management Sciences",
        duration: "3 years",
        apsRequirement: 25,
        description:
          "Human resources management with subject requirements in Maths or Maths Lit",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 3, isRequired: true },
          { name: "Mathematical Literacy", level: 4, isRequired: false },
        ],
        careerProspects: [
          "HR Assistant",
          "Recruitment Coordinator",
          "Training Officer",
        ],
      },
      {
        id: createDegreeId("Diploma Office Management MUT"),
        name: "Diploma in Office Management",
        faculty: "Management Sciences",
        duration: "3 years",
        apsRequirement: 25,
        description:
          "Office management with subject requirements in Maths or Maths Lit",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 3, isRequired: true },
          { name: "Mathematical Literacy", level: 4, isRequired: false },
        ],
        careerProspects: [
          "Office Manager",
          "Administrative Assistant",
          "Executive Secretary",
        ],
      },
      {
        id: createDegreeId("BCom Accounting MUT"),
        name: "Bachelor of Commerce in Accounting",
        faculty: "Management Sciences",
        duration: "3 years",
        apsRequirement: 30,
        description:
          "Commerce with accounting specialization with baseline APS and departmental screening",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Accounting", level: 4, isRequired: true },
        ],
        careerProspects: ["Accountant", "Financial Manager", "Auditor"],
      },
      {
        id: createDegreeId("BCom Marketing MUT"),
        name: "Bachelor of Commerce in Marketing",
        faculty: "Management Sciences",
        duration: "3 years",
        apsRequirement: 30,
        description:
          "Commerce with marketing specialization with baseline APS and departmental screening",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Marketing Manager",
          "Brand Manager",
          "Sales Manager",
        ],
      },
      {
        id: createDegreeId("BCom Public Administration MUT"),
        name: "Bachelor of Commerce in Public Administration",
        faculty: "Management Sciences",
        duration: "3 years",
        apsRequirement: 30,
        description:
          "Commerce with public administration specialization with baseline APS and departmental screening",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Public Administrator",
          "Government Official",
          "Policy Analyst",
        ],
      },
    ],
  },
  {
    id: createFacultyId(
      "Faculty of Natural Sciences Applied Health Sciences MUT",
    ),
    name: "Faculty of Natural Sciences (Applied & Health Sciences)",
    description:
      "Applied sciences, health sciences, and natural sciences programs",
    degrees: [
      {
        id: createDegreeId("Diploma Analytical Chemistry MUT"),
        name: "Diploma in Analytical Chemistry",
        faculty: "Natural Sciences (Applied & Health Sciences)",
        duration: "3 years",
        apsRequirement: 23,
        description:
          "Analytical chemistry with subject requirements in Maths, Life/Physical Sciences",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 3, isRequired: true },
          { name: "Physical Sciences", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Analytical Chemist",
          "Laboratory Technician",
          "Quality Control Analyst",
        ],
      },
      {
        id: createDegreeId("Diploma Agriculture MUT"),
        name: "Diploma in Agriculture",
        faculty: "Natural Sciences (Applied & Health Sciences)",
        duration: "3 years",
        apsRequirement: 23,
        description:
          "Agriculture with subject requirements in Maths, Life/Physical Sciences",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 3, isRequired: true },
          { name: "Life Sciences", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Agricultural Technician",
          "Farm Manager",
          "Agricultural Consultant",
        ],
      },
      {
        id: createDegreeId("Diploma Environmental Health MUT"),
        name: "Diploma in Environmental Health",
        faculty: "Natural Sciences (Applied & Health Sciences)",
        duration: "3 years",
        apsRequirement: 23,
        description:
          "Environmental health with subject requirements in Maths, Life/Physical Sciences",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 3, isRequired: true },
          { name: "Life Sciences", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Environmental Health Officer",
          "Public Health Inspector",
          "Safety Officer",
        ],
      },
      {
        id: createDegreeId("Diploma Biomedical Technology MUT"),
        name: "Diploma in Biomedical Technology",
        faculty: "Natural Sciences (Applied & Health Sciences)",
        duration: "3 years",
        apsRequirement: 23,
        description:
          "Biomedical technology with subject requirements in Maths, Life/Physical Sciences",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 3, isRequired: true },
          { name: "Life Sciences", level: 4, isRequired: true },
          { name: "Physical Sciences", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Biomedical Technician",
          "Medical Equipment Technician",
          "Laboratory Technician",
        ],
      },
      {
        id: createDegreeId("BSc Analytical Chemistry MUT"),
        name: "Bachelor of Science (e.g., Analytical Chemistry)",
        faculty: "Natural Sciences (Applied & Health Sciences)",
        duration: "3 years",
        apsRequirement: 30,
        description:
          "Bachelor of Science with higher APS and 50%+ in relevant sciences & English",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Physical Sciences", level: 4, isRequired: true },
          { name: "Life Sciences", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Research Scientist",
          "Analytical Chemist",
          "Quality Control Manager",
        ],
      },
      {
        id: createDegreeId("BSc Environmental Health MUT"),
        name: "Bachelor of Science in Environmental Health",
        faculty: "Natural Sciences (Applied & Health Sciences)",
        duration: "3 years",
        apsRequirement: 30,
        description:
          "Environmental health bachelor's degree with higher APS and 50%+ in relevant sciences & English",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Life Sciences", level: 4, isRequired: true },
          { name: "Physical Sciences", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Environmental Health Manager",
          "Environmental Consultant",
          "Public Health Specialist",
        ],
      },
    ],
  },
  {
    id: createFacultyId("Hospitality and Tourism MUT"),
    name: "Hospitality & Tourism",
    description: "Hospitality management and tourism programs",
    degrees: [
      {
        id: createDegreeId("Diploma Hospitality Management MUT"),
        name: "Diploma in Hospitality Management",
        faculty: "Hospitality & Tourism",
        duration: "3 years",
        apsRequirement: 22,
        description: "Hospitality management with English Level 4",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 3, isRequired: true },
        ],
        careerProspects: [
          "Hotel Manager",
          "Restaurant Manager",
          "Event Coordinator",
        ],
      },
      {
        id: createDegreeId("Diploma Office Management 20 APS MUT"),
        name: "Diploma in Office Management",
        faculty: "Hospitality & Tourism",
        duration: "3 years",
        apsRequirement: 20,
        description: "Office management (20 APS with Maths Lit accepted)",
        subjects: [
          { name: "English", level: 3, isRequired: true },
          { name: "Mathematics", level: 3, isRequired: true },
          { name: "Mathematical Literacy", level: 4, isRequired: false },
        ],
        careerProspects: [
          "Office Manager",
          "Administrative Assistant",
          "Executive Secretary",
        ],
      },
    ],
  },
];
