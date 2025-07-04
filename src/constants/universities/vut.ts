import { Faculty } from "@/types/university";
import { createDegreeId, createFacultyId } from "./base";

// Vaal University of Technology (VUT) - Faculty Data - Comprehensive Update
export const VUT_FACULTIES: Faculty[] = [
  {
    id: createFacultyId("Faculty of Applied Computer Sciences VUT"),
    name: "Faculty of Applied & Computer Sciences",
    description: "Applied sciences and computer technology programs",
    degrees: [
      {
        id: createDegreeId("Diploma Analytical Chemistry VUT"),
        name: "Diploma in Analytical Chemistry",
        faculty: "Applied & Computer Sciences",
        duration: "3 years",
        apsRequirement: 24,
        description: "Analytical chemistry (24 APS with Maths)",
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
        id: createDegreeId("Diploma Agricultural Management VUT"),
        name: "Diploma in Agricultural Management",
        faculty: "Applied & Computer Sciences",
        duration: "3 years",
        apsRequirement: 24,
        description:
          "Agricultural management (24 APS with Maths / 25 APS with Math Lit)",
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
        description: "Biotechnology and life sciences",
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
        id: createDegreeId("Diploma Information Technology VUT"),
        name: "Diploma in Information Technology",
        faculty: "Applied & Computer Sciences",
        duration: "3 years",
        apsRequirement: 24,
        description:
          "Information technology (24 APS with Maths or Tech Maths / 26 APS with Math Lit)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Information Technology", level: 4, isRequired: true },
        ],
        careerProspects: [
          "IT Specialist",
          "Software Developer",
          "Systems Administrator",
        ],
      },
      {
        id: createDegreeId("Diploma Environmental Science VUT"),
        name: "Diploma in Environmental Science",
        faculty: "Applied & Computer Sciences",
        duration: "3 years",
        apsRequirement: 21,
        description: "Environmental science and management (21 APS with Maths)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Life Sciences", level: 4, isRequired: true },
          { name: "Geography", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Environmental Scientist",
          "Conservation Officer",
          "Environmental Consultant",
        ],
      },
      {
        id: createDegreeId("Diploma NonDestructive Testing VUT"),
        name: "Diploma in Non-Destructive Testing",
        faculty: "Applied & Computer Sciences",
        duration: "3 years",
        apsRequirement: 19,
        description: "Non-destructive testing technology",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Physical Sciences", level: 4, isRequired: true },
        ],
        careerProspects: [
          "NDT Technician",
          "Quality Control Inspector",
          "Materials Testing Specialist",
        ],
      },
    ],
  },
  {
    id: createFacultyId("Faculty of Engineering Technology VUT"),
    name: "Faculty of Engineering & Technology",
    description: "Engineering and technical programs",
    degrees: [
      {
        id: createDegreeId("Diploma Chemical Engineering VUT"),
        name: "Diploma in Chemical Engineering",
        faculty: "Engineering & Technology",
        duration: "3 years",
        apsRequirement: 24,
        description:
          "Chemical engineering technology (All engineering diplomas require 24 APS with Maths)",
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
        id: createDegreeId("Diploma Civil Engineering VUT"),
        name: "Diploma in Civil Engineering",
        faculty: "Engineering & Technology",
        duration: "3 years",
        apsRequirement: 24,
        description:
          "Civil engineering technology (All engineering diplomas require 24 APS with Maths)",
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
        id: createDegreeId("Diploma Electronic Engineering VUT"),
        name: "Diploma in Electronic Engineering",
        faculty: "Engineering & Technology",
        duration: "3 years",
        apsRequirement: 24,
        description:
          "Electronic engineering technology (All engineering diplomas require 24 APS with Maths)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Physical Sciences", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Electronic Engineering Technician",
          "Electronics Designer",
          "Instrumentation Specialist",
        ],
      },
      {
        id: createDegreeId("Diploma Power Engineering VUT"),
        name: "Diploma in Power Engineering",
        faculty: "Engineering & Technology",
        duration: "3 years",
        apsRequirement: 24,
        description:
          "Power engineering technology (All engineering diplomas require 24 APS with Maths)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Physical Sciences", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Power Engineering Technician",
          "Electrical Technologist",
          "Power Systems Specialist",
        ],
      },
      {
        id: createDegreeId("Diploma Process Control Engineering VUT"),
        name: "Diploma in Process Control Engineering",
        faculty: "Engineering & Technology",
        duration: "3 years",
        apsRequirement: 24,
        description:
          "Process control engineering technology (All engineering diplomas require 24 APS with Maths)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Physical Sciences", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Process Control Technician",
          "Automation Specialist",
          "Control Systems Engineer",
        ],
      },
      {
        id: createDegreeId("Diploma Computer Systems Engineering VUT"),
        name: "Diploma in Computer Systems Engineering",
        faculty: "Engineering & Technology",
        duration: "3 years",
        apsRequirement: 24,
        description:
          "Computer systems engineering technology (All engineering diplomas require 24 APS with Maths)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Physical Sciences", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Computer Systems Technician",
          "Network Engineer",
          "Systems Analyst",
        ],
      },
      {
        id: createDegreeId("Diploma Industrial Engineering VUT"),
        name: "Diploma in Industrial Engineering",
        faculty: "Engineering & Technology",
        duration: "3 years",
        apsRequirement: 24,
        description:
          "Industrial engineering technology (All engineering diplomas require 24 APS with Maths)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Physical Sciences", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Industrial Engineering Technician",
          "Operations Coordinator",
          "Quality Engineer",
        ],
      },
      {
        id: createDegreeId("Diploma Mechanical Engineering VUT"),
        name: "Diploma in Mechanical Engineering",
        faculty: "Engineering & Technology",
        duration: "3 years",
        apsRequirement: 24,
        description:
          "Mechanical engineering technology (All engineering diplomas require 24 APS with Maths)",
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
        id: createDegreeId("Diploma Metallurgical Engineering VUT"),
        name: "Diploma in Metallurgical Engineering",
        faculty: "Engineering & Technology",
        duration: "3 years",
        apsRequirement: 24,
        description:
          "Metallurgical engineering technology (All engineering diplomas require 24 APS with Maths)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Physical Sciences", level: 5, isRequired: true },
        ],
        careerProspects: [
          "Metallurgical Technician",
          "Materials Engineer",
          "Mining Technologist",
        ],
      },
      {
        id: createDegreeId("Extended Engineering Courses VUT"),
        name: "Extended Engineering Courses",
        faculty: "Engineering & Technology",
        duration: "4 years",
        apsRequirement: 22,
        description:
          "Extended engineering programs (Extended courses require 22 APS)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Physical Sciences", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Engineering Technician",
          "Technical Officer",
          "Project Assistant",
        ],
      },
    ],
  },
  {
    id: createFacultyId("Faculty of Human Sciences VUT"),
    name: "Faculty of Human Sciences",
    description: "Human sciences, arts, and design programs",
    degrees: [
      {
        id: createDegreeId("Diploma Fashion VUT"),
        name: "Diploma in Fashion",
        faculty: "Human Sciences",
        duration: "3 years",
        apsRequirement: 21,
        description:
          "Fashion design and merchandising (21 APS with Maths / 22 APS with Math Lit/Tech Maths)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Visual Arts", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Fashion Designer",
          "Fashion Merchandiser",
          "Textile Designer",
        ],
      },
      {
        id: createDegreeId("Diploma Photography VUT"),
        name: "Diploma in Photography",
        faculty: "Human Sciences",
        duration: "3 years",
        apsRequirement: 21,
        description:
          "Photography and visual arts (21 APS / 22 APS with Math Lit/Tech Maths)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Visual Arts", level: 4, isRequired: true },
        ],
        careerProspects: ["Photographer", "Visual Artist", "Media Specialist"],
      },
      {
        id: createDegreeId("Diploma Graphic Design VUT"),
        name: "Diploma in Graphic Design",
        faculty: "Human Sciences",
        duration: "3 years",
        apsRequirement: 21,
        description:
          "Graphic design and visual communication (21 APS / 22 APS with Math Lit/Tech Maths)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Visual Arts", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Graphic Designer",
          "Visual Communication Designer",
          "Creative Director",
        ],
      },
      {
        id: createDegreeId("Diploma Fine Art VUT"),
        name: "Diploma in Fine Art",
        faculty: "Human Sciences",
        duration: "3 years",
        apsRequirement: 21,
        description:
          "Fine art and visual arts (21 APS / 22 APS with Math Lit/Tech Maths)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Visual Arts", level: 4, isRequired: true },
        ],
        careerProspects: ["Artist", "Art Teacher", "Art Therapist"],
      },
      {
        id: createDegreeId("Diploma Food Service Management VUT"),
        name: "Diploma in Food Service Management",
        faculty: "Human Sciences",
        duration: "3 years",
        apsRequirement: 21,
        description:
          "Food service and hospitality management (21 APS with Maths / 22 APS with Math Lit/Tech Maths)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Consumer Studies", level: 4, isRequired: true },
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
          "Tourism management and hospitality (21 APS with Maths / 22 APS with Math Lit/Tech Maths)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Geography", level: 4, isRequired: true },
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
          "Ecotourism and sustainable tourism management (21 APS with Maths / 22 APS with Math Lit/Tech Maths)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Geography", level: 4, isRequired: true },
          { name: "Life Sciences", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Ecotourism Manager",
          "Conservation Tourism Specialist",
          "Sustainable Tourism Coordinator",
        ],
      },
      {
        id: createDegreeId("Diploma Public Relations VUT"),
        name: "Diploma in Public Relations",
        faculty: "Human Sciences",
        duration: "3 years",
        apsRequirement: 21,
        description:
          "Public relations and communications (21 APS with Maths / 22 APS with Math Lit/Tech Maths)",
        subjects: [
          { name: "English", level: 5, isRequired: true },
          { name: "Life Orientation", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Public Relations Officer",
          "Communications Specialist",
          "Media Liaison",
        ],
      },
      {
        id: createDegreeId("Diploma Legal Assistance VUT"),
        name: "Diploma in Legal Assistance",
        faculty: "Human Sciences",
        duration: "3 years",
        apsRequirement: 23,
        description:
          "Legal assistance and paralegal work (23 APS with Maths / 24 APS with Math Lit/Tech Maths)",
        subjects: [
          { name: "English", level: 5, isRequired: true },
          { name: "Life Orientation", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Paralegal",
          "Legal Assistant",
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
          "Labour law and industrial relations (23 APS with Maths / 24 APS with Math Lit/Tech Maths)",
        subjects: [
          { name: "English", level: 5, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Labour Law Specialist",
          "Industrial Relations Officer",
          "HR Legal Advisor",
        ],
      },
      {
        id: createDegreeId("Diploma Policing VUT"),
        name: "Diploma in Policing",
        faculty: "Human Sciences",
        duration: "3 years",
        apsRequirement: 21,
        description:
          "Police science and law enforcement (21 APS with Maths / 22 APS with Math Lit/Tech Maths)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Life Orientation", level: 4, isRequired: true },
        ],
        careerProspects: ["Police Officer", "Detective", "Security Manager"],
      },
      {
        id: createDegreeId("Diploma Safety Management VUT"),
        name: "Diploma in Safety Management",
        faculty: "Human Sciences",
        duration: "3 years",
        apsRequirement: 21,
        description:
          "Safety management and occupational health (21 APS with Maths / 22 APS with Math Lit/Tech Maths)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Safety Manager",
          "Health and Safety Officer",
          "Risk Assessment Specialist",
        ],
      },
      {
        id: createDegreeId("BEd Senior Phase FET Teaching VUT"),
        name: "BEd (Senior Phase & FET teaching)",
        faculty: "Human Sciences",
        duration: "4 years",
        apsRequirement: 22,
        description:
          "Senior phase and FET teaching (22 APS with Maths / 24 APS with Math Lit)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
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
    id: createFacultyId("Faculty of Management Sciences VUT"),
    name: "Faculty of Management Sciences",
    description: "Management, business, and administrative programs",
    degrees: [
      {
        id: createDegreeId("Diploma Financial Info Systems VUT"),
        name: "Diploma in Financial Info Systems",
        faculty: "Management Sciences",
        duration: "3 years",
        apsRequirement: 20,
        description:
          "Financial information systems (20 APS with Maths / 22 APS with Math Lit/Tech Maths)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Financial Systems Analyst",
          "Information Systems Officer",
          "Financial Technician",
        ],
      },
      {
        id: createDegreeId("Diploma Cost Management Accounting VUT"),
        name: "Diploma in Cost & Management Accounting",
        faculty: "Management Sciences",
        duration: "3 years",
        apsRequirement: 20,
        description:
          "Cost and management accounting (20 APS with Maths / 22 APS with Math Lit/Tech Maths)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Accounting", level: 4, isRequired: true },
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
          "Internal auditing and compliance (20 APS with Maths / 23 APS with Math Lit/Tech Maths)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Accounting", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Internal Auditor",
          "Compliance Officer",
          "Risk Analyst",
        ],
      },
      {
        id: createDegreeId("Diploma Human Resources Management VUT"),
        name: "Diploma in Human Resources Management",
        faculty: "Management Sciences",
        duration: "3 years",
        apsRequirement: 20,
        description:
          "Human resources management (20 APS with Maths / 21 APS with Math Lit/Tech Maths)",
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
        id: createDegreeId("Diploma Logistics Supply Chain Management VUT"),
        name: "Diploma in Logistics & Supply Chain Management",
        faculty: "Management Sciences",
        duration: "3 years",
        apsRequirement: 20,
        description:
          "Logistics and supply chain management (20 APS with Maths / 21 APS with Math Lit/Tech Maths)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Logistics Manager",
          "Supply Chain Coordinator",
          "Operations Manager",
        ],
      },
      {
        id: createDegreeId("Diploma Marketing VUT"),
        name: "Diploma in Marketing",
        faculty: "Management Sciences",
        duration: "3 years",
        apsRequirement: 20,
        description:
          "Marketing and business promotion (20 APS with Maths / 21 APS with Math Lit/Tech Maths)",
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
        id: createDegreeId("Diploma Retail Business Management VUT"),
        name: "Diploma in Retail Business Management",
        faculty: "Management Sciences",
        duration: "3 years",
        apsRequirement: 20,
        description:
          "Retail business and management (20 APS with Maths / 21 APS with Math Lit/Tech Maths)",
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
      {
        id: createDegreeId("Diploma Sport Management VUT"),
        name: "Diploma in Sport Management",
        faculty: "Management Sciences",
        duration: "3 years",
        apsRequirement: 20,
        description:
          "Sports management and administration (20 APS with Maths / 21 APS with Math Lit/Tech Maths)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Life Orientation", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Sports Manager",
          "Sports Administrator",
          "Recreation Coordinator",
        ],
      },
      {
        id: createDegreeId("Diploma Operations Management VUT"),
        name: "Diploma in Operations Management",
        faculty: "Management Sciences",
        duration: "3 years",
        apsRequirement: 23,
        description: "Operations management (23 APS with Maths)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Operations Manager",
          "Process Coordinator",
          "Business Analyst",
        ],
      },
    ],
  },
];
