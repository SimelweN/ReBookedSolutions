import { University, Faculty, Degree } from "@/types/university";

// University ID mappings for the exclusion rules - ALL 26 SA UNIVERSITIES
const UNIVERSITY_MAPPINGS: Record<string, string> = {
  // Traditional Universities (11)
  UCT: "uct",
  Wits: "wits",
  SU: "stellenbosch",
  UP: "up",
  UKZN: "ukzn",
  RU: "ru",
  NWU: "nwu",
  UFS: "ufs",
  UWC: "uwc",
  UFH: "ufh",
  UL: "ul",

  // Universities of Technology (6)
  CPUT: "cput",
  DUT: "dut",
  TUT: "tut",
  VUT: "vut",
  CUT: "cut",
  MUT: "mut",

  // Comprehensive Universities (6)
  UJ: "uj",
  UNIZULU: "unizulu",
  WSU: "wsu",
  UNIVEN: "univen",
  UMP: "ump",
  SPU: "sol",

  // Specialized Universities (3)
  UNISA: "unisa",
  SMU: "smu",
};

// Reverse mapping for display purposes
const UNIVERSITY_ID_TO_CODE: Record<string, string> = Object.fromEntries(
  Object.entries(UNIVERSITY_MAPPINGS).map(([code, id]) => [id, code]),
);

// Program definitions with inclusion/exclusion rules
interface ProgramRule {
  name: string;
  faculty: string;
  duration: string;
  apsRequirement: number;
  description: string;
  careerProspects: string[];
  subjects: Array<{ name: string; level: number; isRequired: boolean }>;
  rule: "all" | { exclude: string[] } | { include: string[] };
}

