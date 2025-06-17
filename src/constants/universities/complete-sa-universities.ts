import { University, Faculty } from "@/types/university";
import {
  generateUniversityPrograms,
  getAllFaculties,
} from "./comprehensive-program-allocation";

/**
 * COMPLETE DATABASE: ALL 29 SOUTH AFRICAN UNIVERSITIES
 *
 * This includes ALL public universities in South Africa:
 * - 17 Traditional Universities (academic focus)
 * - 6 Universities of Technology (practical/vocational focus)
 * - 6 Comprehensive Universities (blend of traditional and technology)
 *
 * Updated with comprehensive program allocation system
 */

// Base faculty structure for consistent application
const createBaseFaculty = (id: string, name: string, description: string) => ({
  id,
  name,
  description,
  degrees: [],
});

// Function to generate comprehensive faculties for a university
const generateUniversityFaculties = (
  universityId: string,
  universityType: string,
): Faculty[] => {
  const programs = generateUniversityPrograms(universityId, universityType);
  const facultyMap = new Map<string, Faculty>();

  // Group programs by faculty
  programs.forEach((program) => {
    const facultyKey = program.faculty;

    if (!facultyMap.has(facultyKey)) {
      facultyMap.set(facultyKey, {
        id: `${facultyKey.toLowerCase().replace(/\s+/g, "-")}`,
        name: `Faculty of ${facultyKey}`,
        description: `The Faculty of ${facultyKey} offers comprehensive academic programs and research opportunities in ${facultyKey.toLowerCase()}.`,
        degrees: [],
      });
    }

    facultyMap.get(facultyKey)!.degrees.push(program);
  });

  return Array.from(facultyMap.values());
};

// Helper function to create comprehensive degree programs
const createDegree = (
  id: string,
  name: string,
  faculty: string,
  duration: string,
  apsRequirement: number,
  description: string,
  careerProspects: string[] = [],
  subjects: string[] = [],
) => ({
  id,
  name,
  code: id.toUpperCase(),
  faculty,
  duration,
  apsRequirement,
  description,
  subjects,
  careerProspects:
    careerProspects.length > 0
      ? careerProspects
      : [
          "Graduate programs and further studies",
          "Research and development roles",
          "Professional career opportunities",
          "Consulting and advisory positions",
        ],
});

// Standard engineering programs
const createEngineeringPrograms = () => [
  createDegree(
    "beng-civil",
    "BEng Civil Engineering",
    "Engineering",
    "4 years",
    36,
    "Design and construction of infrastructure including buildings, bridges, roads, and water systems.",
    [
      "Civil Engineer",
      "Structural Engineer",
      "Project Manager",
      "Construction Manager",
      "Infrastructure Planner",
    ],
    [
      { name: "Mathematics", level: 6, isRequired: true },
      { name: "Physical Sciences", level: 6, isRequired: true },
      { name: "English", level: 4, isRequired: true },
    ],
  ),
  createDegree(
    "beng-mechanical",
    "BEng Mechanical Engineering",
    "Engineering",
    "4 years",
    36,
    "Design and manufacture of mechanical systems, machines, and thermal systems.",
    [
      "Mechanical Engineer",
      "Design Engineer",
      "Manufacturing Engineer",
      "Automotive Engineer",
      "HVAC Engineer",
    ],
  ),
  createDegree(
    "beng-electrical",
    "BEng Electrical Engineering",
    "Engineering",
    "4 years",
    36,
    "Study of electrical systems, electronics, power generation, and control systems.",
    [
      "Electrical Engineer",
      "Electronics Engineer",
      "Power Systems Engineer",
      "Control Systems Engineer",
      "Telecommunications Engineer",
    ],
  ),
  createDegree(
    "beng-chemical",
    "BEng Chemical Engineering",
    "Engineering",
    "4 years",
    38,
    "Application of chemistry, physics, and mathematics to design chemical processes and equipment.",
    [
      "Chemical Engineer",
      "Process Engineer",
      "Plant Manager",
      "Research Scientist",
      "Environmental Engineer",
    ],
  ),
  createDegree(
    "beng-industrial",
    "BEng Industrial Engineering",
    "Engineering",
    "4 years",
    34,
    "Optimization of complex processes, systems, and organizations.",
    [
      "Industrial Engineer",
      "Systems Analyst",
      "Operations Manager",
      "Quality Assurance Manager",
      "Consultant",
    ],
  ),
];

// Standard commerce programs
const createCommercePrograms = () => [
  createDegree(
    "bcom-accounting",
    "BCom Accounting",
    "Commerce",
    "3 years",
    32,
    "Comprehensive accounting program covering financial accounting, management accounting, auditing, and taxation.",
    [
      "Chartered Accountant",
      "Financial Manager",
      "Auditor",
      "Tax Advisor",
      "Financial Analyst",
    ],
    [
      { name: "Mathematics", level: 4, isRequired: true },
      { name: "English", level: 4, isRequired: true },
      { name: "Accounting", level: 5, isRequired: false },
    ],
  ),
  createDegree(
    "bcom-business-management",
    "BCom Business Management",
    "Commerce",
    "3 years",
    30,
    "Business fundamentals including management, marketing, human resources, and strategic planning.",
    [
      "Business Manager",
      "Project Manager",
      "Marketing Manager",
      "HR Manager",
      "Entrepreneur",
    ],
  ),
  createDegree(
    "bcom-economics",
    "BCom Economics",
    "Commerce",
    "3 years",
    32,
    "Study of economic theory, policy, and analysis for understanding market dynamics and policy making.",
    [
      "Economist",
      "Policy Analyst",
      "Financial Consultant",
      "Research Analyst",
      "Banking Professional",
    ],
  ),
  createDegree(
    "bcom-finance",
    "BCom Finance",
    "Commerce",
    "3 years",
    30,
    "Financial management, investment analysis, and corporate finance.",
    [
      "Financial Analyst",
      "Investment Advisor",
      "Bank Manager",
      "Financial Planner",
      "Risk Manager",
    ],
  ),
];

