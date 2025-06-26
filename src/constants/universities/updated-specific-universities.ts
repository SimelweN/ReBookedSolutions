import { Faculty, Degree } from "@/types/university";

/**
 * UPDATED SPECIFIC UNIVERSITY DATA - CLEARED FOR MANUAL ENTRY
 *
 * All faculty and program data has been removed. Universities will be populated
 * manually with accurate faculty and program information.
 */

// Helper function to create degree IDs
function createDegreeId(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .replace(/\s+/g, "-")
    .substring(0, 50);
}

// Helper function to create faculty ID
function createFacultyId(name: string): string {
  return name
    .toLowerCase()
    .replace(/faculty\s+of\s+/gi, "")
    .replace(/[^a-zA-Z0-9\s]/g, "")
    .replace(/\s+/g, "-");
}

// University of Limpopo (UL) - Updated Data
export const UL_FACULTIES: Faculty[] = [
  {
    id: createFacultyId("Faculty of Humanities"),
    name: "Faculty of Humanities",
    description:
      "Humanities programs focusing on education, social sciences, and communication studies",
    degrees: [
      {
        id: createDegreeId("Bachelor of Education BEd"),
        name: "Bachelor of Education (BEd)",
        faculty: "Humanities",
        duration: "4 years",
        apsRequirement: 24,
        description: "Professional teacher education program",
        subjects: [
          { name: "English", level: 5, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Teacher",
          "Education Specialist",
          "Curriculum Developer",
        ],
      },
      {
        id: createDegreeId("Bachelor of Arts Criminology Psychology"),
        name: "Bachelor of Arts (Criminology & Psychology Stream)",
        faculty: "Humanities",
        duration: "3 years",
        apsRequirement: 25,
        description: "Interdisciplinary study of criminology and psychology",
        subjects: [
          { name: "English", level: 5, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Criminologist",
          "Psychologist",
          "Social Worker",
          "Police Officer",
        ],
      },
      {
        id: createDegreeId("Bachelor of Arts Sociology Anthropology"),
        name: "Bachelor of Arts (Sociology & Anthropology Stream)",
        faculty: "Humanities",
        duration: "3 years",
        apsRequirement: 25,
        description: "Study of society, culture, and human behavior",
        subjects: [
          { name: "English", level: 5, isRequired: true },
          { name: "History", level: 4, isRequired: false },
        ],
        careerProspects: [
          "Sociologist",
          "Anthropologist",
          "Social Researcher",
          "Community Development Worker",
        ],
      },
      {
        id: createDegreeId("Bachelor of Arts Political Studies"),
        name: "Bachelor of Arts (Political Studies Stream)",
        faculty: "Humanities",
        duration: "3 years",
        apsRequirement: 25,
        description: "Study of political systems and governance",
        subjects: [
          { name: "English", level: 5, isRequired: true },
          { name: "History", level: 4, isRequired: false },
        ],
        careerProspects: [
          "Political Analyst",
          "Government Official",
          "Policy Researcher",
        ],
      },
      {
        id: createDegreeId("Bachelor of Psychology"),
        name: "Bachelor of Psychology",
        faculty: "Humanities",
        duration: "3 years",
        apsRequirement: 25,
        description: "Comprehensive psychology program",
        subjects: [
          { name: "English", level: 5, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
        ],
        careerProspects: ["Psychologist", "Counselor", "Research Psychologist"],
      },
      {
        id: createDegreeId("Bachelor of Arts Criminology Psychology ECP"),
        name: "Bachelor of Arts (Criminology & Psychology Stream) - Extended Curriculum Programme",
        faculty: "Humanities",
        duration: "4 years",
        apsRequirement: 24,
        description:
          "Extended programme for criminology and psychology studies",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 3, isRequired: true },
        ],
        careerProspects: ["Criminologist", "Psychologist", "Social Worker"],
      },
      {
        id: createDegreeId("Bachelor of Social Work"),
        name: "Bachelor of Social Work",
        faculty: "Humanities",
        duration: "4 years",
        apsRequirement: 25,
        description: "Professional social work training",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 3, isRequired: true },
        ],
        careerProspects: [
          "Social Worker",
          "Community Developer",
          "Child Protection Officer",
        ],
      },
      {
        id: createDegreeId("Bachelor of Arts Languages"),
        name: "Bachelor of Arts (Languages Stream)",
        faculty: "Humanities",
        duration: "3 years",
        apsRequirement: 25,
        description: "Language studies and linguistics",
        subjects: [
          { name: "English", level: 5, isRequired: true },
          { name: "Additional Language", level: 4, isRequired: true },
        ],
        careerProspects: ["Translator", "Language Teacher", "Linguist"],
      },
      {
        id: createDegreeId("Bachelor of Arts Translation Linguistics"),
        name: "Bachelor of Arts (Translation and Linguistics)",
        faculty: "Humanities",
        duration: "3 years",
        apsRequirement: 25,
        description: "Translation and linguistic studies",
        subjects: [
          { name: "English", level: 5, isRequired: true },
          { name: "Additional Language", level: 4, isRequired: true },
        ],
        careerProspects: ["Translator", "Interpreter", "Language Specialist"],
      },
      {
        id: createDegreeId("Bachelor of Information Studies"),
        name: "Bachelor of Information Studies",
        faculty: "Humanities",
        duration: "3 years",
        apsRequirement: 25,
        description: "Information management and library science",
        subjects: [
          { name: "English", level: 5, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Librarian",
          "Information Manager",
          "Knowledge Manager",
        ],
      },
      {
        id: createDegreeId("Bachelor of Arts Contemporary English"),
        name: "Bachelor of Arts in Contemporary English and Multilingual Studies",
        faculty: "Humanities",
        duration: "3 years",
        apsRequirement: 25,
        description: "Contemporary English and multilingual studies",
        subjects: [
          { name: "English", level: 6, isRequired: true },
          { name: "Additional Language", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Language Teacher",
          "Writer",
          "Communications Specialist",
        ],
      },
      {
        id: createDegreeId("Bachelor of Arts Communication Studies"),
        name: "Bachelor of Arts in Communication Studies",
        faculty: "Humanities",
        duration: "3 years",
        apsRequirement: 25,
        description: "Communication theory and practice",
        subjects: [{ name: "English", level: 5, isRequired: true }],
        careerProspects: [
          "Communications Officer",
          "Public Relations Specialist",
          "Media Coordinator",
        ],
      },
      {
        id: createDegreeId("Bachelor of Arts Media Studies"),
        name: "Bachelor of Arts in Media Studies",
        faculty: "Humanities",
        duration: "3 years",
        apsRequirement: 25,
        description: "Media studies and journalism",
        subjects: [{ name: "English", level: 5, isRequired: true }],
        careerProspects: ["Journalist", "Media Producer", "Content Creator"],
      },
      {
        id: createDegreeId("Bachelor of Arts Media Studies ECP"),
        name: "Bachelor of Arts in Media Studies - Extended Curriculum Programme",
        faculty: "Humanities",
        duration: "4 years",
        apsRequirement: 23,
        description: "Extended programme for media studies",
        subjects: [{ name: "English", level: 4, isRequired: true }],
        careerProspects: ["Journalist", "Media Producer", "Content Creator"],
      },
    ],
  },
  {
    id: createFacultyId("Faculty of Management and Law"),
    name: "Faculty of Management and Law",
    description: "Business management, commerce, and legal studies",
    degrees: [
      {
        id: createDegreeId("Bachelor of Accountancy"),
        name: "Bachelor of Accountancy",
        faculty: "Management and Law",
        duration: "3 years",
        apsRequirement: 30,
        description: "Professional accounting education",
        subjects: [
          { name: "Mathematics", level: 5, isRequired: true },
          { name: "English", level: 5, isRequired: true },
        ],
        careerProspects: ["Accountant", "Financial Manager", "Auditor"],
      },
      {
        id: createDegreeId("Bachelor of Commerce Accountancy"),
        name: "Bachelor of Commerce in Accountancy",
        faculty: "Management and Law",
        duration: "3 years",
        apsRequirement: 28,
        description: "Commerce with accounting specialization",
        subjects: [
          { name: "Mathematics", level: 5, isRequired: true },
          { name: "English", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Accountant",
          "Financial Analyst",
          "Business Advisor",
        ],
      },
      {
        id: createDegreeId("Bachelor of Commerce Accountancy ECP"),
        name: "Bachelor of Commerce in Accountancy - Extended Curriculum Programme",
        faculty: "Management and Law",
        duration: "4 years",
        apsRequirement: 26,
        description: "Extended programme for commerce in accountancy",
        subjects: [
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "English", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Accountant",
          "Financial Analyst",
          "Business Advisor",
        ],
      },
      {
        id: createDegreeId("Bachelor of Commerce Human Resources"),
        name: "Bachelor of Commerce in Human Resources Management",
        faculty: "Management and Law",
        duration: "3 years",
        apsRequirement: 26,
        description: "Human resources management",
        subjects: [
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "English", level: 4, isRequired: true },
        ],
        careerProspects: [
          "HR Manager",
          "Recruitment Specialist",
          "Training Coordinator",
        ],
      },
      {
        id: createDegreeId("Bachelor of Commerce Business Management"),
        name: "Bachelor of Commerce in Business Management",
        faculty: "Management and Law",
        duration: "3 years",
        apsRequirement: 26,
        description: "General business management",
        subjects: [
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "English", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Business Manager",
          "Operations Manager",
          "Project Manager",
        ],
      },
      {
        id: createDegreeId("Bachelor of Commerce Business Management ECP"),
        name: "Bachelor of Commerce in Business Management - Extended Curriculum Programme",
        faculty: "Management and Law",
        duration: "4 years",
        apsRequirement: 22,
        description: "Extended programme for business management",
        subjects: [
          { name: "Mathematics", level: 3, isRequired: true },
          { name: "English", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Business Manager",
          "Operations Manager",
          "Project Manager",
        ],
      },
      {
        id: createDegreeId("Bachelor of Commerce Economics"),
        name: "Bachelor of Commerce in Economics",
        faculty: "Management and Law",
        duration: "3 years",
        apsRequirement: 26,
        description: "Economic theory and analysis",
        subjects: [
          { name: "Mathematics", level: 5, isRequired: true },
          { name: "English", level: 4, isRequired: true },
        ],
        careerProspects: ["Economist", "Policy Analyst", "Financial Analyst"],
      },
      {
        id: createDegreeId("Bachelor of Commerce Economics ECP"),
        name: "Bachelor of Commerce in Economics - Extended Curriculum Programme",
        faculty: "Management and Law",
        duration: "4 years",
        apsRequirement: 22,
        description: "Extended programme for economics",
        subjects: [
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "English", level: 4, isRequired: true },
        ],
        careerProspects: ["Economist", "Policy Analyst", "Financial Analyst"],
      },
      {
        id: createDegreeId("Bachelor of Administration"),
        name: "Bachelor of Administration",
        faculty: "Management and Law",
        duration: "3 years",
        apsRequirement: 26,
        description: "Public administration and management",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 3, isRequired: true },
        ],
        careerProspects: [
          "Administrator",
          "Government Official",
          "Public Servant",
        ],
      },
      {
        id: createDegreeId("Bachelor of Administration Local Government"),
        name: "Bachelor of Administration in Local Government",
        faculty: "Management and Law",
        duration: "3 years",
        apsRequirement: 26,
        description: "Local government administration",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 3, isRequired: true },
        ],
        careerProspects: [
          "Municipal Administrator",
          "Local Government Official",
          "Community Developer",
        ],
      },
      {
        id: createDegreeId("Bachelor of Development Planning Management"),
        name: "Bachelor of Development in Planning and Management",
        faculty: "Management and Law",
        duration: "3 years",
        apsRequirement: 26,
        description: "Development planning and management",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 3, isRequired: true },
        ],
        careerProspects: [
          "Development Planner",
          "Project Manager",
          "Policy Analyst",
        ],
      },
      {
        id: createDegreeId("Bachelor of Laws LLB"),
        name: "Bachelor of Laws (LLB)",
        faculty: "Management and Law",
        duration: "4 years",
        apsRequirement: 30,
        description: "Comprehensive legal education",
        subjects: [
          { name: "English", level: 5, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
        ],
        careerProspects: ["Attorney", "Advocate", "Legal Advisor"],
      },
      {
        id: createDegreeId("Bachelor of Laws LLB ECP"),
        name: "Bachelor of Laws (LLB) - Extended Curriculum Programme",
        faculty: "Management and Law",
        duration: "5 years",
        apsRequirement: 26,
        description: "Extended programme for legal studies",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 3, isRequired: true },
        ],
        careerProspects: ["Attorney", "Advocate", "Legal Advisor"],
      },
    ],
  },
  {
    id: createFacultyId("Faculty of Science and Agriculture"),
    name: "Faculty of Science and Agriculture",
    description:
      "Natural sciences, agricultural sciences, and environmental studies",
    degrees: [
      {
        id: createDegreeId("Bachelor of Agricultural Management"),
        name: "Bachelor of Agricultural Management",
        faculty: "Science and Agriculture",
        duration: "4 years",
        apsRequirement: 24,
        description: "Agricultural management and business",
        subjects: [
          { name: "Life Sciences", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "English", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Agricultural Manager",
          "Farm Manager",
          "Agricultural Consultant",
        ],
      },
      {
        id: createDegreeId("Bachelor of Science Agriculture Economics"),
        name: "Bachelor of Science in Agriculture in Agricultural Economics",
        faculty: "Science and Agriculture",
        duration: "4 years",
        apsRequirement: 24,
        description: "Agricultural economics and business",
        subjects: [
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Life Sciences", level: 4, isRequired: true },
          { name: "English", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Agricultural Economist",
          "Policy Analyst",
          "Market Researcher",
        ],
      },
      {
        id: createDegreeId("Bachelor of Science Agriculture Plant Production"),
        name: "Bachelor of Science in Agriculture in Plant Production",
        faculty: "Science and Agriculture",
        duration: "4 years",
        apsRequirement: 24,
        description: "Plant production and crop science",
        subjects: [
          { name: "Life Sciences", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "English", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Plant Scientist",
          "Crop Manager",
          "Agricultural Technician",
        ],
      },
      {
        id: createDegreeId("Bachelor of Science Agriculture Animal Production"),
        name: "Bachelor of Science in Agriculture in Animal Production",
        faculty: "Science and Agriculture",
        duration: "4 years",
        apsRequirement: 24,
        description: "Animal production and livestock management",
        subjects: [
          { name: "Life Sciences", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "English", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Animal Scientist",
          "Livestock Manager",
          "Veterinary Technician",
        ],
      },
      {
        id: createDegreeId("Bachelor of Science Agriculture Soil Science"),
        name: "Bachelor of Science in Agriculture in Soil Science",
        faculty: "Science and Agriculture",
        duration: "4 years",
        apsRequirement: 25,
        description: "Soil science and management",
        subjects: [
          { name: "Life Sciences", level: 4, isRequired: true },
          { name: "Physical Sciences", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "English", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Soil Scientist",
          "Environmental Consultant",
          "Agricultural Advisor",
        ],
      },
      {
        id: createDegreeId(
          "Bachelor of Science Environmental Resource Studies",
        ),
        name: "Bachelor of Science in Environmental & Resource Studies",
        faculty: "Science and Agriculture",
        duration: "3 years",
        apsRequirement: 24,
        description: "Environmental science and resource management",
        subjects: [
          { name: "Life Sciences", level: 4, isRequired: true },
          { name: "Geography", level: 4, isRequired: true },
          { name: "English", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Environmental Scientist",
          "Conservation Officer",
          "Resource Manager",
        ],
      },
      {
        id: createDegreeId("Bachelor of Science Water Sanitation"),
        name: "Bachelor of Science in Water & Sanitation Sciences",
        faculty: "Science and Agriculture",
        duration: "3 years",
        apsRequirement: 24,
        description: "Water and sanitation management",
        subjects: [
          { name: "Physical Sciences", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "English", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Water Engineer",
          "Sanitation Specialist",
          "Environmental Health Officer",
        ],
      },
      {
        id: createDegreeId("Bachelor of Science Mathematical Sciences"),
        name: "Bachelor of Science (Mathematical Sciences Stream)",
        faculty: "Science and Agriculture",
        duration: "3 years",
        apsRequirement: 24,
        description: "Pure and applied mathematics",
        subjects: [
          { name: "Mathematics", level: 6, isRequired: true },
          { name: "English", level: 4, isRequired: true },
        ],
        careerProspects: ["Mathematician", "Statistician", "Data Analyst"],
      },
      {
        id: createDegreeId("Bachelor of Science Mathematical Sciences ECP"),
        name: "Bachelor of Science (Mathematical Sciences Stream) - Extended Curriculum Programme",
        faculty: "Science and Agriculture",
        duration: "4 years",
        apsRequirement: 22,
        description: "Extended programme for mathematical sciences",
        subjects: [
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "English", level: 4, isRequired: true },
        ],
        careerProspects: ["Mathematician", "Statistician", "Data Analyst"],
      },
      {
        id: createDegreeId("Bachelor of Science Life Sciences"),
        name: "Bachelor of Science (Life Sciences Stream)",
        faculty: "Science and Agriculture",
        duration: "3 years",
        apsRequirement: 24,
        description: "Biological and life sciences",
        subjects: [
          { name: "Life Sciences", level: 5, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "English", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Biologist",
          "Research Scientist",
          "Laboratory Technician",
        ],
      },
      {
        id: createDegreeId("Bachelor of Science Life Sciences ECP"),
        name: "Bachelor of Science (Life Sciences Stream) - Extended Curriculum Programme",
        faculty: "Science and Agriculture",
        duration: "4 years",
        apsRequirement: 22,
        description: "Extended programme for life sciences",
        subjects: [
          { name: "Life Sciences", level: 4, isRequired: true },
          { name: "Mathematics", level: 3, isRequired: true },
          { name: "English", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Biologist",
          "Research Scientist",
          "Laboratory Technician",
        ],
      },
      {
        id: createDegreeId("Bachelor of Science Physical Sciences"),
        name: "Bachelor of Science (Physical Sciences Stream)",
        faculty: "Science and Agriculture",
        duration: "3 years",
        apsRequirement: 26,
        description: "Physics and chemistry studies",
        subjects: [
          { name: "Physical Sciences", level: 5, isRequired: true },
          { name: "Mathematics", level: 5, isRequired: true },
          { name: "English", level: 4, isRequired: true },
        ],
        careerProspects: ["Physicist", "Chemist", "Research Scientist"],
      },
      {
        id: createDegreeId("Bachelor of Science Physical Sciences ECP"),
        name: "Bachelor of Science (Physical Sciences Stream) - Extended Curriculum Programme",
        faculty: "Science and Agriculture",
        duration: "4 years",
        apsRequirement: 22,
        description: "Extended programme for physical sciences",
        subjects: [
          { name: "Physical Sciences", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "English", level: 4, isRequired: true },
        ],
        careerProspects: ["Physicist", "Chemist", "Research Scientist"],
      },
      {
        id: createDegreeId("Bachelor of Science Geology"),
        name: "Bachelor of Science in Geology",
        faculty: "Science and Agriculture",
        duration: "3 years",
        apsRequirement: 26,
        description: "Earth sciences and geology",
        subjects: [
          { name: "Physical Sciences", level: 5, isRequired: true },
          { name: "Mathematics", level: 5, isRequired: true },
          { name: "Geography", level: 4, isRequired: true },
          { name: "English", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Geologist",
          "Mining Geologist",
          "Environmental Geologist",
        ],
      },
    ],
  },
  {
    id: createFacultyId("Faculty of Health Sciences"),
    name: "Faculty of Health Sciences",
    description: "Medical and health sciences programs",
    degrees: [
      {
        id: createDegreeId("Bachelor of Medicine Bachelor Surgery"),
        name: "Bachelor of Medicine & Bachelor of Surgery",
        faculty: "Health Sciences",
        duration: "6 years",
        apsRequirement: 27,
        description: "Medical degree program",
        subjects: [
          { name: "Mathematics", level: 5, isRequired: true },
          { name: "Physical Sciences", level: 5, isRequired: true },
          { name: "Life Sciences", level: 5, isRequired: true },
          { name: "English", level: 5, isRequired: true },
        ],
        careerProspects: [
          "Medical Doctor",
          "Specialist Physician",
          "General Practitioner",
        ],
      },
      {
        id: createDegreeId("Bachelor of Science Medical Studies"),
        name: "Bachelor of Science in Medical Studies",
        faculty: "Health Sciences",
        duration: "3 years",
        apsRequirement: 26,
        description: "Pre-medical and medical sciences",
        subjects: [
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Physical Sciences", level: 5, isRequired: true },
          { name: "Life Sciences", level: 5, isRequired: true },
          { name: "English", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Medical Technologist",
          "Research Assistant",
          "Health Educator",
        ],
      },
      {
        id: createDegreeId("Bachelor of Science Dietetics"),
        name: "Bachelor of Science in Dietetics",
        faculty: "Health Sciences",
        duration: "4 years",
        apsRequirement: 26,
        description: "Nutrition and dietetics",
        subjects: [
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Life Sciences", level: 5, isRequired: true },
          { name: "Physical Sciences", level: 4, isRequired: true },
          { name: "English", level: 4, isRequired: true },
        ],
        careerProspects: ["Dietitian", "Nutritionist", "Health Consultant"],
      },
      {
        id: createDegreeId("Bachelor of Optometry"),
        name: "Bachelor of Optometry",
        faculty: "Health Sciences",
        duration: "4 years",
        apsRequirement: 27,
        description: "Eye care and vision science",
        subjects: [
          { name: "Mathematics", level: 5, isRequired: true },
          { name: "Physical Sciences", level: 5, isRequired: true },
          { name: "Life Sciences", level: 5, isRequired: true },
          { name: "English", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Optometrist",
          "Vision Therapist",
          "Eye Care Specialist",
        ],
      },
      {
        id: createDegreeId("Bachelor of Nursing"),
        name: "Bachelor of Nursing",
        faculty: "Health Sciences",
        duration: "4 years",
        apsRequirement: 26,
        description: "Professional nursing education",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Life Sciences", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Professional Nurse",
          "Clinical Nurse",
          "Community Health Nurse",
        ],
      },
      {
        id: createDegreeId("Bachelor of Pharmacy"),
        name: "Bachelor of Pharmacy",
        faculty: "Health Sciences",
        duration: "4 years",
        apsRequirement: 27,
        description: "Pharmaceutical sciences",
        subjects: [
          { name: "Mathematics", level: 5, isRequired: true },
          { name: "Physical Sciences", level: 5, isRequired: true },
          { name: "Life Sciences", level: 5, isRequired: true },
          { name: "English", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Pharmacist",
          "Clinical Pharmacist",
          "Pharmaceutical Researcher",
        ],
      },
    ],
  },
];
export const NWU_FACULTIES: Faculty[] = [];
export const WSU_FACULTIES: Faculty[] = [];
export const UNIZULU_FACULTIES: Faculty[] = [];
export const SPU_FACULTIES: Faculty[] = [];
export const UMP_FACULTIES: Faculty[] = [];
export const CPUT_FACULTIES: Faculty[] = [];
export const CUT_FACULTIES: Faculty[] = [];
export const DUT_FACULTIES: Faculty[] = [];
export const MUT_FACULTIES: Faculty[] = [];
export const TUT_FACULTIES: Faculty[] = [];
export const VUT_FACULTIES: Faculty[] = [];

// Function to get updated university faculties
export function getUpdatedUniversityFaculties(
  universityId: string,
): Faculty[] | null {
  switch (universityId) {
    case "ul":
      return UL_FACULTIES;
    case "nwu":
      return NWU_FACULTIES;
    case "wsu":
      return WSU_FACULTIES;
    case "unizulu":
      return UNIZULU_FACULTIES;
    case "spu":
      return SPU_FACULTIES;
    case "ump":
      return UMP_FACULTIES;
    case "cput":
      return CPUT_FACULTIES;
    case "cut":
      return CUT_FACULTIES;
    case "dut":
      return DUT_FACULTIES;
    case "mut":
      return MUT_FACULTIES;
    case "tut":
      return TUT_FACULTIES;
    case "vut":
      return VUT_FACULTIES;
    default:
      return null;
  }
}

// Faculty arrays are already exported above as individual const declarations

// List of universities that have been updated with specific data
export const UPDATED_UNIVERSITIES = [
  "ul", // University of Limpopo
  "nwu", // North-West University
  "wsu", // Walter Sisulu University
  "unizulu", // University of Zululand
  "spu", // Sol Plaatje University
  "ump", // University of Mpumalanga
  "cput", // Cape Peninsula University of Technology
  "cut", // Central University of Technology
  "dut", // Durban University of Technology
  "mut", // Mangosuthu University of Technology
  "tut", // Tshwane University of Technology
  "vut", // Vaal University of Technology
];
