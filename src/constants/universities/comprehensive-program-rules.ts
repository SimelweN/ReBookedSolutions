import { University, Faculty, Degree } from "@/types/university";

/**
 * Program Assignment Rules System
 *
 * This system implements the comprehensive program assignment logic
 * based on "all" or "exclude: [university list]" annotations.
 */

// University abbreviation mappings for exclusion rules
export const UNIVERSITY_ABBREVIATIONS = {
  UCT: "uct",
  Wits: "wits",
  SU: "su",
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
  UV: "uv",
  WSU: "wsu",
  SMU: "smu",
  UMP: "ump",
  UNIZULU: "unizulu",
  CUT: "cut",
  NMU: "nmu",
  SOL: "sol",
};

// Reverse mapping for ID to abbreviation
export const ID_TO_ABBREVIATION = Object.fromEntries(
  Object.entries(UNIVERSITY_ABBREVIATIONS).map(([abbr, id]) => [id, abbr]),
);

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
}

// Comprehensive program database with assignment rules
export const COMPREHENSIVE_PROGRAMS: ProgramDefinition[] = [
  // Faculty of Engineering / Engineering and Built Environment
  {
    name: "Civil Engineering",
    faculty: "Engineering",
    description:
      "Design, construct and maintain civil infrastructure including roads, bridges, and buildings.",
    duration: "4 years",
    defaultAps: 36,
    assignmentRule: {
      type: "exclude",
      universities: ["uwc", "unisa", "ufh"],
    },
  },
  {
    name: "Mechanical Engineering",
    faculty: "Engineering",
    description:
      "Design, develop and manufacture mechanical systems and machinery.",
    duration: "4 years",
    defaultAps: 36,
    assignmentRule: {
      type: "exclude",
      universities: ["uwc", "unisa", "ufh"],
    },
  },
  {
    name: "Electrical Engineering",
    faculty: "Engineering",
    description:
      "Design and develop electrical systems, electronics, and power systems.",
    duration: "4 years",
    defaultAps: 36,
    assignmentRule: {
      type: "exclude",
      universities: ["uwc", "unisa", "ufh"],
    },
  },
  {
    name: "Chemical Engineering",
    faculty: "Engineering",
    description:
      "Apply chemistry and engineering principles to industrial processes.",
    duration: "4 years",
    defaultAps: 38,
    assignmentRule: {
      type: "exclude",
      universities: ["uj", "unisa", "ufh"],
    },
  },
  {
    name: "Industrial Engineering",
    faculty: "Engineering",
    description:
      "Optimize complex processes and systems for efficiency and quality.",
    duration: "4 years",
    defaultAps: 34,
    assignmentRule: {
      type: "exclude",
      universities: ["uwc", "unisa"],
    },
  },
  {
    name: "Computer Engineering",
    faculty: "Engineering",
    description: "Design and develop computer hardware and software systems.",
    duration: "4 years",
    defaultAps: 35,
    assignmentRule: {
      type: "exclude",
      universities: ["uct", "up", "unisa"],
    },
  },
  {
    name: "Mechatronics",
    faculty: "Engineering",
    description:
      "Integrate mechanical, electrical, and computer engineering systems.",
    duration: "4 years",
    defaultAps: 36,
    assignmentRule: {
      type: "exclude",
      universities: ["uwc", "unisa", "ufh", "mut"],
    },
  },
  {
    name: "Mining Engineering",
    faculty: "Engineering",
    description:
      "Extract minerals and resources from the earth safely and efficiently.",
    duration: "4 years",
    defaultAps: 37,
    assignmentRule: {
      type: "exclude",
      universities: ["uwc", "unisa", "ufh", "ru"],
    },
  },
  {
    name: "Environmental Engineering",
    faculty: "Engineering",
    description:
      "Develop solutions for environmental protection and pollution control.",
    duration: "4 years",
    defaultAps: 34,
    assignmentRule: {
      type: "exclude",
      universities: ["uwc", "unisa"],
    },
  },
  {
    name: "Agricultural Engineering",
    faculty: "Engineering",
    description:
      "Apply engineering principles to agricultural production and processing.",
    duration: "4 years",
    defaultAps: 32,
    assignmentRule: {
      type: "exclude",
      universities: ["uwc", "unisa", "ufh"],
    },
  },
  {
    name: "Structural Engineering",
    faculty: "Engineering",
    description:
      "Design and analyze structural systems for buildings and infrastructure.",
    duration: "4 years",
    defaultAps: 36,
    assignmentRule: {
      type: "exclude",
      universities: ["uwc", "unisa"],
    },
  },
  {
    name: "Transport Engineering",
    faculty: "Engineering",
    description: "Plan and design transportation systems and infrastructure.",
    duration: "4 years",
    defaultAps: 32,
    assignmentRule: {
      type: "include_only",
      universities: ["tut", "dut"],
    },
  },
  {
    name: "Water Resources Engineering",
    faculty: "Engineering",
    description: "Manage and develop water resources and hydraulic systems.",
    duration: "4 years",
    defaultAps: 34,
    assignmentRule: {
      type: "exclude",
      universities: ["uwc", "unisa"],
    },
  },
  {
    name: "Geotechnical Engineering",
    faculty: "Engineering",
    description:
      "Study soil and rock mechanics for foundation and earthwork design.",
    duration: "4 years",
    defaultAps: 35,
    assignmentRule: {
      type: "exclude",
      universities: ["uwc", "unisa"],
    },
  },
  {
    name: "Construction Management",
    faculty: "Engineering",
    description: "Manage construction projects from planning to completion.",
    duration: "4 years",
    defaultAps: 28,
    assignmentRule: {
      type: "all",
    },
  },
  {
    name: "Quantity Surveying",
    faculty: "Engineering",
    description: "Manage costs and contracts in construction projects.",
    duration: "4 years",
    defaultAps: 30,
    assignmentRule: {
      type: "all",
    },
  },
  {
    name: "Urban and Regional Planning",
    faculty: "Built Environment",
    description: "Plan sustainable urban and regional development.",
    duration: "4 years",
    defaultAps: 30,
    assignmentRule: {
      type: "exclude",
      universities: ["unisa", "ufh"],
    },
  },
  {
    name: "Architecture",
    faculty: "Built Environment",
    description:
      "Design buildings and spaces that are functional and aesthetically pleasing.",
    duration: "5 years",
    defaultAps: 35,
    assignmentRule: {
      type: "exclude",
      universities: ["unisa", "ufh", "mut"],
    },
  },
  {
    name: "Building Science",
    faculty: "Built Environment",
    description:
      "Study building materials, construction methods, and building performance.",
    duration: "4 years",
    defaultAps: 28,
    assignmentRule: {
      type: "exclude",
      universities: ["unisa", "ufh"],
    },
  },
  {
    name: "Interior Architecture",
    faculty: "Built Environment",
    description: "Design interior spaces for functionality and aesthetics.",
    duration: "4 years",
    defaultAps: 32,
    assignmentRule: {
      type: "include_only",
      universities: ["su", "uct", "up"],
    },
  },
  {
    name: "Landscape Architecture",
    faculty: "Built Environment",
    description: "Design outdoor spaces and landscapes for communities.",
    duration: "4 years",
    defaultAps: 32,
    assignmentRule: {
      type: "include_only",
      universities: ["su", "uct"],
    },
  },
  {
    name: "Urban Design",
    faculty: "Built Environment",
    description: "Design urban spaces and city planning solutions.",
    duration: "4 years",
    defaultAps: 32,
    assignmentRule: {
      type: "exclude",
      universities: ["unisa", "ufh"],
    },
  },

  // Faculty of Health Sciences / Medicine and Health
  {
    name: "Bachelor of Medicine and Bachelor of Surgery (MBChB)",
    faculty: "Health Sciences",
    description: "Comprehensive medical training to become a qualified doctor.",
    duration: "6 years",
    defaultAps: 40,
    assignmentRule: {
      type: "all",
    },
    apsRequirements: {
      uct: 42,
      wits: 40,
      su: 39,
      up: 38,
      ukzn: 38,
      ufs: 36,
      uws: 35,
      ul: 34,
    },
  },
  {
    name: "Bachelor of Dental Surgery (BDS)",
    faculty: "Health Sciences",
    description: "Comprehensive dental training and oral health care.",
    duration: "5 years",
    defaultAps: 38,
    assignmentRule: {
      type: "exclude",
      universities: ["unisa", "ufh", "mut"],
    },
  },
  {
    name: "Bachelor of Pharmacy (BPharm)",
    faculty: "Health Sciences",
    description: "Study of drugs, their properties, and pharmaceutical care.",
    duration: "4 years",
    defaultAps: 35,
    assignmentRule: {
      type: "all",
    },
  },
  {
    name: "Bachelor of Physiotherapy (BSc Physiotherapy)",
    faculty: "Health Sciences",
    description: "Treatment of movement disorders and physical rehabilitation.",
    duration: "4 years",
    defaultAps: 36,
    assignmentRule: {
      type: "all",
    },
  },
  {
    name: "Bachelor of Occupational Therapy (BSc Occupational Therapy)",
    faculty: "Health Sciences",
    description: "Help people participate in daily activities and occupations.",
    duration: "4 years",
    defaultAps: 34,
    assignmentRule: {
      type: "all",
    },
  },
  {
    name: "Bachelor of Radiography (BSc Radiography)",
    faculty: "Health Sciences",
    description: "Medical imaging and radiation therapy techniques.",
    duration: "4 years",
    defaultAps: 33,
    assignmentRule: {
      type: "exclude",
      universities: ["ufh", "mut"],
    },
  },
  {
    name: "Bachelor of Nursing Science (BNS)",
    faculty: "Health Sciences",
    description: "Comprehensive nursing care and health promotion.",
    duration: "4 years",
    defaultAps: 28,
    assignmentRule: {
      type: "all",
    },
  },
  {
    name: "Bachelor of Clinical Medical Practice (BCMP)",
    faculty: "Health Sciences",
    description: "Clinical medical practice in underserved areas.",
    duration: "3 years",
    defaultAps: 32,
    assignmentRule: {
      type: "exclude",
      universities: ["uct", "wits"],
    },
  },
  {
    name: "Bachelor of Emergency Medical Care (BEMC)",
    faculty: "Health Sciences",
    description: "Emergency medical care and paramedicine.",
    duration: "4 years",
    defaultAps: 30,
    assignmentRule: {
      type: "include_only",
      universities: ["dut", "tut"],
    },
  },
  {
    name: "Bachelor of Medical Science (BMedSci)",
    faculty: "Health Sciences",
    description: "Medical science research and laboratory medicine.",
    duration: "3 years",
    defaultAps: 32,
    assignmentRule: {
      type: "all",
    },
  },
  {
    name: "Bachelor of Biomedical Science (BSc Biomedical Science)",
    faculty: "Health Sciences",
    description: "Study of biological processes in health and disease.",
    duration: "3 years",
    defaultAps: 30,
    assignmentRule: {
      type: "all",
    },
  },
  {
    name: "Bachelor of Medical Laboratory Science (BMLS)",
    faculty: "Health Sciences",
    description: "Laboratory testing and medical diagnostics.",
    duration: "4 years",
    defaultAps: 30,
    assignmentRule: {
      type: "all",
    },
  },
  {
    name: "Bachelor of Optometry (BOptom)",
    faculty: "Health Sciences",
    description: "Eye care and vision correction services.",
    duration: "4 years",
    defaultAps: 34,
    assignmentRule: {
      type: "exclude",
      universities: ["ufh", "mut"],
    },
  },
  {
    name: "Bachelor of Speech-Language Pathology (BSc Speech-Language Pathology)",
    faculty: "Health Sciences",
    description: "Treatment of speech, language, and communication disorders.",
    duration: "4 years",
    defaultAps: 32,
    assignmentRule: {
      type: "exclude",
      universities: ["ufh"],
    },
  },
  {
    name: "Bachelor of Audiology (BSc Audiology)",
    faculty: "Health Sciences",
    description: "Assessment and treatment of hearing and balance disorders.",
    duration: "4 years",
    defaultAps: 32,
    assignmentRule: {
      type: "exclude",
      universities: ["ufh"],
    },
  },
  {
    name: "Bachelor of Dietetics (BSc Dietetics)",
    faculty: "Health Sciences",
    description: "Nutrition science and dietary counseling.",
    duration: "4 years",
    defaultAps: 30,
    assignmentRule: {
      type: "all",
    },
  },
  {
    name: "Bachelor of Environmental Health (BSc Environmental Health)",
    faculty: "Health Sciences",
    description: "Environmental factors affecting human health.",
    duration: "4 years",
    defaultAps: 28,
    assignmentRule: {
      type: "all",
    },
  },
  {
    name: "Bachelor of Public Health (BSc Public Health)",
    faculty: "Health Sciences",
    description: "Population health and disease prevention strategies.",
    duration: "4 years",
    defaultAps: 28,
    assignmentRule: {
      type: "all",
    },
  },
  {
    name: "Bachelor of Medical Imaging (BSc Medical Imaging)",
    faculty: "Health Sciences",
    description: "Advanced medical imaging techniques and technologies.",
    duration: "4 years",
    defaultAps: 32,
    assignmentRule: {
      type: "exclude",
      universities: ["ufh"],
    },
  },
  {
    name: "Bachelor of Clinical Technology (BSc Clinical Technology)",
    faculty: "Health Sciences",
    description: "Clinical laboratory technology and diagnostics.",
    duration: "4 years",
    defaultAps: 30,
    assignmentRule: {
      type: "exclude",
      universities: ["ufh"],
    },
  },

  // Faculty of Humanities / Arts and Social Sciences
  {
    name: "Bachelor of Arts (BA) in English",
    faculty: "Humanities",
    description: "Study of English language, literature, and communication.",
    duration: "3 years",
    defaultAps: 25,
    assignmentRule: {
      type: "all",
    },
  },
  {
    name: "History",
    faculty: "Humanities",
    description: "Study of past events and their significance to society.",
    duration: "3 years",
    defaultAps: 24,
    assignmentRule: {
      type: "all",
    },
  },
  {
    name: "Philosophy",
    faculty: "Humanities",
    description: "Critical thinking and examination of fundamental questions.",
    duration: "3 years",
    defaultAps: 26,
    assignmentRule: {
      type: "all",
    },
  },
  {
    name: "Sociology",
    faculty: "Humanities",
    description: "Study of society, social relationships, and social change.",
    duration: "3 years",
    defaultAps: 25,
    assignmentRule: {
      type: "all",
    },
  },
  {
    name: "Psychology",
    faculty: "Humanities",
    description: "Study of human behavior and mental processes.",
    duration: "3 years",
    defaultAps: 30,
    assignmentRule: {
      type: "all",
    },
  },
  {
    name: "Political Science",
    faculty: "Humanities",
    description: "Study of government, politics, and political behavior.",
    duration: "3 years",
    defaultAps: 26,
    assignmentRule: {
      type: "all",
    },
  },
  {
    name: "Anthropology",
    faculty: "Humanities",
    description: "Study of human culture, society, and evolution.",
    duration: "3 years",
    defaultAps: 25,
    assignmentRule: {
      type: "exclude",
      universities: ["unisa"],
    },
  },
  {
    name: "Archaeology",
    faculty: "Humanities",
    description: "Study of human history through material remains.",
    duration: "3 years",
    defaultAps: 26,
    assignmentRule: {
      type: "exclude",
      universities: ["unisa", "mut"],
    },
  },
  {
    name: "Linguistics",
    faculty: "Humanities",
    description: "Scientific study of language and communication.",
    duration: "3 years",
    defaultAps: 26,
    assignmentRule: {
      type: "all",
    },
  },
  {
    name: "Geography",
    faculty: "Humanities",
    description:
      "Study of Earth's landscapes, environments, and human-place relationships.",
    duration: "3 years",
    defaultAps: 25,
    assignmentRule: {
      type: "all",
    },
  },
  {
    name: "Fine Arts",
    faculty: "Humanities",
    description: "Creative expression through visual arts and media.",
    duration: "3 years",
    defaultAps: 26,
    assignmentRule: {
      type: "exclude",
      universities: ["ufh"],
    },
  },
  {
    name: "Music",
    faculty: "Humanities",
    description: "Musical performance, composition, and theory.",
    duration: "3 years",
    defaultAps: 26,
    assignmentRule: {
      type: "exclude",
      universities: ["ufh", "mut"],
    },
  },
  {
    name: "Theatre Arts",
    faculty: "Humanities",
    description: "Dramatic performance and theatrical production.",
    duration: "3 years",
    defaultAps: 26,
    assignmentRule: {
      type: "exclude",
      universities: ["ufh", "mut"],
    },
  },
  {
    name: "Film and Media Studies",
    faculty: "Humanities",
    description: "Analysis and production of film and digital media.",
    duration: "3 years",
    defaultAps: 27,
    assignmentRule: {
      type: "all",
    },
  },
  {
    name: "Religious Studies",
    faculty: "Humanities",
    description: "Study of world religions and spiritual traditions.",
    duration: "3 years",
    defaultAps: 24,
    assignmentRule: {
      type: "all",
    },
  },
  {
    name: "Gender Studies",
    faculty: "Humanities",
    description: "Interdisciplinary study of gender and sexuality.",
    duration: "3 years",
    defaultAps: 25,
    assignmentRule: {
      type: "all",
    },
  },
  {
    name: "African Studies",
    faculty: "Humanities",
    description: "Interdisciplinary study of African cultures and societies.",
    duration: "3 years",
    defaultAps: 25,
    assignmentRule: {
      type: "all",
    },
  },
  {
    name: "Development Studies",
    faculty: "Humanities",
    description: "Study of social and economic development processes.",
    duration: "3 years",
    defaultAps: 26,
    assignmentRule: {
      type: "all",
    },
  },
  {
    name: "International Relations",
    faculty: "Humanities",
    description:
      "Study of relationships between countries and global politics.",
    duration: "3 years",
    defaultAps: 28,
    assignmentRule: {
      type: "all",
    },
  },
  {
    name: "Communication Science",
    faculty: "Humanities",
    description: "Study of human communication and media.",
    duration: "3 years",
    defaultAps: 26,
    assignmentRule: {
      type: "all",
    },
  },
  {
    name: "Journalism",
    faculty: "Humanities",
    description: "News reporting, writing, and media production.",
    duration: "3 years",
    defaultAps: 28,
    assignmentRule: {
      type: "all",
    },
  },
  {
    name: "Public Relations",
    faculty: "Humanities",
    description: "Strategic communication and relationship management.",
    duration: "3 years",
    defaultAps: 26,
    assignmentRule: {
      type: "all",
    },
  },
  {
    name: "Publishing",
    faculty: "Humanities",
    description: "Book and digital publishing industry practices.",
    duration: "3 years",
    defaultAps: 26,
    assignmentRule: {
      type: "exclude",
      universities: ["unisa"],
    },
  },
  {
    name: "Translation and Interpreting",
    faculty: "Humanities",
    description: "Professional translation and interpretation services.",
    duration: "3 years",
    defaultAps: 28,
    assignmentRule: {
      type: "include_only",
      universities: ["uct", "su"],
    },
  },
  {
    name: "Creative Writing",
    faculty: "Humanities",
    description: "Fiction, poetry, and creative non-fiction writing.",
    duration: "3 years",
    defaultAps: 26,
    assignmentRule: {
      type: "all",
    },
  },
  {
    name: "Visual Arts",
    faculty: "Humanities",
    description: "Painting, sculpture, and visual arts production.",
    duration: "3 years",
    defaultAps: 26,
    assignmentRule: {
      type: "exclude",
      universities: ["ufh"],
    },
  },
  {
    name: "Fashion Design",
    faculty: "Humanities",
    description: "Fashion design and textile arts.",
    duration: "3 years",
    defaultAps: 28,
    assignmentRule: {
      type: "include_only",
      universities: ["su", "uct"],
    },
  },
  {
    name: "Interior Design",
    faculty: "Humanities",
    description: "Interior space design and decoration.",
    duration: "3 years",
    defaultAps: 28,
    assignmentRule: {
      type: "include_only",
      universities: ["su", "uct"],
    },
  },
  {
    name: "Graphic Design",
    faculty: "Humanities",
    description: "Visual communication and graphic design.",
    duration: "3 years",
    defaultAps: 28,
    assignmentRule: {
      type: "include_only",
      universities: ["su", "uct"],
    },
  },
  {
    name: "Industrial Design",
    faculty: "Humanities",
    description: "Product design and industrial aesthetics.",
    duration: "3 years",
    defaultAps: 30,
    assignmentRule: {
      type: "include_only",
      universities: ["su", "uct"],
    },
  },
  {
    name: "Photography",
    faculty: "Humanities",
    description: "Photographic arts and digital imaging.",
    duration: "3 years",
    defaultAps: 26,
    assignmentRule: {
      type: "all",
    },
  },
  {
    name: "Animation",
    faculty: "Humanities",
    description: "Digital animation and motion graphics.",
    duration: "3 years",
    defaultAps: 28,
    assignmentRule: {
      type: "all",
    },
  },
  {
    name: "Film Production",
    faculty: "Humanities",
    description: "Film and video production techniques.",
    duration: "3 years",
    defaultAps: 28,
    assignmentRule: {
      type: "all",
    },
  },
  {
    name: "Theatre Production",
    faculty: "Humanities",
    description: "Behind-the-scenes theatre production and management.",
    duration: "3 years",
    defaultAps: 26,
    assignmentRule: {
      type: "all",
    },
  },
];

// More programs will be added in the next part due to size limitations
