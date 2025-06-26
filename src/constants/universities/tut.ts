import { Faculty } from "@/types/university";
import { createDegreeId, createFacultyId } from "./base";

// Tshwane University of Technology (TUT) - Faculty Data
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
        description: "Extended ICT program with higher requirements",
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
    description: "Business management and commerce programs",
    degrees: [
      {
        id: createDegreeId("Diploma Accounting TUT"),
        name: "Diploma in Accounting",
        faculty: "Management Sciences",
        duration: "3 years",
        apsRequirement: 20,
        description: "Accounting diploma subject dependent",
        subjects: [
          { name: "English", level: 3, isRequired: true },
          { name: "Mathematics", level: 3, isRequired: true },
          { name: "Mathematical Literacy", level: 4, isRequired: false },
        ],
        careerProspects: [
          "Accounting Clerk",
          "Bookkeeper",
          "Financial Assistant",
        ],
      },
      {
        id: createDegreeId("Diploma Marketing TUT"),
        name: "Diploma in Marketing",
        faculty: "Management Sciences",
        duration: "3 years",
        apsRequirement: 20,
        description: "Marketing diploma subject dependent",
        subjects: [
          { name: "English", level: 3, isRequired: true },
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
        id: createDegreeId("Diploma Public Finance TUT"),
        name: "Diploma in Public Finance",
        faculty: "Management Sciences",
        duration: "3 years",
        apsRequirement: 23,
        description: "Public finance diploma - extended or specialised",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 3, isRequired: true },
        ],
        careerProspects: [
          "Public Finance Officer",
          "Government Accountant",
          "Municipal Finance Clerk",
        ],
      },
      {
        id: createDegreeId("Diploma Sport Management TUT"),
        name: "Diploma in Sport Management",
        faculty: "Management Sciences",
        duration: "3 years",
        apsRequirement: 24,
        description: "Sport management diploma subject dependent",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Life Orientation", level: 4, isRequired: true },
          { name: "Mathematics", level: 3, isRequired: false },
        ],
        careerProspects: [
          "Sports Manager",
          "Sports Administrator",
          "Event Coordinator",
        ],
      },
    ],
  },
  {
    id: createFacultyId("Faculty of Arts Design and Humanities TUT"),
    name: "Faculty of Arts, Design & Humanities",
    description: "Creative arts, design, and humanities programs",
    degrees: [
      {
        id: createDegreeId("Diploma Fine Applied Arts TUT"),
        name: "Diploma in Fine & Applied Arts",
        faculty: "Arts, Design & Humanities",
        duration: "3 years",
        apsRequirement: 20,
        description:
          "Fine arts diploma with portfolio, auditions or interviews",
        subjects: [
          { name: "English", level: 3, isRequired: true },
          { name: "Visual Arts", level: 4, isRequired: true },
        ],
        careerProspects: ["Artist", "Graphic Designer", "Art Teacher"],
      },
      {
        id: createDegreeId("Diploma Jewellery TUT"),
        name: "Diploma in Jewellery",
        faculty: "Arts, Design & Humanities",
        duration: "3 years",
        apsRequirement: 20,
        description: "Jewellery design with portfolio requirements",
        subjects: [
          { name: "English", level: 3, isRequired: true },
          { name: "Visual Arts", level: 4, isRequired: true },
        ],
        careerProspects: ["Jewellery Designer", "Metalsmith", "Artisan"],
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
          { name: "Dramatic Arts", level: 4, isRequired: true },
        ],
        careerProspects: ["Performer", "Actor", "Theatre Director"],
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
        id: createDegreeId("Diploma Graphic Design TUT"),
        name: "Diploma in Graphic Design",
        faculty: "Arts, Design & Humanities",
        duration: "3 years",
        apsRequirement: 22,
        description: "Graphic design with portfolio requirements",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Visual Arts", level: 4, isRequired: true },
          { name: "Information Technology", level: 3, isRequired: false },
        ],
        careerProspects: [
          "Graphic Designer",
          "Web Designer",
          "Creative Director",
        ],
      },
      {
        id: createDegreeId("Bachelor of Architecture TUT"),
        name: "Bachelor of Architecture",
        faculty: "Arts, Design & Humanities",
        duration: "5 years",
        apsRequirement: 25,
        description:
          "Architecture degree with strong entrance requirements in English & related subjects",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Physical Sciences", level: 4, isRequired: false },
          { name: "Visual Arts", level: 4, isRequired: false },
        ],
        careerProspects: ["Architect", "Urban Planner", "Design Consultant"],
      },
    ],
  },
  {
    id: createFacultyId("Faculty of Humanities and Social Sciences TUT"),
    name: "Faculty of Humanities & Social Sciences",
    description: "Liberal arts and social sciences programs",
    degrees: [
      {
        id: createDegreeId("Bachelor Humanities Social Sciences TUT"),
        name: "Bachelor's degrees in Humanities & Social Sciences",
        faculty: "Humanities & Social Sciences",
        duration: "3 years",
        apsRequirement: 25,
        description:
          "Bachelor's degrees ≥25 APS, often 30+ APS preferred; English proficiency mandatory",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Life Orientation", level: 4, isRequired: false },
        ],
        careerProspects: ["Social Worker", "Researcher", "Community Developer"],
      },
      {
        id: createDegreeId("Bachelor Humanities Social Sciences Preferred TUT"),
        name: "Bachelor's degrees in Humanities & Social Sciences (Preferred Entry)",
        faculty: "Humanities & Social Sciences",
        duration: "3 years",
        apsRequirement: 30,
        description:
          "Preferred entry bachelor's degrees with higher APS requirements",
        subjects: [
          { name: "English", level: 5, isRequired: true },
          { name: "Life Orientation", level: 4, isRequired: false },
        ],
        careerProspects: [
          "Policy Analyst",
          "Research Specialist",
          "Social Development Officer",
        ],
      },
    ],
  },
];