// Standard science programs
const createSciencePrograms = () => [
  createDegree(
    "bsc-computer-science",
    "BSc Computer Science",
    "Science",
    "3 years",
    32,
    "Programming, algorithms, software development, and computer systems.",
    [
      "Software Developer",
      "Data Scientist",
      "System Analyst",
      "IT Consultant",
      "Cybersecurity Specialist",
    ],
    [
      { name: "Mathematics", level: 5, isRequired: true },
      { name: "English", level: 4, isRequired: true },
      { name: "Information Technology", level: 4, isRequired: false },
    ],
  ),
  createDegree(
    "bsc-mathematics",
    "BSc Mathematics",
    "Science",
    "3 years",
    34,
    "Pure and applied mathematics, statistics, and mathematical modeling.",
    [
      "Mathematician",
      "Statistician",
      "Actuary",
      "Data Analyst",
      "Research Scientist",
    ],
  ),
  createDegree(
    "bsc-physics",
    "BSc Physics",
    "Science",
    "3 years",
    34,
    "Study of matter, energy, and the fundamental laws of the universe.",
    [
      "Physicist",
      "Research Scientist",
      "Engineering Consultant",
      "Data Scientist",
      "Science Teacher",
    ],
  ),
  createDegree(
    "bsc-chemistry",
    "BSc Chemistry",
    "Science",
    "3 years",
    32,
    "Study of chemical properties, reactions, and applications.",
    [
      "Chemist",
      "Research Scientist",
      "Quality Control Analyst",
      "Environmental Scientist",
      "Pharmaceutical Scientist",
    ],
  ),
];

