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
  SPU: "spu",

  // Specialized Universities (3)
  UNISA: "unisa",
  SMU: "smu",
  NMU: "nmu",
};

// Program definitions with detailed inclusion/exclusion rules
interface ProgramRule {
  name: string;
  faculty: string;
  duration: string;
  apsRequirement: number;
  type: "all" | "exclude" | "include_only";
  excludeUniversities?: string[];
  includeOnlyUniversities?: string[];
}

// ALL COMPREHENSIVE PROGRAM RULES
const COMPREHENSIVE_PROGRAM_RULES: ProgramRule[] = [
  // Faculty of Engineering / Engineering and Built Environment
  {
    name: "Civil Engineering",
    faculty: "engineering",
    duration: "4 years",
    apsRequirement: 35,
    type: "exclude",
    excludeUniversities: ["UWC", "UNISA", "UFH"],
  },
  {
    name: "Mechanical Engineering",
    faculty: "engineering",
    duration: "4 years",
    apsRequirement: 35,
    type: "exclude",
    excludeUniversities: ["UWC", "UNISA", "UFH"],
  },
  {
    name: "Electrical Engineering",
    faculty: "engineering",
    duration: "4 years",
    apsRequirement: 35,
    type: "exclude",
    excludeUniversities: ["UWC", "UNISA", "UFH"],
  },
  {
    name: "Chemical Engineering",
    faculty: "engineering",
    duration: "4 years",
    apsRequirement: 36,
    type: "exclude",
    excludeUniversities: ["UJ", "UNISA", "UFH"],
  },
  {
    name: "Industrial Engineering",
    faculty: "engineering",
    duration: "4 years",
    apsRequirement: 34,
    type: "exclude",
    excludeUniversities: ["UWC", "UNISA"],
  },
  {
    name: "Computer Engineering",
    faculty: "engineering",
    duration: "4 years",
    apsRequirement: 35,
    type: "exclude",
    excludeUniversities: ["UCT", "UP", "UNISA"],
  },
  {
    name: "Mechatronics",
    faculty: "engineering",
    duration: "4 years",
    apsRequirement: 35,
    type: "exclude",
    excludeUniversities: ["UWC", "UNISA", "UFH", "MUT"],
  },
  {
    name: "Mining Engineering",
    faculty: "engineering",
    duration: "4 years",
    apsRequirement: 34,
    type: "exclude",
    excludeUniversities: ["UWC", "UNISA", "UFH", "RU"],
  },
  {
    name: "Environmental Engineering",
    faculty: "engineering",
    duration: "4 years",
    apsRequirement: 33,
    type: "exclude",
    excludeUniversities: ["UWC", "UNISA"],
  },
  {
    name: "Agricultural Engineering",
    faculty: "engineering",
    duration: "4 years",
    apsRequirement: 32,
    type: "exclude",
    excludeUniversities: ["UWC", "UNISA", "UFH"],
  },
  {
    name: "Structural Engineering",
    faculty: "engineering",
    duration: "4 years",
    apsRequirement: 35,
    type: "exclude",
    excludeUniversities: ["UWC", "UNISA"],
  },
  {
    name: "Transport Engineering",
    faculty: "engineering",
    duration: "4 years",
    apsRequirement: 32,
    type: "include_only",
    includeOnlyUniversities: ["TUT", "DUT"],
  },
  {
    name: "Water Resources Engineering",
    faculty: "engineering",
    duration: "4 years",
    apsRequirement: 33,
    type: "exclude",
    excludeUniversities: ["UWC", "UNISA"],
  },
  {
    name: "Geotechnical Engineering",
    faculty: "engineering",
    duration: "4 years",
    apsRequirement: 34,
    type: "exclude",
    excludeUniversities: ["UWC", "UNISA"],
  },
  {
    name: "Construction Management",
    faculty: "engineering",
    duration: "4 years",
    apsRequirement: 30,
    type: "all",
  },
  {
    name: "Quantity Surveying",
    faculty: "engineering",
    duration: "4 years",
    apsRequirement: 30,
    type: "all",
  },
  {
    name: "Urban and Regional Planning",
    faculty: "engineering",
    duration: "4 years",
    apsRequirement: 32,
    type: "exclude",
    excludeUniversities: ["UNISA", "UFH"],
  },
  {
    name: "Architecture",
    faculty: "engineering",
    duration: "5 years",
    apsRequirement: 35,
    type: "exclude",
    excludeUniversities: ["UNISA", "UFH", "MUT"],
  },
  {
    name: "Building Science",
    faculty: "engineering",
    duration: "4 years",
    apsRequirement: 30,
    type: "exclude",
    excludeUniversities: ["UNISA", "UFH"],
  },
  {
    name: "Interior Architecture",
    faculty: "engineering",
    duration: "4 years",
    apsRequirement: 32,
    type: "include_only",
    includeOnlyUniversities: ["SU", "UCT", "UP"],
  },
  {
    name: "Landscape Architecture",
    faculty: "engineering",
    duration: "4 years",
    apsRequirement: 32,
    type: "include_only",
    includeOnlyUniversities: ["SU", "UCT"],
  },
  {
    name: "Urban Design",
    faculty: "engineering",
    duration: "4 years",
    apsRequirement: 33,
    type: "exclude",
    excludeUniversities: ["UNISA", "UFH"],
  },

  // Faculty of Health Sciences / Medicine and Health
  {
    name: "Bachelor of Medicine and Bachelor of Surgery (MBChB)",
    faculty: "health-sciences",
    duration: "6 years",
    apsRequirement: 40,
    type: "all",
  },
  {
    name: "Bachelor of Dental Surgery (BDS)",
    faculty: "health-sciences",
    duration: "5 years",
    apsRequirement: 38,
    type: "exclude",
    excludeUniversities: ["UNISA", "UFH", "MUT"],
  },
  {
    name: "Bachelor of Pharmacy (BPharm)",
    faculty: "health-sciences",
    duration: "4 years",
    apsRequirement: 35,
    type: "all",
  },
  {
    name: "Bachelor of Physiotherapy (BSc Physiotherapy)",
    faculty: "health-sciences",
    duration: "4 years",
    apsRequirement: 34,
    type: "all",
  },
  {
    name: "Bachelor of Occupational Therapy (BSc Occupational Therapy)",
    faculty: "health-sciences",
    duration: "4 years",
    apsRequirement: 34,
    type: "all",
  },
  {
    name: "Bachelor of Radiography (BSc Radiography)",
    faculty: "health-sciences",
    duration: "4 years",
    apsRequirement: 33,
    type: "exclude",
    excludeUniversities: ["UFH", "MUT"],
  },
  {
    name: "Bachelor of Nursing Science (BNS)",
    faculty: "health-sciences",
    duration: "4 years",
    apsRequirement: 30,
    type: "all",
  },
  {
    name: "Bachelor of Clinical Medical Practice (BCMP)",
    faculty: "health-sciences",
    duration: "3 years",
    apsRequirement: 32,
    type: "exclude",
    excludeUniversities: ["UCT", "Wits"],
  },
  {
    name: "Bachelor of Emergency Medical Care (BEMC)",
    faculty: "health-sciences",
    duration: "4 years",
    apsRequirement: 30,
    type: "include_only",
    includeOnlyUniversities: ["DUT", "TUT"],
  },
  {
    name: "Bachelor of Medical Science (BMedSci)",
    faculty: "health-sciences",
    duration: "3 years",
    apsRequirement: 32,
    type: "all",
  },
  {
    name: "Bachelor of Biomedical Science (BSc Biomedical Science)",
    faculty: "health-sciences",
    duration: "3 years",
    apsRequirement: 32,
    type: "all",
  },
  {
    name: "Bachelor of Medical Laboratory Science (BMLS)",
    faculty: "health-sciences",
    duration: "4 years",
    apsRequirement: 30,
    type: "all",
  },
  {
    name: "Bachelor of Optometry (BOptom)",
    faculty: "health-sciences",
    duration: "4 years",
    apsRequirement: 34,
    type: "exclude",
    excludeUniversities: ["UFH", "MUT"],
  },
  {
    name: "Bachelor of Speech-Language Pathology (BSc Speech-Language Pathology)",
    faculty: "health-sciences",
    duration: "4 years",
    apsRequirement: 32,
    type: "exclude",
    excludeUniversities: ["UFH"],
  },
  {
    name: "Bachelor of Audiology (BSc Audiology)",
    faculty: "health-sciences",
    duration: "4 years",
    apsRequirement: 32,
    type: "exclude",
    excludeUniversities: ["UFH"],
  },
  {
    name: "Bachelor of Dietetics (BSc Dietetics)",
    faculty: "health-sciences",
    duration: "4 years",
    apsRequirement: 32,
    type: "all",
  },
  {
    name: "Bachelor of Environmental Health (BSc Environmental Health)",
    faculty: "health-sciences",
    duration: "4 years",
    apsRequirement: 30,
    type: "all",
  },
  {
    name: "Bachelor of Public Health (BSc Public Health)",
    faculty: "health-sciences",
    duration: "3 years",
    apsRequirement: 30,
    type: "all",
  },
  {
    name: "Bachelor of Medical Imaging (BSc Medical Imaging)",
    faculty: "health-sciences",
    duration: "4 years",
    apsRequirement: 32,
    type: "exclude",
    excludeUniversities: ["UFH"],
  },
  {
    name: "Bachelor of Clinical Technology (BSc Clinical Technology)",
    faculty: "health-sciences",
    duration: "4 years",
    apsRequirement: 30,
    type: "exclude",
    excludeUniversities: ["UFH"],
  },

  // Faculty of Humanities / Arts and Social Sciences
  {
    name: "Bachelor of Arts (BA) in English",
    faculty: "humanities",
    duration: "3 years",
    apsRequirement: 26,
    type: "all",
  },
  {
    name: "History",
    faculty: "humanities",
    duration: "3 years",
    apsRequirement: 26,
    type: "all",
  },
  {
    name: "Philosophy",
    faculty: "humanities",
    duration: "3 years",
    apsRequirement: 28,
    type: "all",
  },
  {
    name: "Sociology",
    faculty: "humanities",
    duration: "3 years",
    apsRequirement: 26,
    type: "all",
  },
  {
    name: "Psychology",
    faculty: "humanities",
    duration: "3 years",
    apsRequirement: 30,
    type: "all",
  },
  {
    name: "Political Science",
    faculty: "humanities",
    duration: "3 years",
    apsRequirement: 28,
    type: "all",
  },
  {
    name: "Anthropology",
    faculty: "humanities",
    duration: "3 years",
    apsRequirement: 28,
    type: "exclude",
    excludeUniversities: ["UNISA"],
  },
  {
    name: "Archaeology",
    faculty: "humanities",
    duration: "3 years",
    apsRequirement: 28,
    type: "exclude",
    excludeUniversities: ["UNISA", "MUT"],
  },
  {
    name: "Linguistics",
    faculty: "humanities",
    duration: "3 years",
    apsRequirement: 28,
    type: "all",
  },
  {
    name: "Geography",
    faculty: "humanities",
    duration: "3 years",
    apsRequirement: 26,
    type: "all",
  },
  {
    name: "Fine Arts",
    faculty: "humanities",
    duration: "4 years",
    apsRequirement: 28,
    type: "exclude",
    excludeUniversities: ["UFH"],
  },
  {
    name: "Music",
    faculty: "humanities",
    duration: "4 years",
    apsRequirement: 28,
    type: "exclude",
    excludeUniversities: ["UFH", "MUT"],
  },
  {
    name: "Theatre Arts",
    faculty: "humanities",
    duration: "3 years",
    apsRequirement: 26,
    type: "exclude",
    excludeUniversities: ["UFH", "MUT"],
  },
  {
    name: "Film and Media Studies",
    faculty: "humanities",
    duration: "3 years",
    apsRequirement: 28,
    type: "all",
  },
  {
    name: "Religious Studies",
    faculty: "humanities",
    duration: "3 years",
    apsRequirement: 26,
    type: "all",
  },
  {
    name: "Gender Studies",
    faculty: "humanities",
    duration: "3 years",
    apsRequirement: 26,
    type: "all",
  },
  {
    name: "African Studies",
    faculty: "humanities",
    duration: "3 years",
    apsRequirement: 26,
    type: "all",
  },
  {
    name: "Development Studies",
    faculty: "humanities",
    duration: "3 years",
    apsRequirement: 26,
    type: "all",
  },
  {
    name: "International Relations",
    faculty: "humanities",
    duration: "3 years",
    apsRequirement: 30,
    type: "all",
  },
  {
    name: "Communication Science",
    faculty: "humanities",
    duration: "3 years",
    apsRequirement: 28,
    type: "all",
  },
  {
    name: "Journalism",
    faculty: "humanities",
    duration: "3 years",
    apsRequirement: 30,
    type: "all",
  },
  {
    name: "Public Relations",
    faculty: "humanities",
    duration: "3 years",
    apsRequirement: 28,
    type: "all",
  },
  {
    name: "Publishing",
    faculty: "humanities",
    duration: "3 years",
    apsRequirement: 28,
    type: "exclude",
    excludeUniversities: ["UNISA"],
  },
  {
    name: "Translation and Interpreting",
    faculty: "humanities",
    duration: "3 years",
    apsRequirement: 30,
    type: "include_only",
    includeOnlyUniversities: ["UCT", "SU"],
  },
  {
    name: "Creative Writing",
    faculty: "humanities",
    duration: "3 years",
    apsRequirement: 28,
    type: "all",
  },
  {
    name: "Visual Arts",
    faculty: "humanities",
    duration: "4 years",
    apsRequirement: 28,
    type: "exclude",
    excludeUniversities: ["UFH"],
  },
  {
    name: "Fashion Design",
    faculty: "humanities",
    duration: "3 years",
    apsRequirement: 26,
    type: "include_only",
    includeOnlyUniversities: ["SU", "UCT"],
  },
  {
    name: "Interior Design",
    faculty: "humanities",
    duration: "3 years",
    apsRequirement: 28,
    type: "include_only",
    includeOnlyUniversities: ["SU", "UCT"],
  },
  {
    name: "Graphic Design",
    faculty: "humanities",
    duration: "3 years",
    apsRequirement: 26,
    type: "include_only",
    includeOnlyUniversities: ["SU", "UCT"],
  },
  {
    name: "Industrial Design",
    faculty: "humanities",
    duration: "4 years",
    apsRequirement: 30,
    type: "include_only",
    includeOnlyUniversities: ["SU", "UCT"],
  },
  {
    name: "Photography",
    faculty: "humanities",
    duration: "3 years",
    apsRequirement: 26,
    type: "all",
  },
  {
    name: "Animation",
    faculty: "humanities",
    duration: "3 years",
    apsRequirement: 26,
    type: "all",
  },
  {
    name: "Film Production",
    faculty: "humanities",
    duration: "3 years",
    apsRequirement: 28,
    type: "all",
  },
  {
    name: "Theatre Production",
    faculty: "humanities",
    duration: "3 years",
    apsRequirement: 26,
    type: "all",
  },

  // Faculty of Commerce / Business and Management
  {
    name: "Bachelor of Commerce (BCom) in Accounting",
    faculty: "commerce",
    duration: "3 years",
    apsRequirement: 32,
    type: "all",
  },
  {
    name: "Finance",
    faculty: "commerce",
    duration: "3 years",
    apsRequirement: 30,
    type: "all",
  },
  {
    name: "Economics",
    faculty: "commerce",
    duration: "3 years",
    apsRequirement: 30,
    type: "all",
  },
  {
    name: "Marketing",
    faculty: "commerce",
    duration: "3 years",
    apsRequirement: 28,
    type: "all",
  },
  {
    name: "Human Resource Management",
    faculty: "commerce",
    duration: "3 years",
    apsRequirement: 28,
    type: "all",
  },
  {
    name: "Business Management",
    faculty: "commerce",
    duration: "3 years",
    apsRequirement: 28,
    type: "all",
  },
  {
    name: "Supply Chain Management",
    faculty: "commerce",
    duration: "3 years",
    apsRequirement: 28,
    type: "all",
  },
  {
    name: "Logistics",
    faculty: "commerce",
    duration: "3 years",
    apsRequirement: 26,
    type: "all",
  },
  {
    name: "Risk Management",
    faculty: "commerce",
    duration: "3 years",
    apsRequirement: 30,
    type: "all",
  },
  {
    name: "Tourism Management",
    faculty: "commerce",
    duration: "3 years",
    apsRequirement: 26,
    type: "all",
  },
  {
    name: "Hospitality Management",
    faculty: "commerce",
    duration: "3 years",
    apsRequirement: 26,
    type: "all",
  },
  {
    name: "Public Administration",
    faculty: "commerce",
    duration: "3 years",
    apsRequirement: 26,
    type: "all",
  },
  {
    name: "Labour Relations",
    faculty: "commerce",
    duration: "3 years",
    apsRequirement: 28,
    type: "all",
  },
  {
    name: "Entrepreneurship",
    faculty: "commerce",
    duration: "3 years",
    apsRequirement: 26,
    type: "all",
  },
  {
    name: "Banking",
    faculty: "commerce",
    duration: "3 years",
    apsRequirement: 30,
    type: "all",
  },
  {
    name: "Insurance",
    faculty: "commerce",
    duration: "3 years",
    apsRequirement: 28,
    type: "all",
  },
  {
    name: "Auditing",
    faculty: "commerce",
    duration: "3 years",
    apsRequirement: 32,
    type: "all",
  },
  {
    name: "Actuarial Science",
    faculty: "commerce",
    duration: "3 years",
    apsRequirement: 38,
    type: "exclude",
    excludeUniversities: ["UFH", "MUT"],
  },
  {
    name: "Taxation",
    faculty: "commerce",
    duration: "3 years",
    apsRequirement: 30,
    type: "all",
  },
  {
    name: "Investment Management",
    faculty: "commerce",
    duration: "3 years",
    apsRequirement: 32,
    type: "all",
  },
  {
    name: "Business Analytics",
    faculty: "commerce",
    duration: "3 years",
    apsRequirement: 30,
    type: "all",
  },
  {
    name: "Strategic Management",
    faculty: "commerce",
    duration: "3 years",
    apsRequirement: 30,
    type: "all",
  },
  {
    name: "International Business",
    faculty: "commerce",
    duration: "3 years",
    apsRequirement: 30,
    type: "all",
  },
  {
    name: "Bachelor of Business Science (BBusSc) in Business Analysis",
    faculty: "commerce",
    duration: "3 years",
    apsRequirement: 32,
    type: "all",
  },
  {
    name: "Business Computing",
    faculty: "commerce",
    duration: "3 years",
    apsRequirement: 30,
    type: "all",
  },
  {
    name: "Business Economics",
    faculty: "commerce",
    duration: "3 years",
    apsRequirement: 30,
    type: "all",
  },
  {
    name: "Business Finance",
    faculty: "commerce",
    duration: "3 years",
    apsRequirement: 30,
    type: "all",
  },
  {
    name: "Business Law",
    faculty: "commerce",
    duration: "3 years",
    apsRequirement: 30,
    type: "all",
  },
  {
    name: "Business Marketing",
    faculty: "commerce",
    duration: "3 years",
    apsRequirement: 28,
    type: "all",
  },
  {
    name: "Business Statistics",
    faculty: "commerce",
    duration: "3 years",
    apsRequirement: 30,
    type: "all",
  },
  {
    name: "Business Strategy",
    faculty: "commerce",
    duration: "3 years",
    apsRequirement: 30,
    type: "all",
  },
  {
    name: "Bachelor of Administration (BAdmin) in Public Administration",
    faculty: "commerce",
    duration: "3 years",
    apsRequirement: 26,
    type: "all",
  },
  {
    name: "Local Government",
    faculty: "commerce",
    duration: "3 years",
    apsRequirement: 26,
    type: "all",
  },
  {
    name: "Municipal Governance",
    faculty: "commerce",
    duration: "3 years",
    apsRequirement: 26,
    type: "all",
  },

  // Faculty of Law
  {
    name: "Bachelor of Laws (LLB)",
    faculty: "law",
    duration: "4 years",
    apsRequirement: 35,
    type: "all",
  },
  {
    name: "Bachelor of Criminal Justice",
    faculty: "law",
    duration: "3 years",
    apsRequirement: 30,
    type: "all",
  },
  {
    name: "Bachelor of Forensic Science",
    faculty: "law",
    duration: "3 years",
    apsRequirement: 32,
    type: "exclude",
    excludeUniversities: ["UFH", "MUT"],
  },
  {
    name: "Bachelor of International Law",
    faculty: "law",
    duration: "4 years",
    apsRequirement: 35,
    type: "all",
  },
  {
    name: "Bachelor of Environmental Law",
    faculty: "law",
    duration: "4 years",
    apsRequirement: 33,
    type: "all",
  },
  {
    name: "Bachelor of Labour Law",
    faculty: "law",
    duration: "4 years",
    apsRequirement: 33,
    type: "all",
  },
  {
    name: "Bachelor of Tax Law",
    faculty: "law",
    duration: "4 years",
    apsRequirement: 35,
    type: "all",
  },
  {
    name: "Bachelor of Commercial Law",
    faculty: "law",
    duration: "4 years",
    apsRequirement: 35,
    type: "all",
  },
  {
    name: "Bachelor of Constitutional Law",
    faculty: "law",
    duration: "4 years",
    apsRequirement: 35,
    type: "all",
  },
  {
    name: "Bachelor of Human Rights Law",
    faculty: "law",
    duration: "4 years",
    apsRequirement: 33,
    type: "all",
  },

  // Faculty of Science / Natural Sciences
  {
    name: "Bachelor of Science (BSc) in Biological Sciences",
    faculty: "science",
    duration: "3 years",
    apsRequirement: 30,
    type: "all",
  },
  {
    name: "Chemistry",
    faculty: "science",
    duration: "3 years",
    apsRequirement: 32,
    type: "all",
  },
  {
    name: "Physics",
    faculty: "science",
    duration: "3 years",
    apsRequirement: 34,
    type: "all",
  },
  {
    name: "Mathematics",
    faculty: "science",
    duration: "3 years",
    apsRequirement: 34,
    type: "all",
  },
  {
    name: "Computer Science",
    faculty: "science",
    duration: "3 years",
    apsRequirement: 32,
    type: "all",
  },
  {
    name: "Environmental Science",
    faculty: "science",
    duration: "3 years",
    apsRequirement: 30,
    type: "all",
  },
  {
    name: "Geology",
    faculty: "science",
    duration: "3 years",
    apsRequirement: 30,
    type: "all",
  },
  {
    name: "Geography",
    faculty: "science",
    duration: "3 years",
    apsRequirement: 26,
    type: "all",
  },
  {
    name: "Statistics",
    faculty: "science",
    duration: "3 years",
    apsRequirement: 32,
    type: "all",
  },
  {
    name: "Biochemistry",
    faculty: "science",
    duration: "3 years",
    apsRequirement: 32,
    type: "all",
  },
  {
    name: "Microbiology",
    faculty: "science",
    duration: "3 years",
    apsRequirement: 30,
    type: "all",
  },
  {
    name: "Genetics",
    faculty: "science",
    duration: "3 years",
    apsRequirement: 32,
    type: "all",
  },
  {
    name: "Botany",
    faculty: "science",
    duration: "3 years",
    apsRequirement: 28,
    type: "all",
  },
  {
    name: "Zoology",
    faculty: "science",
    duration: "3 years",
    apsRequirement: 28,
    type: "all",
  },
  {
    name: "Astronomy",
    faculty: "science",
    duration: "3 years",
    apsRequirement: 36,
    type: "include_only",
    includeOnlyUniversities: ["UCT", "RU"],
  },
  {
    name: "Meteorology",
    faculty: "science",
    duration: "3 years",
    apsRequirement: 34,
    type: "include_only",
    includeOnlyUniversities: ["UCT", "RU"],
  },
  {
    name: "Marine Biology",
    faculty: "science",
    duration: "3 years",
    apsRequirement: 32,
    type: "include_only",
    includeOnlyUniversities: ["UCT", "RU"],
  },
  {
    name: "Biotechnology",
    faculty: "science",
    duration: "3 years",
    apsRequirement: 32,
    type: "all",
  },
  {
    name: "Ecology",
    faculty: "science",
    duration: "3 years",
    apsRequirement: 30,
    type: "all",
  },
  {
    name: "Entomology",
    faculty: "science",
    duration: "3 years",
    apsRequirement: 28,
    type: "all",
  },
  {
    name: "Mycology",
    faculty: "science",
    duration: "3 years",
    apsRequirement: 28,
    type: "exclude",
    excludeUniversities: ["UFH"],
  },
  {
    name: "Phycology",
    faculty: "science",
    duration: "3 years",
    apsRequirement: 28,
    type: "exclude",
    excludeUniversities: ["UFH"],
  },
  {
    name: "Limnology",
    faculty: "science",
    duration: "3 years",
    apsRequirement: 28,
    type: "exclude",
    excludeUniversities: ["UFH"],
  },
  {
    name: "Hydrology",
    faculty: "science",
    duration: "3 years",
    apsRequirement: 30,
    type: "all",
  },
  {
    name: "Soil Science",
    faculty: "science",
    duration: "3 years",
    apsRequirement: 28,
    type: "all",
  },
  {
    name: "Agricultural Science",
    faculty: "science",
    duration: "4 years",
    apsRequirement: 28,
    type: "all",
  },

  // Faculty of Education
  {
    name: "Bachelor of Education (BEd) in Foundation Phase",
    faculty: "education",
    duration: "4 years",
    apsRequirement: 26,
    type: "all",
  },
  {
    name: "Intermediate Phase",
    faculty: "education",
    duration: "4 years",
    apsRequirement: 26,
    type: "all",
  },
  {
    name: "Senior Phase",
    faculty: "education",
    duration: "4 years",
    apsRequirement: 26,
    type: "all",
  },
  {
    name: "Further Education and Training (FET) Phase",
    faculty: "education",
    duration: "4 years",
    apsRequirement: 28,
    type: "all",
  },
  {
    name: "Special Education",
    faculty: "education",
    duration: "4 years",
    apsRequirement: 28,
    type: "all",
  },
  {
    name: "Adult Education",
    faculty: "education",
    duration: "4 years",
    apsRequirement: 26,
    type: "all",
  },
  {
    name: "Educational Psychology",
    faculty: "education",
    duration: "4 years",
    apsRequirement: 32,
    type: "all",
  },
  {
    name: "Educational Management",
    faculty: "education",
    duration: "4 years",
    apsRequirement: 30,
    type: "all",
  },
  {
    name: "Curriculum Studies",
    faculty: "education",
    duration: "4 years",
    apsRequirement: 28,
    type: "all",
  },
  {
    name: "Language Education",
    faculty: "education",
    duration: "4 years",
    apsRequirement: 26,
    type: "all",
  },
  {
    name: "Mathematics Education",
    faculty: "education",
    duration: "4 years",
    apsRequirement: 30,
    type: "all",
  },
  {
    name: "Science Education",
    faculty: "education",
    duration: "4 years",
    apsRequirement: 30,
    type: "all",
  },
  {
    name: "Technology Education",
    faculty: "education",
    duration: "4 years",
    apsRequirement: 28,
    type: "all",
  },
  {
    name: "Social Sciences Education",
    faculty: "education",
    duration: "4 years",
    apsRequirement: 26,
    type: "all",
  },
  {
    name: "Life Orientation Education",
    faculty: "education",
    duration: "4 years",
    apsRequirement: 26,
    type: "all",
  },
  {
    name: "Arts and Culture Education",
    faculty: "education",
    duration: "4 years",
    apsRequirement: 26,
    type: "all",
  },
  {
    name: "Economic and Management Sciences Education",
    faculty: "education",
    duration: "4 years",
    apsRequirement: 28,
    type: "all",
  },
  {
    name: "Physical Education",
    faculty: "education",
    duration: "4 years",
    apsRequirement: 26,
    type: "all",
  },

  // Faculty of Agriculture / Agricultural Sciences
  {
    name: "Bachelor of Agriculture in Animal Science",
    faculty: "agriculture",
    duration: "4 years",
    apsRequirement: 28,
    type: "all",
  },
  {
    name: "Plant Production",
    faculty: "agriculture",
    duration: "4 years",
    apsRequirement: 28,
    type: "all",
  },
  {
    name: "Soil Science",
    faculty: "agriculture",
    duration: "4 years",
    apsRequirement: 28,
    type: "all",
  },
  {
    name: "Agricultural Economics",
    faculty: "agriculture",
    duration: "4 years",
    apsRequirement: 28,
    type: "all",
  },
  {
    name: "Agricultural Extension",
    faculty: "agriculture",
    duration: "4 years",
    apsRequirement: 26,
    type: "all",
  },
  {
    name: "Horticulture",
    faculty: "agriculture",
    duration: "4 years",
    apsRequirement: 26,
    type: "all",
  },
  {
    name: "Viticulture and Oenology",
    faculty: "agriculture",
    duration: "4 years",
    apsRequirement: 30,
    type: "include_only",
    includeOnlyUniversities: ["SU", "UCT"],
  },
  {
    name: "Agricultural Engineering",
    faculty: "agriculture",
    duration: "4 years",
    apsRequirement: 32,
    type: "exclude",
    excludeUniversities: ["UWC", "UNISA", "UFH"],
  },
  {
    name: "Agricultural Management",
    faculty: "agriculture",
    duration: "4 years",
    apsRequirement: 26,
    type: "all",
  },
  {
    name: "Food Science and Technology",
    faculty: "agriculture",
    duration: "4 years",
    apsRequirement: 30,
    type: "all",
  },
  {
    name: "Forestry",
    faculty: "agriculture",
    duration: "4 years",
    apsRequirement: 28,
    type: "include_only",
    includeOnlyUniversities: ["SU", "UCT"],
  },
  {
    name: "Game Ranch Management",
    faculty: "agriculture",
    duration: "4 years",
    apsRequirement: 26,
    type: "include_only",
    includeOnlyUniversities: ["UFH", "RU"],
  },
  {
    name: "Irrigation Management",
    faculty: "agriculture",
    duration: "4 years",
    apsRequirement: 26,
    type: "all",
  },
  {
    name: "Organic Farming",
    faculty: "agriculture",
    duration: "4 years",
    apsRequirement: 26,
    type: "include_only",
    includeOnlyUniversities: ["SU"],
  },
  {
    name: "Precision Agriculture",
    faculty: "agriculture",
    duration: "4 years",
    apsRequirement: 30,
    type: "include_only",
    includeOnlyUniversities: ["SU", "UCT"],
  },
  {
    name: "Rural Development",
    faculty: "agriculture",
    duration: "4 years",
    apsRequirement: 26,
    type: "all",
  },

  // Faculty of Information Technology / Computer Science
  {
    name: "Bachelor of Information Technology (BIT)",
    faculty: "information-technology",
    duration: "3 years",
    apsRequirement: 30,
    type: "all",
  },
  {
    name: "Bachelor of Science in Computer Science (BSc Computer Science)",
    faculty: "information-technology",
    duration: "3 years",
    apsRequirement: 32,
    type: "all",
  },
  {
    name: "Bachelor of Software Engineering (BSc Software Engineering)",
    faculty: "information-technology",
    duration: "4 years",
    apsRequirement: 34,
    type: "all",
  },
  {
    name: "Bachelor of Information Systems (BIS)",
    faculty: "information-technology",
    duration: "3 years",
    apsRequirement: 30,
    type: "all",
  },
  {
    name: "Bachelor of Cybersecurity",
    faculty: "information-technology",
    duration: "3 years",
    apsRequirement: 32,
    type: "all",
  },
  {
    name: "Bachelor of Data Science",
    faculty: "information-technology",
    duration: "3 years",
    apsRequirement: 32,
    type: "all",
  },
  {
    name: "Bachelor of Artificial Intelligence",
    faculty: "information-technology",
    duration: "3 years",
    apsRequirement: 34,
    type: "all",
  },
  {
    name: "Bachelor of Game Development",
    faculty: "information-technology",
    duration: "3 years",
    apsRequirement: 30,
    type: "all",
  },
  {
    name: "Bachelor of Web Development",
    faculty: "information-technology",
    duration: "3 years",
    apsRequirement: 28,
    type: "all",
  },
  {
    name: "Bachelor of Mobile Application Development",
    faculty: "information-technology",
    duration: "3 years",
    apsRequirement: 30,
    type: "all",
  },
  {
    name: "Bachelor of Network Engineering",
    faculty: "information-technology",
    duration: "3 years",
    apsRequirement: 30,
    type: "all",
  },
  {
    name: "Bachelor of Cloud Computing",
    faculty: "information-technology",
    duration: "3 years",
    apsRequirement: 30,
    type: "all",
  },
  {
    name: "Bachelor of Digital Media",
    faculty: "information-technology",
    duration: "3 years",
    apsRequirement: 26,
    type: "all",
  },

  // Faculty of Built Environment / Architecture and Planning
  {
    name: "Bachelor of Architecture (BArch)",
    faculty: "built-environment",
    duration: "5 years",
    apsRequirement: 35,
    type: "exclude",
    excludeUniversities: ["UNISA", "UFH"],
  },
  {
    name: "Bachelor of Architectural Studies (BAS)",
    faculty: "built-environment",
    duration: "3 years",
    apsRequirement: 32,
    type: "exclude",
    excludeUniversities: ["UNISA", "UFH"],
  },
  {
    name: "Bachelor of Urban and Regional Planning",
    faculty: "built-environment",
    duration: "4 years",
    apsRequirement: 32,
    type: "exclude",
    excludeUniversities: ["UNISA", "UFH"],
  },
  {
    name: "Bachelor of Construction Studies",
    faculty: "built-environment",
    duration: "4 years",
    apsRequirement: 28,
    type: "all",
  },
  {
    name: "Bachelor of Quantity Surveying",
    faculty: "built-environment",
    duration: "4 years",
    apsRequirement: 30,
    type: "all",
  },
  {
    name: "Bachelor of Property Studies",
    faculty: "built-environment",
    duration: "3 years",
    apsRequirement: 26,
    type: "exclude",
    excludeUniversities: ["UNISA"],
  },
  {
    name: "Bachelor of Real Estate",
    faculty: "built-environment",
    duration: "3 years",
    apsRequirement: 26,
    type: "include_only",
    includeOnlyUniversities: ["TUT", "DUT"],
  },
  {
    name: "Bachelor of Facilities Management",
    faculty: "built-environment",
    duration: "3 years",
    apsRequirement: 26,
    type: "include_only",
    includeOnlyUniversities: ["TUT", "DUT"],
  },
  {
    name: "Bachelor of Housing Studies",
    faculty: "built-environment",
    duration: "3 years",
    apsRequirement: 26,
    type: "include_only",
    includeOnlyUniversities: ["TUT", "DUT"],
  },
  {
    name: "Bachelor of Interior Architecture",
    faculty: "built-environment",
    duration: "4 years",
    apsRequirement: 32,
    type: "exclude",
    excludeUniversities: ["UNISA", "UFH"],
  },
  {
    name: "Bachelor of Landscape Architecture",
    faculty: "built-environment",
    duration: "4 years",
    apsRequirement: 32,
    type: "exclude",
    excludeUniversities: ["UNISA", "UFH"],
  },

  // Technical and Vocational Programmes (mostly for Universities of Technology)
  {
    name: "National Diploma in Engineering (various disciplines)",
    faculty: "engineering",
    duration: "3 years",
    apsRequirement: 26,
    type: "include_only",
    includeOnlyUniversities: ["TUT", "DUT", "MUT", "VUT"],
  },
  {
    name: "National Diploma in Information Technology",
    faculty: "information-technology",
    duration: "3 years",
    apsRequirement: 26,
    type: "include_only",
    includeOnlyUniversities: ["TUT", "DUT", "MUT", "VUT"],
  },
  {
    name: "National Diploma in Business Studies",
    faculty: "commerce",
    duration: "3 years",
    apsRequirement: 24,
    type: "include_only",
    includeOnlyUniversities: ["TUT", "DUT", "MUT", "VUT"],
  },
  {
    name: "National Diploma in Hospitality Management",
    faculty: "commerce",
    duration: "3 years",
    apsRequirement: 24,
    type: "include_only",
    includeOnlyUniversities: ["TUT", "DUT", "MUT", "VUT"],
  },
  {
    name: "National Diploma in Tourism Management",
    faculty: "commerce",
    duration: "3 years",
    apsRequirement: 24,
    type: "include_only",
    includeOnlyUniversities: ["TUT", "DUT", "MUT", "VUT"],
  },
  {
    name: "National Diploma in Public Management",
    faculty: "commerce",
    duration: "3 years",
    apsRequirement: 24,
    type: "include_only",
    includeOnlyUniversities: ["TUT", "DUT", "MUT", "VUT"],
  },
  {
    name: "National Diploma in Graphic Design",
    faculty: "humanities",
    duration: "3 years",
    apsRequirement: 24,
    type: "include_only",
    includeOnlyUniversities: ["TUT", "DUT", "MUT", "VUT"],
  },
  {
    name: "National Diploma in Environmental Health",
    faculty: "health-sciences",
    duration: "3 years",
    apsRequirement: 26,
    type: "include_only",
    includeOnlyUniversities: ["TUT", "DUT", "MUT", "VUT"],
  },
  {
    name: "National Diploma in Food Technology",
    faculty: "agriculture",
    duration: "3 years",
    apsRequirement: 26,
    type: "include_only",
    includeOnlyUniversities: ["TUT", "DUT", "MUT", "VUT"],
  },
];

