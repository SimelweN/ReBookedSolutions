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
        apsRequirement: 24,
        description:
          "Information technology studies - 24 APS (Maths or Tech Maths) / 26 APS (Math Lit)",
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
      {
        id: createDegreeId("Diploma Environmental Science VUT"),
        name: "Diploma in Environmental Science",
        faculty: "Applied & Computer Sciences",
        duration: "3 years",
        apsRequirement: 21,
        description: "Environmental science studies - 21 APS (Maths)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Physical Sciences", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Environmental Scientist",
          "Conservation Officer",
          "Environmental Consultant",
        ],
      },
      {
        id: createDegreeId("Diploma Non-Destructive Testing VUT"),
        name: "Diploma in Non-Destructive Testing",
        faculty: "Applied & Computer Sciences",
        duration: "3 years",
        apsRequirement: 19,
        description: "Non-destructive testing technology",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 3, isRequired: true },
          { name: "Physical Sciences", level: 3, isRequired: true },
        ],
        careerProspects: [
          "NDT Technician",
          "Quality Control Inspector",
          "Materials Tester",
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
        id: createDegreeId("Diploma Chemical Engineering VUT"),
        name: "Diploma in Chemical Engineering",
        faculty: "Engineering & Technology",
        duration: "3 years",
        apsRequirement: 24,
        description:
          "Chemical engineering technology - requires 24 APS (Maths)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Physical Sciences", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Chemical Engineering Technician",
          "Process Technician",
          "Plant Operator",
        ],
      },
      {
        id: createDegreeId("Diploma Civil Engineering VUT"),
        name: "Diploma in Civil Engineering",
        faculty: "Engineering & Technology",
        duration: "3 years",
        apsRequirement: 24,
        description: "Civil engineering technology - requires 24 APS (Maths)",
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
        id: createDegreeId("Diploma Electronic Engineering VUT"),
        name: "Diploma in Electronic Engineering",
        faculty: "Engineering & Technology",
        duration: "3 years",
        apsRequirement: 24,
        description:
          "Electronic engineering technology - requires 24 APS (Maths)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Physical Sciences", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Electronic Engineering Technician",
          "Electronics Technician",
          "Control Systems Technician",
        ],
      },
      {
        id: createDegreeId("Diploma Power Engineering VUT"),
        name: "Diploma in Power Engineering",
        faculty: "Engineering & Technology",
        duration: "3 years",
        apsRequirement: 24,
        description: "Power engineering technology - requires 24 APS (Maths)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Physical Sciences", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Power Engineering Technician",
          "Electrical Technician",
          "Power Systems Operator",
        ],
      },
      {
        id: createDegreeId("Diploma Process Control Engineering VUT"),
        name: "Diploma in Process Control Engineering",
        faculty: "Engineering & Technology",
        duration: "3 years",
        apsRequirement: 24,
        description: "Process control engineering - requires 24 APS (Maths)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Physical Sciences", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Process Control Technician",
          "Automation Technician",
          "Control Systems Engineer",
        ],
      },
      {
        id: createDegreeId("Diploma Computer Systems Engineering VUT"),
        name: "Diploma in Computer Systems Engineering",
        faculty: "Engineering & Technology",
        duration: "3 years",
        apsRequirement: 24,
        description: "Computer systems engineering - requires 24 APS (Maths)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Physical Sciences", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Computer Systems Engineer",
          "Network Engineer",
          "Systems Administrator",
        ],
      },
      {
        id: createDegreeId("Diploma Industrial Engineering VUT"),
        name: "Diploma in Industrial Engineering",
        faculty: "Engineering & Technology",
        duration: "3 years",
        apsRequirement: 24,
        description: "Industrial engineering - requires 24 APS (Maths)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Physical Sciences", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Industrial Engineering Technician",
          "Production Supervisor",
          "Quality Manager",
        ],
      },
      {
        id: createDegreeId("Diploma Mechanical Engineering VUT"),
        name: "Diploma in Mechanical Engineering",
        faculty: "Engineering & Technology",
        duration: "3 years",
        apsRequirement: 24,
        description:
          "Mechanical engineering technology - requires 24 APS (Maths)",
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
        id: createDegreeId("Diploma Metallurgical Engineering VUT"),
        name: "Diploma in Metallurgical Engineering",
        faculty: "Engineering & Technology",
        duration: "3 years",
        apsRequirement: 24,
        description: "Metallurgical engineering - requires 24 APS (Maths)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Physical Sciences", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Metallurgical Technician",
          "Materials Engineer",
          "Mining Technician",
        ],
      },
    ],
  },
  {
    id: createFacultyId("Faculty of Human Sciences VUT"),
    name: "Faculty of Human Sciences",
    description: "Creative arts, education, tourism, and social programs",
    degrees: [
      {
        id: createDegreeId("Diploma Fashion VUT"),
        name: "Diploma in Fashion",
        faculty: "Human Sciences",
        duration: "3 years",
        apsRequirement: 21,
        description:
          "Fashion design and production - 21 APS (Maths) / 22 APS (Math Lit/Tech Maths)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Visual Arts", level: 3, isRequired: false },
        ],
        careerProspects: [
          "Fashion Designer",
          "Fashion Merchandiser",
          "Clothing Technologist",
        ],
      },
      {
        id: createDegreeId("Diploma Photography VUT"),
        name: "Diploma in Photography",
        faculty: "Human Sciences",
        duration: "3 years",
        apsRequirement: 21,
        description:
          "Photography and visual arts - 21 APS / 22 APS (Math Lit/Tech Maths)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Visual Arts", level: 3, isRequired: false },
        ],
        careerProspects: ["Photographer", "Photo Editor", "Visual Artist"],
      },
      {
        id: createDegreeId("Diploma Graphic Design VUT"),
        name: "Diploma in Graphic Design",
        faculty: "Human Sciences",
        duration: "3 years",
        apsRequirement: 21,
        description:
          "Graphic design and multimedia - 21 APS / 22 APS (Math Lit/Tech Maths)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Visual Arts", level: 3, isRequired: false },
        ],
        careerProspects: [
          "Graphic Designer",
          "Web Designer",
          "Multimedia Artist",
        ],
      },
      {
        id: createDegreeId("Diploma Fine Art VUT"),
        name: "Diploma in Fine Art",
        faculty: "Human Sciences",
        duration: "3 years",
        apsRequirement: 21,
        description:
          "Fine arts and creative expression - 21 APS / 22 APS (Math Lit/Tech Maths)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Visual Arts", level: 4, isRequired: true },
        ],
        careerProspects: ["Fine Artist", "Art Teacher", "Gallery Curator"],
      },
      {
        id: createDegreeId("Diploma Food Service Management VUT"),
        name: "Diploma in Food Service Management",
        faculty: "Human Sciences",
        duration: "3 years",
        apsRequirement: 21,
        description:
          "Food service and hospitality management - 21 APS (Maths) / 22 APS (Math Lit/Tech Maths)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Life Sciences", level: 3, isRequired: false },
        ],
        careerProspects: [
          "Food Service Manager",
          "Restaurant Manager",
          "Catering Manager",
        ],
      },
      {
        id: createDegreeId("Diploma Tourism Management VUT"),
        name: "Diploma in Tourism Management",
        faculty: "Human Sciences",
        duration: "3 years",
        apsRequirement: 21,
        description:
          "Tourism and hospitality management - 21 APS (Maths) / 22 APS (Math Lit/Tech Maths)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Geography", level: 3, isRequired: false },
        ],
        careerProspects: ["Tourism Manager", "Travel Consultant", "Tour Guide"],
      },
      {
        id: createDegreeId("Diploma Ecotourism Management VUT"),
        name: "Diploma in Ecotourism Management",
        faculty: "Human Sciences",
        duration: "3 years",
        apsRequirement: 21,
        description:
          "Ecotourism and sustainable tourism - 21 APS (Maths) / 22 APS (Math Lit/Tech Maths)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Geography", level: 3, isRequired: false },
          { name: "Life Sciences", level: 3, isRequired: false },
        ],
        careerProspects: [
          "Ecotourism Manager",
          "Conservation Officer",
          "Environmental Guide",
        ],
      },
      {
        id: createDegreeId("Diploma Public Relations VUT"),
        name: "Diploma in Public Relations",
        faculty: "Human Sciences",
        duration: "3 years",
        apsRequirement: 21,
        description:
          "Public relations and communications - 21 APS (Maths) / 22 APS (Math Lit/Tech Maths)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Life Orientation", level: 3, isRequired: false },
        ],
        careerProspects: [
          "Public Relations Officer",
          "Communications Manager",
          "Marketing Coordinator",
        ],
      },
      {
        id: createDegreeId("Diploma Legal Assistance VUT"),
        name: "Diploma in Legal Assistance",
        faculty: "Human Sciences",
        duration: "3 years",
        apsRequirement: 23,
        description:
          "Legal assistance and paralegal work - 23 APS (Maths) / 24 APS (Math Lit/Tech Maths)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 3, isRequired: true },
        ],
        careerProspects: [
          "Legal Assistant",
          "Paralegal",
          "Court Administrator",
        ],
      },
      {
        id: createDegreeId("Diploma Labour Law VUT"),
        name: "Diploma in Labour Law",
        faculty: "Human Sciences",
        duration: "3 years",
        apsRequirement: 23,
        description:
          "Labour law and industrial relations - 23 APS (Maths) / 24 APS (Math Lit/Tech Maths)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 3, isRequired: true },
        ],
        careerProspects: [
          "Labour Relations Officer",
          "HR Specialist",
          "Legal Advisor",
        ],
      },
      {
        id: createDegreeId("Diploma Policing VUT"),
        name: "Diploma in Policing",
        faculty: "Human Sciences",
        duration: "3 years",
        apsRequirement: 21,
        description:
          "Policing and law enforcement - 21 APS (Maths) / 22 APS (Math Lit/Tech Maths)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Life Orientation", level: 3, isRequired: false },
        ],
        careerProspects: [
          "Police Officer",
          "Security Manager",
          "Crime Analyst",
        ],
      },
      {
        id: createDegreeId("Diploma Safety Management VUT"),
        name: "Diploma in Safety Management",
        faculty: "Human Sciences",
        duration: "3 years",
        apsRequirement: 21,
        description:
          "Occupational health and safety - 21 APS (Maths) / 22 APS (Math Lit/Tech Maths)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Physical Sciences", level: 3, isRequired: false },
        ],
        careerProspects: [
          "Safety Officer",
          "Health and Safety Manager",
          "Risk Assessor",
        ],
      },
      {
        id: createDegreeId("BEd Senior Phase FET Teaching VUT"),
        name: "BEd (Senior Phase & FET Teaching)",
        faculty: "Human Sciences",
        duration: "4 years",
        apsRequirement: 22,
        description:
          "Teacher education for senior and FET phases - 22 APS (Maths) / 24 APS (Math Lit)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
        ],
        careerProspects: [
          "High School Teacher",
          "Education Specialist",
          "Subject Coordinator",
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
        id: createDegreeId("Diploma Financial Info Systems VUT"),
        name: "Diploma in Financial Information Systems",
        faculty: "Management Sciences",
        duration: "3 years",
        apsRequirement: 20,
        description:
          "Financial information systems - 20 APS (Maths) / 22 APS (Math Lit/Tech Maths)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Financial Systems Analyst",
          "Accounting Technician",
          "Data Analyst",
        ],
      },
      {
        id: createDegreeId("Diploma Cost Management Accounting VUT"),
        name: "Diploma in Cost & Management Accounting",
        faculty: "Management Sciences",
        duration: "3 years",
        apsRequirement: 20,
        description:
          "Cost and management accounting - 20 APS (Maths) / 22 APS (Math Lit/Tech Maths)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Management Accountant",
          "Cost Analyst",
          "Financial Controller",
        ],
      },
      {
        id: createDegreeId("Diploma Internal Auditing VUT"),
        name: "Diploma in Internal Auditing",
        faculty: "Management Sciences",
        duration: "3 years",
        apsRequirement: 20,
        description:
          "Internal auditing - 20 APS (Maths) / 23 APS (Math Lit/Tech Maths)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Internal Auditor",
          "Risk Analyst",
          "Compliance Officer",
        ],
      },
      {
        id: createDegreeId("Diploma Human Resources Management VUT"),
        name: "Diploma in Human Resources Management",
        faculty: "Management Sciences",
        duration: "3 years",
        apsRequirement: 20,
        description:
          "Human resources management - 20 APS (Maths) / 21 APS (Math Lit/Tech Maths)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 3, isRequired: true },
        ],
        careerProspects: [
          "HR Officer",
          "Recruitment Specialist",
          "Training Coordinator",
        ],
      },
      {
        id: createDegreeId("Diploma Logistics Supply Chain Management VUT"),
        name: "Diploma in Logistics & Supply Chain Management",
        faculty: "Management Sciences",
        duration: "3 years",
        apsRequirement: 20,
        description:
          "Logistics and supply chain - 20 APS (Maths) / 21 APS (Math Lit/Tech Maths)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 3, isRequired: true },
        ],
        careerProspects: [
          "Logistics Coordinator",
          "Supply Chain Analyst",
          "Warehouse Manager",
        ],
      },
      {
        id: createDegreeId("Diploma Marketing VUT"),
        name: "Diploma in Marketing",
        faculty: "Management Sciences",
        duration: "3 years",
        apsRequirement: 20,
        description:
          "Marketing and sales - 20 APS (Maths) / 21 APS (Math Lit/Tech Maths)",
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
        id: createDegreeId("Diploma Retail Business Management VUT"),
        name: "Diploma in Retail Business Management",
        faculty: "Management Sciences",
        duration: "3 years",
        apsRequirement: 20,
        description:
          "Retail business management - 20 APS (Maths) / 21 APS (Math Lit/Tech Maths)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 3, isRequired: true },
        ],
        careerProspects: [
          "Retail Manager",
          "Store Manager",
          "Merchandise Planner",
        ],
      },
      {
        id: createDegreeId("Diploma Sport Management VUT"),
        name: "Diploma in Sport Management",
        faculty: "Management Sciences",
        duration: "3 years",
        apsRequirement: 20,
        description:
          "Sport management and administration - 20 APS (Maths) / 21 APS (Math Lit/Tech Maths)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Life Orientation", level: 3, isRequired: false },
        ],
        careerProspects: [
          "Sport Manager",
          "Event Coordinator",
          "Fitness Manager",
        ],
      },
      {
        id: createDegreeId("Diploma Operations Management VUT"),
        name: "Diploma in Operations Management",
        faculty: "Management Sciences",
        duration: "3 years",
        apsRequirement: 23,
        description: "Operations management - 23 APS (Maths)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Operations Manager",
          "Production Supervisor",
          "Process Improvement Specialist",
        ],
      },
    ],
  },
];