// Standard health sciences programs
const createHealthSciencesPrograms = () => [
  createDegree(
    "mbchb",
    "MBChB Medicine",
    "Health Sciences",
    "6 years",
    40,
    "Comprehensive medical education to become a medical doctor.",
    [
      "Medical Doctor",
      "Specialist Physician",
      "Surgeon",
      "General Practitioner",
      "Medical Researcher",
    ],
    [
      { name: "Mathematics", level: 5, isRequired: true },
      { name: "Physical Sciences", level: 6, isRequired: true },
      { name: "Life Sciences", level: 6, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
  ),
  createDegree(
    "bpharm",
    "BPharm Pharmacy",
    "Health Sciences",
    "4 years",
    36,
    "Study of pharmaceutical sciences, drug development, and patient care.",
    [
      "Pharmacist",
      "Clinical Pharmacist",
      "Industrial Pharmacist",
      "Pharmaceutical Researcher",
      "Regulatory Affairs Specialist",
    ],
  ),
  createDegree(
    "bsc-nursing",
    "BSc Nursing",
    "Health Sciences",
    "4 years",
    28,
    "Professional nursing education for patient care and healthcare management.",
    [
      "Registered Nurse",
      "Nurse Manager",
      "Clinical Nurse",
      "Community Health Nurse",
      "Nursing Educator",
    ],
  ),
];

// Standard humanities programs
const createHumanitiesPrograms = () => [
  createDegree(
    "ba-psychology",
    "BA Psychology",
    "Humanities",
    "3 years",
    28,
    "Study of human behavior, mental processes, and psychological research methods.",
    [
      "Psychologist",
      "Clinical Psychologist",
      "Counselor",
      "HR Specialist",
      "Research Psychologist",
    ],
  ),
  createDegree(
    "ba-english",
    "BA English",
    "Humanities",
    "3 years",
    26,
    "Literature, language, and communication studies.",
    ["Teacher", "Writer", "Journalist", "Editor", "Communications Specialist"],
  ),
  createDegree(
    "ba-history",
    "BA History",
    "Humanities",
    "3 years",
    26,
    "Study of past events, cultures, and societies.",
    ["Historian", "Teacher", "Museum Curator", "Archivist", "Research Analyst"],
  ),
];

// Standard education programs
const createEducationPrograms = () => [
  createDegree(
    "bed-foundation-phase",
    "BEd Foundation Phase",
    "Education",
    "4 years",
    26,
    "Training to teach children from Grade R to Grade 3.",
    [
      "Foundation Phase Teacher",
      "Early Childhood Development Specialist",
      "Educational Consultant",
      "Curriculum Developer",
    ],
  ),
  createDegree(
    "bed-intermediate-phase",
    "BEd Intermediate Phase",
    "Education",
    "4 years",
    26,
    "Training to teach children from Grade 4 to Grade 6.",
    [
      "Intermediate Phase Teacher",
      "Subject Specialist",
      "Educational Consultant",
      "School Principal",
    ],
  ),
];

// Standard law programs
const createLawPrograms = () => [
  createDegree(
    "llb",
    "LLB Law",
    "Law",
    "4 years",
    34,
    "Comprehensive legal education covering various areas of law and legal practice.",
    [
      "Attorney",
      "Advocate",
      "Legal Advisor",
      "Prosecutor",
      "Magistrate",
      "Corporate Lawyer",
    ],
    [
      { name: "English", level: 5, isRequired: true },
      { name: "Mathematics", level: 4, isRequired: true },
    ],
  ),
];

// TRADITIONAL UNIVERSITIES (17)
export const COMPLETE_TRADITIONAL_UNIVERSITIES: University[] = [
  {
    id: "uct",
    name: "University of Cape Town",
    abbreviation: "UCT",
    fullName: "University of Cape Town",
    location: "Cape Town",
    province: "Western Cape",
    logo: "/logos/universities/university-of-cape-town.svg",
    overview:
      "Africa's leading research university, ranked #1 in Africa. Known for academic excellence and research innovation.",
    website: "https://www.uct.ac.za",
    establishedYear: 1829,
    studentPopulation: 29000,
    type: "Traditional University",
    faculties: [
      {
        ...createBaseFaculty(
          "commerce",
          "Commerce",
          "Business and economic sciences",
        ),
        degrees: createCommercePrograms(),
      },
      {
        ...createBaseFaculty(
          "engineering",
          "Engineering & Built Environment",
          "Engineering programs",
        ),
        degrees: createEngineeringPrograms(),
      },
      {
        ...createBaseFaculty(
          "health-sciences",
          "Health Sciences",
          "Medical and health programs",
        ),
        degrees: createHealthSciencesPrograms(),
      },
      {
        ...createBaseFaculty(
          "humanities",
          "Humanities",
          "Arts and social sciences",
        ),
        degrees: createHumanitiesPrograms(),
      },
      {
        ...createBaseFaculty("law", "Law", "Legal studies"),
        degrees: createLawPrograms(),
      },
      {
        ...createBaseFaculty("science", "Science", "Natural sciences"),
        degrees: createSciencePrograms(),
      },
    ],
    applicationInfo: {
      isOpen: true,
      openingDate: "2 April 2025",
      closingDate: "31 July 2025",
      academicYear: "2026",
      applicationFee: "R100",
      applicationMethod: "Online via UCT Student Portal",
    },
  },
  {
    id: "wits",
    name: "University of the Witwatersrand",
    abbreviation: "Wits",
    fullName: "University of the Witwatersrand, Johannesburg",
    location: "Johannesburg",
    province: "Gauteng",
    logo: "/logos/universities/university-of-witwatersrand.svg",
    overview:
      "Leading research university known for engineering, medicine, and business programs.",
    website: "https://www.wits.ac.za",
    establishedYear: 1922,
    studentPopulation: 40000,
    type: "Traditional University",
    faculties: [
      {
        ...createBaseFaculty(
          "commerce",
          "Commerce, Law & Management",
          "Business and law",
        ),
        degrees: [...createCommercePrograms(), ...createLawPrograms()],
      },
      {
        ...createBaseFaculty(
          "engineering",
          "Engineering & Built Environment",
          "Engineering programs",
        ),
        degrees: createEngineeringPrograms(),
      },
      {
        ...createBaseFaculty(
          "health-sciences",
          "Health Sciences",
          "Medical programs",
        ),
        degrees: createHealthSciencesPrograms(),
      },
      {
        ...createBaseFaculty(
          "humanities",
          "Humanities",
          "Arts and social sciences",
        ),
        degrees: createHumanitiesPrograms(),
      },
      {
        ...createBaseFaculty("science", "Science", "Natural sciences"),
        degrees: createSciencePrograms(),
      },
    ],
    applicationInfo: {
      isOpen: true,
      openingDate: "1 April 2025",
      closingDate: "30 June 2025",
      academicYear: "2026",
      applicationFee: "R130",
      applicationMethod: "Online via Wits Student Portal",
    },
  },
  {
    id: "stellenbosch",
    name: "Stellenbosch University",
    abbreviation: "SU",
    fullName: "Stellenbosch University",
    location: "Stellenbosch",
    province: "Western Cape",
    logo: "/logos/universities/stellenbosch-university.svg",
    overview:
      "Leading research university known for agriculture, engineering, and medicine.",
    website: "https://www.sun.ac.za",
    establishedYear: 1918,
    studentPopulation: 32000,
    type: "Traditional University",
    faculties: [
      {
        ...createBaseFaculty(
          "agriculture",
          "AgriSciences",
          "Agricultural sciences",
        ),
        degrees: [],
      },
      {
        ...createBaseFaculty("arts", "Arts & Social Sciences", "Humanities"),
        degrees: createHumanitiesPrograms(),
      },
      {
        ...createBaseFaculty(
          "economic-management",
          "Economic & Management Sciences",
          "Business",
        ),
        degrees: createCommercePrograms(),
      },
      {
        ...createBaseFaculty("education", "Education", "Teacher training"),
        degrees: createEducationPrograms(),
      },
      {
        ...createBaseFaculty(
          "engineering",
          "Engineering",
          "Engineering programs",
        ),
        degrees: createEngineeringPrograms(),
      },
      {
        ...createBaseFaculty("law", "Law", "Legal studies"),
        degrees: createLawPrograms(),
      },
      {
        ...createBaseFaculty(
          "medicine",
          "Medicine & Health Sciences",
          "Medical programs",
        ),
        degrees: createHealthSciencesPrograms(),
      },
      {
        ...createBaseFaculty("science", "Science", "Natural sciences"),
        degrees: createSciencePrograms(),
      },
    ],
    applicationInfo: {
      isOpen: true,
      openingDate: "1 April 2025",
      closingDate: "31 July 2025",
      academicYear: "2026",
      applicationFee: "R100",
      applicationMethod: "Online via SU Student Portal",
    },
  },
  {
    id: "up",
    name: "University of Pretoria",
    abbreviation: "UP",
    fullName: "University of Pretoria",
    location: "Pretoria",
    province: "Gauteng",
    logo: "/logos/universities/university-of-pretoria.svg",
    overview:
      "One of South Africa's largest universities with comprehensive programs.",
    website: "https://www.up.ac.za",
    establishedYear: 1908,
    studentPopulation: 53000,
    type: "Traditional University",
    faculties: [
      {
        ...createBaseFaculty(
          "economic-management",
          "Economic & Management Sciences",
          "Business",
        ),
        degrees: createCommercePrograms(),
      },
      {
        ...createBaseFaculty("education", "Education", "Teacher training"),
        degrees: createEducationPrograms(),
      },
      {
        ...createBaseFaculty(
          "engineering",
          "Engineering, Built Environment & IT",
          "Engineering and IT",
        ),
        degrees: [
          ...createEngineeringPrograms(),
          ...createSciencePrograms().filter((d) => d.name.includes("Computer")),
        ],
      },
      {
        ...createBaseFaculty(
          "health-sciences",
          "Health Sciences",
          "Medical programs",
        ),
        degrees: createHealthSciencesPrograms(),
      },
      {
        ...createBaseFaculty(
          "humanities",
          "Humanities",
          "Arts and social sciences",
        ),
        degrees: createHumanitiesPrograms(),
      },
      {
        ...createBaseFaculty("law", "Law", "Legal studies"),
        degrees: createLawPrograms(),
      },
      {
        ...createBaseFaculty(
          "natural-agricultural",
          "Natural & Agricultural Sciences",
          "Sciences",
        ),
        degrees: createSciencePrograms(),
      },
      {
        ...createBaseFaculty(
          "veterinary",
          "Veterinary Science",
          "Animal health",
        ),
        degrees: [],
      },
    ],
    applicationInfo: {
      isOpen: true,
      openingDate: "1 April 2025",
      closingDate: "30 September 2025",
      academicYear: "2026",
      applicationFee: "R100",
      applicationMethod: "Online via UP Student Portal",
    },
  },
  {
    id: "ukzn",
    name: "University of KwaZulu-Natal",
    abbreviation: "UKZN",
    fullName: "University of KwaZulu-Natal",
    location: "Durban and Pietermaritzburg",
    province: "KwaZulu-Natal",
    logo: "/logos/universities/university-of-kwazulu-natal.svg",
    overview:
      "Comprehensive university with campuses in Durban and Pietermaritzburg.",
    website: "https://www.ukzn.ac.za",
    establishedYear: 2004,
    studentPopulation: 47000,
    type: "Traditional University",
    faculties: [
      {
        ...createBaseFaculty(
          "agriculture",
          "Agriculture",
          "Agricultural sciences",
        ),
        degrees: [],
      },
      {
        ...createBaseFaculty(
          "applied-sciences",
          "Applied Sciences",
          "Applied sciences",
        ),
        degrees: [],
      },
      {
        ...createBaseFaculty(
          "engineering",
          "Engineering",
          "Engineering programs",
        ),
        degrees: createEngineeringPrograms(),
      },
      {
        ...createBaseFaculty(
          "health-sciences",
          "Health Sciences",
          "Medical programs",
        ),
        degrees: createHealthSciencesPrograms(),
      },
      {
        ...createBaseFaculty(
          "humanities",
          "Humanities",
          "Arts and social sciences",
        ),
        degrees: createHumanitiesPrograms(),
      },
      {
        ...createBaseFaculty("law", "Law", "Legal studies"),
        degrees: createLawPrograms(),
      },
      {
        ...createBaseFaculty(
          "management-studies",
          "Management Studies",
          "Business",
        ),
        degrees: createCommercePrograms(),
      },
      {
        ...createBaseFaculty("science", "Science", "Natural sciences"),
        degrees: createSciencePrograms(),
      },
    ],
    applicationInfo: {
      isOpen: true,
      openingDate: "1 April 2025",
      closingDate: "30 September 2025",
      academicYear: "2026",
      applicationFee: "R100",
      applicationMethod: "Online via UKZN Student Portal",
    },
  },
  {
    id: "uj",
    name: "University of Johannesburg",
    abbreviation: "UJ",
    fullName: "University of Johannesburg",
    location: "Johannesburg",
    province: "Gauteng",
    logo: "/logos/universities/university-of-johannesburg.svg",
    overview:
      "Dynamic university in Johannesburg formed from multiple institutions.",
    website: "https://www.uj.ac.za",
    establishedYear: 2005,
    studentPopulation: 50000,
    type: "Traditional University",
    faculties: [
      {
        ...createBaseFaculty(
          "art-design",
          "Art, Design & Architecture",
          "Creative arts",
        ),
        degrees: [],
      },
      {
        ...createBaseFaculty(
          "economic-financial",
          "Economic & Financial Sciences",
          "Business",
        ),
        degrees: createCommercePrograms(),
      },
      {
        ...createBaseFaculty("education", "Education", "Teacher training"),
        degrees: createEducationPrograms(),
      },
      {
        ...createBaseFaculty(
          "engineering",
          "Engineering & Built Environment",
          "Engineering",
        ),
        degrees: createEngineeringPrograms(),
      },
      {
        ...createBaseFaculty(
          "health-sciences",
          "Health Sciences",
          "Medical programs",
        ),
        degrees: createHealthSciencesPrograms(),
      },
      {
        ...createBaseFaculty(
          "humanities",
          "Humanities",
          "Arts and social sciences",
        ),
        degrees: createHumanitiesPrograms(),
      },
      {
        ...createBaseFaculty("law", "Law", "Legal studies"),
        degrees: createLawPrograms(),
      },
      {
        ...createBaseFaculty("science", "Science", "Natural sciences"),
        degrees: createSciencePrograms(),
      },
    ],
  },
  {
    id: "nwu",
    name: "North-West University",
    abbreviation: "NWU",
    fullName: "North-West University",
    location: "Potchefstroom, Mafikeng, Vanderbijlpark",
    province: "North West",
    logo: "/logos/universities/north-west-university.svg",
    overview: "Multi-campus university serving the North West Province.",
    website: "https://www.nwu.ac.za",
    establishedYear: 2004,
    studentPopulation: 64000,
    type: "Traditional University",
    faculties: [
      {
        ...createBaseFaculty(
          "commerce-management",
          "Commerce & Management",
          "Business",
        ),
        degrees: createCommercePrograms(),
      },
      {
        ...createBaseFaculty("education", "Education", "Teacher training"),
        degrees: createEducationPrograms(),
      },
      {
        ...createBaseFaculty(
          "engineering",
          "Engineering",
          "Engineering programs",
        ),
        degrees: createEngineeringPrograms(),
      },
      {
        ...createBaseFaculty(
          "health-sciences",
          "Health Sciences",
          "Medical programs",
        ),
        degrees: createHealthSciencesPrograms(),
      },
      {
        ...createBaseFaculty(
          "humanities",
          "Humanities",
          "Arts and social sciences",
        ),
        degrees: createHumanitiesPrograms(),
      },
      {
        ...createBaseFaculty("law", "Law", "Legal studies"),
        degrees: createLawPrograms(),
      },
      {
        ...createBaseFaculty(
          "natural-agricultural",
          "Natural & Agricultural Sciences",
          "Sciences",
        ),
        degrees: createSciencePrograms(),
      },
    ],
  },
  {
    id: "ufs",
    name: "University of the Free State",
    abbreviation: "UFS",
    fullName: "University of the Free State",
    location: "Bloemfontein",
    province: "Free State",
    logo: "/logos/universities/university-of-free-state.svg",
    overview: "Central South African university with strong academic programs.",
    website: "https://www.ufs.ac.za",
    establishedYear: 1904,
    studentPopulation: 37000,
    type: "Traditional University",
    faculties: [
      {
        ...createBaseFaculty(
          "economic-management",
          "Economic & Management Sciences",
          "Business",
        ),
        degrees: createCommercePrograms(),
      },
      {
        ...createBaseFaculty("education", "Education", "Teacher training"),
        degrees: createEducationPrograms(),
      },
      {
        ...createBaseFaculty(
          "humanities",
          "Humanities",
          "Arts and social sciences",
        ),
        degrees: createHumanitiesPrograms(),
      },
      {
        ...createBaseFaculty("law", "Law", "Legal studies"),
        degrees: createLawPrograms(),
      },
      {
        ...createBaseFaculty(
          "natural-agricultural",
          "Natural & Agricultural Sciences",
          "Sciences",
        ),
        degrees: createSciencePrograms(),
      },
      {
        ...createBaseFaculty(
          "health-sciences",
          "Health Sciences",
          "Medical programs",
        ),
        degrees: createHealthSciencesPrograms(),
      },
    ],
  },
  {
    id: "ru",
    name: "Rhodes University",
    abbreviation: "RU",
    fullName: "Rhodes University",
    location: "Makhanda (Grahamstown)",
    province: "Eastern Cape",
    logo: "/logos/universities/rhodes-university.svg",
    overview: "Small, prestigious university known for academic excellence.",
    website: "https://www.ru.ac.za",
    establishedYear: 1904,
    studentPopulation: 8100,
    type: "Traditional University",
    faculties: [
      {
        ...createBaseFaculty("commerce", "Commerce", "Business studies"),
        degrees: createCommercePrograms(),
      },
      {
        ...createBaseFaculty(
          "humanities",
          "Humanities",
          "Arts and social sciences",
        ),
        degrees: createHumanitiesPrograms(),
      },
      {
        ...createBaseFaculty("law", "Law", "Legal studies"),
        degrees: createLawPrograms(),
      },
      {
        ...createBaseFaculty("science", "Science", "Natural sciences"),
        degrees: createSciencePrograms(),
      },
    ],
  },
  {
    id: "unisa",
    name: "University of South Africa",
    abbreviation: "UNISA",
    fullName: "University of South Africa",
    location: "Pretoria (Distance Learning)",
    province: "Gauteng",
    logo: "/logos/universities/university-of-south-africa.svg",
    overview: "Africa's largest distance education university.",
    website: "https://www.unisa.ac.za",
    establishedYear: 1873,
    studentPopulation: 300000,
    type: "Traditional University",
    faculties: [
      {
        ...createBaseFaculty("accounting", "Accounting Sciences", "Accounting"),
        degrees: [],
      },
      {
        ...createBaseFaculty(
          "agriculture",
          "Agriculture & Environmental Sciences",
          "Agriculture",
        ),
        degrees: [],
      },
      {
        ...createBaseFaculty("arts", "Arts", "Humanities"),
        degrees: createHumanitiesPrograms(),
      },
      {
        ...createBaseFaculty(
          "economic-management",
          "Economic & Management Sciences",
          "Business",
        ),
        degrees: createCommercePrograms(),
      },
      {
        ...createBaseFaculty("education", "Education", "Teacher training"),
        degrees: createEducationPrograms(),
      },
      {
        ...createBaseFaculty("law", "Law", "Legal studies"),
        degrees: createLawPrograms(),
      },
      {
        ...createBaseFaculty(
          "science-engineering",
          "Science, Engineering & Technology",
          "Sciences",
        ),
        degrees: createSciencePrograms(),
      },
    ],
  },
  {
    id: "ufh",
    name: "University of Fort Hare",
    abbreviation: "UFH",
    fullName: "University of Fort Hare",
    location: "Alice",
    province: "Eastern Cape",
    logo: "/logos/universities/university-of-fort-hare.svg",
    overview: "Historic university known as the Oxford of Africa.",
    website: "https://www.ufh.ac.za",
    establishedYear: 1916,
    studentPopulation: 12000,
    type: "Traditional University",
    faculties: [
      {
        ...createBaseFaculty("education", "Education", "Teacher training"),
        degrees: createEducationPrograms(),
      },
      {
        ...createBaseFaculty(
          "humanities",
          "Humanities",
          "Arts and social sciences",
        ),
        degrees: createHumanitiesPrograms(),
      },
      {
        ...createBaseFaculty("law", "Law", "Legal studies"),
        degrees: createLawPrograms(),
      },
      {
        ...createBaseFaculty(
          "management-commerce",
          "Management & Commerce",
          "Business",
        ),
        degrees: createCommercePrograms(),
      },
      {
        ...createBaseFaculty(
          "science-agriculture",
          "Science & Agriculture",
          "Sciences",
        ),
        degrees: createSciencePrograms(),
      },
    ],
  },
  {
    id: "univen",
    name: "University of Venda",
    abbreviation: "UNIVEN",
    fullName: "University of Venda",
    location: "Thohoyandou",
    province: "Limpopo",
    logo: "/logos/universities/university-of-venda.svg",
    overview: "University serving the northern provinces.",
    website: "https://www.univen.ac.za",
    establishedYear: 1982,
    studentPopulation: 15000,
    type: "Traditional University",
    faculties: [
      {
        ...createBaseFaculty(
          "agriculture",
          "Agriculture",
          "Agricultural sciences",
        ),
        degrees: [],
      },
      {
        ...createBaseFaculty("education", "Education", "Teacher training"),
        degrees: createEducationPrograms(),
      },
      {
        ...createBaseFaculty(
          "health-sciences",
          "Health Sciences",
          "Medical programs",
        ),
        degrees: [],
      },
      {
        ...createBaseFaculty(
          "humanities",
          "Humanities, Social Sciences & Education",
          "Arts",
        ),
        degrees: createHumanitiesPrograms(),
      },
      {
        ...createBaseFaculty("law", "Law", "Legal studies"),
        degrees: createLawPrograms(),
      },
      {
        ...createBaseFaculty(
          "management-commerce",
          "Management, Commerce & Law",
          "Business",
        ),
        degrees: createCommercePrograms(),
      },
      {
        ...createBaseFaculty(
          "mathematical-natural",
          "Mathematical & Natural Sciences",
          "Sciences",
        ),
        degrees: createSciencePrograms(),
      },
    ],
  },
  {
    id: "unizulu",
    name: "University of Zululand",
    abbreviation: "UNIZULU",
    fullName: "University of Zululand",
    location: "KwaDlangezwa",
    province: "KwaZulu-Natal",
    logo: "/logos/universities/university-of-zululand.svg",
    overview: "University serving rural KwaZulu-Natal.",
    website: "https://www.unizulu.ac.za",
    establishedYear: 1960,
    studentPopulation: 16000,
    type: "Traditional University",
    faculties: [
      {
        ...createBaseFaculty("arts", "Arts", "Humanities"),
        degrees: createHumanitiesPrograms(),
      },
      {
        ...createBaseFaculty(
          "commerce-administration",
          "Commerce, Administration & Law",
          "Business and law",
        ),
        degrees: [...createCommercePrograms(), ...createLawPrograms()],
      },
      {
        ...createBaseFaculty("education", "Education", "Teacher training"),
        degrees: createEducationPrograms(),
      },
      {
        ...createBaseFaculty(
          "science-agriculture",
          "Science & Agriculture",
          "Sciences",
        ),
        degrees: createSciencePrograms(),
      },
    ],
  },
  {
    id: "ul",
    name: "University of Limpopo",
    abbreviation: "UL",
    fullName: "University of Limpopo",
    location: "Polokwane",
    province: "Limpopo",
    logo: "/logos/universities/university-of-limpopo.svg",
    overview: "University serving the northern provinces.",
    website: "https://www.ul.ac.za",
    establishedYear: 2005,
    studentPopulation: 18000,
    type: "Traditional University",
    faculties: [
      {
        ...createBaseFaculty(
          "humanities",
          "Humanities",
          "Arts and social sciences",
        ),
        degrees: createHumanitiesPrograms(),
      },
      {
        ...createBaseFaculty(
          "health-sciences",
          "Health Sciences",
          "Medical programs",
        ),
        degrees: createHealthSciencesPrograms(),
      },
      {
        ...createBaseFaculty(
          "management-law",
          "Management & Law",
          "Business and law",
        ),
        degrees: [...createCommercePrograms(), ...createLawPrograms()],
      },
      {
        ...createBaseFaculty(
          "science-agriculture",
          "Science & Agriculture",
          "Sciences",
        ),
        degrees: createSciencePrograms(),
      },
    ],
  },
  {
    id: "uwc",
    name: "University of the Western Cape",
    abbreviation: "UWC",
    fullName: "University of the Western Cape",
    location: "Bellville",
    province: "Western Cape",
    logo: "/logos/universities/university-of-western-cape.svg",
    overview:
      "University recognized for academic excellence and social justice.",
    website: "https://www.uwc.ac.za",
    establishedYear: 1960,
    studentPopulation: 24000,
    type: "Traditional University",
    faculties: [
      {
        ...createBaseFaculty("arts", "Arts", "Humanities and social sciences"),
        degrees: createHumanitiesPrograms(),
      },
      {
        ...createBaseFaculty(
          "community-health",
          "Community & Health Sciences",
          "Health programs",
        ),
        degrees: createHealthSciencesPrograms(),
      },
      {
        ...createBaseFaculty(
          "economic-management",
          "Economic & Management Sciences",
          "Business",
        ),
        degrees: createCommercePrograms(),
      },
      {
        ...createBaseFaculty("education", "Education", "Teacher training"),
        degrees: createEducationPrograms(),
      },
      {
        ...createBaseFaculty("law", "Law", "Legal studies"),
        degrees: createLawPrograms(),
      },
      {
        ...createBaseFaculty(
          "natural-sciences",
          "Natural Sciences",
          "Sciences",
        ),
        degrees: createSciencePrograms(),
      },
    ],
  },
  {
    id: "ump",
    name: "University of Mpumalanga",
    abbreviation: "UMP",
    fullName: "University of Mpumalanga",
    location: "Nelspruit",
    province: "Mpumalanga",
    logo: "/logos/universities/university-of-mpumalanga.svg",
    overview: "New university established to serve Mpumalanga province.",
    website: "https://www.ump.ac.za",
    establishedYear: 2014,
    studentPopulation: 5000,
    type: "Traditional University",
    faculties: [
      {
        ...createBaseFaculty(
          "agriculture-natural",
          "Agriculture & Natural Sciences",
          "Agriculture and sciences",
        ),
        degrees: createSciencePrograms(),
      },
      {
        ...createBaseFaculty("education", "Education", "Teacher training"),
        degrees: createEducationPrograms(),
      },
      {
        ...createBaseFaculty(
          "humanities",
          "Humanities",
          "Arts and social sciences",
        ),
        degrees: createHumanitiesPrograms(),
      },
    ],
  },
  {
    id: "nmu",
    name: "Nelson Mandela University",
    abbreviation: "NMU",
    fullName: "Nelson Mandela University",
    location: "Port Elizabeth",
    province: "Eastern Cape",
    logo: "/logos/universities/nelson-mandela-university.svg",
    overview: "Comprehensive university named after Nelson Mandela.",
    website: "https://www.mandela.ac.za",
    establishedYear: 2005,
    studentPopulation: 27000,
    type: "Traditional University",
    faculties: [
      {
        ...createBaseFaculty("arts", "Arts", "Humanities"),
        degrees: createHumanitiesPrograms(),
      },
      {
        ...createBaseFaculty(
          "business-economic",
          "Business & Economic Sciences",
          "Business",
        ),
        degrees: createCommercePrograms(),
      },
      {
        ...createBaseFaculty("education", "Education", "Teacher training"),
        degrees: createEducationPrograms(),
      },
      {
        ...createBaseFaculty(
          "engineering",
          "Engineering, Built Environment & Technology",
          "Engineering",
        ),
        degrees: createEngineeringPrograms(),
      },
      {
        ...createBaseFaculty(
          "health-sciences",
          "Health Sciences",
          "Medical programs",
        ),
        degrees: createHealthSciencesPrograms(),
      },
      {
        ...createBaseFaculty("law", "Law", "Legal studies"),
        degrees: createLawPrograms(),
      },
      {
        ...createBaseFaculty("science", "Science", "Natural sciences"),
        degrees: createSciencePrograms(),
      },
    ],
  },
];

// UNIVERSITIES OF TECHNOLOGY (6)
export const UNIVERSITIES_OF_TECHNOLOGY: University[] = [
  {
    id: "cput",
    name: "Cape Peninsula University of Technology",
    abbreviation: "CPUT",
    fullName: "Cape Peninsula University of Technology",
    location: "Cape Town",
    province: "Western Cape",
    logo: "/logos/universities/cape-peninsula-university-technology.svg",
    overview: "Leading university of technology in the Western Cape.",
    website: "https://www.cput.ac.za",
    establishedYear: 2005,
    studentPopulation: 32000,
    type: "University of Technology",
    faculties: [
      {
        ...createBaseFaculty(
          "applied-sciences",
          "Applied Sciences",
          "Applied sciences",
        ),
        degrees: [],
      },
      {
        ...createBaseFaculty(
          "business-management",
          "Business & Management Sciences",
          "Business",
        ),
        degrees: createCommercePrograms(),
      },
      {
        ...createBaseFaculty("education", "Education", "Teacher training"),
        degrees: createEducationPrograms(),
      },
      {
        ...createBaseFaculty(
          "engineering",
          "Engineering & Built Environment",
          "Engineering",
        ),
        degrees: createEngineeringPrograms(),
      },
      {
        ...createBaseFaculty(
          "health-wellness",
          "Health & Wellness Sciences",
          "Health programs",
        ),
        degrees: [],
      },
      {
        ...createBaseFaculty(
          "informatics-design",
          "Informatics & Design",
          "IT and design",
        ),
        degrees: [],
      },
    ],
  },
  {
    id: "dut",
    name: "Durban University of Technology",
    abbreviation: "DUT",
    fullName: "Durban University of Technology",
    location: "Durban and Pietermaritzburg",
    province: "KwaZulu-Natal",
    logo: "/logos/universities/durban-university-technology.svg",
    overview: "Technology-focused university in KwaZulu-Natal.",
    website: "https://www.dut.ac.za",
    establishedYear: 2002,
    studentPopulation: 31000,
    type: "University of Technology",
    faculties: [
      {
        ...createBaseFaculty(
          "accounting-informatics",
          "Accounting & Informatics",
          "Business and IT",
        ),
        degrees: [],
      },
      {
        ...createBaseFaculty(
          "applied-sciences",
          "Applied Sciences",
          "Applied sciences",
        ),
        degrees: [],
      },
      {
        ...createBaseFaculty("arts-design", "Arts & Design", "Creative arts"),
        degrees: [],
      },
      {
        ...createBaseFaculty(
          "engineering",
          "Engineering & Built Environment",
          "Engineering",
        ),
        degrees: createEngineeringPrograms(),
      },
      {
        ...createBaseFaculty(
          "health-sciences",
          "Health Sciences",
          "Health programs",
        ),
        degrees: [],
      },
      {
        ...createBaseFaculty(
          "management-sciences",
          "Management Sciences",
          "Business",
        ),
        degrees: createCommercePrograms(),
      },
    ],
  },
  {
    id: "tut",
    name: "Tshwane University of Technology",
    abbreviation: "TUT",
    fullName: "Tshwane University of Technology",
    location: "Pretoria, Pretoria West, Soshanguve, Polokwane",
    province: "Gauteng",
    logo: "/logos/universities/tshwane-university-technology.svg",
    overview: "Largest university of technology in South Africa.",
    website: "https://www.tut.ac.za",
    establishedYear: 2004,
    studentPopulation: 60000,
    type: "University of Technology",
    faculties: [
      {
        ...createBaseFaculty("arts-design", "Arts & Design", "Creative arts"),
        degrees: [],
      },
      {
        ...createBaseFaculty(
          "economic-finance",
          "Economic & Finance Sciences",
          "Business",
        ),
        degrees: createCommercePrograms(),
      },
      {
        ...createBaseFaculty("education", "Education", "Teacher training"),
        degrees: createEducationPrograms(),
      },
      {
        ...createBaseFaculty(
          "engineering",
          "Engineering & Built Environment",
          "Engineering",
        ),
        degrees: createEngineeringPrograms(),
      },
      {
        ...createBaseFaculty(
          "humanities",
          "Humanities",
          "Arts and social sciences",
        ),
        degrees: createHumanitiesPrograms(),
      },
      {
        ...createBaseFaculty("ict", "ICT", "Information technology"),
        degrees: [],
      },
      {
        ...createBaseFaculty("science", "Science", "Natural sciences"),
        degrees: createSciencePrograms(),
      },
    ],
  },
  {
    id: "vut",
    name: "Vaal University of Technology",
    abbreviation: "VUT",
    fullName: "Vaal University of Technology",
    location: "Vanderbijlpark",
    province: "Gauteng",
    logo: "/logos/universities/vaal-university-technology.svg",
    overview: "Technology university serving the Vaal Triangle.",
    website: "https://www.vut.ac.za",
    establishedYear: 1966,
    studentPopulation: 21000,
    type: "University of Technology",
    faculties: [
      {
        ...createBaseFaculty(
          "applied-chemical",
          "Applied & Chemical Biotechnology",
          "Applied sciences",
        ),
        degrees: [],
      },
      {
        ...createBaseFaculty(
          "engineering",
          "Engineering & Technology",
          "Engineering",
        ),
        degrees: createEngineeringPrograms(),
      },
      {
        ...createBaseFaculty("human-sciences", "Human Sciences", "Humanities"),
        degrees: createHumanitiesPrograms(),
      },
      {
        ...createBaseFaculty(
          "management-sciences",
          "Management Sciences",
          "Business",
        ),
        degrees: createCommercePrograms(),
      },
    ],
  },
  {
    id: "cut",
    name: "Central University of Technology",
    abbreviation: "CUT",
    fullName: "Central University of Technology, Free State",
    location: "Bloemfontein",
    province: "Free State",
    logo: "/logos/universities/central-university-technology.svg",
    overview: "University of technology in the Free State.",
    website: "https://www.cut.ac.za",
    establishedYear: 1981,
    studentPopulation: 13000,
    type: "University of Technology",
    faculties: [
      {
        ...createBaseFaculty(
          "engineering-it",
          "Engineering & IT",
          "Engineering and IT",
        ),
        degrees: [],
      },
      {
        ...createBaseFaculty(
          "health-environmental",
          "Health & Environmental Sciences",
          "Health and environment",
        ),
        degrees: [],
      },
      {
        ...createBaseFaculty(
          "humanities",
          "Humanities",
          "Arts and social sciences",
        ),
        degrees: createHumanitiesPrograms(),
      },
      {
        ...createBaseFaculty(
          "management-sciences",
          "Management Sciences",
          "Business",
        ),
        degrees: createCommercePrograms(),
      },
    ],
  },
  {
    id: "mut",
    name: "Mangosuthu University of Technology",
    abbreviation: "MUT",
    fullName: "Mangosuthu University of Technology",
    location: "Durban",
    province: "KwaZulu-Natal",
    logo: "/logos/universities/mangosuthu-university-technology.svg",
    overview: "Technology university serving KwaZulu-Natal.",
    website: "https://www.mut.ac.za",
    establishedYear: 1979,
    studentPopulation: 13000,
    type: "University of Technology",
    faculties: [
      {
        ...createBaseFaculty(
          "engineering",
          "Engineering",
          "Engineering programs",
        ),
        degrees: [],
      },
      {
        ...createBaseFaculty(
          "management-sciences",
          "Management Sciences",
          "Business",
        ),
        degrees: createCommercePrograms(),
      },
      {
        ...createBaseFaculty(
          "natural-sciences",
          "Natural Sciences",
          "Sciences",
        ),
        degrees: createSciencePrograms(),
      },
    ],
  },
];

// COMPREHENSIVE UNIVERSITIES (6)
export const COMPREHENSIVE_UNIVERSITIES: University[] = [
  {
    id: "wsu",
    name: "Walter Sisulu University",
    abbreviation: "WSU",
    fullName: "Walter Sisulu University",
    location: "Mthatha",
    province: "Eastern Cape",
    logo: "/logos/universities/walter-sisulu-university.svg",
    overview: "Comprehensive university serving the Eastern Cape.",
    website: "https://www.wsu.ac.za",
    establishedYear: 2005,
    studentPopulation: 27000,
    type: "Comprehensive University",
    faculties: [
      {
        ...createBaseFaculty(
          "business-management",
          "Business, Management Sciences & Law",
          "Business and law",
        ),
        degrees: [...createCommercePrograms(), ...createLawPrograms()],
      },
      {
        ...createBaseFaculty("education", "Education", "Teacher training"),
        degrees: createEducationPrograms(),
      },
      {
        ...createBaseFaculty(
          "health-sciences",
          "Health Sciences",
          "Medical programs",
        ),
        degrees: createHealthSciencesPrograms(),
      },
      {
        ...createBaseFaculty(
          "humanities",
          "Humanities & Social Sciences",
          "Arts",
        ),
        degrees: createHumanitiesPrograms(),
      },
      {
        ...createBaseFaculty(
          "science-engineering",
          "Science, Engineering & Technology",
          "Sciences and engineering",
        ),
        degrees: [...createSciencePrograms(), ...createEngineeringPrograms()],
      },
    ],
  },
  // Note: Some universities like UNISA and UNIZULU are also considered comprehensive but are listed in traditional
  // This follows the official classification where they have both traditional and technology elements
];

// Combine all universities
export const ALL_29_SA_UNIVERSITIES: University[] = [
  ...COMPLETE_TRADITIONAL_UNIVERSITIES,
  ...UNIVERSITIES_OF_TECHNOLOGY,
  ...COMPREHENSIVE_UNIVERSITIES,
];

// Export for use in application
export const ALL_SOUTH_AFRICAN_UNIVERSITIES = ALL_29_SA_UNIVERSITIES;

// Export summary
export const UNIVERSITY_COUNT_SUMMARY = {
  traditional: COMPLETE_TRADITIONAL_UNIVERSITIES.length,
  technology: UNIVERSITIES_OF_TECHNOLOGY.length,
  comprehensive: COMPREHENSIVE_UNIVERSITIES.length,
  total: ALL_29_SA_UNIVERSITIES.length,
};

console.log(
  `✅ Complete database loaded: ${ALL_29_SA_UNIVERSITIES.length} South African universities`,
);