// Function to resolve university codes to IDs
function resolveUniversityId(code: string): string {
  return UNIVERSITY_MAPPINGS[code] || code.toLowerCase();
}

// Function to apply program rules to all universities
export function assignComprehensivePrograms(
  universities: University[],
): University[] {
  return universities.map((university) => {
    const updatedFaculties = [...university.faculties];

    // Get the university code for exclusion logic
    const universityCode =
      Object.keys(UNIVERSITY_MAPPINGS).find(
        (code) => UNIVERSITY_MAPPINGS[code] === university.id,
      ) || university.id.toUpperCase();

    // Process each program rule
    COMPREHENSIVE_PROGRAM_RULES.forEach((rule) => {
      let shouldAddProgram = false;

      if (rule.type === "all") {
        shouldAddProgram = true;
      } else if (rule.type === "exclude") {
        shouldAddProgram = !rule.excludeUniversities?.includes(universityCode);
      } else if (rule.type === "include_only") {
        shouldAddProgram =
          rule.includeOnlyUniversities?.includes(universityCode) || false;
      }

      if (shouldAddProgram) {
        // Find or create the faculty
        let facultyIndex = updatedFaculties.findIndex(
          (f) =>
            f.id === rule.faculty ||
            f.id.includes(rule.faculty) ||
            rule.faculty.includes(f.id),
        );

        if (facultyIndex === -1) {
          // Create new faculty if it doesn't exist
          const newFaculty: Faculty = {
            id: rule.faculty,
            name: getFacultyDisplayName(rule.faculty),
            description: getFacultyDescription(rule.faculty),
            degrees: [],
          };
          updatedFaculties.push(newFaculty);
          facultyIndex = updatedFaculties.length - 1;
        }

        // Check if program already exists
        const existingProgram = updatedFaculties[facultyIndex].degrees.find(
          (d) =>
            d.name === rule.name ||
            d.name.toLowerCase().includes(rule.name.toLowerCase()) ||
            rule.name.toLowerCase().includes(d.name.toLowerCase()),
        );

        if (!existingProgram) {
          // Add the program
          const newDegree: Degree = {
            id: `${rule.faculty}-${rule.name.toLowerCase().replace(/[^a-z0-9]/g, "-")}`,
            name: rule.name,
            description: getDefaultDescription(rule.name),
            duration: rule.duration,
            apsRequirement: rule.apsRequirement,
            requirements: [
              `Minimum APS score of ${rule.apsRequirement}`,
              "National Senior Certificate with matriculation exemption",
            ],
            careerOpportunities: getCareerOpportunities(
              rule.name,
              rule.faculty,
            ),
            modules: [],
          };
          updatedFaculties[facultyIndex].degrees.push(newDegree);
        }
      }
    });

    return {
      ...university,
      faculties: updatedFaculties,
    };
  });
}

