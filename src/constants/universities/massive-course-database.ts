import { University, Faculty, Degree } from "@/types/university";

/**
 * MASSIVE COURSE DATABASE
 *
 * This implements the comprehensive course list provided by the user with
 * proper assignment rules (all/exclude) and university-specific APS requirements.
 *
 * Assignment Rules:
 * - "all" means assign to every university
 * - "exclude: [list]" means assign to all except those listed
 * - "include_only: [list]" means assign only to those listed
 */

// University abbreviation mappings
export const UNIVERSITY_ABBREVIATIONS = {
  UCT: "uct",
  Wits: "wits",
  SU: "stellenbosch",
  UP: "up",
  UKZN: "ukzn",
  UFS: "ufs",
  RU: "ru",
  NWU: "nwu",
  UWC: "uwc",
  UJ: "uj",
  UNISA: "unisa",
  UFH: "ufh",
  TUT: "tut",
  DUT: "dut",
  VUT: "vut",
  MUT: "mut",
  CPUT: "cput",
  UL: "ul",
  UV: "univen",
  WSU: "wsu",
  SMU: "smu",
  UMP: "ump",
  UNIZULU: "unizulu",
  CUT: "cut",
  NMU: "nmu",
  SPU: "spu",
};

// Get all university IDs
export const ALL_UNIVERSITY_IDS = Object.values(UNIVERSITY_ABBREVIATIONS);

// Assignment rule types
export type AssignmentRule = {
  type: "all" | "exclude" | "include_only";
  universities?: string[]; // University IDs for exclude/include rules
};

// Program definition with assignment rules
export interface ProgramDefinition {
  name: string;
  faculty: string;
  description: string;
  duration: string;
  assignmentRule: AssignmentRule;
  apsRequirements?: Record<string, number>; // University ID -> APS requirement
  defaultAps: number;
  subjects?: Array<{ name: string; level: number; isRequired: boolean }>;
  careerProspects?: string[];
}

// Helper function to parse exclusion rules
function parseExcludeRule(excludeList: string): AssignmentRule {
  const excludeAbbrevs = excludeList.split(", ").map((s) => s.trim());
  const universityIds = excludeAbbrevs
    .map(
      (abbrev) =>
        UNIVERSITY_ABBREVIATIONS[
          abbrev as keyof typeof UNIVERSITY_ABBREVIATIONS
        ],
    )
    .filter(Boolean);

  return {
    type: "exclude",
    universities: universityIds,
  };
}

// Helper function to parse include-only rules
function parseIncludeOnlyRule(includeList: string): AssignmentRule {
  const includeAbbrevs = includeList.split(", ").map((s) => s.trim());
  const universityIds = includeAbbrevs
    .map(
      (abbrev) =>
        UNIVERSITY_ABBREVIATIONS[
          abbrev as keyof typeof UNIVERSITY_ABBREVIATIONS
        ],
    )
    .filter(Boolean);

  return {
    type: "include_only",
    universities: universityIds,
  };
}

