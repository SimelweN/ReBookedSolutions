import { University, Faculty, Degree } from "@/types/university";

/**
 * COMPLETE COURSE ALLOCATION SYSTEM
 *
 * This file implements the comprehensive course assignment rules as specified.
 * Every course is mapped to universities based on "all" or "exclude: [list]" rules.
 */

// University abbreviation mappings for ALL 26 South African Universities
const UNIVERSITY_MAPPINGS: Record<string, string> = {
  // Traditional Universities (11)
  UCT: "uct",
  WITS: "wits",
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

// Reverse mapping
const UNIVERSITY_ID_TO_CODE: Record<string, string> = Object.fromEntries(
  Object.entries(UNIVERSITY_MAPPINGS).map(([code, id]) => [id, code]),
);

// Get all university IDs
const ALL_UNIVERSITY_IDS = Object.values(UNIVERSITY_MAPPINGS);

// Course template with allocation rules
interface CourseTemplate {
  name: string;
  faculty: string;
  duration: string;
  baseAPS: number;
  description: string;
  careerProspects: string[];
  subjects: Array<{ name: string; level: number; isRequired: boolean }>;
  allocation: "all" | { exclude: string[] } | { includeOnly: string[] };
  universitySpecificAPS?: Record<string, number>;
}

// COMPLETE COURSE DATABASE - ALL COURSES FROM USER'S LIST
const COMPREHENSIVE_COURSES: CourseTemplate[] = [
  // Faculty of Engineering / Engineering and Built Environment
  {
    name: "Civil Engineering",
    faculty: "Engineering",
    duration: "4 years",
    baseAPS: 36,
    description:
      "Design, construct and maintain civil infrastructure including buildings, roads, bridges, and water systems.",
    careerProspects: [
      "Civil Engineer",
      "Structural Engineer",
      "Project Manager",
      "Construction Manager",
      "Infrastructure Consultant",
    ],
    subjects: [
      { name: "Mathematics", level: 6, isRequired: true },
      { name: "Physical Sciences", level: 6, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    allocation: { exclude: ["UWC", "UNISA", "UFH"] },
  },
  {
    name: "Mechanical Engineering",
    faculty: "Engineering",
    duration: "4 years",
    baseAPS: 36,
    description:
      "Design, develop and manufacture mechanical systems, machines and devices.",
    careerProspects: [
      "Mechanical Engineer",
      "Design Engineer",
      "Manufacturing Engineer",
      "Energy Engineer",
      "Automotive Engineer",
    ],
    subjects: [
      { name: "Mathematics", level: 6, isRequired: true },
      { name: "Physical Sciences", level: 6, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    allocation: { exclude: ["UWC", "UNISA", "UFH"] },
  },
  {
    name: "Electrical Engineering",
    faculty: "Engineering",
    duration: "4 years",
    baseAPS: 37,
    description:
      "Design and develop electrical systems, electronics, and power systems.",
    careerProspects: [
      "Electrical Engineer",
      "Power Systems Engineer",
      "Electronics Engineer",
      "Control Systems Engineer",
      "Telecommunications Engineer",
    ],
    subjects: [
      { name: "Mathematics", level: 6, isRequired: true },
      { name: "Physical Sciences", level: 6, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    allocation: { exclude: ["UWC", "UNISA", "UFH"] },
  },
  {
    name: "Chemical Engineering",
    faculty: "Engineering",
    duration: "4 years",
    baseAPS: 38,
    description:
      "Apply chemistry and physics principles to transform raw materials into useful products.",
    careerProspects: [
      "Chemical Engineer",
      "Process Engineer",
      "Environmental Engineer",
      "Petroleum Engineer",
      "Materials Engineer",
    ],
    subjects: [
      { name: "Mathematics", level: 6, isRequired: true },
      { name: "Physical Sciences", level: 6, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    allocation: { exclude: ["UJ", "UNISA", "UFH"] },
  },
  {
    name: "Industrial Engineering",
    faculty: "Engineering",
    duration: "4 years",
    baseAPS: 35,
    description:
      "Optimize complex processes and systems for efficiency and productivity.",
    careerProspects: [
      "Industrial Engineer",
      "Operations Manager",
      "Quality Engineer",
      "Systems Analyst",
      "Supply Chain Manager",
    ],
    subjects: [
      { name: "Mathematics", level: 6, isRequired: true },
      { name: "Physical Sciences", level: 5, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    allocation: { exclude: ["UWC", "UNISA"] },
  },
  {
    name: "Computer Engineering",
    faculty: "Engineering",
    duration: "4 years",
    baseAPS: 37,
    description: "Design and develop computer hardware and software systems.",
    careerProspects: [
      "Computer Engineer",
      "Hardware Engineer",
      "Software Engineer",
      "Systems Engineer",
      "Embedded Systems Developer",
    ],
    subjects: [
      { name: "Mathematics", level: 6, isRequired: true },
      { name: "Physical Sciences", level: 6, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    allocation: { exclude: ["UCT", "UP", "UNISA"] },
  },
  {
    name: "Mechatronics",
    faculty: "Engineering",
    duration: "4 years",
    baseAPS: 37,
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
    allocation: { exclude: ["UWC", "UNISA", "UFH", "MUT"] },
  },
  {
    name: "Mining Engineering",
    faculty: "Engineering",
    duration: "4 years",
    baseAPS: 35,
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
    allocation: { exclude: ["UWC", "UNISA", "UFH", "RU"] },
  },
  {
    name: "Environmental Engineering",
    faculty: "Engineering",
    duration: "4 years",
    baseAPS: 34,
    description:
      "Environmental protection and sustainable development engineering.",
    careerProspects: [
      "Environmental Engineer",
      "Sustainability Consultant",
      "Waste Management Engineer",
      "Water Resources Engineer",
      "Environmental Scientist",
    ],
    subjects: [
      { name: "Mathematics", level: 6, isRequired: true },
      { name: "Physical Sciences", level: 5, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    allocation: { exclude: ["UWC", "UNISA"] },
  },
  {
    name: "Agricultural Engineering",
    faculty: "Engineering",
    duration: "4 years",
    baseAPS: 34,
    description:
      "Engineering principles applied to agricultural and food systems.",
    careerProspects: [
      "Agricultural Engineer",
      "Food Process Engineer",
      "Irrigation Engineer",
      "Farm Equipment Designer",
      "Agricultural Consultant",
    ],
    subjects: [
      { name: "Mathematics", level: 5, isRequired: true },
      { name: "Physical Sciences", level: 5, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    allocation: { exclude: ["UWC", "UNISA", "UFH"] },
  },
  {
    name: "Structural Engineering",
    faculty: "Engineering",
    duration: "4 years",
    baseAPS: 36,
    description: "Design and analysis of structures that support loads.",
    careerProspects: [
      "Structural Engineer",
      "Bridge Engineer",
      "Building Designer",
      "Seismic Engineer",
      "Construction Engineer",
    ],
    subjects: [
      { name: "Mathematics", level: 6, isRequired: true },
      { name: "Physical Sciences", level: 6, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    allocation: { exclude: ["UWC", "UNISA"] },
  },
  {
    name: "Transport Engineering",
    faculty: "Engineering",
    duration: "4 years",
    baseAPS: 34,
    description: "Planning, design, and operation of transportation systems.",
    careerProspects: [
      "Transport Engineer",
      "Traffic Engineer",
      "Transport Planner",
      "Railway Engineer",
      "Aviation Engineer",
    ],
    subjects: [
      { name: "Mathematics", level: 5, isRequired: true },
      { name: "Physical Sciences", level: 5, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    allocation: { includeOnly: ["TUT", "DUT"] },
  },
  {
    name: "Water Resources Engineering",
    faculty: "Engineering",
    duration: "4 years",
    baseAPS: 35,
    description: "Management and engineering of water resources and systems.",
    careerProspects: [
      "Water Resources Engineer",
      "Hydrologist",
      "Dam Engineer",
      "Irrigation Engineer",
      "Water Quality Specialist",
    ],
    subjects: [
      { name: "Mathematics", level: 6, isRequired: true },
      { name: "Physical Sciences", level: 5, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    allocation: { exclude: ["UWC", "UNISA"] },
  },
  {
    name: "Geotechnical Engineering",
    faculty: "Engineering",
    duration: "4 years",
    baseAPS: 35,
    description: "Engineering behavior of earth materials and soil mechanics.",
    careerProspects: [
      "Geotechnical Engineer",
      "Soil Engineer",
      "Foundation Engineer",
      "Mining Engineer",
      "Environmental Engineer",
    ],
    subjects: [
      { name: "Mathematics", level: 6, isRequired: true },
      { name: "Physical Sciences", level: 6, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    allocation: { exclude: ["UWC", "UNISA"] },
  },
  {
    name: "Construction Management",
    faculty: "Engineering",
    duration: "4 years",
    baseAPS: 30,
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
    allocation: "all",
  },
  {
    name: "Quantity Surveying",
    faculty: "Engineering",
    duration: "4 years",
    baseAPS: 32,
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
    allocation: "all",
  },
  {
    name: "Urban and Regional Planning",
    faculty: "Engineering",
    duration: "4 years",
    baseAPS: 32,
    description: "Planning and development of urban and regional areas.",
    careerProspects: [
      "Urban Planner",
      "Regional Planner",
      "Policy Analyst",
      "Development Consultant",
      "Municipal Planner",
    ],
    subjects: [
      { name: "Mathematics", level: 4, isRequired: true },
      { name: "English", level: 5, isRequired: true },
      { name: "Geography", level: 4, isRequired: false },
    ],
    allocation: { exclude: ["UNISA", "UFH"] },
  },
  {
    name: "Architecture",
    faculty: "Engineering",
    duration: "5 years",
    baseAPS: 34,
    description: "Design and planning of buildings and architectural spaces.",
    careerProspects: [
      "Architect",
      "Urban Designer",
      "Building Designer",
      "Landscape Architect",
      "Interior Architect",
    ],
    subjects: [
      { name: "Mathematics", level: 5, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    allocation: { exclude: ["UNISA", "UFH", "MUT"] },
  },
  {
    name: "Building Science",
    faculty: "Engineering",
    duration: "4 years",
    baseAPS: 30,
    description:
      "Science and technology of building construction and materials.",
    careerProspects: [
      "Building Scientist",
      "Building Inspector",
      "Construction Consultant",
      "Building Performance Analyst",
      "Sustainability Consultant",
    ],
    subjects: [
      { name: "Mathematics", level: 5, isRequired: true },
      { name: "Physical Sciences", level: 5, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    allocation: { exclude: ["UNISA", "UFH"] },
  },
  {
    name: "Interior Architecture",
    faculty: "Engineering",
    duration: "4 years",
    baseAPS: 30,
    description: "Design of interior spaces and architectural interiors.",
    careerProspects: [
      "Interior Architect",
      "Interior Designer",
      "Space Planner",
      "Design Consultant",
      "Furniture Designer",
    ],
    subjects: [
      { name: "Mathematics", level: 4, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    allocation: { includeOnly: ["SU", "UCT", "UP"] },
  },
  {
    name: "Landscape Architecture",
    faculty: "Engineering",
    duration: "4 years",
    baseAPS: 32,
    description: "Design of outdoor spaces and landscape environments.",
    careerProspects: [
      "Landscape Architect",
      "Environmental Designer",
      "Garden Designer",
      "Urban Designer",
      "Conservation Planner",
    ],
    subjects: [
      { name: "Mathematics", level: 4, isRequired: true },
      { name: "English", level: 5, isRequired: true },
      { name: "Geography", level: 4, isRequired: false },
    ],
    allocation: { includeOnly: ["SU", "UCT"] },
  },
  {
    name: "Urban Design",
    faculty: "Engineering",
    duration: "4 years",
    baseAPS: 32,
    description: "Design of urban environments and city planning.",
    careerProspects: [
      "Urban Designer",
      "City Planner",
      "Development Consultant",
      "Municipal Designer",
      "Regional Planner",
    ],
    subjects: [
      { name: "Mathematics", level: 4, isRequired: true },
      { name: "English", level: 5, isRequired: true },
      { name: "Geography", level: 4, isRequired: false },
    ],
    allocation: { exclude: ["UNISA", "UFH"] },
  },

  // Faculty of Health Sciences / Medicine and Health
  {
    name: "Bachelor of Medicine and Bachelor of Surgery (MBChB)",
    faculty: "Health Sciences",
    duration: "6 years",
    baseAPS: 42,
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
    allocation: "all",
    universitySpecificAPS: {
      uct: 45,
      wits: 44,
      stellenbosch: 44,
      up: 42,
      ukzn: 40,
      ufs: 38,
    },
  },
  {
    name: "Bachelor of Dental Surgery (BDS)",
    faculty: "Health Sciences",
    duration: "5 years",
    baseAPS: 40,
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
    allocation: { exclude: ["UNISA", "UFH", "MUT"] },
  },
  {
    name: "Bachelor of Pharmacy (BPharm)",
    faculty: "Health Sciences",
    duration: "4 years",
    baseAPS: 36,
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
    allocation: "all",
  },
  {
    name: "Bachelor of Physiotherapy (BSc Physiotherapy)",
    faculty: "Health Sciences",
    duration: "4 years",
    baseAPS: 34,
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
    allocation: "all",
  },
  {
    name: "Bachelor of Occupational Therapy (BSc Occupational Therapy)",
    faculty: "Health Sciences",
    duration: "4 years",
    baseAPS: 34,
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
    allocation: "all",
  },
  {
    name: "Bachelor of Radiography (BSc Radiography)",
    faculty: "Health Sciences",
    duration: "4 years",
    baseAPS: 32,
    description: "Medical imaging and radiation therapy techniques.",
    careerProspects: [
      "Radiographer",
      "Medical Imaging Specialist",
      "Radiation Therapist",
      "Nuclear Medicine Technologist",
      "CT/MRI Technologist",
    ],
    subjects: [
      { name: "Mathematics", level: 5, isRequired: true },
      { name: "Physical Sciences", level: 6, isRequired: true },
      { name: "Life Sciences", level: 5, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    allocation: { exclude: ["UFH", "MUT"] },
  },
  {
    name: "Bachelor of Nursing Science (BNS)",
    faculty: "Health Sciences",
    duration: "4 years",
    baseAPS: 30,
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
    allocation: "all",
  },
  {
    name: "Bachelor of Clinical Medical Practice (BCMP)",
    faculty: "Health Sciences",
    duration: "3 years",
    baseAPS: 34,
    description:
      "Training for clinical medical practitioners in primary healthcare.",
    careerProspects: [
      "Clinical Medical Practitioner",
      "Primary Healthcare Provider",
      "Emergency Medical Practitioner",
      "Rural Health Practitioner",
      "Community Health Specialist",
    ],
    subjects: [
      { name: "Mathematics", level: 5, isRequired: true },
      { name: "Life Sciences", level: 6, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    allocation: { exclude: ["UCT", "WITS"] },
  },
  {
    name: "Bachelor of Emergency Medical Care (BEMC)",
    faculty: "Health Sciences",
    duration: "4 years",
    baseAPS: 30,
    description: "Emergency medical care and pre-hospital emergency medicine.",
    careerProspects: [
      "Emergency Medical Practitioner",
      "Paramedic",
      "Emergency Room Technician",
      "Flight Medic",
      "Emergency Services Manager",
    ],
    subjects: [
      { name: "Mathematics", level: 4, isRequired: true },
      { name: "Life Sciences", level: 5, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    allocation: { includeOnly: ["DUT", "TUT"] },
  },
  {
    name: "Bachelor of Medical Science (BMedSci)",
    faculty: "Health Sciences",
    duration: "3 years",
    baseAPS: 36,
    description: "Foundation medical sciences for healthcare careers.",
    careerProspects: [
      "Medical Scientist",
      "Research Scientist",
      "Laboratory Manager",
      "Biomedical Researcher",
      "Healthcare Analyst",
    ],
    subjects: [
      { name: "Mathematics", level: 6, isRequired: true },
      { name: "Physical Sciences", level: 6, isRequired: true },
      { name: "Life Sciences", level: 6, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    allocation: "all",
  },
  {
    name: "Bachelor of Biomedical Science (BSc Biomedical Science)",
    faculty: "Health Sciences",
    duration: "3 years",
    baseAPS: 34,
    description: "Study of biological processes in human health and disease.",
    careerProspects: [
      "Biomedical Scientist",
      "Laboratory Technologist",
      "Research Scientist",
      "Biotechnologist",
      "Medical Device Specialist",
    ],
    subjects: [
      { name: "Mathematics", level: 5, isRequired: true },
      { name: "Physical Sciences", level: 5, isRequired: true },
      { name: "Life Sciences", level: 6, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    allocation: "all",
  },
  {
    name: "Bachelor of Medical Laboratory Science (BMLS)",
    faculty: "Health Sciences",
    duration: "4 years",
    baseAPS: 32,
    description: "Laboratory diagnostics and medical testing.",
    careerProspects: [
      "Medical Laboratory Scientist",
      "Laboratory Manager",
      "Clinical Laboratory Technologist",
      "Research Technician",
      "Quality Control Specialist",
    ],
    subjects: [
      { name: "Mathematics", level: 5, isRequired: true },
      { name: "Physical Sciences", level: 6, isRequired: true },
      { name: "Life Sciences", level: 6, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    allocation: "all",
  },
  {
    name: "Bachelor of Optometry (BOptom)",
    faculty: "Health Sciences",
    duration: "4 years",
    baseAPS: 34,
    description: "Eye care and vision science.",
    careerProspects: [
      "Optometrist",
      "Vision Therapist",
      "Low Vision Specialist",
      "Contact Lens Specialist",
      "Eye Care Researcher",
    ],
    subjects: [
      { name: "Mathematics", level: 5, isRequired: true },
      { name: "Physical Sciences", level: 6, isRequired: true },
      { name: "Life Sciences", level: 6, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    allocation: { exclude: ["UFH", "MUT"] },
  },
  {
    name: "Bachelor of Speech-Language Pathology (BSc Speech-Language Pathology)",
    faculty: "Health Sciences",
    duration: "4 years",
    baseAPS: 32,
    description: "Diagnosis and treatment of speech and language disorders.",
    careerProspects: [
      "Speech-Language Pathologist",
      "Speech Therapist",
      "Communication Specialist",
      "Voice Therapist",
      "Swallowing Specialist",
    ],
    subjects: [
      { name: "Mathematics", level: 4, isRequired: true },
      { name: "Life Sciences", level: 5, isRequired: true },
      { name: "English", level: 6, isRequired: true },
    ],
    allocation: { exclude: ["UFH"] },
  },
  {
    name: "Bachelor of Audiology (BSc Audiology)",
    faculty: "Health Sciences",
    duration: "4 years",
    baseAPS: 32,
    description: "Hearing and balance disorders assessment and treatment.",
    careerProspects: [
      "Audiologist",
      "Hearing Aid Specialist",
      "Balance Specialist",
      "Pediatric Audiologist",
      "Industrial Audiologist",
    ],
    subjects: [
      { name: "Mathematics", level: 5, isRequired: true },
      { name: "Physical Sciences", level: 5, isRequired: true },
      { name: "Life Sciences", level: 5, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    allocation: { exclude: ["UFH"] },
  },
  {
    name: "Bachelor of Dietetics (BSc Dietetics)",
    faculty: "Health Sciences",
    duration: "4 years",
    baseAPS: 32,
    description: "Nutrition science and dietary therapy for health promotion.",
    careerProspects: [
      "Dietitian",
      "Nutritionist",
      "Sports Nutritionist",
      "Clinical Dietitian",
      "Public Health Nutritionist",
    ],
    subjects: [
      { name: "Mathematics", level: 5, isRequired: true },
      { name: "Life Sciences", level: 6, isRequired: true },
      { name: "Physical Sciences", level: 5, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    allocation: "all",
  },
  {
    name: "Bachelor of Environmental Health (BSc Environmental Health)",
    faculty: "Health Sciences",
    duration: "4 years",
    baseAPS: 30,
    description: "Environmental factors affecting human health.",
    careerProspects: [
      "Environmental Health Officer",
      "Public Health Inspector",
      "Occupational Health Specialist",
      "Environmental Consultant",
      "Health and Safety Officer",
    ],
    subjects: [
      { name: "Mathematics", level: 4, isRequired: true },
      { name: "Life Sciences", level: 5, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    allocation: "all",
  },
  {
    name: "Bachelor of Public Health (BSc Public Health)",
    faculty: "Health Sciences",
    duration: "4 years",
    baseAPS: 30,
    description: "Population health and disease prevention strategies.",
    careerProspects: [
      "Public Health Officer",
      "Epidemiologist",
      "Health Policy Analyst",
      "Community Health Specialist",
      "Health Program Manager",
    ],
    subjects: [
      { name: "Mathematics", level: 4, isRequired: true },
      { name: "Life Sciences", level: 5, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    allocation: "all",
  },
  {
    name: "Bachelor of Medical Imaging (BSc Medical Imaging)",
    faculty: "Health Sciences",
    duration: "4 years",
    baseAPS: 32,
    description: "Advanced medical imaging techniques and interpretation.",
    careerProspects: [
      "Medical Imaging Specialist",
      "Radiologic Technologist",
      "MRI Technologist",
      "CT Technologist",
      "Imaging Research Specialist",
    ],
    subjects: [
      { name: "Mathematics", level: 5, isRequired: true },
      { name: "Physical Sciences", level: 6, isRequired: true },
      { name: "Life Sciences", level: 5, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    allocation: { exclude: ["UFH"] },
  },
  {
    name: "Bachelor of Clinical Technology (BSc Clinical Technology)",
    faculty: "Health Sciences",
    duration: "4 years",
    baseAPS: 30,
    description: "Clinical laboratory technology and medical diagnostics.",
    careerProspects: [
      "Clinical Technologist",
      "Laboratory Supervisor",
      "Medical Technology Specialist",
      "Quality Assurance Officer",
      "Laboratory Manager",
    ],
    subjects: [
      { name: "Mathematics", level: 5, isRequired: true },
      { name: "Physical Sciences", level: 5, isRequired: true },
      { name: "Life Sciences", level: 6, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    allocation: { exclude: ["UFH"] },
  },

  // Faculty of Humanities / Arts and Social Sciences
  {
    name: "Bachelor of Arts (BA) in English",
    faculty: "Humanities",
    duration: "3 years",
    baseAPS: 24,
    description: "Literature, language studies, and communication skills.",
    careerProspects: [
      "Teacher",
      "Writer",
      "Editor",
      "Journalist",
      "Communications Specialist",
    ],
    subjects: [{ name: "English", level: 6, isRequired: true }],
    allocation: "all",
  },
  {
    name: "History",
    faculty: "Humanities",
    duration: "3 years",
    baseAPS: 24,
    description: "Study of past events, societies, and cultural developments.",
    careerProspects: [
      "Historian",
      "Teacher",
      "Museum Curator",
      "Archivist",
      "Research Analyst",
    ],
    subjects: [
      { name: "English", level: 5, isRequired: true },
      { name: "History", level: 5, isRequired: true },
    ],
    allocation: "all",
  },
  {
    name: "Philosophy",
    faculty: "Humanities",
    duration: "3 years",
    baseAPS: 26,
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
    allocation: "all",
  },
  {
    name: "Sociology",
    faculty: "Humanities",
    duration: "3 years",
    baseAPS: 24,
    description: "Study of society, social behavior, and social structures.",
    careerProspects: [
      "Sociologist",
      "Social Worker",
      "Community Development Officer",
      "Policy Analyst",
      "Research Analyst",
    ],
    subjects: [{ name: "English", level: 5, isRequired: true }],
    allocation: "all",
  },
  {
    name: "Psychology",
    faculty: "Humanities",
    duration: "3 years",
    baseAPS: 28,
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
    allocation: "all",
  },
  {
    name: "Political Science",
    faculty: "Humanities",
    duration: "3 years",
    baseAPS: 26,
    description: "Study of political systems, governance, and public policy.",
    careerProspects: [
      "Political Scientist",
      "Policy Analyst",
      "Government Official",
      "Diplomat",
      "Political Consultant",
    ],
    subjects: [{ name: "English", level: 5, isRequired: true }],
    allocation: "all",
  },
  {
    name: "Anthropology",
    faculty: "Humanities",
    duration: "3 years",
    baseAPS: 24,
    description: "Study of human societies, cultures, and their development.",
    careerProspects: [
      "Anthropologist",
      "Cultural Researcher",
      "Museum Curator",
      "International Development Worker",
      "Cultural Consultant",
    ],
    subjects: [{ name: "English", level: 5, isRequired: true }],
    allocation: { exclude: ["UNISA"] },
  },
  {
    name: "Archaeology",
    faculty: "Humanities",
    duration: "3 years",
    baseAPS: 24,
    description:
      "Study of human history through excavation and analysis of artifacts.",
    careerProspects: [
      "Archaeologist",
      "Museum Curator",
      "Cultural Heritage Manager",
      "Field Researcher",
      "Heritage Consultant",
    ],
    subjects: [{ name: "English", level: 5, isRequired: true }],
    allocation: { exclude: ["UNISA", "MUT"] },
  },
  {
    name: "Linguistics",
    faculty: "Humanities",
    duration: "3 years",
    baseAPS: 26,
    description: "Scientific study of language and its structure.",
    careerProspects: [
      "Linguist",
      "Language Teacher",
      "Translator",
      "Speech Therapist",
      "Language Technology Specialist",
    ],
    subjects: [{ name: "English", level: 6, isRequired: true }],
    allocation: "all",
  },
  {
    name: "Geography",
    faculty: "Humanities",
    duration: "3 years",
    baseAPS: 24,
    description: "Study of places, environments, and spatial relationships.",
    careerProspects: [
      "Geographer",
      "Urban Planner",
      "Environmental Consultant",
      "GIS Specialist",
      "Cartographer",
    ],
    subjects: [
      { name: "English", level: 5, isRequired: true },
      { name: "Geography", level: 5, isRequired: true },
    ],
    allocation: "all",
  },
  {
    name: "Fine Arts",
    faculty: "Humanities",
    duration: "4 years",
    baseAPS: 22,
    description: "Creative expression through visual arts and artistic media.",
    careerProspects: [
      "Fine Artist",
      "Art Teacher",
      "Gallery Curator",
      "Art Therapist",
      "Art Director",
    ],
    subjects: [{ name: "English", level: 4, isRequired: true }],
    allocation: { exclude: ["UFH"] },
  },
  {
    name: "Music",
    faculty: "Humanities",
    duration: "4 years",
    baseAPS: 22,
    description: "Music theory, performance, and composition.",
    careerProspects: [
      "Musician",
      "Music Teacher",
      "Composer",
      "Music Therapist",
      "Sound Engineer",
    ],
    subjects: [{ name: "English", level: 4, isRequired: true }],
    allocation: { exclude: ["UFH", "MUT"] },
  },
  {
    name: "Theatre Arts",
    faculty: "Humanities",
    duration: "4 years",
    baseAPS: 22,
    description: "Acting, directing, and theatrical production.",
    careerProspects: [
      "Actor",
      "Director",
      "Theatre Producer",
      "Drama Teacher",
      "Arts Administrator",
    ],
    subjects: [{ name: "English", level: 5, isRequired: true }],
    allocation: { exclude: ["UFH", "MUT"] },
  },
  {
    name: "Film and Media Studies",
    faculty: "Humanities",
    duration: "3 years",
    baseAPS: 24,
    description:
      "Film production, media analysis, and digital content creation.",
    careerProspects: [
      "Filmmaker",
      "Media Producer",
      "Film Critic",
      "Video Editor",
      "Content Creator",
    ],
    subjects: [{ name: "English", level: 5, isRequired: true }],
    allocation: "all",
  },
  {
    name: "Religious Studies",
    faculty: "Humanities",
    duration: "3 years",
    baseAPS: 22,
    description: "Study of world religions, theology, and spiritual practices.",
    careerProspects: [
      "Religious Leader",
      "Chaplain",
      "Religious Education Teacher",
      "Community Leader",
      "Interfaith Coordinator",
    ],
    subjects: [{ name: "English", level: 5, isRequired: true }],
    allocation: "all",
  },
  {
    name: "Gender Studies",
    faculty: "Humanities",
    duration: "3 years",
    baseAPS: 24,
    description:
      "Analysis of gender roles, identities, and social constructions.",
    careerProspects: [
      "Gender Specialist",
      "Policy Analyst",
      "NGO Worker",
      "Social Researcher",
      "Advocacy Coordinator",
    ],
    subjects: [{ name: "English", level: 5, isRequired: true }],
    allocation: "all",
  },
  {
    name: "African Studies",
    faculty: "Humanities",
    duration: "3 years",
    baseAPS: 22,
    description:
      "Interdisciplinary study of African cultures, politics, and development.",
    careerProspects: [
      "African Studies Specialist",
      "International Development Worker",
      "Cultural Consultant",
      "Diplomat",
      "NGO Coordinator",
    ],
    subjects: [{ name: "English", level: 5, isRequired: true }],
    allocation: "all",
  },
  {
    name: "Development Studies",
    faculty: "Humanities",
    duration: "3 years",
    baseAPS: 24,
    description: "Social and economic development theory and practice.",
    careerProspects: [
      "Development Worker",
      "Project Manager",
      "Policy Analyst",
      "NGO Coordinator",
      "Community Development Specialist",
    ],
    subjects: [{ name: "English", level: 5, isRequired: true }],
    allocation: "all",
  },
  {
    name: "International Relations",
    faculty: "Humanities",
    duration: "3 years",
    baseAPS: 26,
    description: "Global politics, diplomacy, and international affairs.",
    careerProspects: [
      "Diplomat",
      "International Relations Specialist",
      "Policy Analyst",
      "Foreign Service Officer",
      "International Consultant",
    ],
    subjects: [{ name: "English", level: 5, isRequired: true }],
    allocation: "all",
  },
  {
    name: "Communication Science",
    faculty: "Humanities",
    duration: "3 years",
    baseAPS: 24,
    description: "Communication theory, media studies, and public relations.",
    careerProspects: [
      "Communications Specialist",
      "Public Relations Officer",
      "Media Consultant",
      "Corporate Communications Manager",
      "Social Media Manager",
    ],
    subjects: [{ name: "English", level: 5, isRequired: true }],
    allocation: "all",
  },
  {
    name: "Journalism",
    faculty: "Humanities",
    duration: "3 years",
    baseAPS: 26,
    description: "News reporting, media ethics, and investigative journalism.",
    careerProspects: [
      "Journalist",
      "News Reporter",
      "Editor",
      "Media Producer",
      "Investigative Reporter",
    ],
    subjects: [{ name: "English", level: 6, isRequired: true }],
    allocation: "all",
  },
  {
    name: "Public Relations",
    faculty: "Humanities",
    duration: "3 years",
    baseAPS: 24,
    description: "Strategic communication and reputation management.",
    careerProspects: [
      "Public Relations Specialist",
      "Communications Manager",
      "Brand Manager",
      "Event Coordinator",
      "Crisis Communications Specialist",
    ],
    subjects: [{ name: "English", level: 5, isRequired: true }],
    allocation: "all",
  },
  {
    name: "Publishing",
    faculty: "Humanities",
    duration: "3 years",
    baseAPS: 24,
    description: "Book and digital publishing industry practices.",
    careerProspects: [
      "Publisher",
      "Editor",
      "Literary Agent",
      "Publishing Coordinator",
      "Digital Content Manager",
    ],
    subjects: [{ name: "English", level: 6, isRequired: true }],
    allocation: { exclude: ["UNISA"] },
  },
  {
    name: "Translation and Interpreting",
    faculty: "Humanities",
    duration: "3 years",
    baseAPS: 28,
    description: "Professional translation and interpretation services.",
    careerProspects: [
      "Translator",
      "Interpreter",
      "Language Specialist",
      "Localization Expert",
      "Court Interpreter",
    ],
    subjects: [{ name: "English", level: 6, isRequired: true }],
    allocation: { includeOnly: ["UCT", "SU"] },
  },
  {
    name: "Creative Writing",
    faculty: "Humanities",
    duration: "3 years",
    baseAPS: 24,
    description: "Fiction, poetry, and creative nonfiction writing.",
    careerProspects: [
      "Writer",
      "Author",
      "Poet",
      "Scriptwriter",
      "Content Creator",
    ],
    subjects: [{ name: "English", level: 6, isRequired: true }],
    allocation: "all",
  },
  {
    name: "Visual Arts",
    faculty: "Humanities",
    duration: "4 years",
    baseAPS: 22,
    description: "Drawing, painting, sculpture, and visual design.",
    careerProspects: [
      "Visual Artist",
      "Art Director",
      "Graphic Designer",
      "Art Teacher",
      "Gallery Curator",
    ],
    subjects: [{ name: "English", level: 4, isRequired: true }],
    allocation: { exclude: ["UFH"] },
  },
  {
    name: "Fashion Design",
    faculty: "Humanities",
    duration: "4 years",
    baseAPS: 22,
    description: "Fashion design, textiles, and apparel industry.",
    careerProspects: [
      "Fashion Designer",
      "Textile Designer",
      "Fashion Stylist",
      "Fashion Buyer",
      "Fashion Merchandiser",
    ],
    subjects: [{ name: "English", level: 4, isRequired: true }],
    allocation: { includeOnly: ["SU", "UCT"] },
  },
  {
    name: "Interior Design",
    faculty: "Humanities",
    duration: "4 years",
    baseAPS: 22,
    description: "Interior space design and decoration.",
    careerProspects: [
      "Interior Designer",
      "Space Planner",
      "Design Consultant",
      "Furniture Designer",
      "Set Designer",
    ],
    subjects: [{ name: "English", level: 4, isRequired: true }],
    allocation: { includeOnly: ["SU", "UCT"] },
  },
  {
    name: "Graphic Design",
    faculty: "Humanities",
    duration: "3 years",
    baseAPS: 22,
    description: "Visual communication through graphic and digital media.",
    careerProspects: [
      "Graphic Designer",
      "Web Designer",
      "Brand Designer",
      "Digital Artist",
      "Creative Director",
    ],
    subjects: [{ name: "English", level: 4, isRequired: true }],
    allocation: { includeOnly: ["SU", "UCT"] },
  },
  {
    name: "Industrial Design",
    faculty: "Humanities",
    duration: "4 years",
    baseAPS: 24,
    description: "Product design and industrial design principles.",
    careerProspects: [
      "Industrial Designer",
      "Product Designer",
      "Design Engineer",
      "UX Designer",
      "Design Consultant",
    ],
    subjects: [
      { name: "Mathematics", level: 4, isRequired: true },
      { name: "English", level: 4, isRequired: true },
    ],
    allocation: { includeOnly: ["SU", "UCT"] },
  },
  {
    name: "Photography",
    faculty: "Humanities",
    duration: "3 years",
    baseAPS: 20,
    description: "Digital and film photography techniques and artistry.",
    careerProspects: [
      "Photographer",
      "Photojournalist",
      "Commercial Photographer",
      "Photo Editor",
      "Visual Artist",
    ],
    subjects: [{ name: "English", level: 4, isRequired: true }],
    allocation: "all",
  },
  {
    name: "Animation",
    faculty: "Humanities",
    duration: "4 years",
    baseAPS: 22,
    description: "2D and 3D animation and digital media production.",
    careerProspects: [
      "Animator",
      "3D Artist",
      "Motion Graphics Designer",
      "Game Artist",
      "Visual Effects Artist",
    ],
    subjects: [{ name: "English", level: 4, isRequired: true }],
    allocation: "all",
  },
  {
    name: "Film Production",
    faculty: "Humanities",
    duration: "4 years",
    baseAPS: 24,
    description: "Film and video production techniques and storytelling.",
    careerProspects: [
      "Film Producer",
      "Director",
      "Cinematographer",
      "Film Editor",
      "Video Producer",
    ],
    subjects: [{ name: "English", level: 5, isRequired: true }],
    allocation: "all",
  },
  {
    name: "Theatre Production",
    faculty: "Humanities",
    duration: "4 years",
    baseAPS: 22,
    description: "Theatre production, stage management, and technical theatre.",
    careerProspects: [
      "Theatre Producer",
      "Stage Manager",
      "Theatre Director",
      "Production Designer",
      "Arts Administrator",
    ],
    subjects: [{ name: "English", level: 4, isRequired: true }],
    allocation: "all",
  },

  // Faculty of Commerce / Business and Management
  {
    name: "Bachelor of Commerce (BCom) in Accounting",
    faculty: "Commerce",
    duration: "3 years",
    baseAPS: 30,
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
    allocation: "all",
  },
  {
    name: "Finance",
    faculty: "Commerce",
    duration: "3 years",
    baseAPS: 30,
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
    allocation: "all",
  },
  {
    name: "Economics",
    faculty: "Commerce",
    duration: "3 years",
    baseAPS: 28,
    description: "Economic theory, policy analysis, and market behavior.",
    careerProspects: [
      "Economist",
      "Policy Analyst",
      "Economic Researcher",
      "Financial Analyst",
      "Government Economist",
    ],
    subjects: [
      { name: "Mathematics", level: 5, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    allocation: "all",
  },
  {
    name: "Marketing",
    faculty: "Commerce",
    duration: "3 years",
    baseAPS: 26,
    description: "Market research, advertising, brand management, and sales.",
    careerProspects: [
      "Marketing Manager",
      "Brand Manager",
      "Digital Marketer",
      "Sales Manager",
      "Market Research Analyst",
    ],
    subjects: [{ name: "English", level: 5, isRequired: true }],
    allocation: "all",
  },
  {
    name: "Human Resource Management",
    faculty: "Commerce",
    duration: "3 years",
    baseAPS: 26,
    description:
      "Personnel management, organizational behavior, and labor relations.",
    careerProspects: [
      "HR Manager",
      "Recruitment Specialist",
      "Training Manager",
      "Employee Relations Specialist",
      "Organizational Development Consultant",
    ],
    subjects: [{ name: "English", level: 5, isRequired: true }],
    allocation: "all",
  },
  {
    name: "Business Management",
    faculty: "Commerce",
    duration: "3 years",
    baseAPS: 26,
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
    allocation: "all",
  },
  {
    name: "Supply Chain Management",
    faculty: "Commerce",
    duration: "3 years",
    baseAPS: 26,
    description: "Logistics, procurement, and supply chain optimization.",
    careerProspects: [
      "Supply Chain Manager",
      "Logistics Coordinator",
      "Procurement Specialist",
      "Operations Manager",
      "Inventory Manager",
    ],
    subjects: [
      { name: "Mathematics", level: 4, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    allocation: "all",
  },
  {
    name: "Logistics",
    faculty: "Commerce",
    duration: "3 years",
    baseAPS: 24,
    description: "Transportation, warehousing, and distribution management.",
    careerProspects: [
      "Logistics Manager",
      "Transportation Coordinator",
      "Warehouse Manager",
      "Distribution Manager",
      "Freight Forwarder",
    ],
    subjects: [
      { name: "Mathematics", level: 4, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    allocation: "all",
  },
  {
    name: "Risk Management",
    faculty: "Commerce",
    duration: "3 years",
    baseAPS: 28,
    description: "Financial and operational risk assessment and mitigation.",
    careerProspects: [
      "Risk Manager",
      "Insurance Specialist",
      "Compliance Officer",
      "Financial Risk Analyst",
      "Operational Risk Specialist",
    ],
    subjects: [
      { name: "Mathematics", level: 5, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    allocation: "all",
  },
  {
    name: "Tourism Management",
    faculty: "Commerce",
    duration: "3 years",
    baseAPS: 24,
    description: "Tourism industry management and hospitality services.",
    careerProspects: [
      "Tourism Manager",
      "Travel Agent",
      "Tour Operator",
      "Hotel Manager",
      "Event Coordinator",
    ],
    subjects: [{ name: "English", level: 5, isRequired: true }],
    allocation: "all",
  },
  {
    name: "Hospitality Management",
    faculty: "Commerce",
    duration: "3 years",
    baseAPS: 24,
    description: "Hotel, restaurant, and hospitality industry management.",
    careerProspects: [
      "Hotel Manager",
      "Restaurant Manager",
      "Event Manager",
      "Resort Manager",
      "Hospitality Consultant",
    ],
    subjects: [{ name: "English", level: 5, isRequired: true }],
    allocation: "all",
  },
  {
    name: "Public Administration",
    faculty: "Commerce",
    duration: "3 years",
    baseAPS: 24,
    description: "Government administration and public sector management.",
    careerProspects: [
      "Public Administrator",
      "Government Official",
      "Policy Analyst",
      "Municipal Manager",
      "Public Service Officer",
    ],
    subjects: [{ name: "English", level: 5, isRequired: true }],
    allocation: "all",
  },
  {
    name: "Labour Relations",
    faculty: "Commerce",
    duration: "3 years",
    baseAPS: 26,
    description:
      "Employment law, collective bargaining, and workplace relations.",
    careerProspects: [
      "Labour Relations Officer",
      "Union Representative",
      "Employment Lawyer",
      "HR Specialist",
      "Mediator",
    ],
    subjects: [{ name: "English", level: 5, isRequired: true }],
    allocation: "all",
  },
  {
    name: "Entrepreneurship",
    faculty: "Commerce",
    duration: "3 years",
    baseAPS: 24,
    description: "Business startup and small business management.",
    careerProspects: [
      "Entrepreneur",
      "Small Business Owner",
      "Business Consultant",
      "Startup Advisor",
      "Innovation Manager",
    ],
    subjects: [{ name: "English", level: 5, isRequired: true }],
    allocation: "all",
  },
  {
    name: "Banking",
    faculty: "Commerce",
    duration: "3 years",
    baseAPS: 28,
    description:
      "Banking operations, financial services, and credit management.",
    careerProspects: [
      "Bank Manager",
      "Credit Analyst",
      "Investment Advisor",
      "Financial Consultant",
      "Commercial Banker",
    ],
    subjects: [
      { name: "Mathematics", level: 5, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    allocation: "all",
  },
  {
    name: "Insurance",
    faculty: "Commerce",
    duration: "3 years",
    baseAPS: 26,
    description: "Insurance products, risk assessment, and claims management.",
    careerProspects: [
      "Insurance Agent",
      "Underwriter",
      "Claims Adjuster",
      "Risk Assessor",
      "Insurance Broker",
    ],
    subjects: [
      { name: "Mathematics", level: 4, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    allocation: "all",
  },
  {
    name: "Auditing",
    faculty: "Commerce",
    duration: "3 years",
    baseAPS: 30,
    description: "Financial auditing, internal controls, and compliance.",
    careerProspects: [
      "Auditor",
      "Internal Auditor",
      "Compliance Officer",
      "Risk Auditor",
      "Forensic Auditor",
    ],
    subjects: [
      { name: "Mathematics", level: 5, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    allocation: "all",
  },
  {
    name: "Actuarial Science",
    faculty: "Commerce",
    duration: "4 years",
    baseAPS: 36,
    description: "Mathematical modeling of financial risk and uncertainty.",
    careerProspects: [
      "Actuary",
      "Risk Analyst",
      "Insurance Specialist",
      "Pension Fund Manager",
      "Investment Analyst",
    ],
    subjects: [
      { name: "Mathematics", level: 7, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    allocation: { exclude: ["UFH", "MUT"] },
  },
  {
    name: "Taxation",
    faculty: "Commerce",
    duration: "3 years",
    baseAPS: 28,
    description: "Tax law, tax planning, and compliance.",
    careerProspects: [
      "Tax Consultant",
      "Tax Advisor",
      "Tax Attorney",
      "Tax Accountant",
      "Revenue Officer",
    ],
    subjects: [
      { name: "Mathematics", level: 5, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    allocation: "all",
  },
  {
    name: "Investment Management",
    faculty: "Commerce",
    duration: "3 years",
    baseAPS: 30,
    description:
      "Portfolio management, investment analysis, and wealth management.",
    careerProspects: [
      "Investment Manager",
      "Portfolio Manager",
      "Financial Advisor",
      "Wealth Manager",
      "Investment Analyst",
    ],
    subjects: [
      { name: "Mathematics", level: 6, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    allocation: "all",
  },
  {
    name: "Business Analytics",
    faculty: "Commerce",
    duration: "3 years",
    baseAPS: 30,
    description:
      "Data analysis, business intelligence, and decision support systems.",
    careerProspects: [
      "Business Analyst",
      "Data Analyst",
      "Business Intelligence Specialist",
      "Analytics Consultant",
      "Operations Research Analyst",
    ],
    subjects: [
      { name: "Mathematics", level: 6, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    allocation: "all",
  },
  {
    name: "Strategic Management",
    faculty: "Commerce",
    duration: "3 years",
    baseAPS: 28,
    description:
      "Corporate strategy, competitive analysis, and organizational planning.",
    careerProspects: [
      "Strategy Consultant",
      "Business Development Manager",
      "Strategic Planner",
      "Management Consultant",
      "Corporate Strategy Analyst",
    ],
    subjects: [{ name: "English", level: 5, isRequired: true }],
    allocation: "all",
  },
  {
    name: "International Business",
    faculty: "Commerce",
    duration: "3 years",
    baseAPS: 28,
    description:
      "Global business operations, international trade, and cross-cultural management.",
    careerProspects: [
      "International Business Manager",
      "Export-Import Specialist",
      "Global Operations Manager",
      "International Trade Consultant",
      "Cross-Cultural Business Advisor",
    ],
    subjects: [{ name: "English", level: 6, isRequired: true }],
    allocation: "all",
  },

  // Faculty of Law
  {
    name: "Bachelor of Laws (LLB)",
    faculty: "Law",
    duration: "4 years",
    baseAPS: 32,
    description: "Legal principles, constitutional law, and jurisprudence.",
    careerProspects: [
      "Lawyer",
      "Attorney",
      "Advocate",
      "Legal Advisor",
      "Magistrate",
    ],
    subjects: [{ name: "English", level: 6, isRequired: true }],
    allocation: "all",
  },
  {
    name: "Bachelor of Criminal Justice",
    faculty: "Law",
    duration: "4 years",
    baseAPS: 28,
    description:
      "Criminal law, criminology, and justice system administration.",
    careerProspects: [
      "Police Officer",
      "Detective",
      "Probation Officer",
      "Correctional Officer",
      "Crime Analyst",
    ],
    subjects: [{ name: "English", level: 5, isRequired: true }],
    allocation: "all",
  },
  {
    name: "Bachelor of Forensic Science",
    faculty: "Law",
    duration: "4 years",
    baseAPS: 32,
    description: "Scientific methods applied to criminal investigation.",
    careerProspects: [
      "Forensic Scientist",
      "Crime Scene Investigator",
      "DNA Analyst",
      "Ballistics Expert",
      "Digital Forensics Specialist",
    ],
    subjects: [
      { name: "Mathematics", level: 5, isRequired: true },
      { name: "Physical Sciences", level: 6, isRequired: true },
      { name: "Life Sciences", level: 5, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    allocation: { exclude: ["UFH", "MUT"] },
  },
  {
    name: "Bachelor of International Law",
    faculty: "Law",
    duration: "4 years",
    baseAPS: 34,
    description: "International legal systems and cross-border legal issues.",
    careerProspects: [
      "International Lawyer",
      "Diplomat",
      "Legal Advisor",
      "Human Rights Lawyer",
      "International Legal Consultant",
    ],
    subjects: [{ name: "English", level: 6, isRequired: true }],
    allocation: "all",
  },
  {
    name: "Bachelor of Environmental Law",
    faculty: "Law",
    duration: "4 years",
    baseAPS: 30,
    description: "Environmental regulations and conservation law.",
    careerProspects: [
      "Environmental Lawyer",
      "Environmental Consultant",
      "Policy Analyst",
      "Conservation Legal Advisor",
      "Regulatory Affairs Specialist",
    ],
    subjects: [{ name: "English", level: 6, isRequired: true }],
    allocation: "all",
  },
  {
    name: "Bachelor of Labour Law",
    faculty: "Law",
    duration: "4 years",
    baseAPS: 30,
    description: "Employment law, labor relations, and workplace regulations.",
    careerProspects: [
      "Labour Lawyer",
      "Employment Specialist",
      "Union Representative",
      "HR Legal Advisor",
      "Industrial Relations Specialist",
    ],
    subjects: [{ name: "English", level: 6, isRequired: true }],
    allocation: "all",
  },
  {
    name: "Bachelor of Tax Law",
    faculty: "Law",
    duration: "4 years",
    baseAPS: 32,
    description: "Tax legislation, compliance, and tax planning.",
    careerProspects: [
      "Tax Lawyer",
      "Tax Consultant",
      "Revenue Attorney",
      "Tax Advisor",
      "Compliance Specialist",
    ],
    subjects: [
      { name: "Mathematics", level: 5, isRequired: true },
      { name: "English", level: 6, isRequired: true },
    ],
    allocation: "all",
  },
  {
    name: "Bachelor of Commercial Law",
    faculty: "Law",
    duration: "4 years",
    baseAPS: 32,
    description:
      "Business law, corporate governance, and commercial transactions.",
    careerProspects: [
      "Commercial Lawyer",
      "Corporate Legal Counsel",
      "Contract Specialist",
      "Business Legal Advisor",
      "Mergers & Acquisitions Lawyer",
    ],
    subjects: [{ name: "English", level: 6, isRequired: true }],
    allocation: "all",
  },
  {
    name: "Bachelor of Constitutional Law",
    faculty: "Law",
    duration: "4 years",
    baseAPS: 34,
    description: "Constitutional principles, government law, and civil rights.",
    careerProspects: [
      "Constitutional Lawyer",
      "Government Legal Advisor",
      "Civil Rights Lawyer",
      "Policy Legal Analyst",
      "Constitutional Court Clerk",
    ],
    subjects: [{ name: "English", level: 6, isRequired: true }],
    allocation: "all",
  },
  {
    name: "Bachelor of Human Rights Law",
    faculty: "Law",
    duration: "4 years",
    baseAPS: 32,
    description: "Human rights legislation and advocacy.",
    careerProspects: [
      "Human Rights Lawyer",
      "Civil Rights Advocate",
      "NGO Legal Advisor",
      "International Human Rights Specialist",
      "Legal Aid Attorney",
    ],
    subjects: [{ name: "English", level: 6, isRequired: true }],
    allocation: "all",
  },

  // Faculty of Science / Natural Sciences
  {
    name: "Bachelor of Science (BSc) in Biological Sciences",
    faculty: "Science",
    duration: "3 years",
    baseAPS: 30,
    description: "Study of living organisms and biological processes.",
    careerProspects: [
      "Biologist",
      "Research Scientist",
      "Environmental Consultant",
      "Biotechnologist",
      "Laboratory Technician",
    ],
    subjects: [
      { name: "Life Sciences", level: 6, isRequired: true },
      { name: "Mathematics", level: 5, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    allocation: "all",
  },
  {
    name: "Chemistry",
    faculty: "Science",
    duration: "3 years",
    baseAPS: 32,
    description:
      "Chemical principles, laboratory techniques, and molecular science.",
    careerProspects: [
      "Chemist",
      "Research Scientist",
      "Quality Control Analyst",
      "Environmental Scientist",
      "Pharmaceutical Scientist",
    ],
    subjects: [
      { name: "Mathematics", level: 5, isRequired: true },
      { name: "Physical Sciences", level: 6, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    allocation: "all",
  },
  {
    name: "Physics",
    faculty: "Science",
    duration: "3 years",
    baseAPS: 34,
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
    allocation: "all",
  },
  {
    name: "Mathematics",
    faculty: "Science",
    duration: "3 years",
    baseAPS: 34,
    description:
      "Pure and applied mathematics, statistics, and mathematical modeling.",
    careerProspects: [
      "Mathematician",
      "Statistician",
      "Data Analyst",
      "Actuary",
      "Mathematics Teacher",
    ],
    subjects: [
      { name: "Mathematics", level: 6, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    allocation: "all",
  },
  {
    name: "Computer Science",
    faculty: "Science",
    duration: "3 years",
    baseAPS: 32,
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
    allocation: "all",
  },
  {
    name: "Environmental Science",
    faculty: "Science",
    duration: "3 years",
    baseAPS: 28,
    description:
      "Interdisciplinary study of environmental systems and sustainability.",
    careerProspects: [
      "Environmental Scientist",
      "Conservation Specialist",
      "Environmental Consultant",
      "Sustainability Coordinator",
      "Environmental Impact Assessor",
    ],
    subjects: [
      { name: "Life Sciences", level: 5, isRequired: true },
      { name: "Mathematics", level: 4, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    allocation: "all",
  },
  {
    name: "Geology",
    faculty: "Science",
    duration: "3 years",
    baseAPS: 30,
    description: "Earth sciences, minerals, and geological processes.",
    careerProspects: [
      "Geologist",
      "Mining Geologist",
      "Environmental Geologist",
      "Hydrogeologist",
      "Geological Consultant",
    ],
    subjects: [
      { name: "Mathematics", level: 5, isRequired: true },
      { name: "Physical Sciences", level: 5, isRequired: true },
      { name: "Geography", level: 4, isRequired: false },
      { name: "English", level: 5, isRequired: true },
    ],
    allocation: "all",
  },
  {
    name: "Statistics",
    faculty: "Science",
    duration: "3 years",
    baseAPS: 32,
    description:
      "Statistical analysis, data interpretation, and research methods.",
    careerProspects: [
      "Statistician",
      "Data Analyst",
      "Market Research Analyst",
      "Biostatistician",
      "Quality Control Analyst",
    ],
    subjects: [
      { name: "Mathematics", level: 6, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    allocation: "all",
  },
  {
    name: "Biochemistry",
    faculty: "Science",
    duration: "3 years",
    baseAPS: 34,
    description: "Chemical processes within living organisms.",
    careerProspects: [
      "Biochemist",
      "Research Scientist",
      "Clinical Biochemist",
      "Biotechnologist",
      "Pharmaceutical Researcher",
    ],
    subjects: [
      { name: "Mathematics", level: 5, isRequired: true },
      { name: "Physical Sciences", level: 6, isRequired: true },
      { name: "Life Sciences", level: 6, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    allocation: "all",
  },
  {
    name: "Microbiology",
    faculty: "Science",
    duration: "3 years",
    baseAPS: 32,
    description: "Study of microorganisms and their applications.",
    careerProspects: [
      "Microbiologist",
      "Medical Microbiologist",
      "Food Microbiologist",
      "Environmental Microbiologist",
      "Quality Control Microbiologist",
    ],
    subjects: [
      { name: "Life Sciences", level: 6, isRequired: true },
      { name: "Physical Sciences", level: 5, isRequired: true },
      { name: "Mathematics", level: 4, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    allocation: "all",
  },
  {
    name: "Genetics",
    faculty: "Science",
    duration: "3 years",
    baseAPS: 34,
    description: "Heredity, genetic variation, and molecular genetics.",
    careerProspects: [
      "Geneticist",
      "Genetic Counselor",
      "Research Scientist",
      "Biotechnologist",
      "Forensic Geneticist",
    ],
    subjects: [
      { name: "Life Sciences", level: 6, isRequired: true },
      { name: "Mathematics", level: 5, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    allocation: "all",
  },
  {
    name: "Botany",
    faculty: "Science",
    duration: "3 years",
    baseAPS: 28,
    description: "Study of plant life and plant biology.",
    careerProspects: [
      "Botanist",
      "Plant Researcher",
      "Conservation Biologist",
      "Horticulturist",
      "Environmental Consultant",
    ],
    subjects: [
      { name: "Life Sciences", level: 6, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    allocation: "all",
  },
  {
    name: "Zoology",
    faculty: "Science",
    duration: "3 years",
    baseAPS: 28,
    description: "Study of animal behavior, physiology, and ecology.",
    careerProspects: [
      "Zoologist",
      "Wildlife Biologist",
      "Animal Researcher",
      "Conservation Specialist",
      "Veterinary Research Scientist",
    ],
    subjects: [
      { name: "Life Sciences", level: 6, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    allocation: "all",
  },
  {
    name: "Astronomy",
    faculty: "Science",
    duration: "3 years",
    baseAPS: 36,
    description: "Study of celestial objects and space phenomena.",
    careerProspects: [
      "Astronomer",
      "Astrophysicist",
      "Planetarium Director",
      "Space Research Scientist",
      "Observatory Technician",
    ],
    subjects: [
      { name: "Mathematics", level: 7, isRequired: true },
      { name: "Physical Sciences", level: 6, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    allocation: { includeOnly: ["UCT", "RU"] },
  },
  {
    name: "Meteorology",
    faculty: "Science",
    duration: "3 years",
    baseAPS: 34,
    description: "Weather patterns, atmospheric science, and climate study.",
    careerProspects: [
      "Meteorologist",
      "Weather Forecaster",
      "Climate Scientist",
      "Atmospheric Researcher",
      "Environmental Consultant",
    ],
    subjects: [
      { name: "Mathematics", level: 6, isRequired: true },
      { name: "Physical Sciences", level: 6, isRequired: true },
      { name: "Geography", level: 5, isRequired: false },
      { name: "English", level: 5, isRequired: true },
    ],
    allocation: { includeOnly: ["UCT", "RU"] },
  },
  {
    name: "Marine Biology",
    faculty: "Science",
    duration: "3 years",
    baseAPS: 32,
    description: "Study of marine organisms and ocean ecosystems.",
    careerProspects: [
      "Marine Biologist",
      "Ocean Researcher",
      "Aquaculture Specialist",
      "Marine Conservation Specialist",
      "Fisheries Biologist",
    ],
    subjects: [
      { name: "Life Sciences", level: 6, isRequired: true },
      { name: "Mathematics", level: 5, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    allocation: { includeOnly: ["UCT", "RU"] },
  },
  {
    name: "Biotechnology",
    faculty: "Science",
    duration: "4 years",
    baseAPS: 34,
    description:
      "Application of biological systems for technological purposes.",
    careerProspects: [
      "Biotechnologist",
      "Research Scientist",
      "Bioprocess Engineer",
      "Quality Control Specialist",
      "Product Development Scientist",
    ],
    subjects: [
      { name: "Life Sciences", level: 6, isRequired: true },
      { name: "Physical Sciences", level: 5, isRequired: true },
      { name: "Mathematics", level: 5, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    allocation: "all",
  },
  {
    name: "Ecology",
    faculty: "Science",
    duration: "3 years",
    baseAPS: 28,
    description: "Relationships between organisms and their environment.",
    careerProspects: [
      "Ecologist",
      "Environmental Consultant",
      "Conservation Biologist",
      "Wildlife Manager",
      "Environmental Impact Assessor",
    ],
    subjects: [
      { name: "Life Sciences", level: 6, isRequired: true },
      { name: "Mathematics", level: 4, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    allocation: "all",
  },
  {
    name: "Entomology",
    faculty: "Science",
    duration: "3 years",
    baseAPS: 28,
    description: "Study of insects and their behavior.",
    careerProspects: [
      "Entomologist",
      "Pest Control Specialist",
      "Agricultural Consultant",
      "Museum Curator",
      "Research Scientist",
    ],
    subjects: [
      { name: "Life Sciences", level: 6, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    allocation: "all",
  },
  {
    name: "Mycology",
    faculty: "Science",
    duration: "3 years",
    baseAPS: 28,
    description: "Study of fungi and their ecological roles.",
    careerProspects: [
      "Mycologist",
      "Research Scientist",
      "Agricultural Specialist",
      "Biotechnologist",
      "Environmental Consultant",
    ],
    subjects: [
      { name: "Life Sciences", level: 6, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    allocation: { exclude: ["UFH"] },
  },
  {
    name: "Phycology",
    faculty: "Science",
    duration: "3 years",
    baseAPS: 28,
    description: "Study of algae and their applications.",
    careerProspects: [
      "Phycologist",
      "Marine Researcher",
      "Biotechnologist",
      "Environmental Scientist",
      "Aquaculture Specialist",
    ],
    subjects: [
      { name: "Life Sciences", level: 6, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    allocation: { exclude: ["UFH"] },
  },
  {
    name: "Limnology",
    faculty: "Science",
    duration: "3 years",
    baseAPS: 30,
    description: "Study of freshwater systems and aquatic ecology.",
    careerProspects: [
      "Limnologist",
      "Aquatic Ecologist",
      "Water Quality Specialist",
      "Environmental Consultant",
      "Fisheries Biologist",
    ],
    subjects: [
      { name: "Life Sciences", level: 6, isRequired: true },
      { name: "Mathematics", level: 4, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    allocation: { exclude: ["UFH"] },
  },
  {
    name: "Hydrology",
    faculty: "Science",
    duration: "3 years",
    baseAPS: 30,
    description: "Study of water movement, distribution, and quality.",
    careerProspects: [
      "Hydrologist",
      "Water Resources Specialist",
      "Environmental Consultant",
      "Water Quality Analyst",
      "Groundwater Specialist",
    ],
    subjects: [
      { name: "Mathematics", level: 5, isRequired: true },
      { name: "Physical Sciences", level: 5, isRequired: true },
      { name: "Geography", level: 5, isRequired: false },
      { name: "English", level: 5, isRequired: true },
    ],
    allocation: "all",
  },
  {
    name: "Soil Science",
    faculty: "Science",
    duration: "3 years",
    baseAPS: 28,
    description: "Study of soil as a natural resource and agricultural medium.",
    careerProspects: [
      "Soil Scientist",
      "Agricultural Consultant",
      "Environmental Consultant",
      "Land Use Planner",
      "Soil Conservation Specialist",
    ],
    subjects: [
      { name: "Life Sciences", level: 5, isRequired: true },
      { name: "Physical Sciences", level: 4, isRequired: true },
      { name: "Mathematics", level: 4, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    allocation: "all",
  },
  {
    name: "Agricultural Science",
    faculty: "Science",
    duration: "4 years",
    baseAPS: 26,
    description:
      "Scientific principles applied to agriculture and food production.",
    careerProspects: [
      "Agricultural Scientist",
      "Crop Specialist",
      "Agricultural Consultant",
      "Farm Manager",
      "Agricultural Extension Officer",
    ],
    subjects: [
      { name: "Life Sciences", level: 5, isRequired: true },
      { name: "Mathematics", level: 4, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    allocation: "all",
  },

  // Faculty of Education
  {
    name: "Bachelor of Education (BEd) in Foundation Phase",
    faculty: "Education",
    duration: "4 years",
    baseAPS: 24,
    description: "Teaching young children from Grade R to Grade 3.",
    careerProspects: [
      "Foundation Phase Teacher",
      "Early Childhood Educator",
      "Educational Specialist",
      "Curriculum Developer",
      "School Principal",
    ],
    subjects: [
      { name: "English", level: 5, isRequired: true },
      { name: "Mathematics", level: 4, isRequired: true },
    ],
    allocation: "all",
  },
  {
    name: "Intermediate Phase",
    faculty: "Education",
    duration: "4 years",
    baseAPS: 24,
    description: "Teaching children from Grade 4 to Grade 6.",
    careerProspects: [
      "Intermediate Phase Teacher",
      "Educational Specialist",
      "Curriculum Developer",
      "School Principal",
      "Education Consultant",
    ],
    subjects: [
      { name: "English", level: 5, isRequired: true },
      { name: "Mathematics", level: 5, isRequired: true },
    ],
    allocation: "all",
  },
  {
    name: "Senior Phase",
    faculty: "Education",
    duration: "4 years",
    baseAPS: 26,
    description: "Teaching adolescents from Grade 7 to Grade 9.",
    careerProspects: [
      "Senior Phase Teacher",
      "Subject Specialist",
      "Educational Specialist",
      "School Principal",
      "Education Consultant",
    ],
    subjects: [
      { name: "English", level: 5, isRequired: true },
      { name: "Mathematics", level: 5, isRequired: true },
      { name: "Teaching Subject", level: 5, isRequired: true },
    ],
    allocation: "all",
  },
  {
    name: "Further Education and Training (FET) Phase",
    faculty: "Education",
    duration: "4 years",
    baseAPS: 28,
    description: "Teaching high school students from Grade 10 to Grade 12.",
    careerProspects: [
      "High School Teacher",
      "Subject Specialist",
      "Educational Specialist",
      "School Principal",
      "Education Consultant",
    ],
    subjects: [
      { name: "English", level: 5, isRequired: true },
      { name: "Mathematics", level: 5, isRequired: true },
      { name: "Teaching Subject", level: 6, isRequired: true },
    ],
    allocation: "all",
  },
  {
    name: "Special Education",
    faculty: "Education",
    duration: "4 years",
    baseAPS: 26,
    description: "Teaching students with special educational needs.",
    careerProspects: [
      "Special Education Teacher",
      "Inclusive Education Specialist",
      "Remedial Teacher",
      "Learning Support Teacher",
      "Special Needs Coordinator",
    ],
    subjects: [
      { name: "English", level: 5, isRequired: true },
      { name: "Mathematics", level: 4, isRequired: true },
    ],
    allocation: "all",
  },
  {
    name: "Adult Education",
    faculty: "Education",
    duration: "4 years",
    baseAPS: 24,
    description: "Teaching and training adult learners.",
    careerProspects: [
      "Adult Education Teacher",
      "Corporate Trainer",
      "Literacy Coordinator",
      "Community Education Specialist",
      "Training Manager",
    ],
    subjects: [{ name: "English", level: 5, isRequired: true }],
    allocation: "all",
  },
  {
    name: "Educational Psychology",
    faculty: "Education",
    duration: "4 years",
    baseAPS: 30,
    description:
      "Psychology applied to educational settings and learning processes.",
    careerProspects: [
      "Educational Psychologist",
      "School Psychologist",
      "Learning Support Specialist",
      "Educational Consultant",
      "Research Psychologist",
    ],
    subjects: [
      { name: "English", level: 5, isRequired: true },
      { name: "Mathematics", level: 5, isRequired: true },
      { name: "Life Sciences", level: 4, isRequired: false },
    ],
    allocation: "all",
  },
  {
    name: "Educational Management",
    faculty: "Education",
    duration: "4 years",
    baseAPS: 26,
    description: "Leadership and administration in educational institutions.",
    careerProspects: [
      "School Principal",
      "Education Administrator",
      "District Education Manager",
      "Educational Consultant",
      "Policy Analyst",
    ],
    subjects: [
      { name: "English", level: 5, isRequired: true },
      { name: "Mathematics", level: 4, isRequired: true },
    ],
    allocation: "all",
  },
  {
    name: "Curriculum Studies",
    faculty: "Education",
    duration: "4 years",
    baseAPS: 26,
    description:
      "Design, development, and evaluation of educational curricula.",
    careerProspects: [
      "Curriculum Developer",
      "Educational Consultant",
      "Instructional Designer",
      "Assessment Specialist",
      "Education Policy Analyst",
    ],
    subjects: [{ name: "English", level: 5, isRequired: true }],
    allocation: "all",
  },
  {
    name: "Language Education",
    faculty: "Education",
    duration: "4 years",
    baseAPS: 26,
    description: "Teaching language skills and literacy development.",
    careerProspects: [
      "Language Teacher",
      "Literacy Specialist",
      "Language Coordinator",
      "ESL Teacher",
      "Reading Specialist",
    ],
    subjects: [{ name: "English", level: 6, isRequired: true }],
    allocation: "all",
  },
  {
    name: "Mathematics Education",
    faculty: "Education",
    duration: "4 years",
    baseAPS: 28,
    description: "Teaching mathematics at various educational levels.",
    careerProspects: [
      "Mathematics Teacher",
      "Mathematics Coordinator",
      "Numeracy Specialist",
      "Educational Consultant",
      "Curriculum Developer",
    ],
    subjects: [
      { name: "Mathematics", level: 6, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    allocation: "all",
  },
  {
    name: "Science Education",
    faculty: "Education",
    duration: "4 years",
    baseAPS: 28,
    description: "Teaching science subjects at various educational levels.",
    careerProspects: [
      "Science Teacher",
      "Science Coordinator",
      "Educational Consultant",
      "Curriculum Developer",
      "Science Education Researcher",
    ],
    subjects: [
      { name: "Physical Sciences", level: 5, isRequired: true },
      { name: "Life Sciences", level: 5, isRequired: true },
      { name: "Mathematics", level: 5, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    allocation: "all",
  },
  {
    name: "Technology Education",
    faculty: "Education",
    duration: "4 years",
    baseAPS: 26,
    description: "Teaching technology and technical subjects.",
    careerProspects: [
      "Technology Teacher",
      "Technical Education Specialist",
      "Skills Development Coordinator",
      "Vocational Trainer",
      "Educational Technology Specialist",
    ],
    subjects: [
      { name: "Mathematics", level: 5, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    allocation: "all",
  },
  {
    name: "Social Sciences Education",
    faculty: "Education",
    duration: "4 years",
    baseAPS: 24,
    description: "Teaching social sciences subjects.",
    careerProspects: [
      "Social Sciences Teacher",
      "History Teacher",
      "Geography Teacher",
      "Educational Consultant",
      "Curriculum Developer",
    ],
    subjects: [
      { name: "English", level: 5, isRequired: true },
      { name: "History", level: 4, isRequired: false },
      { name: "Geography", level: 4, isRequired: false },
    ],
    allocation: "all",
  },
  {
    name: "Life Orientation Education",
    faculty: "Education",
    duration: "4 years",
    baseAPS: 24,
    description: "Teaching life skills and personal development.",
    careerProspects: [
      "Life Orientation Teacher",
      "Guidance Counselor",
      "Life Skills Coordinator",
      "Student Support Teacher",
      "Personal Development Specialist",
    ],
    subjects: [
      { name: "English", level: 5, isRequired: true },
      { name: "Life Sciences", level: 4, isRequired: false },
    ],
    allocation: "all",
  },
  {
    name: "Arts and Culture Education",
    faculty: "Education",
    duration: "4 years",
    baseAPS: 22,
    description: "Teaching creative arts and cultural studies.",
    careerProspects: [
      "Arts Teacher",
      "Cultural Education Specialist",
      "Arts Coordinator",
      "Creative Arts Teacher",
      "Drama Teacher",
    ],
    subjects: [{ name: "English", level: 5, isRequired: true }],
    allocation: "all",
  },
  {
    name: "Economic and Management Sciences Education",
    faculty: "Education",
    duration: "4 years",
    baseAPS: 26,
    description: "Teaching business and economic subjects.",
    careerProspects: [
      "Business Studies Teacher",
      "Economics Teacher",
      "Accounting Teacher",
      "Commercial Education Specialist",
      "Entrepreneurship Educator",
    ],
    subjects: [
      { name: "Mathematics", level: 5, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    allocation: "all",
  },
  {
    name: "Physical Education",
    faculty: "Education",
    duration: "4 years",
    baseAPS: 22,
    description: "Teaching physical education and sports coaching.",
    careerProspects: [
      "Physical Education Teacher",
      "Sports Coach",
      "Fitness Instructor",
      "Sports Administrator",
      "Recreation Specialist",
    ],
    subjects: [
      { name: "English", level: 4, isRequired: true },
      { name: "Life Sciences", level: 4, isRequired: false },
    ],
    allocation: "all",
  },

  // Faculty of Agriculture / Agricultural Sciences
  {
    name: "Bachelor of Agriculture in Animal Science",
    faculty: "Agriculture",
    duration: "4 years",
    baseAPS: 26,
    description:
      "Animal husbandry, livestock management, and animal nutrition.",
    careerProspects: [
      "Animal Scientist",
      "Livestock Manager",
      "Animal Nutritionist",
      "Farm Manager",
      "Agricultural Consultant",
    ],
    subjects: [
      { name: "Life Sciences", level: 5, isRequired: true },
      { name: "Mathematics", level: 4, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    allocation: "all",
  },
  {
    name: "Plant Production",
    faculty: "Agriculture",
    duration: "4 years",
    baseAPS: 26,
    description:
      "Crop science, plant breeding, and agricultural production systems.",
    careerProspects: [
      "Crop Scientist",
      "Plant Breeder",
      "Agricultural Consultant",
      "Farm Manager",
      "Seed Production Specialist",
    ],
    subjects: [
      { name: "Life Sciences", level: 5, isRequired: true },
      { name: "Mathematics", level: 4, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    allocation: "all",
  },
  {
    name: "Agricultural Economics",
    faculty: "Agriculture",
    duration: "4 years",
    baseAPS: 28,
    description: "Economics applied to agricultural production and marketing.",
    careerProspects: [
      "Agricultural Economist",
      "Farm Business Advisor",
      "Agricultural Policy Analyst",
      "Market Analyst",
      "Rural Development Specialist",
    ],
    subjects: [
      { name: "Mathematics", level: 5, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    allocation: "all",
  },
  {
    name: "Agricultural Extension",
    faculty: "Agriculture",
    duration: "4 years",
    baseAPS: 24,
    description: "Technology transfer and farmer education services.",
    careerProspects: [
      "Extension Officer",
      "Agricultural Advisor",
      "Rural Development Officer",
      "Farmer Educator",
      "Community Development Specialist",
    ],
    subjects: [
      { name: "Life Sciences", level: 4, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    allocation: "all",
  },
  {
    name: "Horticulture",
    faculty: "Agriculture",
    duration: "4 years",
    baseAPS: 24,
    description: "Cultivation of fruits, vegetables, and ornamental plants.",
    careerProspects: [
      "Horticulturist",
      "Garden Designer",
      "Nursery Manager",
      "Greenhouse Manager",
      "Landscape Designer",
    ],
    subjects: [
      { name: "Life Sciences", level: 5, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    allocation: "all",
  },
  {
    name: "Viticulture and Oenology",
    faculty: "Agriculture",
    duration: "4 years",
    baseAPS: 28,
    description: "Grape growing and wine production.",
    careerProspects: [
      "Viticulturist",
      "Winemaker",
      "Wine Consultant",
      "Vineyard Manager",
      "Wine Quality Specialist",
    ],
    subjects: [
      { name: "Life Sciences", level: 5, isRequired: true },
      { name: "Physical Sciences", level: 5, isRequired: true },
      { name: "Mathematics", level: 4, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    allocation: { includeOnly: ["SU", "UCT"] },
  },
  {
    name: "Agricultural Management",
    faculty: "Agriculture",
    duration: "4 years",
    baseAPS: 26,
    description:
      "Business management principles applied to agricultural enterprises.",
    careerProspects: [
      "Farm Manager",
      "Agricultural Business Manager",
      "Agribusiness Consultant",
      "Rural Development Manager",
      "Cooperative Manager",
    ],
    subjects: [
      { name: "Mathematics", level: 4, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    allocation: "all",
  },
  {
    name: "Food Science and Technology",
    faculty: "Agriculture",
    duration: "4 years",
    baseAPS: 30,
    description: "Food processing, preservation, and quality control.",
    careerProspects: [
      "Food Scientist",
      "Food Technologist",
      "Quality Control Manager",
      "Product Development Specialist",
      "Food Safety Inspector",
    ],
    subjects: [
      { name: "Mathematics", level: 5, isRequired: true },
      { name: "Physical Sciences", level: 5, isRequired: true },
      { name: "Life Sciences", level: 5, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    allocation: "all",
  },
  {
    name: "Forestry",
    faculty: "Agriculture",
    duration: "4 years",
    baseAPS: 26,
    description: "Forest management, conservation, and timber production.",
    careerProspects: [
      "Forester",
      "Forest Manager",
      "Conservation Officer",
      "Timber Production Manager",
      "Environmental Consultant",
    ],
    subjects: [
      { name: "Life Sciences", level: 5, isRequired: true },
      { name: "Mathematics", level: 4, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    allocation: { includeOnly: ["SU", "UCT"] },
  },
  {
    name: "Game Ranch Management",
    faculty: "Agriculture",
    duration: "4 years",
    baseAPS: 24,
    description: "Wildlife management and game farming operations.",
    careerProspects: [
      "Game Ranch Manager",
      "Wildlife Manager",
      "Conservation Manager",
      "Tourism Manager",
      "Game Breeder",
    ],
    subjects: [
      { name: "Life Sciences", level: 5, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    allocation: { includeOnly: ["UFH", "RU"] },
  },
  {
    name: "Irrigation Management",
    faculty: "Agriculture",
    duration: "4 years",
    baseAPS: 26,
    description: "Water management systems for agricultural production.",
    careerProspects: [
      "Irrigation Specialist",
      "Water Management Consultant",
      "Agricultural Engineer",
      "Water Resources Manager",
      "Precision Agriculture Specialist",
    ],
    subjects: [
      { name: "Mathematics", level: 5, isRequired: true },
      { name: "Physical Sciences", level: 4, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    allocation: "all",
  },
  {
    name: "Organic Farming",
    faculty: "Agriculture",
    duration: "4 years",
    baseAPS: 24,
    description: "Sustainable and organic agricultural production methods.",
    careerProspects: [
      "Organic Farming Specialist",
      "Sustainable Agriculture Consultant",
      "Organic Certification Officer",
      "Environmental Farmer",
      "Permaculture Designer",
    ],
    subjects: [
      { name: "Life Sciences", level: 5, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    allocation: { includeOnly: ["SU"] },
  },
  {
    name: "Precision Agriculture",
    faculty: "Agriculture",
    duration: "4 years",
    baseAPS: 28,
    description:
      "Technology-driven farming using GPS, sensors, and data analytics.",
    careerProspects: [
      "Precision Agriculture Specialist",
      "Agricultural Technology Consultant",
      "Farm Systems Analyst",
      "Agricultural Data Scientist",
      "Smart Farming Coordinator",
    ],
    subjects: [
      { name: "Mathematics", level: 5, isRequired: true },
      { name: "Life Sciences", level: 5, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    allocation: { includeOnly: ["SU", "UCT"] },
  },
  {
    name: "Rural Development",
    faculty: "Agriculture",
    duration: "4 years",
    baseAPS: 24,
    description: "Community development and rural empowerment strategies.",
    careerProspects: [
      "Rural Development Officer",
      "Community Development Specialist",
      "NGO Project Manager",
      "Agricultural Extension Officer",
      "Policy Development Specialist",
    ],
    subjects: [{ name: "English", level: 5, isRequired: true }],
    allocation: "all",
  },

  // Faculty of Information Technology / Computer Science
  {
    name: "Bachelor of Information Technology (BIT)",
    faculty: "Information Technology",
    duration: "3 years",
    baseAPS: 28,
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
    allocation: "all",
  },
  {
    name: "Bachelor of Science in Computer Science (BSc Computer Science)",
    faculty: "Information Technology",
    duration: "3 years",
    baseAPS: 32,
    description:
      "Advanced computer science, algorithms, and software development.",
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
    allocation: "all",
  },
  {
    name: "Bachelor of Software Engineering (BSc Software Engineering)",
    faculty: "Information Technology",
    duration: "4 years",
    baseAPS: 32,
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
    allocation: "all",
  },
  {
    name: "Bachelor of Information Systems (BIS)",
    faculty: "Information Technology",
    duration: "3 years",
    baseAPS: 28,
    description: "Business information systems and enterprise solutions.",
    careerProspects: [
      "Information Systems Analyst",
      "Business Analyst",
      "Systems Consultant",
      "IT Project Manager",
      "Enterprise Architect",
    ],
    subjects: [
      { name: "Mathematics", level: 5, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    allocation: "all",
  },
  {
    name: "Bachelor of Cybersecurity",
    faculty: "Information Technology",
    duration: "4 years",
    baseAPS: 30,
    description: "Information security, network security, and cyber defense.",
    careerProspects: [
      "Cybersecurity Specialist",
      "Information Security Analyst",
      "Security Consultant",
      "Ethical Hacker",
      "Security Architect",
    ],
    subjects: [
      { name: "Mathematics", level: 5, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    allocation: "all",
  },
  {
    name: "Bachelor of Data Science",
    faculty: "Information Technology",
    duration: "4 years",
    baseAPS: 32,
    description: "Data analysis, machine learning, and statistical modeling.",
    careerProspects: [
      "Data Scientist",
      "Data Analyst",
      "Machine Learning Engineer",
      "Business Intelligence Analyst",
      "Statistical Analyst",
    ],
    subjects: [
      { name: "Mathematics", level: 6, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    allocation: "all",
  },
  {
    name: "Bachelor of Artificial Intelligence",
    faculty: "Information Technology",
    duration: "4 years",
    baseAPS: 34,
    description: "AI systems, machine learning, and intelligent automation.",
    careerProspects: [
      "AI Engineer",
      "Machine Learning Specialist",
      "Robotics Engineer",
      "AI Researcher",
      "Intelligent Systems Developer",
    ],
    subjects: [
      { name: "Mathematics", level: 6, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    allocation: "all",
  },
  {
    name: "Bachelor of Game Development",
    faculty: "Information Technology",
    duration: "4 years",
    baseAPS: 28,
    description: "Video game design, programming, and interactive media.",
    careerProspects: [
      "Game Developer",
      "Game Designer",
      "3D Artist",
      "Game Programmer",
      "Interactive Media Developer",
    ],
    subjects: [
      { name: "Mathematics", level: 5, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    allocation: "all",
  },
  {
    name: "Bachelor of Web Development",
    faculty: "Information Technology",
    duration: "3 years",
    baseAPS: 26,
    description: "Web technologies, front-end and back-end development.",
    careerProspects: [
      "Web Developer",
      "Full-Stack Developer",
      "Front-End Developer",
      "Back-End Developer",
      "Web Designer",
    ],
    subjects: [
      { name: "Mathematics", level: 4, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    allocation: "all",
  },
  {
    name: "Bachelor of Mobile Application Development",
    faculty: "Information Technology",
    duration: "3 years",
    baseAPS: 28,
    description: "Mobile app development for iOS and Android platforms.",
    careerProspects: [
      "Mobile App Developer",
      "iOS Developer",
      "Android Developer",
      "Mobile UI/UX Designer",
      "Mobile Solutions Architect",
    ],
    subjects: [
      { name: "Mathematics", level: 5, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    allocation: "all",
  },
  {
    name: "Bachelor of Network Engineering",
    faculty: "Information Technology",
    duration: "4 years",
    baseAPS: 30,
    description: "Computer networks, telecommunications, and infrastructure.",
    careerProspects: [
      "Network Engineer",
      "Network Administrator",
      "Telecommunications Engineer",
      "Network Security Specialist",
      "Infrastructure Architect",
    ],
    subjects: [
      { name: "Mathematics", level: 5, isRequired: true },
      { name: "Physical Sciences", level: 5, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    allocation: "all",
  },
  {
    name: "Bachelor of Cloud Computing",
    faculty: "Information Technology",
    duration: "4 years",
    baseAPS: 30,
    description:
      "Cloud infrastructure, distributed systems, and cloud services.",
    careerProspects: [
      "Cloud Engineer",
      "Cloud Architect",
      "DevOps Engineer",
      "Cloud Solutions Specialist",
      "Systems Engineer",
    ],
    subjects: [
      { name: "Mathematics", level: 5, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    allocation: "all",
  },
  {
    name: "Bachelor of Digital Media",
    faculty: "Information Technology",
    duration: "3 years",
    baseAPS: 24,
    description:
      "Digital content creation, multimedia design, and interactive media.",
    careerProspects: [
      "Digital Media Specialist",
      "Multimedia Designer",
      "Content Creator",
      "Digital Artist",
      "Interactive Media Developer",
    ],
    subjects: [{ name: "English", level: 5, isRequired: true }],
    allocation: "all",
  },

  // Faculty of Built Environment / Architecture and Planning
  {
    name: "Bachelor of Architecture (BArch)",
    faculty: "Built Environment",
    duration: "5 years",
    baseAPS: 34,
    description:
      "Architectural design, building technology, and urban planning.",
    careerProspects: [
      "Architect",
      "Urban Designer",
      "Building Designer",
      "Project Architect",
      "Design Consultant",
    ],
    subjects: [
      { name: "Mathematics", level: 5, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    allocation: { exclude: ["UNISA", "UFH"] },
  },
  {
    name: "Bachelor of Architectural Studies (BAS)",
    faculty: "Built Environment",
    duration: "3 years",
    baseAPS: 32,
    description: "Foundation studies in architecture and design.",
    careerProspects: [
      "Architectural Draftsperson",
      "Design Assistant",
      "Building Inspector",
      "Urban Planning Assistant",
      "Construction Coordinator",
    ],
    subjects: [
      { name: "Mathematics", level: 5, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    allocation: { exclude: ["UNISA", "UFH"] },
  },
  {
    name: "Bachelor of Urban and Regional Planning",
    faculty: "Built Environment",
    duration: "4 years",
    baseAPS: 30,
    description: "Urban planning, regional development, and spatial planning.",
    careerProspects: [
      "Urban Planner",
      "Regional Planner",
      "Policy Analyst",
      "Development Consultant",
      "Municipal Planner",
    ],
    subjects: [
      { name: "Mathematics", level: 4, isRequired: true },
      { name: "English", level: 5, isRequired: true },
      { name: "Geography", level: 4, isRequired: false },
    ],
    allocation: { exclude: ["UNISA", "UFH"] },
  },
  {
    name: "Bachelor of Construction Studies",
    faculty: "Built Environment",
    duration: "4 years",
    baseAPS: 28,
    description:
      "Construction management, building technology, and project management.",
    careerProspects: [
      "Construction Manager",
      "Project Manager",
      "Site Manager",
      "Building Inspector",
      "Construction Consultant",
    ],
    subjects: [
      { name: "Mathematics", level: 5, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    allocation: "all",
  },
  {
    name: "Bachelor of Property Studies",
    faculty: "Built Environment",
    duration: "4 years",
    baseAPS: 28,
    description: "Property management, real estate, and property development.",
    careerProspects: [
      "Property Manager",
      "Real Estate Agent",
      "Property Developer",
      "Property Valuer",
      "Real Estate Consultant",
    ],
    subjects: [
      { name: "Mathematics", level: 4, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    allocation: { exclude: ["UNISA"] },
  },
  {
    name: "Bachelor of Real Estate",
    faculty: "Built Environment",
    duration: "4 years",
    baseAPS: 26,
    description: "Real estate transactions, property law, and market analysis.",
    careerProspects: [
      "Real Estate Agent",
      "Property Broker",
      "Real Estate Appraiser",
      "Property Investment Advisor",
      "Real Estate Developer",
    ],
    subjects: [
      { name: "Mathematics", level: 4, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    allocation: { includeOnly: ["TUT", "DUT"] },
  },
  {
    name: "Bachelor of Facilities Management",
    faculty: "Built Environment",
    duration: "4 years",
    baseAPS: 26,
    description: "Building operations, maintenance, and facility services.",
    careerProspects: [
      "Facilities Manager",
      "Building Manager",
      "Maintenance Manager",
      "Space Planner",
      "Property Operations Manager",
    ],
    subjects: [
      { name: "Mathematics", level: 4, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    allocation: { includeOnly: ["TUT", "DUT"] },
  },
  {
    name: "Bachelor of Housing Studies",
    faculty: "Built Environment",
    duration: "4 years",
    baseAPS: 24,
    description:
      "Housing policy, affordable housing, and community development.",
    careerProspects: [
      "Housing Officer",
      "Community Development Specialist",
      "Housing Policy Analyst",
      "Social Housing Manager",
      "Urban Development Coordinator",
    ],
    subjects: [{ name: "English", level: 5, isRequired: true }],
    allocation: { includeOnly: ["TUT", "DUT"] },
  },

  // Technical and Vocational Programmes (mainly at UoTs)
  {
    name: "National Diploma in Engineering (various disciplines)",
    faculty: "Engineering",
    duration: "3 years",
    baseAPS: 22,
    description:
      "Practical engineering training in various technical disciplines.",
    careerProspects: [
      "Engineering Technician",
      "Technical Officer",
      "Maintenance Technician",
      "Production Supervisor",
      "Quality Control Technician",
    ],
    subjects: [
      { name: "Mathematics", level: 4, isRequired: true },
      { name: "Physical Sciences", level: 4, isRequired: true },
      { name: "English", level: 4, isRequired: true },
    ],
    allocation: { includeOnly: ["TUT", "DUT", "MUT", "VUT", "CPUT", "CUT"] },
  },
  {
    name: "National Diploma in Information Technology",
    faculty: "Information Technology",
    duration: "3 years",
    baseAPS: 20,
    description: "Practical IT skills and technical computing.",
    careerProspects: [
      "IT Technician",
      "Computer Support Specialist",
      "Network Technician",
      "Database Technician",
      "Web Support Specialist",
    ],
    subjects: [
      { name: "Mathematics", level: 4, isRequired: true },
      { name: "English", level: 4, isRequired: true },
    ],
    allocation: { includeOnly: ["TUT", "DUT", "MUT", "VUT", "CPUT", "CUT"] },
  },
  {
    name: "National Diploma in Business Studies",
    faculty: "Commerce",
    duration: "3 years",
    baseAPS: 18,
    description: "Practical business skills and management principles.",
    careerProspects: [
      "Business Administrator",
      "Office Manager",
      "Sales Representative",
      "Customer Service Manager",
      "Small Business Owner",
    ],
    subjects: [
      { name: "Mathematics", level: 3, isRequired: true },
      { name: "English", level: 4, isRequired: true },
    ],
    allocation: { includeOnly: ["TUT", "DUT", "MUT", "VUT", "CPUT", "CUT"] },
  },
  {
    name: "National Diploma in Hospitality Management",
    faculty: "Commerce",
    duration: "3 years",
    baseAPS: 18,
    description: "Hotel and restaurant management skills.",
    careerProspects: [
      "Hotel Manager",
      "Restaurant Manager",
      "Event Coordinator",
      "Tourism Operator",
      "Hospitality Supervisor",
    ],
    subjects: [{ name: "English", level: 4, isRequired: true }],
    allocation: { includeOnly: ["TUT", "DUT", "MUT", "VUT", "CPUT"] },
  },
  {
    name: "National Diploma in Tourism Management",
    faculty: "Commerce",
    duration: "3 years",
    baseAPS: 18,
    description: "Tourism industry operations and management.",
    careerProspects: [
      "Tourism Manager",
      "Travel Consultant",
      "Tour Guide",
      "Tourism Marketing Specialist",
      "Event Manager",
    ],
    subjects: [{ name: "English", level: 4, isRequired: true }],
    allocation: { includeOnly: ["TUT", "DUT", "MUT", "VUT", "CPUT"] },
  },
  {
    name: "National Diploma in Public Management",
    faculty: "Commerce",
    duration: "3 years",
    baseAPS: 20,
    description: "Public sector administration and government services.",
    careerProspects: [
      "Public Administrator",
      "Government Officer",
      "Municipal Officer",
      "Public Service Coordinator",
      "Community Liaison Officer",
    ],
    subjects: [{ name: "English", level: 4, isRequired: true }],
    allocation: { includeOnly: ["TUT", "DUT", "MUT", "VUT", "CPUT"] },
  },
  {
    name: "National Diploma in Graphic Design",
    faculty: "Humanities",
    duration: "3 years",
    baseAPS: 18,
    description: "Visual communication and graphic design skills.",
    careerProspects: [
      "Graphic Designer",
      "Visual Artist",
      "Desktop Publisher",
      "Advertising Designer",
      "Digital Artist",
    ],
    subjects: [{ name: "English", level: 4, isRequired: true }],
    allocation: { includeOnly: ["TUT", "DUT", "MUT", "VUT", "CPUT"] },
  },
  {
    name: "National Diploma in Environmental Health",
    faculty: "Health Sciences",
    duration: "3 years",
    baseAPS: 22,
    description:
      "Environmental health monitoring and public health protection.",
    careerProspects: [
      "Environmental Health Officer",
      "Public Health Inspector",
      "Health and Safety Officer",
      "Environmental Consultant",
      "Occupational Health Specialist",
    ],
    subjects: [
      { name: "Life Sciences", level: 4, isRequired: true },
      { name: "English", level: 4, isRequired: true },
    ],
    allocation: { includeOnly: ["TUT", "DUT", "MUT", "VUT", "CPUT"] },
  },
  {
    name: "National Diploma in Food Technology",
    faculty: "Agriculture",
    duration: "3 years",
    baseAPS: 22,
    description: "Food processing, quality control, and food safety.",
    careerProspects: [
      "Food Technologist",
      "Quality Control Officer",
      "Food Safety Inspector",
      "Production Supervisor",
      "Product Development Technician",
    ],
    subjects: [
      { name: "Mathematics", level: 4, isRequired: true },
      { name: "Physical Sciences", level: 4, isRequired: true },
      { name: "Life Sciences", level: 4, isRequired: true },
      { name: "English", level: 4, isRequired: true },
    ],
    allocation: { includeOnly: ["TUT", "DUT", "MUT", "VUT", "CPUT"] },
  },
];

/**
 * Apply allocation rules to determine which universities should have each course
 */
function getUniversitiesForCourse(
  allocation: CourseTemplate["allocation"],
): string[] {
  if (allocation === "all") {
    return ALL_UNIVERSITY_IDS;
  }

  if ("exclude" in allocation) {
    const excludedIds = allocation.exclude
      .map((abbrev) => UNIVERSITY_MAPPINGS[abbrev])
      .filter(Boolean);
    return ALL_UNIVERSITY_IDS.filter((id) => !excludedIds.includes(id));
  }

  if ("includeOnly" in allocation) {
    const includedIds = allocation.includeOnly
      .map((abbrev) => UNIVERSITY_MAPPINGS[abbrev])
      .filter(Boolean);
    return includedIds.filter((id) => ALL_UNIVERSITY_IDS.includes(id));
  }

  return ALL_UNIVERSITY_IDS;
}

/**
 * Generate APS score for specific university based on course and university characteristics
 */
function generateUniversityAPS(
  course: CourseTemplate,
  universityId: string,
): number {
  // Use university-specific APS if available
  if (
    course.universitySpecificAPS &&
    course.universitySpecificAPS[universityId]
  ) {
    return course.universitySpecificAPS[universityId];
  }

  // Otherwise adjust base APS based on university prestige
  const prestigeAdjustments: Record<string, number> = {
    uct: 3,
    wits: 3,
    stellenbosch: 2,
    up: 2,
    ukzn: 1,
    ufs: 1,
    ru: 0,
    nwu: 0,
    uj: 0,
    tut: -2,
    dut: -2,
    mut: -3,
    vut: -3,
    cput: -2,
    cut: -3,
  };

  const adjustment = prestigeAdjustments[universityId] || 0;
  return Math.max(20, Math.min(42, course.baseAPS + adjustment));
}

/**
 * Convert course template to degree object for specific university
 */
function createDegreeFromCourse(
  course: CourseTemplate,
  universityId: string,
): Degree {
  return {
    id: `${course.name.toLowerCase().replace(/\s+/g, "-").replace(/[()]/g, "")}-${universityId}`,
    name: course.name,
    faculty: course.faculty,
    duration: course.duration,
    apsRequirement: generateUniversityAPS(course, universityId),
    description: course.description,
    subjects: course.subjects,
    careerProspects: course.careerProspects,
  };
}

/**
 * Assign all courses to universities based on allocation rules
 */
export function assignAllCoursesToUniversities(
  universities: University[],
): University[] {
  return universities.map((university) => {
    // Group courses by faculty
    const facultyCoursesMap = new Map<string, Degree[]>();

    // Process each course template
    COMPREHENSIVE_COURSES.forEach((course) => {
      const applicableUniversities = getUniversitiesForCourse(
        course.allocation,
      );

      if (applicableUniversities.includes(university.id)) {
        const degree = createDegreeFromCourse(course, university.id);

        if (!facultyCoursesMap.has(course.faculty)) {
          facultyCoursesMap.set(course.faculty, []);
        }
        facultyCoursesMap.get(course.faculty)!.push(degree);
      }
    });

    // Create or update faculties
    const updatedFaculties: Faculty[] = [];
    const existingFaculties = new Map(
      university.faculties.map((f) => [f.name, f]),
    );

    // Add existing faculties with new courses
    university.faculties.forEach((faculty) => {
      const additionalCourses = facultyCoursesMap.get(faculty.name) || [];
      updatedFaculties.push({
        ...faculty,
        degrees: [...faculty.degrees, ...additionalCourses],
      });
      facultyCoursesMap.delete(faculty.name);
    });

    // Add new faculties for remaining courses
    facultyCoursesMap.forEach((courses, facultyName) => {
      if (courses.length > 0) {
        updatedFaculties.push({
          id: facultyName.toLowerCase().replace(/\s+/g, "-"),
          name: facultyName,
          description: getFacultyDescription(facultyName),
          degrees: courses,
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
 * Get description for faculty
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
    "Built Environment":
      "Architecture, urban planning, and built environment programs.",
  };

  return (
    descriptions[facultyName] ||
    "Academic programs and courses offered by this faculty."
  );
}

/**
 * Get all courses available at a specific university
 */
export function getCoursesForUniversity(
  universityId: string,
): CourseTemplate[] {
  return COMPREHENSIVE_COURSES.filter((course) => {
    const applicableUniversities = getUniversitiesForCourse(course.allocation);
    return applicableUniversities.includes(universityId);
  });
}

/**
 * Get course allocation statistics
 */
export function getCourseAllocationStats() {
  const stats = {
    totalCourses: COMPREHENSIVE_COURSES.length,
    allUniversityCourses: 0,
    excludedCourses: 0,
    includeOnlyCourses: 0,
    universityCounts: {} as Record<string, number>,
  };

  COMPREHENSIVE_COURSES.forEach((course) => {
    const universities = getUniversitiesForCourse(course.allocation);

    if (course.allocation === "all") {
      stats.allUniversityCourses++;
    } else if ("exclude" in course.allocation) {
      stats.excludedCourses++;
    } else if ("includeOnly" in course.allocation) {
      stats.includeOnlyCourses++;
    }

    universities.forEach((univId) => {
      stats.universityCounts[univId] =
        (stats.universityCounts[univId] || 0) + 1;
    });
  });

  return stats;
}

export { COMPREHENSIVE_COURSES, UNIVERSITY_MAPPINGS };
