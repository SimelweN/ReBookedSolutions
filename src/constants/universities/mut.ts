import { Faculty } from "@/types/university";
import { createDegreeId, createFacultyId } from "./base";

// Mangosuthu University of Technology (MUT) - Faculty Data - Comprehensive Update
export const MUT_FACULTIES: Faculty[] = [
  {
    id: createFacultyId("Faculty of Engineering MUT"),
    name: "Faculty of Engineering",
    description: "Engineering and technical programs",
    degrees: [
      {
        id: createDegreeId("Diploma Civil Engineering MUT"),
        name: "Diploma in Civil Engineering",
        faculty: "Engineering",
        duration: "3 years",
        apsRequirement: 20,
        description:
          "Civil engineering technology (APS ~20+, with 50% Maths & Physical Science)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Physical Sciences", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Civil Engineering Technician",
          "Construction Manager",
          "Project Coordinator",
        ],
      },
      {
        id: createDegreeId("Diploma Mechanical Engineering MUT"),
        name: "Diploma in Mechanical Engineering",
        faculty: "Engineering",
        duration: "3 years",
        apsRequirement: 20,
        description:
          "Mechanical engineering technology (similar 20+ APS, with subject-level requirements)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Physical Sciences", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Mechanical Engineering Technician",
          "Manufacturing Technologist",
          "Maintenance Engineer",
        ],
      },
      {
        id: createDegreeId("Diploma Electrical Engineering MUT"),
        name: "Diploma in Electrical Engineering",
        faculty: "Engineering",
        duration: "3 years",
        apsRequirement: 20,
        description:
          "Electrical engineering technology (similar 20+ APS, with subject-level requirements)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Physical Sciences", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Electrical Engineering Technician",
          "Power Systems Technologist",
          "Control Systems Specialist",
        ],
      },
      {
        id: createDegreeId("Diploma Chemical Engineering MUT"),
        name: "Diploma in Chemical Engineering",
        faculty: "Engineering",
        duration: "3 years",
        apsRequirement: 20,
        description:
          "Chemical engineering technology (similar 20+ APS, with subject-level requirements)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Physical Sciences", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Chemical Engineering Technician",
          "Process Technologist",
          "Quality Control Specialist",
        ],
      },
      {
        id: createDegreeId("BEngTech MUT"),
        name: "Bachelor of Engineering Technology (BEngTech)",
        faculty: "Engineering",
        duration: "4 years",
        apsRequirement: 28,
        description:
          "Engineering technology degree (typically higher APS, require strong 50%+ in Maths, Physics & English)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 5, isRequired: true },
          { name: "Physical Sciences", level: 5, isRequired: true },
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
    description: "Management, business, and administrative programs",
    degrees: [
      {
        id: createDegreeId("Diploma Accounting MUT"),
        name: "Diploma in Accounting",
        faculty: "Management Sciences",
        duration: "3 years",
        apsRequirement: 25,
        description:
          "Accounting and financial management (min 25 APS plus subject requirements in Maths or Maths Lit)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Accounting", level: 4, isRequired: true },
        ],
        careerProspects: ["Accountant", "Bookkeeper", "Financial Assistant"],
      },
      {
        id: createDegreeId("Diploma Marketing MUT"),
        name: "Diploma in Marketing",
        faculty: "Management Sciences",
        duration: "3 years",
        apsRequirement: 25,
        description:
          "Marketing and business promotion (min 25 APS plus subject requirements in Maths or Maths Lit)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Marketing Officer",
          "Brand Manager",
          "Digital Marketing Specialist",
        ],
      },
      {
        id: createDegreeId("Diploma Public Management MUT"),
        name: "Diploma in Public Management",
        faculty: "Management Sciences",
        duration: "3 years",
        apsRequirement: 25,
        description:
          "Public sector management (min 25 APS plus subject requirements in Maths or Maths Lit)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Public Manager",
          "Government Official",
          "Municipal Officer",
        ],
      },
      {
        id: createDegreeId("Diploma Human Resources MUT"),
        name: "Diploma in HR",
        faculty: "Management Sciences",
        duration: "3 years",
        apsRequirement: 25,
        description:
          "Human resources management (min 25 APS plus subject requirements in Maths or Maths Lit)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
        ],
        careerProspects: [
          "HR Officer",
          "Recruitment Specialist",
          "Training Coordinator",
        ],
      },
      {
        id: createDegreeId("Diploma Office Management MUT"),
        name: "Diploma in Office Management",
        faculty: "Management Sciences",
        duration: "3 years",
        apsRequirement: 25,
        description:
          "Office management and administration (min 25 APS plus subject requirements in Maths or Maths Lit)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
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
        apsRequirement: 25,
        description:
          "Commerce with accounting specialization (similar baseline APS 25–30 plus departmental screening)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 5, isRequired: true },
          { name: "Accounting", level: 4, isRequired: true },
        ],
        careerProspects: ["Accountant", "Financial Manager", "Auditor"],
      },
      {
        id: createDegreeId("BCom Marketing MUT"),
        name: "Bachelor of Commerce in Marketing",
        faculty: "Management Sciences",
        duration: "3 years",
        apsRequirement: 25,
        description:
          "Commerce with marketing specialization (similar baseline APS 25–30 plus departmental screening)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Marketing Manager",
          "Brand Manager",
          "Digital Marketing Specialist",
        ],
      },
      {
        id: createDegreeId("BCom Public Administration MUT"),
        name: "Bachelor of Commerce in Public Administration",
        faculty: "Management Sciences",
        duration: "3 years",
        apsRequirement: 25,
        description:
          "Commerce with public administration specialization (similar baseline APS 25–30 plus departmental screening)",
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
    id: createFacultyId("Faculty of Natural Sciences MUT"),
    name: "Faculty of Natural Sciences (Applied & Health Sciences)",
    description: "Science, health, and applied science programs",
    degrees: [
      {
        id: createDegreeId("Diploma Analytical Chemistry MUT"),
        name: "Diploma in Analytical Chemistry",
        faculty: "Natural Sciences",
        duration: "3 years",
        apsRequirement: 23,
        description:
          "Analytical chemistry (min APS 23+, plus subject requirements in Maths, Life/Physical Sciences)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Physical Sciences", level: 5, isRequired: true },
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
        faculty: "Natural Sciences",
        duration: "3 years",
        apsRequirement: 23,
        description:
          "Agriculture (min APS 23+, plus subject requirements in Maths, Life/Physical Sciences)",
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
        id: createDegreeId("Diploma Environmental Health MUT"),
        name: "Diploma in Environmental Health",
        faculty: "Natural Sciences",
        duration: "3 years",
        apsRequirement: 23,
        description:
          "Environmental health (min APS 23+, plus subject requirements in Maths, Life/Physical Sciences)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Life Sciences", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Environmental Health Officer",
          "Health Inspector",
          "Environmental Consultant",
        ],
      },
      {
        id: createDegreeId("Diploma Biomedical Technology MUT"),
        name: "Diploma in Biomedical Technology",
        faculty: "Natural Sciences",
        duration: "3 years",
        apsRequirement: 23,
        description:
          "Biomedical technology (min APS 23+, plus subject requirements in Maths, Life/Physical Sciences)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Life Sciences", level: 5, isRequired: true },
          { name: "Physical Sciences", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Biomedical Technologist",
          "Medical Equipment Technician",
          "Laboratory Assistant",
        ],
      },
      {
        id: createDegreeId("BSc Analytical Chemistry MUT"),
        name: "Bachelor of Science (Analytical Chemistry)",
        faculty: "Natural Sciences",
        duration: "3 years",
        apsRequirement: 30,
        description:
          "Science in analytical chemistry (around 30+, plus 50%+ in relevant sciences & English)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 5, isRequired: true },
          { name: "Physical Sciences", level: 5, isRequired: true },
        ],
        careerProspects: [
          "Analytical Chemist",
          "Research Scientist",
          "Quality Assurance Manager",
        ],
      },
      {
        id: createDegreeId("BSc Environmental Health MUT"),
        name: "Bachelor of Science (Environmental Health)",
        faculty: "Natural Sciences",
        duration: "3 years",
        apsRequirement: 30,
        description:
          "Science in environmental health (around 30+, plus 50%+ in relevant sciences & English)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Life Sciences", level: 5, isRequired: true },
        ],
        careerProspects: [
          "Environmental Health Scientist",
          "Environmental Consultant",
          "Public Health Officer",
        ],
      },
    ],
  },
  {
    id: createFacultyId("Faculty of Hospitality Tourism MUT"),
    name: "Faculty of Hospitality & Tourism",
    description: "Hospitality and tourism programs",
    degrees: [
      {
        id: createDegreeId("Diploma Hospitality Management MUT"),
        name: "Diploma in Hospitality Management",
        faculty: "Hospitality & Tourism",
        duration: "3 years",
        apsRequirement: 22,
        description: "Hospitality management (APS ~22, with English Level 4)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Consumer Studies", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Hotel Manager",
          "Restaurant Manager",
          "Event Coordinator",
        ],
      },
      {
        id: createDegreeId("Diploma Office Management MUT Tourism"),
        name: "Diploma in Office Management",
        faculty: "Hospitality & Tourism",
        duration: "3 years",
        apsRequirement: 20,
        description: "Office management (20 APS, Maths Lit accepted)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematical Literacy", level: 4, isRequired: true },
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