// Massive program database based on user requirements
export const MASSIVE_COURSE_DATABASE: ProgramDefinition[] = [
  // Faculty of Engineering / Engineering and Built Environment
  {
    name: "Civil Engineering",
    faculty: "Engineering",
    description:
      "Design, construct and maintain civil infrastructure including roads, bridges, and buildings.",
    duration: "4 years",
    defaultAps: 35,
    assignmentRule: parseExcludeRule("UWC, UNISA, UFH"),
    subjects: [
      { name: "Mathematics", level: 6, isRequired: true },
      { name: "Physical Sciences", level: 6, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    careerProspects: [
      "Civil Engineer",
      "Structural Engineer",
      "Project Manager",
      "Construction Manager",
    ],
  },
  {
    name: "Mechanical Engineering",
    faculty: "Engineering",
    description:
      "Design, develop and manufacture mechanical systems and machinery.",
    duration: "4 years",
    defaultAps: 35,
    assignmentRule: parseExcludeRule("UWC, UNISA, UFH"),
    subjects: [
      { name: "Mathematics", level: 6, isRequired: true },
      { name: "Physical Sciences", level: 6, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    careerProspects: [
      "Mechanical Engineer",
      "Design Engineer",
      "Manufacturing Engineer",
      "Project Manager",
    ],
  },
  {
    name: "Electrical Engineering",
    faculty: "Engineering",
    description:
      "Design and develop electrical systems, electronics, and power systems.",
    duration: "4 years",
    defaultAps: 35,
    assignmentRule: parseExcludeRule("UWC, UNISA, UFH"),
    subjects: [
      { name: "Mathematics", level: 6, isRequired: true },
      { name: "Physical Sciences", level: 6, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    careerProspects: [
      "Electrical Engineer",
      "Electronics Engineer",
      "Power Systems Engineer",
      "Control Systems Engineer",
    ],
  },
  {
    name: "Chemical Engineering",
    faculty: "Engineering",
    description:
      "Design chemical processes and develop materials for industrial applications.",
    duration: "4 years",
    defaultAps: 35,
    assignmentRule: parseExcludeRule("UJ, UNISA, UFH"),
    subjects: [
      { name: "Mathematics", level: 6, isRequired: true },
      { name: "Physical Sciences", level: 6, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    careerProspects: [
      "Chemical Engineer",
      "Process Engineer",
      "Environmental Engineer",
      "Materials Engineer",
    ],
  },
  {
    name: "Industrial Engineering",
    faculty: "Engineering",
    description: "Optimize systems, processes, and operations for efficiency.",
    duration: "4 years",
    defaultAps: 35,
    assignmentRule: parseExcludeRule("UWC, UNISA"),
    subjects: [
      { name: "Mathematics", level: 6, isRequired: true },
      { name: "Physical Sciences", level: 5, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    careerProspects: [
      "Industrial Engineer",
      "Operations Manager",
      "Quality Manager",
      "Supply Chain Manager",
    ],
  },
  {
    name: "Computer Engineering",
    faculty: "Engineering",
    description: "Design and develop computer hardware and software systems.",
    duration: "4 years",
    defaultAps: 36,
    assignmentRule: parseExcludeRule("UCT, UP, UNISA"),
    subjects: [
      { name: "Mathematics", level: 6, isRequired: true },
      { name: "Physical Sciences", level: 6, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    careerProspects: [
      "Computer Engineer",
      "Software Engineer",
      "Hardware Engineer",
      "Systems Engineer",
    ],
  },
  {
    name: "Mechatronics",
    faculty: "Engineering",
    description: "Integrate mechanical, electrical, and computer engineering.",
    duration: "4 years",
    defaultAps: 36,
    assignmentRule: parseExcludeRule("UWC, UNISA, UFH, MUT"),
    subjects: [
      { name: "Mathematics", level: 6, isRequired: true },
      { name: "Physical Sciences", level: 6, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    careerProspects: [
      "Mechatronics Engineer",
      "Robotics Engineer",
      "Automation Engineer",
      "Design Engineer",
    ],
  },
  {
    name: "Mining Engineering",
    faculty: "Engineering",
    description:
      "Extract and process mineral resources safely and efficiently.",
    duration: "4 years",
    defaultAps: 35,
    assignmentRule: parseExcludeRule("UWC, UNISA, UFH, RU"),
    subjects: [
      { name: "Mathematics", level: 6, isRequired: true },
      { name: "Physical Sciences", level: 6, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    careerProspects: [
      "Mining Engineer",
      "Metallurgical Engineer",
      "Geological Engineer",
      "Mine Manager",
    ],
  },
  {
    name: "Environmental Engineering",
    faculty: "Engineering",
    description:
      "Develop solutions for environmental challenges and sustainability.",
    duration: "4 years",
    defaultAps: 34,
    assignmentRule: parseExcludeRule("UWC, UNISA"),
    subjects: [
      { name: "Mathematics", level: 6, isRequired: true },
      { name: "Physical Sciences", level: 6, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    careerProspects: [
      "Environmental Engineer",
      "Sustainability Consultant",
      "Water Resources Engineer",
      "Waste Management Engineer",
    ],
  },
  {
    name: "Agricultural Engineering",
    faculty: "Engineering",
    description:
      "Apply engineering principles to agricultural and biological systems.",
    duration: "4 years",
    defaultAps: 34,
    assignmentRule: parseExcludeRule("UWC, UNISA, UFH"),
    subjects: [
      { name: "Mathematics", level: 6, isRequired: true },
      { name: "Physical Sciences", level: 5, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    careerProspects: [
      "Agricultural Engineer",
      "Irrigation Engineer",
      "Food Processing Engineer",
      "Farm Equipment Designer",
    ],
  },
  {
    name: "Construction Management",
    faculty: "Engineering",
    description: "Manage construction projects from planning to completion.",
    duration: "3 years",
    defaultAps: 30,
    assignmentRule: { type: "all" },
    subjects: [
      { name: "Mathematics", level: 5, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    careerProspects: [
      "Construction Manager",
      "Project Manager",
      "Site Manager",
      "Construction Consultant",
    ],
  },
  {
    name: "Quantity Surveying",
    faculty: "Engineering",
    description: "Manage costs and contracts in construction projects.",
    duration: "3 years",
    defaultAps: 30,
    assignmentRule: { type: "all" },
    subjects: [
      { name: "Mathematics", level: 5, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    careerProspects: [
      "Quantity Surveyor",
      "Cost Estimator",
      "Project Manager",
      "Construction Economist",
    ],
  },
  {
    name: "Urban and Regional Planning",
    faculty: "Engineering",
    description: "Plan and design sustainable urban and regional development.",
    duration: "4 years",
    defaultAps: 32,
    assignmentRule: parseExcludeRule("UNISA, UFH"),
    subjects: [
      { name: "Mathematics", level: 5, isRequired: true },
      { name: "English", level: 5, isRequired: true },
      { name: "Geography", level: 4, isRequired: false },
    ],
    careerProspects: [
      "Urban Planner",
      "Regional Planner",
      "Development Consultant",
      "Policy Analyst",
    ],
  },
  {
    name: "Architecture",
    faculty: "Engineering",
    description: "Design and plan buildings and structures.",
    duration: "5 years",
    defaultAps: 34,
    assignmentRule: parseExcludeRule("UNISA, UFH, MUT"),
    subjects: [
      { name: "Mathematics", level: 5, isRequired: true },
      { name: "English", level: 5, isRequired: true },
      { name: "Visual Arts", level: 4, isRequired: false },
    ],
    careerProspects: [
      "Architect",
      "Urban Designer",
      "Landscape Architect",
      "Building Designer",
    ],
  },

  // Faculty of Health Sciences / Medicine and Health
  {
    name: "Bachelor of Medicine and Bachelor of Surgery (MBChB)",
    faculty: "Health Sciences",
    description: "Comprehensive medical training to become a qualified doctor.",
    duration: "6 years",
    defaultAps: 42,
    assignmentRule: { type: "all" },
    apsRequirements: {
      uct: 45,
      wits: 44,
      up: 42,
      ukzn: 40,
      stellenbosch: 44,
      ufs: 38,
      smu: 40,
    },
    subjects: [
      { name: "Life Sciences", level: 7, isRequired: true },
      { name: "Physical Sciences", level: 6, isRequired: true },
      { name: "Mathematics", level: 6, isRequired: true },
      { name: "English", level: 6, isRequired: true },
    ],
    careerProspects: [
      "Medical Doctor",
      "Specialist Physician",
      "General Practitioner",
      "Medical Researcher",
    ],
  },
  {
    name: "Bachelor of Dental Surgery (BDS)",
    faculty: "Health Sciences",
    description: "Comprehensive dental training for oral healthcare.",
    duration: "5 years",
    defaultAps: 38,
    assignmentRule: parseExcludeRule("UNISA, UFH, MUT"),
    subjects: [
      { name: "Life Sciences", level: 7, isRequired: true },
      { name: "Physical Sciences", level: 6, isRequired: true },
      { name: "Mathematics", level: 6, isRequired: true },
      { name: "English", level: 6, isRequired: true },
    ],
    careerProspects: [
      "Dentist",
      "Oral Surgeon",
      "Dental Specialist",
      "Dental Practice Owner",
    ],
  },
  {
    name: "Bachelor of Pharmacy (BPharm)",
    faculty: "Health Sciences",
    description: "Pharmaceutical sciences and clinical pharmacy practice.",
    duration: "4 years",
    defaultAps: 34,
    assignmentRule: { type: "all" },
    subjects: [
      { name: "Physical Sciences", level: 6, isRequired: true },
      { name: "Life Sciences", level: 6, isRequired: true },
      { name: "Mathematics", level: 6, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    careerProspects: [
      "Pharmacist",
      "Clinical Pharmacist",
      "Hospital Pharmacist",
      "Pharmaceutical Researcher",
    ],
  },
  {
    name: "Bachelor of Physiotherapy (BSc Physiotherapy)",
    faculty: "Health Sciences",
    description: "Physical rehabilitation and movement therapy.",
    duration: "4 years",
    defaultAps: 36,
    assignmentRule: { type: "all" },
    subjects: [
      { name: "Life Sciences", level: 6, isRequired: true },
      { name: "Physical Sciences", level: 5, isRequired: true },
      { name: "Mathematics", level: 5, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    careerProspects: [
      "Physiotherapist",
      "Sports Therapist",
      "Rehabilitation Specialist",
      "Private Practice Owner",
    ],
  },
  {
    name: "Bachelor of Occupational Therapy (BSc Occupational Therapy)",
    faculty: "Health Sciences",
    description: "Help people participate in daily activities through therapy.",
    duration: "4 years",
    defaultAps: 34,
    assignmentRule: { type: "all" },
    subjects: [
      { name: "Life Sciences", level: 6, isRequired: true },
      { name: "English", level: 5, isRequired: true },
      { name: "Mathematics", level: 4, isRequired: true },
    ],
    careerProspects: [
      "Occupational Therapist",
      "Rehabilitation Specialist",
      "Pediatric Therapist",
      "Mental Health Therapist",
    ],
  },
  {
    name: "Bachelor of Nursing Science (BNS)",
    faculty: "Health Sciences",
    description: "Professional nursing education with clinical practice.",
    duration: "4 years",
    defaultAps: 28,
    assignmentRule: { type: "all" },
    subjects: [
      { name: "Life Sciences", level: 5, isRequired: true },
      { name: "English", level: 5, isRequired: true },
      { name: "Mathematics", level: 4, isRequired: true },
    ],
    careerProspects: [
      "Professional Nurse",
      "Clinical Nurse Specialist",
      "Nurse Manager",
      "Community Health Nurse",
    ],
  },

  // Faculty of Humanities / Arts and Social Sciences
  {
    name: "Bachelor of Arts (BA) in English",
    faculty: "Humanities",
    description: "English literature, language, and communication studies.",
    duration: "3 years",
    defaultAps: 24,
    assignmentRule: { type: "all" },
    subjects: [{ name: "English", level: 5, isRequired: true }],
    careerProspects: [
      "Teacher",
      "Writer",
      "Editor",
      "Journalist",
      "Communications Specialist",
    ],
  },
  {
    name: "History",
    faculty: "Humanities",
    description: "Study of past events, cultures, and civilizations.",
    duration: "3 years",
    defaultAps: 24,
    assignmentRule: { type: "all" },
    subjects: [
      { name: "English", level: 5, isRequired: true },
      { name: "History", level: 4, isRequired: false },
    ],
    careerProspects: [
      "Historian",
      "Museum Curator",
      "Archivist",
      "Teacher",
      "Cultural Heritage Specialist",
    ],
  },
  {
    name: "Philosophy",
    faculty: "Humanities",
    description:
      "Study of fundamental questions about existence, knowledge, and ethics.",
    duration: "3 years",
    defaultAps: 24,
    assignmentRule: { type: "all" },
    subjects: [{ name: "English", level: 5, isRequired: true }],
    careerProspects: [
      "Philosophy Professor",
      "Ethics Consultant",
      "Policy Analyst",
      "Writer",
      "Legal Advisor",
    ],
  },
  {
    name: "Sociology",
    faculty: "Humanities",
    description: "Study of society, social behavior, and social structures.",
    duration: "3 years",
    defaultAps: 24,
    assignmentRule: { type: "all" },
    subjects: [{ name: "English", level: 5, isRequired: true }],
    careerProspects: [
      "Social Worker",
      "Community Development Worker",
      "Policy Analyst",
      "Research Analyst",
    ],
  },
  {
    name: "Psychology",
    faculty: "Humanities",
    description: "Study of human behavior, cognition, and mental processes.",
    duration: "3 years",
    defaultAps: 26,
    assignmentRule: { type: "all" },
    subjects: [
      { name: "English", level: 5, isRequired: true },
      { name: "Mathematics", level: 4, isRequired: true },
    ],
    careerProspects: [
      "Clinical Psychologist",
      "Counselor",
      "Human Resources Specialist",
      "Research Psychologist",
    ],
  },
  {
    name: "Political Science",
    faculty: "Humanities",
    description: "Study of political systems, governance, and public policy.",
    duration: "3 years",
    defaultAps: 26,
    assignmentRule: { type: "all" },
    subjects: [{ name: "English", level: 5, isRequired: true }],
    careerProspects: [
      "Policy Analyst",
      "Political Consultant",
      "Government Official",
      "Diplomat",
    ],
  },

  // Faculty of Commerce / Business and Management
  {
    name: "Bachelor of Commerce (BCom) in Accounting",
    faculty: "Commerce",
    description: "Professional accounting education with CA(SA) pathway.",
    duration: "3 years",
    defaultAps: 30,
    assignmentRule: { type: "all" },
    subjects: [
      { name: "Mathematics", level: 5, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    careerProspects: [
      "Chartered Accountant",
      "Financial Manager",
      "Auditor",
      "Tax Consultant",
    ],
  },
  {
    name: "Finance",
    faculty: "Commerce",
    description:
      "Financial management, investment analysis, and corporate finance.",
    duration: "3 years",
    defaultAps: 30,
    assignmentRule: { type: "all" },
    subjects: [
      { name: "Mathematics", level: 5, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    careerProspects: [
      "Financial Analyst",
      "Investment Banker",
      "Portfolio Manager",
      "Risk Manager",
    ],
  },
  {
    name: "Economics",
    faculty: "Commerce",
    description:
      "Economic theory and analysis for policy and business applications.",
    duration: "3 years",
    defaultAps: 30,
    assignmentRule: { type: "all" },
    subjects: [
      { name: "Mathematics", level: 5, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    careerProspects: [
      "Economist",
      "Policy Analyst",
      "Financial Analyst",
      "Research Economist",
    ],
  },
  {
    name: "Marketing",
    faculty: "Commerce",
    description:
      "Marketing strategy, consumer behavior, and digital marketing.",
    duration: "3 years",
    defaultAps: 28,
    assignmentRule: { type: "all" },
    subjects: [
      { name: "Mathematics", level: 4, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    careerProspects: [
      "Marketing Manager",
      "Digital Marketing Specialist",
      "Brand Manager",
      "Market Research Analyst",
    ],
  },
  {
    name: "Business Management",
    faculty: "Commerce",
    description: "Comprehensive business management and leadership training.",
    duration: "3 years",
    defaultAps: 28,
    assignmentRule: { type: "all" },
    subjects: [
      { name: "Mathematics", level: 4, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    careerProspects: [
      "Business Manager",
      "Management Consultant",
      "Operations Manager",
      "Project Manager",
    ],
  },

  // Faculty of Law
  {
    name: "Bachelor of Laws (LLB)",
    faculty: "Law",
    description: "Comprehensive legal education covering all areas of law.",
    duration: "4 years",
    defaultAps: 32,
    assignmentRule: { type: "all" },
    subjects: [
      { name: "English", level: 6, isRequired: true },
      { name: "Mathematics", level: 4, isRequired: true },
    ],
    careerProspects: [
      "Advocate",
      "Attorney",
      "Legal Advisor",
      "Magistrate",
      "Corporate Lawyer",
    ],
  },

  // Faculty of Science / Natural Sciences
  {
    name: "Bachelor of Science (BSc) in Biological Sciences",
    faculty: "Science",
    description:
      "Comprehensive study of living organisms from molecular to ecosystem levels.",
    duration: "3 years",
    defaultAps: 30,
    assignmentRule: { type: "all" },
    subjects: [
      { name: "Life Sciences", level: 6, isRequired: true },
      { name: "Mathematics", level: 5, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    careerProspects: [
      "Biologist",
      "Research Scientist",
      "Conservation Scientist",
      "Biotechnologist",
    ],
  },
  {
    name: "Chemistry",
    faculty: "Science",
    description: "Study of matter, its properties, and chemical reactions.",
    duration: "3 years",
    defaultAps: 32,
    assignmentRule: { type: "all" },
    subjects: [
      { name: "Physical Sciences", level: 6, isRequired: true },
      { name: "Mathematics", level: 6, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    careerProspects: [
      "Chemist",
      "Pharmaceutical Researcher",
      "Quality Control Analyst",
      "Chemical Engineer",
    ],
  },
  {
    name: "Physics",
    faculty: "Science",
    description: "Study of fundamental laws governing the universe.",
    duration: "3 years",
    defaultAps: 34,
    assignmentRule: { type: "all" },
    subjects: [
      { name: "Physical Sciences", level: 6, isRequired: true },
      { name: "Mathematics", level: 7, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    careerProspects: [
      "Physicist",
      "Research Scientist",
      "Data Analyst",
      "Engineering Physicist",
    ],
  },
  {
    name: "Mathematics",
    faculty: "Science",
    description: "Pure and applied mathematics with analytical focus.",
    duration: "3 years",
    defaultAps: 34,
    assignmentRule: { type: "all" },
    subjects: [
      { name: "Mathematics", level: 7, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    careerProspects: [
      "Mathematician",
      "Actuary",
      "Data Scientist",
      "Financial Analyst",
    ],
  },
  {
    name: "Computer Science",
    faculty: "Science",
    description: "Comprehensive computer science program.",
    duration: "3 years",
    defaultAps: 32,
    assignmentRule: { type: "all" },
    subjects: [
      { name: "Mathematics", level: 6, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    careerProspects: [
      "Software Developer",
      "Data Scientist",
      "Systems Analyst",
      "AI Specialist",
    ],
  },

  // Faculty of Education
  {
    name: "Bachelor of Education (BEd) in Foundation Phase",
    faculty: "Education",
    description: "Teacher training for Grade R to Grade 3.",
    duration: "4 years",
    defaultAps: 22,
    assignmentRule: { type: "all" },
    subjects: [
      { name: "English", level: 5, isRequired: true },
      { name: "Mathematics", level: 4, isRequired: true },
    ],
    careerProspects: [
      "Foundation Phase Teacher",
      "Education Specialist",
      "Curriculum Developer",
      "Educational Consultant",
    ],
  },
  {
    name: "Intermediate Phase",
    faculty: "Education",
    description: "Teacher training for Grade 4 to Grade 6.",
    duration: "4 years",
    defaultAps: 22,
    assignmentRule: { type: "all" },
    subjects: [
      { name: "English", level: 5, isRequired: true },
      { name: "Mathematics", level: 5, isRequired: true },
    ],
    careerProspects: [
      "Intermediate Phase Teacher",
      "Education Specialist",
      "Curriculum Developer",
      "Educational Consultant",
    ],
  },
  {
    name: "Senior Phase",
    faculty: "Education",
    description: "Teacher training for Grade 7 to Grade 9.",
    duration: "4 years",
    defaultAps: 24,
    assignmentRule: { type: "all" },
    subjects: [
      { name: "English", level: 5, isRequired: true },
      { name: "Mathematics", level: 5, isRequired: true },
    ],
    careerProspects: [
      "Senior Phase Teacher",
      "Subject Specialist",
      "Curriculum Developer",
      "Educational Consultant",
    ],
  },

  // Faculty of Agriculture / Agricultural Sciences
  {
    name: "Bachelor of Agriculture in Animal Science",
    faculty: "Agriculture",
    description: "Animal husbandry, breeding, and livestock management.",
    duration: "4 years",
    defaultAps: 26,
    assignmentRule: { type: "all" },
    subjects: [
      { name: "Life Sciences", level: 5, isRequired: true },
      { name: "Mathematics", level: 4, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    careerProspects: [
      "Animal Scientist",
      "Livestock Manager",
      "Veterinary Technician",
      "Agricultural Consultant",
    ],
  },

  // Faculty of Information Technology / Computer Science
  {
    name: "Bachelor of Information Technology (BIT)",
    faculty: "Information Technology",
    description:
      "Information systems, database management, and IT infrastructure.",
    duration: "3 years",
    defaultAps: 28,
    assignmentRule: { type: "all" },
    subjects: [
      { name: "Mathematics", level: 5, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    careerProspects: [
      "IT Specialist",
      "Database Administrator",
      "Systems Analyst",
      "Network Administrator",
    ],
  },
];

// Function to apply assignment rules and get universities for a program
export function getUniversitiesForProgram(rule: AssignmentRule): string[] {
  switch (rule.type) {
    case "all":
      return [...ALL_UNIVERSITY_IDS];
    case "exclude":
      return ALL_UNIVERSITY_IDS.filter(
        (id) => !rule.universities?.includes(id),
      );
    case "include_only":
      return (
        rule.universities?.filter((id) => ALL_UNIVERSITY_IDS.includes(id)) || []
      );
    default:
      return [...ALL_UNIVERSITY_IDS];
  }
}

// Function to get APS requirement for a program at a specific university
export function getAPSRequirement(
  program: ProgramDefinition,
  universityId: string,
): number {
  return program.apsRequirements?.[universityId] || program.defaultAps;
}

// Function to convert program to degree format
export function programToDegree(
  program: ProgramDefinition,
  universityId: string,
): Degree {
  return {
    id: program.name.toLowerCase().replace(/\s+/g, "-").replace(/[()]/g, ""),
    name: program.name,
    faculty: program.faculty,
    duration: program.duration,
    apsRequirement: getAPSRequirement(program, universityId),
    description: program.description,
    subjects: program.subjects || [],
    careerProspects: program.careerProspects || [],
  };
}

// Function to get all programs for a specific university
export function getProgramsForUniversity(
  universityId: string,
): ProgramDefinition[] {
  return MASSIVE_COURSE_DATABASE.filter((program) => {
    const applicableUniversities = getUniversitiesForProgram(
      program.assignmentRule,
    );
    return applicableUniversities.includes(universityId);
  });
}

// Function to organize programs by faculty for a university
export function getUniversityFaculties(universityId: string): Faculty[] {
  const programs = getProgramsForUniversity(universityId);
  const facultyMap = new Map<string, Faculty>();

  programs.forEach((program) => {
    if (!facultyMap.has(program.faculty)) {
      facultyMap.set(program.faculty, {
        id: program.faculty.toLowerCase().replace(/\s+/g, "-"),
        name: `Faculty of ${program.faculty}`,
        description: `${program.faculty} programs and degrees`,
        degrees: [],
      });
    }

    const faculty = facultyMap.get(program.faculty)!;
    faculty.degrees.push(programToDegree(program, universityId));
  });

  return Array.from(facultyMap.values());
}