// Helper functions
function getFacultyDisplayName(facultyId: string): string {
  const names: Record<string, string> = {
    engineering: "Engineering & Built Environment",
    "health-sciences": "Health Sciences",
    humanities: "Humanities & Social Sciences",
    commerce: "Commerce & Management Sciences",
    law: "Law",
    science: "Natural Sciences",
    education: "Education",
    agriculture: "Agriculture & Environmental Sciences",
    "information-technology": "Information Technology",
    "built-environment": "Built Environment & Architecture",
  };
  return names[facultyId] || facultyId;
}

function getFacultyDescription(facultyId: string): string {
  const descriptions: Record<string, string> = {
    engineering:
      "Engineering and built environment programs focusing on design, innovation, and infrastructure development",
    "health-sciences":
      "Medical and health sciences programs for healthcare professionals",
    humanities:
      "Arts, humanities, and social sciences programs exploring human culture and society",
    commerce: "Business and management programs for commerce and industry",
    law: "Legal studies and jurisprudence programs",
    science:
      "Natural sciences and mathematics programs for scientific research and application",
    education: "Educational and teaching programs for all phases of learning",
    agriculture:
      "Agricultural and environmental sciences for sustainable development",
    "information-technology":
      "Computer science and information technology programs",
    "built-environment":
      "Architecture, planning, and built environment programs",
  };
  return descriptions[facultyId] || `Programs in ${facultyId}`;
}

