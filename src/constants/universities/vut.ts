import { Faculty } from "@/types/university";
import { createDegreeId, createFacultyId } from "./base";

// Vaal University of Technology (VUT) - Faculty Data
export const VUT_FACULTIES: Faculty[] = [
  {
    id: createFacultyId("Faculty of Applied & Computer Sciences VUT"),
    name: "Faculty of Applied & Computer Sciences",
    description:
      "Applied sciences, agriculture, biotechnology, and information technology",
    degrees: [
      {
        id: createDegreeId("Diploma Analytical Chemistry VUT"),
        name: "Diploma in Analytical Chemistry",
        faculty: "Applied & Computer Sciences",
        duration: "3 years",
        apsRequirement: 24,
        description: "Analytical chemistry - 24 APS (Maths)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Physical Sciences", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Analytical Chemist",
          "Quality Controller",
          "Laboratory Technician",
        ],
      },
      {
        id: createDegreeId("Diploma Agricultural Management VUT"),
        name: "Diploma in Agricultural Management",
        faculty: "Applied & Computer Sciences",
        duration: "3 years",
        apsRequirement: 24,
        description:
          "Agricultural management - 24 APS (Maths) / 25 APS (Math Lit)",
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
        id: createDegreeId("Diploma Biotechnology VUT"),
        name: "Diploma in Biotechnology",
        faculty: "Applied & Computer Sciences",
        duration: "3 years",
        apsRequirement: 23,
        description: "Biotechnology studies",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Life Sciences", level: 4, isRequired: true },
          { name: "Physical Sciences", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Biotechnologist",
          "Research Technician",
          "Quality Control Analyst",
        ],
      },
      {
        id: createDegreeId("Diploma Information Technology VUT"),
        name: "Diploma in Information Technology",
        faculty: "Applied & Computer Sciences",
        duration: "3 years",
        apsRequirement: 22,
        description: "Information technology studies",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
        ],
        careerProspects: [
          "IT Technician",
          "Software Developer",
          "Network Administrator",
        ],
      },
    ],
  },
  {
    id: createFacultyId("Faculty of Engineering & Technology VUT"),
    name: "Faculty of Engineering & Technology",
    description: "Engineering and technology programs",
    degrees: [
      {
        id: createDegreeId("Diploma Civil Engineering VUT"),
        name: "Diploma in Civil Engineering",
        faculty: "Engineering & Technology",
        duration: "3 years",
        apsRequirement: 26,
        description: "Civil engineering technology",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Physical Sciences", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Civil Engineering Technician",
          "Construction Supervisor",
          "Project Coordinator",
        ],
      },
      {
        id: createDegreeId("Diploma Mechanical Engineering VUT"),
        name: "Diploma in Mechanical Engineering",
        faculty: "Engineering & Technology",
        duration: "3 years",
        apsRequirement: 26,
        description: "Mechanical engineering technology",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Physical Sciences", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Mechanical Engineering Technician",
          "Maintenance Technician",
          "Manufacturing Technician",
        ],
      },
      {
        id: createDegreeId("Diploma Electrical Engineering VUT"),
        name: "Diploma in Electrical Engineering",
        faculty: "Engineering & Technology",
        duration: "3 years",
        apsRequirement: 26,
        description: "Electrical engineering technology",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Physical Sciences", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Electrical Engineering Technician",
          "Control Systems Technician",
          "Power Systems Technician",
        ],
      },
    ],
  },
  {
    id: createFacultyId("Faculty of Management Sciences VUT"),
    name: "Faculty of Management Sciences",
    description: "Business management and administrative programs",
    degrees: [
      {
        id: createDegreeId("Diploma Accounting VUT"),
        name: "Diploma in Accounting",
        faculty: "Management Sciences",
        duration: "3 years",
        apsRequirement: 24,
        description: "Accounting and financial management",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Accountant",
          "Bookkeeper",
          "Financial Administrator",
        ],
      },
      {
        id: createDegreeId("Diploma Marketing VUT"),
        name: "Diploma in Marketing",
        faculty: "Management Sciences",
        duration: "3 years",
        apsRequirement: 23,
        description: "Marketing and sales management",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 3, isRequired: true },
        ],
        careerProspects: [
          "Marketing Officer",
          "Sales Representative",
          "Brand Manager",
        ],
      },
      {
        id: createDegreeId("Diploma Public Management VUT"),
        name: "Diploma in Public Management",
        faculty: "Management Sciences",
        duration: "3 years",
        apsRequirement: 23,
        description: "Public sector management",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 3, isRequired: true },
        ],
        careerProspects: [
          "Public Administrator",
          "Government Official",
          "Municipal Manager",
        ],
      },
    ],
  },
  {
    id: createFacultyId("Faculty of Human Sciences VUT"),
    name: "Faculty of Human Sciences",
    description: "Education, social work, and human development programs",
    degrees: [
      {
        id: createDegreeId("Bachelor of Education VUT"),
        name: "Bachelor of Education",
        faculty: "Human Sciences",
        duration: "4 years",
        apsRequirement: 24,
        description: "Teacher education program",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Teacher",
          "Education Specialist",
          "Curriculum Developer",
        ],
      },
      {
        id: createDegreeId("Bachelor of Social Work VUT"),
        name: "Bachelor of Social Work",
        faculty: "Human Sciences",
        duration: "4 years",
        apsRequirement: 26,
        description: "Social work and community development",
        subjects: [
          { name: "English", level: 5, isRequired: true },
          { name: "Life Orientation", level: 4, isRequired: false },
        ],
        careerProspects: [
          "Social Worker",
          "Community Developer",
          "Social Researcher",
        ],
      },
    ],
  },
];