const COMPREHENSIVE_PROGRAMS: ProgramRule[] = [
  // Faculty of Engineering / Engineering and Built Environment
  {
    name: "BEng Civil Engineering",
    faculty: "Engineering",
    duration: "4 years",
    apsRequirement: 36,
    description:
      "Design and construction of infrastructure including roads, bridges, buildings, and water systems.",
    careerProspects: [
      "Civil Engineer",
      "Structural Engineer",
      "Project Manager",
      "Construction Manager",
      "Infrastructure Planner",
    ],
    subjects: [
      { name: "Mathematics", level: 6, isRequired: true },
      { name: "Physical Sciences", level: 6, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    rule: { exclude: ["UWC", "UNISA", "UFH"] },
  },
  {
    name: "BEng Mechanical Engineering",
    faculty: "Engineering",
    duration: "4 years",
    apsRequirement: 36,
    description:
      "Design, manufacture, and maintenance of mechanical systems and machinery.",
    careerProspects: [
      "Mechanical Engineer",
      "Design Engineer",
      "Manufacturing Engineer",
      "Automotive Engineer",
      "HVAC Engineer",
    ],
    subjects: [
      { name: "Mathematics", level: 6, isRequired: true },
      { name: "Physical Sciences", level: 6, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    rule: { exclude: ["UWC", "UNISA", "UFH"] },
  },
  {
    name: "BEng Electrical Engineering",
    faculty: "Engineering",
    duration: "4 years",
    apsRequirement: 36,
    description:
      "Electrical systems, electronics, power generation, and telecommunications.",
    careerProspects: [
      "Electrical Engineer",
      "Electronics Engineer",
      "Power Systems Engineer",
      "Telecommunications Engineer",
      "Control Systems Engineer",
    ],
    subjects: [
      { name: "Mathematics", level: 6, isRequired: true },
      { name: "Physical Sciences", level: 6, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    rule: { exclude: ["UWC", "UNISA", "UFH"] },
  },
  {
    name: "BEng Chemical Engineering",
    faculty: "Engineering",
    duration: "4 years",
    apsRequirement: 36,
    description:
      "Chemical processes, materials science, and industrial chemistry applications.",
    careerProspects: [
      "Chemical Engineer",
      "Process Engineer",
      "Materials Engineer",
      "Environmental Engineer",
      "Petroleum Engineer",
    ],
    subjects: [
      { name: "Mathematics", level: 6, isRequired: true },
      { name: "Physical Sciences", level: 6, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    rule: { exclude: ["UJ", "UNISA", "UFH"] },
  },
  {
    name: "BEng Industrial Engineering",
    faculty: "Engineering",
    duration: "4 years",
    apsRequirement: 34,
    description:
      "Optimization of complex processes, systems, and organizations.",
    careerProspects: [
      "Industrial Engineer",
      "Operations Manager",
      "Quality Engineer",
      "Supply Chain Manager",
      "Process Analyst",
    ],
    subjects: [
      { name: "Mathematics", level: 6, isRequired: true },
      { name: "Physical Sciences", level: 5, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    rule: { exclude: ["UWC", "UNISA"] },
  },
  {
    name: "BEng Computer Engineering",
    faculty: "Engineering",
    duration: "4 years",
    apsRequirement: 36,
    description:
      "Hardware and software systems, embedded systems, and computer architecture.",
    careerProspects: [
      "Computer Engineer",
      "Hardware Engineer",
      "Embedded Systems Developer",
      "Network Engineer",
      "Systems Architect",
    ],
    subjects: [
      { name: "Mathematics", level: 6, isRequired: true },
      { name: "Physical Sciences", level: 6, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    rule: { exclude: ["UCT", "UP", "UNISA"] },
  },
  {
    name: "BEng Mechatronics",
    faculty: "Engineering",
    duration: "4 years",
    apsRequirement: 36,
    description:
      "Integration of mechanical, electrical, and computer engineering.",
    careerProspects: [
      "Mechatronics Engineer",
      "Robotics Engineer",
      "Automation Engineer",
      "Control Systems Engineer",
      "Product Designer",
    ],
    subjects: [
      { name: "Mathematics", level: 6, isRequired: true },
      { name: "Physical Sciences", level: 6, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    rule: { exclude: ["UWC", "UNISA", "UFH", "MUT"] },
  },
  {
    name: "BEng Mining Engineering",
    faculty: "Engineering",
    duration: "4 years",
    apsRequirement: 34,
    description:
      "Extraction of minerals and metals from the earth safely and efficiently.",
    careerProspects: [
      "Mining Engineer",
      "Mine Planner",
      "Safety Engineer",
      "Metallurgical Engineer",
      "Geotechnical Engineer",
    ],
    subjects: [
      { name: "Mathematics", level: 6, isRequired: true },
      { name: "Physical Sciences", level: 6, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    rule: { exclude: ["UWC", "UNISA", "UFH", "RU"] },
  },
  {
    name: "BSc Construction Management",
    faculty: "Engineering",
    duration: "3 years",
    apsRequirement: 30,
    description:
      "Management of construction projects from planning to completion.",
    careerProspects: [
      "Construction Manager",
      "Project Manager",
      "Site Manager",
      "Quantity Surveyor",
      "Building Inspector",
    ],
    subjects: [
      { name: "Mathematics", level: 5, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    rule: "all",
  },
  {
    name: "BSc Quantity Surveying",
    faculty: "Engineering",
    duration: "4 years",
    apsRequirement: 32,
    description:
      "Cost management and financial control of construction projects.",
    careerProspects: [
      "Quantity Surveyor",
      "Cost Estimator",
      "Construction Economist",
      "Project Manager",
      "Property Developer",
    ],
    subjects: [
      { name: "Mathematics", level: 5, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    rule: "all",
  },
  {
    name: "BArch Architecture",
    faculty: "Engineering",
    duration: "5 years",
    apsRequirement: 34,
    description: "Design and planning of buildings and spaces.",
    careerProspects: [
      "Architect",
      "Urban Planner",
      "Interior Designer",
      "Landscape Architect",
      "Building Designer",
    ],
    subjects: [
      { name: "Mathematics", level: 5, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    rule: { exclude: ["UNISA", "UFH", "MUT"] },
  },

  // Faculty of Health Sciences / Medicine and Health
  {
    name: "MBChB Medicine and Surgery",
    faculty: "Health Sciences",
    duration: "6 years",
    apsRequirement: 42,
    description:
      "Comprehensive medical training to become a qualified medical doctor.",
    careerProspects: [
      "Medical Doctor",
      "Specialist Physician",
      "Surgeon",
      "General Practitioner",
      "Medical Researcher",
    ],
    subjects: [
      { name: "Mathematics", level: 6, isRequired: true },
      { name: "Physical Sciences", level: 6, isRequired: true },
      { name: "Life Sciences", level: 6, isRequired: true },
      { name: "English", level: 6, isRequired: true },
    ],
    rule: "all",
  },
  {
    name: "BDS Dental Surgery",
    faculty: "Health Sciences",
    duration: "5 years",
    apsRequirement: 40,
    description: "Training in oral health, dental surgery, and patient care.",
    careerProspects: [
      "Dentist",
      "Oral Surgeon",
      "Orthodontist",
      "Dental Specialist",
      "Dental Researcher",
    ],
    subjects: [
      { name: "Mathematics", level: 6, isRequired: true },
      { name: "Physical Sciences", level: 6, isRequired: true },
      { name: "Life Sciences", level: 6, isRequired: true },
      { name: "English", level: 6, isRequired: true },
    ],
    rule: { exclude: ["UNISA", "UFH", "MUT"] },
  },
  {
    name: "BPharm Pharmacy",
    faculty: "Health Sciences",
    duration: "4 years",
    apsRequirement: 36,
    description:
      "Pharmaceutical sciences, drug therapy, and patient counseling.",
    careerProspects: [
      "Pharmacist",
      "Clinical Pharmacist",
      "Hospital Pharmacist",
      "Pharmaceutical Researcher",
      "Regulatory Affairs Specialist",
    ],
    subjects: [
      { name: "Mathematics", level: 6, isRequired: true },
      { name: "Physical Sciences", level: 6, isRequired: true },
      { name: "Life Sciences", level: 6, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    rule: "all",
  },
  {
    name: "BSc Physiotherapy",
    faculty: "Health Sciences",
    duration: "4 years",
    apsRequirement: 34,
    description: "Physical rehabilitation and movement therapy.",
    careerProspects: [
      "Physiotherapist",
      "Sports Therapist",
      "Rehabilitation Specialist",
      "Private Practitioner",
      "Hospital Therapist",
    ],
    subjects: [
      { name: "Mathematics", level: 5, isRequired: true },
      { name: "Physical Sciences", level: 5, isRequired: true },
      { name: "Life Sciences", level: 6, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    rule: "all",
  },
  {
    name: "BSc Occupational Therapy",
    faculty: "Health Sciences",
    duration: "4 years",
    apsRequirement: 34,
    description: "Helping people participate in activities of daily living.",
    careerProspects: [
      "Occupational Therapist",
      "Rehabilitation Specialist",
      "Mental Health Therapist",
      "Pediatric Therapist",
      "Community Health Worker",
    ],
    subjects: [
      { name: "Mathematics", level: 5, isRequired: true },
      { name: "Life Sciences", level: 6, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    rule: "all",
  },
  {
    name: "BSc Nursing Science",
    faculty: "Health Sciences",
    duration: "4 years",
    apsRequirement: 32,
    description: "Comprehensive nursing care and patient management.",
    careerProspects: [
      "Registered Nurse",
      "Nurse Manager",
      "Clinical Nurse Specialist",
      "Community Health Nurse",
      "Nurse Educator",
    ],
    subjects: [
      { name: "Mathematics", level: 4, isRequired: true },
      { name: "Life Sciences", level: 5, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    rule: "all",
  },

  // Faculty of Humanities / Arts and Social Sciences
  {
    name: "BA English",
    faculty: "Humanities",
    duration: "3 years",
    apsRequirement: 26,
    description: "Literature, language studies, and communication skills.",
    careerProspects: [
      "Teacher",
      "Writer",
      "Editor",
      "Journalist",
      "Communications Specialist",
    ],
    subjects: [{ name: "English", level: 6, isRequired: true }],
    rule: "all",
  },
  {
    name: "BA History",
    faculty: "Humanities",
    duration: "3 years",
    apsRequirement: 26,
    description: "Study of past events, societies, and cultural developments.",
    careerProspects: [
      "Historian",
      "Teacher",
      "Museum Curator",
      "Archivist",
      "Research Analyst",
    ],
    subjects: [{ name: "English", level: 5, isRequired: true }],
    rule: "all",
  },
  {
    name: "BA Philosophy",
    faculty: "Humanities",
    duration: "3 years",
    apsRequirement: 26,
    description:
      "Critical thinking, ethics, and fundamental questions about existence.",
    careerProspects: [
      "Philosopher",
      "Teacher",
      "Ethicist",
      "Writer",
      "Policy Analyst",
    ],
    subjects: [{ name: "English", level: 5, isRequired: true }],
    rule: "all",
  },
  {
    name: "BA Psychology",
    faculty: "Humanities",
    duration: "3 years",
    apsRequirement: 28,
    description:
      "Human behavior, mental processes, and psychological research.",
    careerProspects: [
      "Psychologist",
      "Counselor",
      "Research Psychologist",
      "Human Resources Specialist",
      "Social Worker",
    ],
    subjects: [
      { name: "English", level: 5, isRequired: true },
      { name: "Mathematics", level: 4, isRequired: true },
    ],
    rule: "all",
  },

  // Faculty of Commerce / Business and Management
  {
    name: "BCom Accounting",
    faculty: "Commerce",
    duration: "3 years",
    apsRequirement: 30,
    description: "Financial accounting, management accounting, and auditing.",
    careerProspects: [
      "Accountant",
      "Financial Manager",
      "Auditor",
      "Tax Consultant",
      "Financial Analyst",
    ],
    subjects: [
      { name: "Mathematics", level: 5, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    rule: "all",
  },
  {
    name: "BCom Finance",
    faculty: "Commerce",
    duration: "3 years",
    apsRequirement: 30,
    description:
      "Investment management, corporate finance, and financial markets.",
    careerProspects: [
      "Financial Analyst",
      "Investment Banker",
      "Portfolio Manager",
      "Financial Planner",
      "Risk Manager",
    ],
    subjects: [
      { name: "Mathematics", level: 5, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    rule: "all",
  },
  {
    name: "BCom Business Management",
    faculty: "Commerce",
    duration: "3 years",
    apsRequirement: 28,
    description:
      "General management principles, strategy, and organizational behavior.",
    careerProspects: [
      "Business Manager",
      "Operations Manager",
      "Project Manager",
      "Entrepreneur",
      "Management Consultant",
    ],
    subjects: [
      { name: "Mathematics", level: 4, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    rule: "all",
  },
  {
    name: "BCom Marketing",
    faculty: "Commerce",
    duration: "3 years",
    apsRequirement: 28,
    description: "Market research, advertising, brand management, and sales.",
    careerProspects: [
      "Marketing Manager",
      "Brand Manager",
      "Digital Marketer",
      "Sales Manager",
      "Market Research Analyst",
    ],
    subjects: [{ name: "English", level: 5, isRequired: true }],
    rule: "all",
  },

  // Faculty of Law
  {
    name: "LLB Laws",
    faculty: "Law",
    duration: "4 years",
    apsRequirement: 32,
    description: "Legal principles, constitutional law, and jurisprudence.",
    careerProspects: [
      "Lawyer",
      "Attorney",
      "Advocate",
      "Legal Advisor",
      "Magistrate",
    ],
    subjects: [{ name: "English", level: 6, isRequired: true }],
    rule: "all",
  },

  // Faculty of Science / Natural Sciences
  {
    name: "BSc Mathematics",
    faculty: "Science",
    duration: "3 years",
    apsRequirement: 32,
    description:
      "Pure and applied mathematics, statistics, and mathematical modeling.",
    careerProspects: [
      "Mathematician",
      "Statistician",
      "Data Analyst",
      "Actuary",
      "Teacher",
    ],
    subjects: [
      { name: "Mathematics", level: 6, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    rule: "all",
  },
  {
    name: "BSc Computer Science",
    faculty: "Science",
    duration: "3 years",
    apsRequirement: 32,
    description:
      "Programming, algorithms, software development, and computer systems.",
    careerProspects: [
      "Software Developer",
      "Systems Analyst",
      "Computer Programmer",
      "IT Consultant",
      "Data Scientist",
    ],
    subjects: [
      { name: "Mathematics", level: 6, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    rule: "all",
  },
  {
    name: "BSc Physics",
    faculty: "Science",
    duration: "3 years",
    apsRequirement: 32,
    description: "Fundamental principles of matter, energy, and the universe.",
    careerProspects: [
      "Physicist",
      "Research Scientist",
      "Engineer",
      "Teacher",
      "Medical Physicist",
    ],
    subjects: [
      { name: "Mathematics", level: 6, isRequired: true },
      { name: "Physical Sciences", level: 6, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    rule: "all",
  },
  {
    name: "BSc Chemistry",
    faculty: "Science",
    duration: "3 years",
    apsRequirement: 32,
    description:
      "Chemical principles, laboratory techniques, and molecular science.",
    careerProspects: [
      "Chemist",
      "Research Scientist",
      "Quality Control Analyst",
      "Environmental Scientist",
      "Teacher",
    ],
    subjects: [
      { name: "Mathematics", level: 5, isRequired: true },
      { name: "Physical Sciences", level: 6, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    rule: "all",
  },
  {
    name: "BSc Biology",
    faculty: "Science",
    duration: "3 years",
    apsRequirement: 30,
    description: "Living organisms, ecology, and biological processes.",
    careerProspects: [
      "Biologist",
      "Research Scientist",
      "Environmental Consultant",
      "Teacher",
      "Laboratory Technician",
    ],
    subjects: [
      { name: "Life Sciences", level: 6, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    rule: "all",
  },

  // Faculty of Education
  {
    name: "BEd Foundation Phase",
    faculty: "Education",
    duration: "4 years",
    apsRequirement: 26,
    description: "Teaching young children from Grade R to Grade 3.",
    careerProspects: [
      "Foundation Phase Teacher",
      "Early Childhood Educator",
      "Educational Specialist",
      "Curriculum Developer",
      "School Principal",
    ],
    subjects: [{ name: "English", level: 5, isRequired: true }],
    rule: "all",
  },
  {
    name: "BEd Intermediate Phase",
    faculty: "Education",
    duration: "4 years",
    apsRequirement: 26,
    description: "Teaching children from Grade 4 to Grade 6.",
    careerProspects: [
      "Intermediate Phase Teacher",
      "Educational Specialist",
      "Curriculum Developer",
      "School Principal",
      "Education Consultant",
    ],
    subjects: [{ name: "English", level: 5, isRequired: true }],
    rule: "all",
  },
  {
    name: "BEd Senior Phase",
    faculty: "Education",
    duration: "4 years",
    apsRequirement: 26,
    description: "Teaching adolescents from Grade 7 to Grade 9.",
    careerProspects: [
      "Senior Phase Teacher",
      "Subject Specialist",
      "Educational Specialist",
      "School Principal",
      "Education Consultant",
    ],
    subjects: [{ name: "English", level: 5, isRequired: true }],
    rule: "all",
  },

  // Faculty of Information Technology
  {
    name: "BIT Information Technology",
    faculty: "Information Technology",
    duration: "3 years",
    apsRequirement: 30,
    description: "Information systems, database management, and IT solutions.",
    careerProspects: [
      "IT Specialist",
      "Systems Administrator",
      "Database Administrator",
      "IT Consultant",
      "Network Administrator",
    ],
    subjects: [
      { name: "Mathematics", level: 5, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    rule: "all",
  },
  {
    name: "BSc Software Engineering",
    faculty: "Information Technology",
    duration: "4 years",
    apsRequirement: 32,
    description: "Software development, system design, and project management.",
    careerProspects: [
      "Software Engineer",
      "Software Developer",
      "Systems Architect",
      "Project Manager",
      "Technical Lead",
    ],
    subjects: [
      { name: "Mathematics", level: 6, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    rule: "all",
  },
];

/**
 * Checks if a university should have a specific program based on the rule
 */
function shouldUniversityHaveProgram(
  universityId: string,
  rule: ProgramRule["rule"],
): boolean {
  if (rule === "all") {
    return true;
  }

  const universityCode = UNIVERSITY_ID_TO_CODE[universityId];
  if (!universityCode) {
    return false;
  }

  if ("exclude" in rule) {
    return !rule.exclude.includes(universityCode);
  }

  if ("include" in rule) {
    return rule.include.includes(universityCode);
  }

  return false;
}

/**
 * Generates a degree object from a program rule
 */
function createDegreeFromProgram(
  program: ProgramRule,
  universityId: string,
): Degree {
  return {
    id: `${program.name.toLowerCase().replace(/\s+/g, "-")}-${universityId}`,
    name: program.name,
    faculty: program.faculty,
    duration: program.duration,
    apsRequirement: program.apsRequirement,
    description: program.description,
    subjects: program.subjects,
    careerProspects: program.careerProspects,
  };
}

/**
 * Assigns comprehensive programs to all universities based on the rules
 */
export function assignComprehensivePrograms(
  universities: University[],
): University[] {
  return universities.map((university) => {
    // Group programs by faculty
    const facultyPrograms = new Map<string, Degree[]>();

    // Process each program rule
    COMPREHENSIVE_PROGRAMS.forEach((program) => {
      if (shouldUniversityHaveProgram(university.id, program.rule)) {
        const degree = createDegreeFromProgram(program, university.id);

        if (!facultyPrograms.has(program.faculty)) {
          facultyPrograms.set(program.faculty, []);
        }
        facultyPrograms.get(program.faculty)!.push(degree);
      }
    });

    // Create faculties with their programs
    const updatedFaculties: Faculty[] = [];

    // Merge with existing faculties
    const existingFacultyNames = new Set(
      university.faculties.map((f) => f.name),
    );

    // Add existing faculties first
    university.faculties.forEach((faculty) => {
      const facultyPrograms_existing = facultyPrograms.get(faculty.name) || [];
      updatedFaculties.push({
        ...faculty,
        degrees: [...faculty.degrees, ...facultyPrograms_existing],
      });
      facultyPrograms.delete(faculty.name);
    });

    // Add new faculties that don't exist yet
    facultyPrograms.forEach((degrees, facultyName) => {
      if (degrees.length > 0) {
        updatedFaculties.push({
          id: facultyName.toLowerCase().replace(/\s+/g, "-"),
          name: facultyName,
          description: getFacultyDescription(facultyName),
          degrees: degrees,
        });
      }
    });

    return {
      ...university,
      faculties: updatedFaculties.sort((a, b) => a.name.localeCompare(b.name)),
    };
  });
}

/**
 * Provides descriptions for faculty types
 */
function getFacultyDescription(facultyName: string): string {
  const descriptions: Record<string, string> = {
    Engineering:
      "Engineering and technical programs covering various engineering disciplines and applied sciences.",
    "Health Sciences":
      "Medical and health-related programs focusing on healthcare, medicine, and allied health professions.",
    Humanities:
      "Liberal arts, social sciences, and humanities programs exploring human culture and society.",
    Commerce:
      "Business, finance, and commercial programs preparing students for careers in business and industry.",
    Law: "Legal studies and jurisprudence programs for aspiring lawyers and legal professionals.",
    Science: "Natural sciences, mathematics, and scientific research programs.",
    Education:
      "Teacher training and educational studies programs for aspiring educators.",
    "Information Technology":
      "Computer science, software development, and information technology programs.",
    Agriculture:
      "Agricultural sciences, farming, and food production programs.",
    Arts: "Creative and performing arts programs including visual arts, music, and drama.",
  };

  return (
    descriptions[facultyName] ||
    "Academic programs and courses offered by this faculty."
  );
}