function getDefaultDescription(programName: string): string {
  if (programName.includes("Bachelor"))
    return `Comprehensive undergraduate program in ${programName.replace("Bachelor of ", "").replace("(", "").replace(")", "")}`;
  if (programName.includes("Engineering"))
    return `Professional engineering program focusing on design, innovation, and technical problem-solving`;
  if (programName.includes("Medicine") || programName.includes("Health"))
    return `Professional healthcare program preparing graduates for medical practice`;
  if (programName.includes("Business") || programName.includes("Commerce"))
    return `Business and management program for commercial and industrial careers`;
  if (programName.includes("Education"))
    return `Educational program for teaching and learning professionals`;
  if (programName.includes("Science"))
    return `Scientific program focusing on research and practical application`;
  return `Comprehensive program in ${programName}`;
}

function getCareerOpportunities(
  programName: string,
  faculty: string,
): string[] {
  const base = [
    "Graduate programs and further studies",
    "Research and development roles",
    "Consulting and advisory positions",
  ];

  if (faculty === "engineering") {
    return [
      ...base,
      "Professional engineering roles",
      "Project management",
      "Technical consulting",
      "Infrastructure development",
    ];
  } else if (faculty === "health-sciences") {
    return [
      ...base,
      "Healthcare practice",
      "Medical research",
      "Public health roles",
      "Healthcare management",
    ];
  } else if (faculty === "commerce") {
    return [
      ...base,
      "Business management",
      "Financial services",
      "Marketing and sales",
      "Corporate leadership",
    ];
  } else if (faculty === "law") {
    return [
      ...base,
      "Legal practice",
      "Corporate law",
      "Government service",
      "Legal consulting",
    ];
  } else if (faculty === "education") {
    return [
      ...base,
      "Teaching profession",
      "Educational management",
      "Curriculum development",
      "Educational consulting",
    ];
  }

  return base;
}

export default assignComprehensivePrograms;
