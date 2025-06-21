import { University, Faculty, Degree } from "@/types/university";

/**
 * COMPREHENSIVE COURSE DATABASE - COMPLETE LIST
 *
 * This implements the complete course list with proper assignment rules
 * and university-specific APS requirements as requested.
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
  UNIVEN: "univen",
  WSU: "wsu",
  SMU: "smu",
  UMP: "ump",
  UNIZULU: "unizulu",
  CUT: "cut",
  NMU: "nmu",
  SPU: "spu",
};

export const ALL_UNIVERSITY_IDS = Object.values(UNIVERSITY_ABBREVIATIONS);

export type AssignmentRule = {
  type: "all" | "exclude" | "include_only";
  universities?: string[];
};

export interface ComprehensiveCourse {
  name: string;
  faculty: string;
  description: string;
  duration: string;
  assignmentRule: AssignmentRule;
  defaultAps: number;
  universitySpecificAps?: Record<string, number>;
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

  return { type: "exclude", universities: universityIds };
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

  return { type: "include_only", universities: universityIds };
}

// Parse "Most except" rules
function parseMostExceptRule(exceptList: string): AssignmentRule {
  return parseIncludeOnlyRule(exceptList);
}

// Comprehensive course database
export const COMPREHENSIVE_COURSES: ComprehensiveCourse[] = [
  // Faculty of Engineering / Engineering and Built Environment
  {
    name: "Civil Engineering",
    faculty: "Engineering",
    description:
      "Design, construct and maintain civil infrastructure including roads, bridges, and buildings.",
    duration: "4 years",
    defaultAps: 35,
    assignmentRule: parseExcludeRule("UWC, UNISA, UFH"),
    universitySpecificAps: { uct: 38, wits: 37, stellenbosch: 36, up: 35 },
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
    universitySpecificAps: { uct: 38, wits: 37, stellenbosch: 36, up: 35 },
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
    universitySpecificAps: { uct: 38, wits: 37, stellenbosch: 36, up: 35 },
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
    universitySpecificAps: { uct: 40, wits: 39, stellenbosch: 38, up: 37 },
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
    defaultAps: 34,
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
    name: "Construction Management",
    faculty: "Engineering",
    description: "Manage construction projects from planning to completion.",
    duration: "3 years",
    defaultAps: 28,
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
    defaultAps: 28,
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
    name: "Architecture",
    faculty: "Engineering",
    description: "Design and plan buildings and structures.",
    duration: "5 years",
    defaultAps: 32,
    assignmentRule: parseExcludeRule("UNISA, UFH, MUT"),
    universitySpecificAps: { uct: 36, wits: 35, stellenbosch: 34 },
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
    universitySpecificAps: {
      uct: 45,
      wits: 44,
      stellenbosch: 44,
      up: 42,
      ukzn: 40,
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
    universitySpecificAps: { uct: 42, wits: 41, stellenbosch: 40, up: 39 },
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
    universitySpecificAps: { uct: 38, wits: 37, stellenbosch: 36, up: 35 },
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
    universitySpecificAps: { uct: 40, wits: 39, stellenbosch: 38, up: 37 },
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
    name: "Psychology",
    faculty: "Humanities",
    description: "Study of human behavior, cognition, and mental processes.",
    duration: "3 years",
    defaultAps: 26,
    assignmentRule: { type: "all" },
    universitySpecificAps: { uct: 32, wits: 30, stellenbosch: 29, up: 28 },
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

  // Faculty of Commerce / Business and Management
  {
    name: "Bachelor of Commerce (BCom) in Accounting",
    faculty: "Commerce",
    description: "Professional accounting education with CA(SA) pathway.",
    duration: "3 years",
    defaultAps: 30,
    assignmentRule: { type: "all" },
    universitySpecificAps: { uct: 36, wits: 35, stellenbosch: 34, up: 33 },
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
    universitySpecificAps: { uct: 38, wits: 36, stellenbosch: 35, up: 34 },
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
    name: "Computer Science",
    faculty: "Science",
    description: "Comprehensive computer science program.",
    duration: "3 years",
    defaultAps: 32,
    assignmentRule: { type: "all" },
    universitySpecificAps: { uct: 38, wits: 36, stellenbosch: 35, up: 34 },
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

  // Faculty of Information Technology
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

  // Technical and Vocational Programmes (for TUT, DUT, MUT, VUT, CPUT)
  {
    name: "National Diploma in Engineering (Mechanical)",
    faculty: "Engineering",
    description: "Practical engineering training with hands-on experience.",
    duration: "3 years",
    defaultAps: 26,
    assignmentRule: {
      type: "include_only",
      universities: ["tut", "dut", "mut", "vut", "cput"],
    },
    subjects: [
      { name: "Mathematics", level: 5, isRequired: true },
      { name: "Physical Sciences", level: 5, isRequired: true },
      { name: "English", level: 4, isRequired: true },
    ],
    careerProspects: [
      "Engineering Technician",
      "Maintenance Engineer",
      "Production Supervisor",
      "Quality Controller",
    ],
  },
  {
    name: "National Diploma in Engineering (Electrical)",
    faculty: "Engineering",
    description: "Electrical systems and power engineering technology.",
    duration: "3 years",
    defaultAps: 26,
    assignmentRule: {
      type: "include_only",
      universities: ["tut", "dut", "mut", "vut", "cput"],
    },
    subjects: [
      { name: "Mathematics", level: 5, isRequired: true },
      { name: "Physical Sciences", level: 5, isRequired: true },
      { name: "English", level: 4, isRequired: true },
    ],
    careerProspects: [
      "Electrical Technician",
      "Control Systems Technician",
      "Maintenance Engineer",
      "Power Systems Operator",
    ],
  },
  {
    name: "National Diploma in Information Technology",
    faculty: "Information Technology",
    description: "Practical IT skills and systems administration.",
    duration: "3 years",
    defaultAps: 24,
    assignmentRule: {
      type: "include_only",
      universities: ["tut", "dut", "mut", "vut", "cput"],
    },
    subjects: [
      { name: "Mathematics", level: 4, isRequired: true },
      { name: "English", level: 4, isRequired: true },
    ],
    careerProspects: [
      "IT Support Technician",
      "Network Administrator",
      "Web Developer",
      "Database Operator",
    ],
  },
  {
    name: "National Diploma in Business Studies",
    faculty: "Commerce",
    description: "Business management and administration skills.",
    duration: "3 years",
    defaultAps: 22,
    assignmentRule: {
      type: "include_only",
      universities: ["tut", "dut", "mut", "vut", "cput"],
    },
    subjects: [
      { name: "Mathematics", level: 4, isRequired: true },
      { name: "English", level: 4, isRequired: true },
    ],
    careerProspects: [
      "Business Administrator",
      "Office Manager",
      "Customer Service Manager",
      "Sales Representative",
    ],
  },
  {
    name: "National Diploma in Hospitality Management",
    faculty: "Commerce",
    description: "Hotel and hospitality industry management.",
    duration: "3 years",
    defaultAps: 20,
    assignmentRule: {
      type: "include_only",
      universities: ["tut", "dut", "mut", "vut", "cput"],
    },
    subjects: [
      { name: "English", level: 4, isRequired: true },
      { name: "Mathematics", level: 3, isRequired: true },
    ],
    careerProspects: [
      "Hotel Manager",
      "Restaurant Manager",
      "Event Coordinator",
      "Tourism Officer",
    ],
  },
  {
    name: "National Diploma in Public Management",
    faculty: "Commerce",
    description: "Public sector administration and governance.",
    duration: "3 years",
    defaultAps: 22,
    assignmentRule: {
      type: "include_only",
      universities: ["tut", "dut", "mut", "vut", "cput"],
    },
    subjects: [
      { name: "English", level: 4, isRequired: true },
      { name: "Mathematics", level: 3, isRequired: true },
    ],
    careerProspects: [
      "Public Administrator",
      "Government Officer",
      "Municipal Manager",
      "Policy Analyst",
    ],
  },
  {
    name: "National Diploma in Environmental Health",
    faculty: "Health Sciences",
    description: "Environmental health monitoring and safety.",
    duration: "3 years",
    defaultAps: 24,
    assignmentRule: {
      type: "include_only",
      universities: ["tut", "dut", "mut", "vut", "cput"],
    },
    subjects: [
      { name: "Life Sciences", level: 4, isRequired: true },
      { name: "English", level: 4, isRequired: true },
      { name: "Mathematics", level: 3, isRequired: true },
    ],
    careerProspects: [
      "Environmental Health Officer",
      "Health Inspector",
      "Safety Officer",
      "Water Quality Analyst",
    ],
  },
  {
    name: "National Diploma in Food Technology",
    faculty: "Agriculture",
    description: "Food processing and quality control.",
    duration: "3 years",
    defaultAps: 24,
    assignmentRule: {
      type: "include_only",
      universities: ["tut", "dut", "mut", "vut", "cput"],
    },
    subjects: [
      { name: "Life Sciences", level: 4, isRequired: true },
      { name: "Physical Sciences", level: 4, isRequired: true },
      { name: "English", level: 4, isRequired: true },
    ],
    careerProspects: [
      "Food Technologist",
      "Quality Controller",
      "Production Manager",
      "Food Safety Inspector",
    ],
  },
  {
    name: "National Diploma in Building Construction",
    faculty: "Engineering",
    description: "Construction management and building technology.",
    duration: "3 years",
    defaultAps: 24,
    assignmentRule: {
      type: "include_only",
      universities: ["tut", "dut", "mut", "vut", "cput"],
    },
    subjects: [
      { name: "Mathematics", level: 4, isRequired: true },
      { name: "Physical Sciences", level: 4, isRequired: true },
      { name: "English", level: 4, isRequired: true },
    ],
    careerProspects: [
      "Construction Supervisor",
      "Building Inspector",
      "Site Manager",
      "Quantity Surveyor Assistant",
    ],
  },
];

// Debug logging for course assignment
if (typeof window !== "undefined" && import.meta.env.DEV) {
  console.log(`Total courses in database: ${COMPREHENSIVE_COURSES.length}`);
  const coursesForMUT = COMPREHENSIVE_COURSES.filter((course) => {
    const applicableUniversities = getUniversitiesForCourse(
      course.assignmentRule,
    );
    return applicableUniversities.includes("mut");
  });
  console.log(
    `Courses available for MUT: ${coursesForMUT.length}`,
    coursesForMUT.map((c) => c.name),
  );
}

// Apply assignment rules and get universities for a course
export function getUniversitiesForCourse(rule: AssignmentRule): string[] {
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

// Get APS requirement for a course at a specific university
export function getAPSRequirement(
  course: ComprehensiveCourse,
  universityId: string,
): number {
  return course.universitySpecificAps?.[universityId] || course.defaultAps;
}

// Convert course to degree format
export function courseToDegree(
  course: ComprehensiveCourse,
  universityId: string,
): Degree {
  return {
    id: course.name.toLowerCase().replace(/\s+/g, "-").replace(/[()]/g, ""),
    name: course.name,
    faculty: course.faculty,
    duration: course.duration,
    apsRequirement: getAPSRequirement(course, universityId),
    description: course.description,
    subjects: course.subjects || [],
    careerProspects: course.careerProspects || [],
  };
}

// Get all courses for a specific university
export function getCoursesForUniversity(
  universityId: string,
): ComprehensiveCourse[] {
  return COMPREHENSIVE_COURSES.filter((course) => {
    const applicableUniversities = getUniversitiesForCourse(
      course.assignmentRule,
    );
    return applicableUniversities.includes(universityId);
  });
}

// Organize courses by faculty for a university
export function getUniversityFaculties(universityId: string): Faculty[] {
  const courses = getCoursesForUniversity(universityId);
  const facultyMap = new Map<string, Faculty>();

  courses.forEach((course) => {
    if (!facultyMap.has(course.faculty)) {
      facultyMap.set(course.faculty, {
        id: course.faculty.toLowerCase().replace(/\s+/g, "-"),
        name: `Faculty of ${course.faculty}`,
        description: `${course.faculty} programs and degrees`,
        degrees: [],
      });
    }

    const faculty = facultyMap.get(course.faculty)!;
    faculty.degrees.push(courseToDegree(course, universityId));
  });

  return Array.from(facultyMap.values());
}
