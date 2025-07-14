import { Faculty } from "@/types/university";
import { createDegreeId, createFacultyId } from "./base";

// Tshwane University of Technology (TUT) - Faculty Data - Comprehensive Update
export const TUT_FACULTIES: Faculty[] = [
  {
    id: createFacultyId("Faculty of Engineering Built Environment TUT"),
    name: "Faculty of Engineering & the Built Environment",
    description: "Engineering and construction programs",
    degrees: [
      {
        id: createDegreeId("Diploma Engineering Various TUT"),
        name: "Diploma in Engineering (various disciplines)",
        faculty: "Engineering & the Built Environment",
        duration: "3 years",
        apsRequirement: 22,
        description:
          "Engineering in various disciplines (22–24 APS, requires Maths & Physical Science Level 4+)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Physical Sciences", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Engineering Technician",
          "Technical Officer",
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
          "Engineering technology degree (28–30 APS, requires stronger subject levels)",
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
    id: createFacultyId("Faculty of Information Communication Technology TUT"),
    name: "Faculty of Information & Communication Technology",
    description: "Information and communication technology programs",
    degrees: [
      {
        id: createDegreeId("Diploma ICT TUT"),
        name: "Diploma in ICT",
        faculty: "Information & Communication Technology",
        duration: "3 years",
        apsRequirement: 22,
        description:
          "Information and communication technology (22–24 APS, requires Maths Level 4; Math Lit often not accepted)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Information Technology", level: 4, isRequired: true },
        ],
        careerProspects: [
          "ICT Technician",
          "Software Developer",
          "Systems Administrator",
        ],
      },
    ],
  },
  {
    id: createFacultyId("Faculty of Management Sciences TUT"),
    name: "Faculty of Management Sciences",
    description: "Management, business, and administrative programs",
    degrees: [
      {
        id: createDegreeId("Diploma Accounting TUT"),
        name: "Diploma in Accounting",
        faculty: "Management Sciences",
        duration: "3 years",
        apsRequirement: 20,
        description:
          "Accounting and financial management (20–24 APS, subject dependent)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Accounting", level: 4, isRequired: true },
        ],
        careerProspects: ["Accountant", "Bookkeeper", "Financial Assistant"],
      },
      {
        id: createDegreeId("Diploma Marketing TUT"),
        name: "Diploma in Marketing",
        faculty: "Management Sciences",
        duration: "3 years",
        apsRequirement: 20,
        description:
          "Marketing and business promotion (20–24 APS, subject dependent)",
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
        id: createDegreeId("Diploma Public Finance TUT"),
        name: "Diploma in Public Finance",
        faculty: "Management Sciences",
        duration: "3 years",
        apsRequirement: 23,
        description:
          "Public finance management (Higher APS for extended or specialised diplomas)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Public Finance Officer",
          "Government Accountant",
          "Budget Analyst",
        ],
      },
      {
        id: createDegreeId("Diploma Sport Management TUT"),
        name: "Diploma in Sport Management",
        faculty: "Management Sciences",
        duration: "3 years",
        apsRequirement: 20,
        description:
          "Sports management and administration (20–24 APS, subject dependent)",
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
    ],
  },
  {
    id: createFacultyId("Faculty of Arts Design Humanities TUT"),
    name: "Faculty of Arts, Design & Humanities",
    description: "Arts, design, and creative programs",
    degrees: [
      {
        id: createDegreeId("Diploma Fine Applied Arts TUT"),
        name: "Diploma in Fine & Applied Arts",
        faculty: "Arts, Design & Humanities",
        duration: "3 years",
        apsRequirement: 20,
        description:
          "Fine and applied arts (20–22 APS, plus portfolio, auditions or interviews)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Visual Arts", level: 4, isRequired: true },
        ],
        careerProspects: ["Artist", "Art Teacher", "Creative Designer"],
      },
      {
        id: createDegreeId("Diploma Jewellery TUT"),
        name: "Diploma in Jewellery",
        faculty: "Arts, Design & Humanities",
        duration: "3 years",
        apsRequirement: 20,
        description:
          "Jewellery design and manufacturing (20–22 APS, plus portfolio, auditions or interviews)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Visual Arts", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Jewellery Designer",
          "Goldsmith",
          "Jewellery Manufacturer",
        ],
      },
      {
        id: createDegreeId("Diploma Performing Arts TUT"),
        name: "Diploma in Performing Arts",
        faculty: "Arts, Design & Humanities",
        duration: "3 years",
        apsRequirement: 20,
        description:
          "Performing arts (20–22 APS, plus portfolio, auditions or interviews)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
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
        description:
          "Fashion design and merchandising (20–22 APS, plus portfolio, auditions or interviews)",
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
        id: createDegreeId("Bachelor Architecture TUT"),
        name: "Bachelor of Architecture",
        faculty: "Arts, Design & Humanities",
        duration: "5 years",
        apsRequirement: 25,
        description:
          "Professional architecture qualification (25 APS, with strong entrance requirements in English & related subjects)",
        subjects: [
          { name: "English", level: 5, isRequired: true },
          { name: "Mathematics", level: 5, isRequired: true },
          { name: "Visual Arts", level: 4, isRequired: true },
        ],
        careerProspects: ["Architect", "Urban Planner", "Building Designer"],
      },
    ],
  },
  {
    id: createFacultyId("Faculty of Humanities Social Sciences TUT"),
    name: "Faculty of Humanities & Social Sciences",
    description: "Humanities and social science programs",
    degrees: [
      {
        id: createDegreeId("Bachelor Degree TUT"),
        name: "Bachelor's degrees",
        faculty: "Humanities & Social Sciences",
        duration: "3 years",
        apsRequirement: 25,
        description:
          "General bachelor's degrees (≥25 APS, often 30+ APS preferred; English proficiency mandatory)",
        subjects: [
          { name: "English", level: 5, isRequired: true },
          { name: "Home Language", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Professional",
          "Government Official",
          "Social Worker",
        ],
      },
    ],
  },
];
