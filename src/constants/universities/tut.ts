import { Faculty } from "@/types/university";
import { createDegreeId, createFacultyId } from "./base";

// Tshwane University of Technology (TUT) - Faculty Data - Complete Update
export const TUT_FACULTIES: Faculty[] = [
  {
    id: createFacultyId("Faculty of Engineering and the Built Environment TUT"),
    name: "Faculty of Engineering & the Built Environment",
    description: "Engineering and construction technology programs",
    degrees: [
      {
        id: createDegreeId("Diploma Engineering Various Disciplines TUT"),
        name: "Diploma in Engineering (various disciplines)",
        faculty: "Engineering & the Built Environment",
        duration: "3 years",
        apsRequirement: 22,
        description:
          "Engineering diplomas requiring Maths & Physical Science Level 4+",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Physical Sciences", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Engineering Technician",
          "Technical Supervisor",
          "Project Coordinator",
        ],
      },
      {
        id: createDegreeId("Diploma Engineering Extended TUT"),
        name: "Diploma in Engineering (Extended Programme)",
        faculty: "Engineering & the Built Environment",
        duration: "4 years",
        apsRequirement: 24,
        description:
          "Extended engineering program requiring stronger subject levels",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Physical Sciences", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Engineering Technician",
          "Technical Supervisor",
          "Project Coordinator",
        ],
      },
      {
        id: createDegreeId("BEngTech TUT"),
        name: "Bachelor of Engineering Technology (BEngTech)",
        faculty: "Engineering & the Built Environment",
        duration: "4 years",
        apsRequirement: 28,
        description:
          "Engineering technology degree requiring stronger subject levels",
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
    id: createFacultyId(
      "Faculty of Information and Communication Technology TUT",
    ),
    name: "Faculty of Information & Communication Technology",
    description: "Computing and information technology programs",
    degrees: [
      {
        id: createDegreeId("Diploma ICT TUT"),
        name: "Diploma in ICT",
        faculty: "Information & Communication Technology",
        duration: "3 years",
        apsRequirement: 22,
        description:
          "ICT diploma requiring Maths Level 4; Math Lit often not accepted",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Information Technology", level: 3, isRequired: false },
        ],
        careerProspects: [
          "IT Technician",
          "Software Developer",
          "Network Administrator",
        ],
      },
      {
        id: createDegreeId("Diploma ICT Extended TUT"),
        name: "Diploma in ICT (Extended Programme)",
        faculty: "Information & Communication Technology",
        duration: "4 years",
        apsRequirement: 24,
        description: "Extended ICT program with foundational support",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Information Technology", level: 3, isRequired: false },
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
    id: createFacultyId("Faculty of Management Sciences TUT"),
    name: "Faculty of Management Sciences",
    description: "Business management and commercial programs",
    degrees: [
      {
        id: createDegreeId("Diploma Accounting TUT"),
        name: "Diploma in Accounting",
        faculty: "Management Sciences",
        duration: "3 years",
        apsRequirement: 20,
        description: "Accounting and financial management",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 3, isRequired: true },
        ],
        careerProspects: ["Accountant", "Bookkeeper", "Financial Clerk"],
      },
      {
        id: createDegreeId("Diploma Marketing TUT"),
        name: "Diploma in Marketing",
        faculty: "Management Sciences",
        duration: "3 years",
        apsRequirement: 20,
        description: "Marketing and sales management",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 3, isRequired: true },
        ],
        careerProspects: [
          "Marketing Coordinator",
          "Sales Representative",
          "Brand Assistant",
        ],
      },
      {
        id: createDegreeId("Diploma Public Finance TUT"),
        name: "Diploma in Public Finance",
        faculty: "Management Sciences",
        duration: "3 years",
        apsRequirement: 23,
        description: "Public finance management",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 3, isRequired: true },
        ],
        careerProspects: [
          "Public Finance Officer",
          "Government Accountant",
          "Municipal Finance Manager",
        ],
      },
      {
        id: createDegreeId("Diploma Sport Management TUT"),
        name: "Diploma in Sport Management",
        faculty: "Management Sciences",
        duration: "3 years",
        apsRequirement: 20,
        description: "Sports management and administration",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Life Orientation", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Sports Manager",
          "Sports Administrator",
          "Event Coordinator",
        ],
      },
      {
        id: createDegreeId("Higher Diploma Extended Specialised TUT"),
        name: "Higher Diploma (Extended or Specialised)",
        faculty: "Management Sciences",
        duration: "3 years",
        apsRequirement: 24,
        description: "Extended or specialised diploma programs",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 3, isRequired: true },
        ],
        careerProspects: [
          "Specialist Administrator",
          "Project Coordinator",
          "Technical Manager",
        ],
      },
    ],
  },
  {
    id: createFacultyId("Faculty of Arts Design Humanities TUT"),
    name: "Faculty of Arts, Design & Humanities",
    description: "Creative arts, design, and humanities programs",
    degrees: [
      {
        id: createDegreeId("Diploma Fine Applied Arts TUT"),
        name: "Diploma in Fine & Applied Arts",
        faculty: "Arts, Design & Humanities",
        duration: "3 years",
        apsRequirement: 20,
        description: "Fine and applied arts with portfolio requirements",
        subjects: [
          { name: "English", level: 3, isRequired: true },
          { name: "Visual Arts", level: 4, isRequired: true },
        ],
        careerProspects: ["Artist", "Art Teacher", "Gallery Assistant"],
      },
      {
        id: createDegreeId("Diploma Jewellery TUT"),
        name: "Diploma in Jewellery",
        faculty: "Arts, Design & Humanities",
        duration: "3 years",
        apsRequirement: 20,
        description:
          "Jewellery design and manufacturing with portfolio requirements",
        subjects: [
          { name: "English", level: 3, isRequired: true },
          { name: "Visual Arts", level: 4, isRequired: true },
        ],
        careerProspects: ["Jewellery Designer", "Jeweller", "Craft Artist"],
      },
      {
        id: createDegreeId("Diploma Performing Arts TUT"),
        name: "Diploma in Performing Arts",
        faculty: "Arts, Design & Humanities",
        duration: "3 years",
        apsRequirement: 20,
        description: "Performing arts with auditions or interviews",
        subjects: [
          { name: "English", level: 3, isRequired: true },
          { name: "Dramatic Arts", level: 4, isRequired: false },
        ],
        careerProspects: [
          "Performer",
          "Theatre Director",
          "Entertainment Coordinator",
        ],
      },
      {
        id: createDegreeId("Diploma Fashion Design TUT"),
        name: "Diploma in Fashion Design",
        faculty: "Arts, Design & Humanities",
        duration: "3 years",
        apsRequirement: 20,
        description: "Fashion design with portfolio requirements",
        subjects: [
          { name: "English", level: 3, isRequired: true },
          { name: "Visual Arts", level: 4, isRequired: true },
        ],
        careerProspects: ["Fashion Designer", "Pattern Maker", "Stylist"],
      },
      {
        id: createDegreeId("Bachelor Architecture TUT"),
        name: "Bachelor of Architecture",
        faculty: "Arts, Design & Humanities",
        duration: "5 years",
        apsRequirement: 25,
        description:
          "Architecture with strong entrance requirements in English & related subjects",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Visual Arts", level: 4, isRequired: false },
        ],
        careerProspects: ["Architect", "Urban Planner", "Design Consultant"],
      },
    ],
  },
  {
    id: createFacultyId("Faculty of Humanities Social Sciences TUT"),
    name: "Faculty of Humanities & Social Sciences",
    description: "Humanities and social science programs",
    degrees: [
      {
        id: createDegreeId("Bachelor Humanities Social Sciences TUT"),
        name: "Bachelor's degrees in Humanities & Social Sciences",
        faculty: "Humanities & Social Sciences",
        duration: "3 years",
        apsRequirement: 25,
        description:
          "Bachelor's degrees (≥25 APS, often 30+ APS preferred; English proficiency mandatory)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Life Orientation", level: 4, isRequired: false },
        ],
        careerProspects: ["Social Worker", "Researcher", "Community Developer"],
      },
    ],
  },
];
