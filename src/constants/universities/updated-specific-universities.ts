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
  {
    id: createFacultyId("Faculty of Humanities"),
    name: "Faculty of Humanities",
    description: "Liberal arts, languages, and social sciences",
    degrees: [
      {
        id: createDegreeId(
          "Bachelor Arts Public Governance Public Administration",
        ),
        name: "Bachelor of Arts (BA) in Public Governance (with Public Administration, Politics and Public Administration, Social Studies, Geography, Labour Relations Management)",
        faculty: "Humanities",
        duration: "3 years",
        apsRequirement: 25,
        description: "Public governance with multiple specializations",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "History", level: 4, isRequired: false },
        ],
        careerProspects: [
          "Public Administrator",
          "Government Official",
          "Policy Analyst",
        ],
      },
      {
        id: createDegreeId(
          "Bachelor Arts Public Governance Municipal Management",
        ),
        name: "Bachelor of Arts (BA) in Public Governance (with Municipal Management and Leadership)",
        faculty: "Humanities",
        duration: "3 years",
        apsRequirement: 25,
        description: "Public governance with municipal management focus",
        subjects: [{ name: "English", level: 4, isRequired: true }],
        careerProspects: [
          "Municipal Manager",
          "Local Government Leader",
          "Public Administrator",
        ],
      },
      {
        id: createDegreeId("Bachelor Arts Public Governance Policing Practice"),
        name: "Bachelor of Arts (BA) in Public Governance (with Policing Practice)",
        faculty: "Humanities",
        duration: "3 years",
        apsRequirement: 25,
        description: "Public governance with policing focus",
        subjects: [{ name: "English", level: 4, isRequired: true }],
        careerProspects: [
          "Police Officer",
          "Law Enforcement Manager",
          "Security Specialist",
        ],
      },
      {
        id: createDegreeId(
          "Bachelor Social Sciences Political Studies International Relations",
        ),
        name: "Bachelor of Social Sciences (BSocSc) (with Political Studies and International Relations)",
        faculty: "Humanities",
        duration: "3 years",
        apsRequirement: 24,
        description: "Social sciences with political studies focus",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "History", level: 4, isRequired: false },
        ],
        careerProspects: [
          "Political Analyst",
          "Diplomat",
          "International Relations Specialist",
        ],
      },
      {
        id: createDegreeId(
          "Bachelor Administration Development Management Local Government",
        ),
        name: "Bachelor of Administration in Development and Management (with Local Government Management)",
        faculty: "Humanities",
        duration: "3 years",
        apsRequirement: 21,
        description: "Development administration with local government focus",
        subjects: [{ name: "English", level: 4, isRequired: true }],
        careerProspects: [
          "Development Administrator",
          "Local Government Manager",
          "Community Developer",
        ],
      },
      {
        id: createDegreeId(
          "Extended Bachelor Administration Development Management",
        ),
        name: "Extended Bachelor of Administration in Development and Management (with Local Government Management)",
        faculty: "Humanities",
        duration: "4 years",
        apsRequirement: 20,
        description: "Extended programme for development administration",
        subjects: [{ name: "English", level: 4, isRequired: true }],
        careerProspects: [
          "Development Administrator",
          "Local Government Manager",
          "Community Developer",
        ],
      },
      {
        id: createDegreeId("Bachelor Arts Communication"),
        name: "Bachelor of Arts (BA) in Communication",
        faculty: "Humanities",
        duration: "3 years",
        apsRequirement: 24,
        description: "Communication studies and media",
        subjects: [{ name: "English", level: 5, isRequired: true }],
        careerProspects: [
          "Communications Specialist",
          "Media Producer",
          "Public Relations Officer",
        ],
      },
      {
        id: createDegreeId("Bachelor Arts Graphic Design"),
        name: "Bachelor of Arts (BA) in Graphic Design",
        faculty: "Humanities",
        duration: "3 years",
        apsRequirement: 24,
        description: "Visual communication and graphic design",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Visual Arts", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Graphic Designer",
          "Visual Designer",
          "Creative Director",
        ],
      },
      {
        id: createDegreeId("Bachelor Arts Graphic Design Communication"),
        name: "Bachelor of Arts (BA) in Graphic Design (with Communication)",
        faculty: "Humanities",
        duration: "3 years",
        apsRequirement: 24,
        description: "Graphic design with communication focus",
        subjects: [
          { name: "English", level: 5, isRequired: true },
          { name: "Visual Arts", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Communication Designer",
          "Visual Communications Specialist",
          "Brand Designer",
        ],
      },
      {
        id: createDegreeId("Bachelor Arts Language Literary Studies"),
        name: "Bachelor of Arts (BA) in Language and Literary Studies",
        faculty: "Humanities",
        duration: "3 years",
        apsRequirement: 24,
        description: "Language studies and literature",
        subjects: [
          { name: "English", level: 5, isRequired: true },
          { name: "Additional Language", level: 4, isRequired: true },
        ],
        careerProspects: ["Language Teacher", "Writer", "Literary Analyst"],
      },
      {
        id: createDegreeId("Bachelor Arts Language Technology"),
        name: "Bachelor of Arts (BA) in Language Technology",
        faculty: "Humanities",
        duration: "3 years",
        apsRequirement: 24,
        description: "Language technology and computational linguistics",
        subjects: [
          { name: "English", level: 5, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Language Technologist",
          "Computational Linguist",
          "Translation Technology Specialist",
        ],
      },
      {
        id: createDegreeId("Diploma Music"),
        name: "Diploma in Music (DM)",
        faculty: "Humanities",
        duration: "3 years",
        apsRequirement: 18,
        description: "Music theory and performance",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Music", level: 4, isRequired: true },
        ],
        careerProspects: ["Musician", "Music Teacher", "Music Therapist"],
      },
      {
        id: createDegreeId("Bachelor Arts Music Society"),
        name: "Bachelor of Arts (BA) in Music and Society",
        faculty: "Humanities",
        duration: "3 years",
        apsRequirement: 21,
        description: "Music studies with social context",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Music", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Music Educator",
          "Music Therapist",
          "Cultural Music Specialist",
        ],
      },
      {
        id: createDegreeId("Bachelor Music"),
        name: "Baccalaureus Musicae (BMus)",
        faculty: "Humanities",
        duration: "3 years",
        apsRequirement: 24,
        description: "Professional music degree",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Music", level: 5, isRequired: true },
        ],
        careerProspects: [
          "Professional Musician",
          "Music Director",
          "Composer",
        ],
      },
      {
        id: createDegreeId("Bachelor Philosophy"),
        name: "Bachelor of Philosophy (BPhil) (with Philosophy, Politics and Economics)",
        faculty: "Humanities",
        duration: "3 years",
        apsRequirement: 26,
        description: "Philosophy with politics and economics",
        subjects: [
          { name: "English", level: 5, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
        ],
        careerProspects: ["Philosopher", "Policy Analyst", "Ethics Consultant"],
      },
      {
        id: createDegreeId("Bachelor Arts Humanities Multiple Languages"),
        name: "Bachelor of Arts (BA) Humanities (with Afrikaans and Dutch, English, Setswana, Sesotho)",
        faculty: "Humanities",
        duration: "3 years",
        apsRequirement: 24,
        description: "Humanities with language specializations",
        subjects: [
          { name: "English", level: 5, isRequired: true },
          { name: "Additional Language", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Language Teacher",
          "Translator",
          "Cultural Specialist",
        ],
      },
      {
        id: createDegreeId("Bachelor Arts Humanities Multiple Specializations"),
        name: "Bachelor of Arts (BA) Humanities (with multiple specializations in Social Sciences, Psychology, History, Geography, etc.)",
        faculty: "Humanities",
        duration: "3 years",
        apsRequirement: 24,
        description: "Humanities with various specialization options",
        subjects: [{ name: "English", level: 4, isRequired: true }],
        careerProspects: [
          "Humanities Scholar",
          "Research Analyst",
          "Cultural Specialist",
        ],
      },
      {
        id: createDegreeId("Bachelor Social Sciences Multiple Specializations"),
        name: "Bachelor of Social Sciences (BSocSc) (with Development Studies, Geography, History, Population Studies, Psychology, Social Anthropology, Sociology)",
        faculty: "Humanities",
        duration: "3 years",
        apsRequirement: 22,
        description: "Social sciences with multiple specialization options",
        subjects: [{ name: "English", level: 4, isRequired: true }],
        careerProspects: [
          "Social Scientist",
          "Research Analyst",
          "Community Developer",
        ],
      },
      {
        id: createDegreeId("Bachelor Social Sciences Economics"),
        name: "Bachelor of Social Sciences (BSocSc) (with Economics)",
        faculty: "Humanities",
        duration: "3 years",
        apsRequirement: 22,
        description: "Social sciences with economics focus",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Social Economist",
          "Policy Researcher",
          "Development Economist",
        ],
      },
      {
        id: createDegreeId(
          "Bachelor Arts Sociology Geography Labour Relations",
        ),
        name: "Bachelor of Arts (BA) (with Sociology and Geography, with Sociology and Labour Relations Management)",
        faculty: "Humanities",
        duration: "3 years",
        apsRequirement: 22,
        description: "Arts with sociology and specialized combinations",
        subjects: [{ name: "English", level: 4, isRequired: true }],
        careerProspects: [
          "Sociologist",
          "Labour Relations Specialist",
          "Geographic Analyst",
        ],
      },
      {
        id: createDegreeId(
          "Bachelor Arts Behavioural Sciences Sociology Psychology",
        ),
        name: "Bachelor of Arts (BA) in Behavioural Sciences (with Sociology and Psychology)",
        faculty: "Humanities",
        duration: "3 years",
        apsRequirement: 22,
        description: "Behavioural sciences with sociology and psychology",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 3, isRequired: true },
        ],
        careerProspects: [
          "Behavioural Scientist",
          "Social Psychologist",
          "Research Analyst",
        ],
      },
    ],
  },
  {
    id: createFacultyId("Faculty of Law"),
    name: "Faculty of Law",
    description: "Legal education and jurisprudence",
    degrees: [
      {
        id: createDegreeId(
          "Bachelor Arts Law Psychology Politics Industrial Psychology",
        ),
        name: "Bachelor of Arts in Law (BA in Law) (with Psychology, with Politics, with Industrial Psychology)",
        faculty: "Law",
        duration: "3 years",
        apsRequirement: 28,
        description: "Arts in law with various specializations",
        subjects: [
          { name: "English", level: 5, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
        ],
        careerProspects: ["Legal Assistant", "Paralegal", "Legal Researcher"],
      },
      {
        id: createDegreeId("Bachelor Commerce Law"),
        name: "Bachelor of Commerce in Law (BCom in Law)",
        faculty: "Law",
        duration: "3 years",
        apsRequirement: 30,
        description: "Commerce with legal studies",
        subjects: [
          { name: "English", level: 5, isRequired: true },
          { name: "Mathematics", level: 5, isRequired: true },
        ],
        careerProspects: [
          "Business Legal Advisor",
          "Corporate Paralegal",
          "Legal Consultant",
        ],
      },
      {
        id: createDegreeId("Bachelor Laws LLB"),
        name: "Bachelor of Laws (LLB)",
        faculty: "Law",
        duration: "4 years",
        apsRequirement: 30,
        description: "Professional law degree",
        subjects: [
          { name: "English", level: 6, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
        ],
        careerProspects: ["Attorney", "Advocate", "Legal Advisor"],
      },
      {
        id: createDegreeId("Extended Bachelor Laws LLB"),
        name: "Extended Bachelor of Laws (LLB)",
        faculty: "Law",
        duration: "5 years",
        apsRequirement: 28,
        description: "Extended programme for law studies",
        subjects: [
          { name: "English", level: 5, isRequired: true },
          { name: "Mathematics", level: 3, isRequired: true },
        ],
        careerProspects: ["Attorney", "Advocate", "Legal Advisor"],
      },
    ],
  },
  {
    id: createFacultyId("Faculty of Natural and Agricultural Sciences"),
    name: "Faculty of Natural and Agricultural Sciences",
    description: "Natural sciences, agricultural sciences, and technology",
    degrees: [
      {
        id: createDegreeId("Diploma Animal Health"),
        name: "Diploma in Animal Health",
        faculty: "Natural and Agricultural Sciences",
        duration: "3 years",
        apsRequirement: 22,
        description: "Animal health and veterinary technology",
        subjects: [
          { name: "Life Sciences", level: 4, isRequired: true },
          { name: "English", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Animal Health Technician",
          "Veterinary Assistant",
          "Animal Welfare Officer",
        ],
      },
      {
        id: createDegreeId("Diploma Animal Science"),
        name: "Diploma in Animal Science",
        faculty: "Natural and Agricultural Sciences",
        duration: "3 years",
        apsRequirement: 22,
        description: "Animal production and management",
        subjects: [
          { name: "Life Sciences", level: 4, isRequired: true },
          { name: "Mathematics", level: 3, isRequired: true },
          { name: "English", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Animal Scientist",
          "Livestock Manager",
          "Animal Production Specialist",
        ],
      },
      {
        id: createDegreeId("Diploma Plant Science Crop Production"),
        name: "Diploma in Plant Science (Crop Production)",
        faculty: "Natural and Agricultural Sciences",
        duration: "3 years",
        apsRequirement: 22,
        description: "Plant science and crop production",
        subjects: [
          { name: "Life Sciences", level: 4, isRequired: true },
          { name: "Mathematics", level: 3, isRequired: true },
          { name: "English", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Plant Scientist",
          "Crop Manager",
          "Agricultural Technician",
        ],
      },
      {
        id: createDegreeId("Bachelor Science Multiple Combinations"),
        name: "Bachelor of Science (with multiple subject combinations including Chemistry, Physics, Mathematics, Computer Sciences, etc.)",
        faculty: "Natural and Agricultural Sciences",
        duration: "3 years",
        apsRequirement: 26,
        description: "General science degree with various subject combinations",
        subjects: [
          { name: "Mathematics", level: 5, isRequired: true },
          { name: "Physical Sciences", level: 5, isRequired: true },
          { name: "English", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Scientist",
          "Research Analyst",
          "Laboratory Technician",
        ],
      },
      {
        id: createDegreeId("Extended Bachelor Science"),
        name: "Extended Bachelor of Science",
        faculty: "Natural and Agricultural Sciences",
        duration: "4 years",
        apsRequirement: 24,
        description: "Extended programme for science studies",
        subjects: [
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Physical Sciences", level: 4, isRequired: true },
          { name: "English", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Scientist",
          "Research Analyst",
          "Laboratory Technician",
        ],
      },
      {
        id: createDegreeId("Bachelor Science Information Technology"),
        name: "Bachelor of Science in Information Technology",
        faculty: "Natural and Agricultural Sciences",
        duration: "3 years",
        apsRequirement: 26,
        description: "Information technology and computer science",
        subjects: [
          { name: "Mathematics", level: 5, isRequired: true },
          { name: "English", level: 4, isRequired: true },
        ],
        careerProspects: [
          "IT Specialist",
          "Software Developer",
          "Systems Analyst",
        ],
      },
      {
        id: createDegreeId("Extended Bachelor Science Information Technology"),
        name: "Extended Bachelor of Science in Information Technology",
        faculty: "Natural and Agricultural Sciences",
        duration: "4 years",
        apsRequirement: 24,
        description: "Extended programme for information technology",
        subjects: [
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "English", level: 4, isRequired: true },
        ],
        careerProspects: [
          "IT Specialist",
          "Software Developer",
          "Systems Analyst",
        ],
      },
      {
        id: createDegreeId("Bachelor Science Mathematical Sciences Multiple"),
        name: "Bachelor of Science in Mathematical Sciences (with Statistics and Mathematics, with Mathematics, with Applied Mathematics and Mathematics)",
        faculty: "Natural and Agricultural Sciences",
        duration: "3 years",
        apsRequirement: 26,
        description: "Mathematical sciences with various specializations",
        subjects: [
          { name: "Mathematics", level: 6, isRequired: true },
          { name: "English", level: 4, isRequired: true },
        ],
        careerProspects: ["Mathematician", "Statistician", "Data Scientist"],
      },
      {
        id: createDegreeId("Bachelor Science Biological Sciences Multiple"),
        name: "Bachelor of Science in Biological Sciences (with multiple combinations including Microbiology, Biochemistry, Botany, Zoology, Chemistry, Physiology)",
        faculty: "Natural and Agricultural Sciences",
        duration: "3 years",
        apsRequirement: 26,
        description:
          "Biological sciences with various specialization combinations",
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
        id: createDegreeId("Bachelor Science Environmental Sciences Multiple"),
        name: "Bachelor of Science in Environmental Sciences (with multiple combinations including Chemistry, Geography, Botany, Zoology, Geology, Tourism)",
        faculty: "Natural and Agricultural Sciences",
        duration: "3 years",
        apsRequirement: 26,
        description:
          "Environmental sciences with various specialization combinations",
        subjects: [
          { name: "Life Sciences", level: 4, isRequired: true },
          { name: "Geography", level: 4, isRequired: true },
          { name: "English", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Environmental Scientist",
          "Conservation Officer",
          "Environmental Consultant",
        ],
      },
      {
        id: createDegreeId(
          "Bachelor Science Environmental Sciences Chemistry Geography Special",
        ),
        name: "Bachelor of Science in Environmental Sciences with Chemistry and Geography",
        faculty: "Natural and Agricultural Sciences",
        duration: "3 years",
        apsRequirement: 32,
        description:
          "Specialized environmental sciences with chemistry and geography",
        subjects: [
          { name: "Physical Sciences", level: 5, isRequired: true },
          { name: "Geography", level: 5, isRequired: true },
          { name: "Mathematics", level: 5, isRequired: true },
          { name: "English", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Environmental Chemist",
          "Environmental Geographer",
          "Research Scientist",
        ],
      },
      {
        id: createDegreeId("Extended Bachelor Science Financial Mathematics"),
        name: "Extended Bachelor of Science in Financial Mathematics",
        faculty: "Natural and Agricultural Sciences",
        duration: "4 years",
        apsRequirement: 28,
        description: "Extended programme for financial mathematics",
        subjects: [
          { name: "Mathematics", level: 5, isRequired: true },
          { name: "English", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Financial Mathematician",
          "Quantitative Analyst",
          "Risk Analyst",
        ],
      },
      {
        id: createDegreeId("Bachelor Science Business Analytics"),
        name: "Bachelor of Science in Business Analytics",
        faculty: "Natural and Agricultural Sciences",
        duration: "3 years",
        apsRequirement: 32,
        description: "Business analytics and data science",
        subjects: [
          { name: "Mathematics", level: 6, isRequired: true },
          { name: "English", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Business Analyst",
          "Data Scientist",
          "Analytics Specialist",
        ],
      },
      {
        id: createDegreeId("Extended Bachelor Science Business Analytics"),
        name: "Extended Bachelor of Science in Business Analytics",
        faculty: "Natural and Agricultural Sciences",
        duration: "4 years",
        apsRequirement: 28,
        description: "Extended programme for business analytics",
        subjects: [
          { name: "Mathematics", level: 5, isRequired: true },
          { name: "English", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Business Analyst",
          "Data Scientist",
          "Analytics Specialist",
        ],
      },
      {
        id: createDegreeId("Bachelor Science Quantitative Risk Management"),
        name: "Bachelor of Science in Quantitative Risk Management",
        faculty: "Natural and Agricultural Sciences",
        duration: "3 years",
        apsRequirement: 32,
        description: "Quantitative risk analysis and management",
        subjects: [
          { name: "Mathematics", level: 6, isRequired: true },
          { name: "English", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Risk Analyst",
          "Quantitative Risk Manager",
          "Financial Risk Specialist",
        ],
      },
      {
        id: createDegreeId(
          "Extended Bachelor Science Quantitative Risk Management",
        ),
        name: "Extended Bachelor of Science in Quantitative Risk Management",
        faculty: "Natural and Agricultural Sciences",
        duration: "4 years",
        apsRequirement: 28,
        description: "Extended programme for quantitative risk management",
        subjects: [
          { name: "Mathematics", level: 5, isRequired: true },
          { name: "English", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Risk Analyst",
          "Quantitative Risk Manager",
          "Financial Risk Specialist",
        ],
      },
      {
        id: createDegreeId("Bachelor Science Actuarial Science"),
        name: "Bachelor of Science in Actuarial Science",
        faculty: "Natural and Agricultural Sciences",
        duration: "3 years",
        apsRequirement: 32,
        description: "Actuarial science and risk assessment",
        subjects: [
          { name: "Mathematics", level: 7, isRequired: true },
          { name: "English", level: 4, isRequired: true },
        ],
        careerProspects: ["Actuary", "Risk Analyst", "Insurance Specialist"],
      },
      {
        id: createDegreeId("Bachelor Science Urban Regional Planning"),
        name: "Bachelor of Science in Urban and Regional Planning",
        faculty: "Natural and Agricultural Sciences",
        duration: "4 years",
        apsRequirement: 28,
        description: "Urban and regional planning",
        subjects: [
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Geography", level: 4, isRequired: true },
          { name: "English", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Urban Planner",
          "Regional Planner",
          "Development Planner",
        ],
      },
      {
        id: createDegreeId("Bachelor Science Agricultural Sciences Multiple"),
        name: "Bachelor of Science in Agricultural Sciences (with Agricultural Economics, Animal Sciences, Animal Health, Agronomy and Horticulture, Agronomy and Soil Sciences, Agronomy and Agricultural Economics)",
        faculty: "Natural and Agricultural Sciences",
        duration: "4 years",
        apsRequirement: 26,
        description: "Agricultural sciences with various specializations",
        subjects: [
          { name: "Life Sciences", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "English", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Agricultural Scientist",
          "Farm Manager",
          "Agricultural Consultant",
        ],
      },
      {
        id: createDegreeId("Bachelor Science Indigenous Knowledge Systems"),
        name: "Bachelor of Science in Indigenous Knowledge Systems",
        faculty: "Natural and Agricultural Sciences",
        duration: "3 years",
        apsRequirement: 26,
        description: "Indigenous knowledge systems and traditional science",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Life Sciences", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Indigenous Knowledge Specialist",
          "Cultural Scientist",
          "Community Researcher",
        ],
      },
    ],
  },
  {
    id: createFacultyId("Faculty of Theology"),
    name: "Faculty of Theology",
    description: "Theological studies and religious education",
    degrees: [
      {
        id: createDegreeId("Bachelor Arts Ancient Languages"),
        name: "BA in Ancient Languages",
        faculty: "Theology",
        duration: "3 years",
        apsRequirement: 24,
        description: "Ancient languages and biblical studies",
        subjects: [
          { name: "English", level: 5, isRequired: true },
          { name: "Additional Language", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Theologian",
          "Religious Scholar",
          "Language Teacher",
        ],
      },
      {
        id: createDegreeId("Bachelor Divinity"),
        name: "Bachelor of Divinity (BDiv)",
        faculty: "Theology",
        duration: "3 years",
        apsRequirement: 24,
        description: "Divinity and theological studies",
        subjects: [{ name: "English", level: 5, isRequired: true }],
        careerProspects: ["Minister", "Pastor", "Theologian"],
      },
      {
        id: createDegreeId("Bachelor Theology Bible Languages Translation"),
        name: "BTh with Bible Languages & Bible Translation",
        faculty: "Theology",
        duration: "3 years",
        apsRequirement: 24,
        description: "Theology with biblical languages and translation",
        subjects: [
          { name: "English", level: 5, isRequired: true },
          { name: "Additional Language", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Biblical Translator",
          "Theologian",
          "Religious Scholar",
        ],
      },
      {
        id: createDegreeId("Bachelor Arts Pastoral Psychology"),
        name: "BA in Pastoral Psychology",
        faculty: "Theology",
        duration: "3 years",
        apsRequirement: 24,
        description: "Pastoral care and psychology",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 3, isRequired: true },
        ],
        careerProspects: [
          "Pastoral Counselor",
          "Chaplain",
          "Religious Counselor",
        ],
      },
      {
        id: createDegreeId("Bachelor Theology Christian Ministry"),
        name: "BTh in Christian Ministry",
        faculty: "Theology",
        duration: "3 years",
        apsRequirement: 24,
        description: "Christian ministry and pastoral studies",
        subjects: [{ name: "English", level: 4, isRequired: true }],
        careerProspects: ["Minister", "Youth Pastor", "Chaplain"],
      },
    ],
  },
];
export const NWU_FACULTIES: Faculty[] = [
  {
    id: createFacultyId("Faculty of Economic and Management Sciences"),
    name: "Faculty of Economic and Management Sciences",
    description: "Business, commerce, economics, and management studies",
    degrees: [
      {
        id: createDegreeId("Bachelor of Commerce Accounting"),
        name: "Bachelor of Commerce in Accounting",
        faculty: "Economic and Management Sciences",
        duration: "3 years",
        apsRequirement: 24,
        description: "General accounting and business",
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
        id: createDegreeId("Bachelor of Commerce Chartered Accountancy"),
        name: "Bachelor of Commerce in Chartered Accountancy",
        faculty: "Economic and Management Sciences",
        duration: "3 years",
        apsRequirement: 32,
        description: "Professional chartered accountancy pathway",
        subjects: [
          { name: "Mathematics", level: 6, isRequired: true },
          { name: "English", level: 5, isRequired: true },
        ],
        careerProspects: [
          "Chartered Accountant",
          "Financial Manager",
          "Auditor",
        ],
      },
      {
        id: createDegreeId("Extended Bachelor Commerce Chartered Accountancy"),
        name: "Extended Bachelor of Commerce in Chartered Accountancy",
        faculty: "Economic and Management Sciences",
        duration: "4 years",
        apsRequirement: 28,
        description: "Extended programme for chartered accountancy",
        subjects: [
          { name: "Mathematics", level: 5, isRequired: true },
          { name: "English", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Chartered Accountant",
          "Financial Manager",
          "Auditor",
        ],
      },
      {
        id: createDegreeId("Bachelor of Commerce Financial Accountancy"),
        name: "Bachelor of Commerce in Financial Accountancy",
        faculty: "Economic and Management Sciences",
        duration: "3 years",
        apsRequirement: 28,
        description: "Financial accounting specialization",
        subjects: [
          { name: "Mathematics", level: 5, isRequired: true },
          { name: "English", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Financial Accountant",
          "Financial Analyst",
          "Investment Advisor",
        ],
      },
      {
        id: createDegreeId("Extended Bachelor Commerce Financial Accountancy"),
        name: "Extended Bachelor of Commerce in Financial Accountancy",
        faculty: "Economic and Management Sciences",
        duration: "4 years",
        apsRequirement: 24,
        description: "Extended programme for financial accountancy",
        subjects: [
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "English", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Financial Accountant",
          "Financial Analyst",
          "Investment Advisor",
        ],
      },
      {
        id: createDegreeId("Bachelor of Commerce Forensic Accountancy"),
        name: "Bachelor of Commerce in Forensic Accountancy",
        faculty: "Economic and Management Sciences",
        duration: "3 years",
        apsRequirement: 36,
        description: "Forensic accounting and investigation",
        subjects: [
          { name: "Mathematics", level: 6, isRequired: true },
          { name: "English", level: 5, isRequired: true },
        ],
        careerProspects: [
          "Forensic Accountant",
          "Financial Investigator",
          "Risk Analyst",
        ],
      },
      {
        id: createDegreeId("Bachelor of Commerce Management Accountancy"),
        name: "Bachelor of Commerce in Management Accountancy",
        faculty: "Economic and Management Sciences",
        duration: "3 years",
        apsRequirement: 30,
        description: "Management accounting and cost control",
        subjects: [
          { name: "Mathematics", level: 5, isRequired: true },
          { name: "English", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Management Accountant",
          "Cost Analyst",
          "Financial Controller",
        ],
      },
      {
        id: createDegreeId("Bachelor of Commerce Operations Research"),
        name: "Bachelor of Commerce in Operations Research",
        faculty: "Economic and Management Sciences",
        duration: "3 years",
        apsRequirement: 24,
        description: "Operations research and optimization",
        subjects: [
          { name: "Mathematics", level: 5, isRequired: true },
          { name: "English", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Operations Research Analyst",
          "Business Analyst",
          "Data Scientist",
        ],
      },
      {
        id: createDegreeId("Bachelor of Commerce Statistics"),
        name: "Bachelor of Commerce in Statistics",
        faculty: "Economic and Management Sciences",
        duration: "3 years",
        apsRequirement: 24,
        description: "Statistical analysis and data science",
        subjects: [
          { name: "Mathematics", level: 5, isRequired: true },
          { name: "English", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Statistician",
          "Data Analyst",
          "Market Research Analyst",
        ],
      },
      {
        id: createDegreeId("Extended Bachelor Commerce Statistics"),
        name: "Extended Bachelor of Commerce in Statistics",
        faculty: "Economic and Management Sciences",
        duration: "4 years",
        apsRequirement: 20,
        description: "Extended programme for statistics",
        subjects: [
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "English", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Statistician",
          "Data Analyst",
          "Market Research Analyst",
        ],
      },
      {
        id: createDegreeId(
          "Bachelor of Commerce Business Operations Logistics",
        ),
        name: "Bachelor of Commerce in Business Operations (with Logistics Management)",
        faculty: "Economic and Management Sciences",
        duration: "3 years",
        apsRequirement: 24,
        description: "Business operations and logistics management",
        subjects: [
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "English", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Logistics Manager",
          "Operations Manager",
          "Supply Chain Manager",
        ],
      },
      {
        id: createDegreeId(
          "Extended Bachelor Commerce Business Operations Logistics",
        ),
        name: "Extended Bachelor of Commerce in Business Operations (with Logistics Management)",
        faculty: "Economic and Management Sciences",
        duration: "4 years",
        apsRequirement: 20,
        description: "Extended programme for business operations and logistics",
        subjects: [
          { name: "Mathematics", level: 3, isRequired: true },
          { name: "English", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Logistics Manager",
          "Operations Manager",
          "Supply Chain Manager",
        ],
      },
      {
        id: createDegreeId(
          "Bachelor of Commerce Business Operations Transport",
        ),
        name: "Bachelor of Commerce in Business Operations (with Transport Economics)",
        faculty: "Economic and Management Sciences",
        duration: "3 years",
        apsRequirement: 24,
        description: "Business operations and transport economics",
        subjects: [
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "English", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Transport Manager",
          "Logistics Coordinator",
          "Operations Analyst",
        ],
      },
      {
        id: createDegreeId(
          "Extended Bachelor Commerce Business Operations Transport",
        ),
        name: "Extended Bachelor of Commerce in Business Operations (with Transport Economics)",
        faculty: "Economic and Management Sciences",
        duration: "4 years",
        apsRequirement: 20,
        description:
          "Extended programme for business operations and transport economics",
        subjects: [
          { name: "Mathematics", level: 3, isRequired: true },
          { name: "English", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Transport Manager",
          "Logistics Coordinator",
          "Operations Analyst",
        ],
      },
      {
        id: createDegreeId(
          "Bachelor Commerce Economic Sciences Agricultural Economics",
        ),
        name: "Bachelor of Commerce in Economic Sciences (with Agricultural Economics and Risk Management)",
        faculty: "Economic and Management Sciences",
        duration: "3 years",
        apsRequirement: 26,
        description:
          "Economic sciences with agricultural economics specialization",
        subjects: [
          { name: "Mathematics", level: 5, isRequired: true },
          { name: "English", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Agricultural Economist",
          "Risk Analyst",
          "Policy Researcher",
        ],
      },
      {
        id: createDegreeId("Bachelor Commerce Economic Sciences Econometrics"),
        name: "Bachelor of Commerce in Economic Sciences (with Econometrics)",
        faculty: "Economic and Management Sciences",
        duration: "3 years",
        apsRequirement: 26,
        description: "Economic sciences with econometric analysis",
        subjects: [
          { name: "Mathematics", level: 6, isRequired: true },
          { name: "English", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Econometrician",
          "Economic Analyst",
          "Financial Modeler",
        ],
      },
      {
        id: createDegreeId(
          "Extended Bachelor Commerce Economic Sciences Econometrics",
        ),
        name: "Extended Bachelor of Commerce in Economic Sciences (with Econometrics)",
        faculty: "Economic and Management Sciences",
        duration: "4 years",
        apsRequirement: 20,
        description:
          "Extended programme for economic sciences with econometrics",
        subjects: [
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "English", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Econometrician",
          "Economic Analyst",
          "Financial Modeler",
        ],
      },
      {
        id: createDegreeId(
          "Bachelor Commerce Economic Sciences International Trade",
        ),
        name: "Bachelor of Commerce in Economic Sciences (with International Trade)",
        faculty: "Economic and Management Sciences",
        duration: "3 years",
        apsRequirement: 26,
        description: "Economic sciences with international trade focus",
        subjects: [
          { name: "Mathematics", level: 5, isRequired: true },
          { name: "English", level: 5, isRequired: true },
        ],
        careerProspects: [
          "International Trade Specialist",
          "Export Manager",
          "Trade Analyst",
        ],
      },
      {
        id: createDegreeId(
          "Extended Bachelor Commerce Economic Sciences International Trade",
        ),
        name: "Extended Bachelor of Commerce in Economic Sciences (with International Trade)",
        faculty: "Economic and Management Sciences",
        duration: "4 years",
        apsRequirement: 20,
        description:
          "Extended programme for economic sciences with international trade",
        subjects: [
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "English", level: 4, isRequired: true },
        ],
        careerProspects: [
          "International Trade Specialist",
          "Export Manager",
          "Trade Analyst",
        ],
      },
      {
        id: createDegreeId("Bachelor Commerce Economic Sciences Informatics"),
        name: "Bachelor of Commerce in Economic Sciences (with Informatics)",
        faculty: "Economic and Management Sciences",
        duration: "3 years",
        apsRequirement: 26,
        description: "Economic sciences with informatics",
        subjects: [
          { name: "Mathematics", level: 5, isRequired: true },
          { name: "English", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Business Analyst",
          "Economic Modeler",
          "Data Scientist",
        ],
      },
      {
        id: createDegreeId(
          "Bachelor Commerce Economic Sciences Information Systems",
        ),
        name: "Bachelor of Commerce in Economic Sciences (with Information Systems)",
        faculty: "Economic and Management Sciences",
        duration: "3 years",
        apsRequirement: 26,
        description: "Economic sciences with information systems",
        subjects: [
          { name: "Mathematics", level: 5, isRequired: true },
          { name: "English", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Information Systems Analyst",
          "Business Intelligence Analyst",
          "Data Manager",
        ],
      },
      {
        id: createDegreeId(
          "Extended Bachelor Commerce Economic Sciences Information Systems",
        ),
        name: "Extended Bachelor of Commerce in Economic Sciences (with Information Systems)",
        faculty: "Economic and Management Sciences",
        duration: "4 years",
        apsRequirement: 20,
        description:
          "Extended programme for economic sciences with information systems",
        subjects: [
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "English", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Information Systems Analyst",
          "Business Intelligence Analyst",
          "Data Manager",
        ],
      },
      {
        id: createDegreeId(
          "Bachelor Commerce Economic Sciences Risk Management",
        ),
        name: "Bachelor of Commerce in Economic Sciences (with Risk Management)",
        faculty: "Economic and Management Sciences",
        duration: "3 years",
        apsRequirement: 26,
        description: "Economic sciences with risk management",
        subjects: [
          { name: "Mathematics", level: 5, isRequired: true },
          { name: "English", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Risk Manager",
          "Risk Analyst",
          "Insurance Specialist",
        ],
      },
      {
        id: createDegreeId(
          "Extended Bachelor Commerce Economic Sciences Risk Management",
        ),
        name: "Extended Bachelor of Commerce in Economic Sciences (with Risk Management)",
        faculty: "Economic and Management Sciences",
        duration: "4 years",
        apsRequirement: 24,
        description:
          "Extended programme for economic sciences with risk management",
        subjects: [
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "English", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Risk Manager",
          "Risk Analyst",
          "Insurance Specialist",
        ],
      },
      {
        id: createDegreeId("Bachelor Administration Human Resource Management"),
        name: "Bachelor of Administration in Human Resource Management",
        faculty: "Economic and Management Sciences",
        duration: "3 years",
        apsRequirement: 23,
        description: "Human resource management and administration",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 3, isRequired: true },
        ],
        careerProspects: [
          "HR Manager",
          "Recruitment Specialist",
          "Training Coordinator",
        ],
      },
      {
        id: createDegreeId(
          "Extended Bachelor Administration Human Resource Management",
        ),
        name: "Extended Bachelor of Administration in Human Resource Management",
        faculty: "Economic and Management Sciences",
        duration: "4 years",
        apsRequirement: 21,
        description: "Extended programme for human resource management",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 3, isRequired: true },
        ],
        careerProspects: [
          "HR Manager",
          "Recruitment Specialist",
          "Training Coordinator",
        ],
      },
      {
        id: createDegreeId(
          "Bachelor Administration Industrial Organisational Psychology",
        ),
        name: "Bachelor of Administration in Industrial and Organisational Psychology",
        faculty: "Economic and Management Sciences",
        duration: "3 years",
        apsRequirement: 23,
        description: "Industrial and organisational psychology",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Industrial Psychologist",
          "Organisational Consultant",
          "HR Specialist",
        ],
      },
      {
        id: createDegreeId(
          "Extended Bachelor Administration Industrial Organisational Psychology",
        ),
        name: "Extended Bachelor of Administration in Industrial and Organisational Psychology",
        faculty: "Economic and Management Sciences",
        duration: "4 years",
        apsRequirement: 21,
        description:
          "Extended programme for industrial and organisational psychology",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 3, isRequired: true },
        ],
        careerProspects: [
          "Industrial Psychologist",
          "Organisational Consultant",
          "HR Specialist",
        ],
      },
      {
        id: createDegreeId(
          "Bachelor Arts Industrial Organisational Psychology Labour Relations",
        ),
        name: "Bachelor of Arts (with Industrial and Organisational Psychology and Labour Relations Management)",
        faculty: "Economic and Management Sciences",
        duration: "3 years",
        apsRequirement: 26,
        description: "Industrial psychology and labour relations",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Labour Relations Manager",
          "Industrial Psychologist",
          "HR Specialist",
        ],
      },
      {
        id: createDegreeId("Bachelor Commerce Human Resource Management"),
        name: "Bachelor of Commerce (Human Resource Management)",
        faculty: "Economic and Management Sciences",
        duration: "3 years",
        apsRequirement: 30,
        description: "Advanced human resource management",
        subjects: [
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "English", level: 5, isRequired: true },
        ],
        careerProspects: [
          "HR Manager",
          "Talent Manager",
          "Organisational Developer",
        ],
      },
      {
        id: createDegreeId(
          "Bachelor Commerce Industrial Organisational Psychology",
        ),
        name: "Bachelor of Commerce (in Industrial and Organisational Psychology)",
        faculty: "Economic and Management Sciences",
        duration: "3 years",
        apsRequirement: 30,
        description: "Commerce with industrial psychology specialization",
        subjects: [
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "English", level: 5, isRequired: true },
        ],
        careerProspects: [
          "Industrial Psychologist",
          "Business Psychologist",
          "Organisational Consultant",
        ],
      },
      {
        id: createDegreeId("Bachelor Human Resource Development"),
        name: "Bachelor of Human Resource Development",
        faculty: "Economic and Management Sciences",
        duration: "3 years",
        apsRequirement: 22,
        description: "Human resource development and training",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 3, isRequired: true },
        ],
        careerProspects: [
          "Training Manager",
          "HR Developer",
          "Learning Specialist",
        ],
      },
      {
        id: createDegreeId("Bachelor Arts Tourism Management"),
        name: "Bachelor of Arts (with Tourism Management)",
        faculty: "Economic and Management Sciences",
        duration: "3 years",
        apsRequirement: 22,
        description: "Tourism management and hospitality",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Geography", level: 4, isRequired: false },
        ],
        careerProspects: [
          "Tourism Manager",
          "Hotel Manager",
          "Travel Consultant",
        ],
      },
      {
        id: createDegreeId(
          "Bachelor Commerce Management Sciences Tourism Management",
        ),
        name: "Bachelor of Commerce in Management Sciences (with Tourism Management)",
        faculty: "Economic and Management Sciences",
        duration: "3 years",
        apsRequirement: 24,
        description: "Management sciences with tourism focus",
        subjects: [
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "English", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Tourism Manager",
          "Hospitality Manager",
          "Event Manager",
        ],
      },
      {
        id: createDegreeId(
          "Bachelor Commerce Management Sciences Tourism Recreation",
        ),
        name: "Bachelor of Commerce in Management Sciences (with Tourism and Recreation Skills)",
        faculty: "Economic and Management Sciences",
        duration: "3 years",
        apsRequirement: 24,
        description: "Management sciences with tourism and recreation",
        subjects: [
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "English", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Recreation Manager",
          "Tourism Coordinator",
          "Leisure Services Manager",
        ],
      },
      {
        id: createDegreeId(
          "Bachelor Commerce Management Sciences Business Management",
        ),
        name: "Bachelor of Commerce in Management Sciences (with Business Management)",
        faculty: "Economic and Management Sciences",
        duration: "3 years",
        apsRequirement: 24,
        description: "Management sciences with business focus",
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
        id: createDegreeId(
          "Extended Bachelor Commerce Management Sciences Business Management",
        ),
        name: "Extended Bachelor of Commerce in Management Sciences (with Business Management)",
        faculty: "Economic and Management Sciences",
        duration: "4 years",
        apsRequirement: 24,
        description:
          "Extended programme for management sciences with business management",
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
        id: createDegreeId(
          "Bachelor Commerce Management Sciences Communication Management",
        ),
        name: "Bachelor of Commerce in Management Sciences (with Communication Management)",
        faculty: "Economic and Management Sciences",
        duration: "3 years",
        apsRequirement: 24,
        description: "Management sciences with communication focus",
        subjects: [
          { name: "English", level: 5, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Communications Manager",
          "Public Relations Manager",
          "Marketing Manager",
        ],
      },
      {
        id: createDegreeId(
          "Bachelor Commerce Management Sciences Marketing Management",
        ),
        name: "Bachelor of Commerce in Management Sciences (with Marketing Management)",
        faculty: "Economic and Management Sciences",
        duration: "3 years",
        apsRequirement: 24,
        description: "Management sciences with marketing focus",
        subjects: [
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "English", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Marketing Manager",
          "Brand Manager",
          "Sales Manager",
        ],
      },
      {
        id: createDegreeId(
          "Extended Bachelor Commerce Management Sciences Marketing Management",
        ),
        name: "Extended Bachelor of Commerce in Management Sciences (with Marketing Management)",
        faculty: "Economic and Management Sciences",
        duration: "4 years",
        apsRequirement: 20,
        description:
          "Extended programme for management sciences with marketing management",
        subjects: [
          { name: "Mathematics", level: 3, isRequired: true },
          { name: "English", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Marketing Manager",
          "Brand Manager",
          "Sales Manager",
        ],
      },
      {
        id: createDegreeId(
          "Bachelor Commerce Management Sciences Sport Business Management",
        ),
        name: "Bachelor of Commerce in Management Sciences (with Sport and Business Management)",
        faculty: "Economic and Management Sciences",
        duration: "3 years",
        apsRequirement: 24,
        description: "Management sciences with sport business focus",
        subjects: [
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "English", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Sports Manager",
          "Event Manager",
          "Sports Marketing Manager",
        ],
      },
      {
        id: createDegreeId(
          "Bachelor Commerce Management Sciences Safety Management",
        ),
        name: "Bachelor of Commerce in Management Sciences (with Safety Management)",
        faculty: "Economic and Management Sciences",
        duration: "3 years",
        apsRequirement: 24,
        description: "Management sciences with safety focus",
        subjects: [
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "English", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Safety Manager",
          "Risk Manager",
          "Health and Safety Officer",
        ],
      },
      {
        id: createDegreeId(
          "Bachelor Commerce Management Sciences Marketing Tourism Management",
        ),
        name: "Bachelor of Commerce in Management Sciences (with Marketing & Tourism Management)",
        faculty: "Economic and Management Sciences",
        duration: "3 years",
        apsRequirement: 24,
        description: "Management sciences with marketing and tourism focus",
        subjects: [
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "English", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Tourism Marketing Manager",
          "Destination Manager",
          "Travel Marketing Specialist",
        ],
      },
    ],
  },
  {
    id: createFacultyId("Faculty of Education"),
    name: "Faculty of Education",
    description: "Teacher education and educational development",
    degrees: [
      {
        id: createDegreeId("Bachelor Education Early Childhood Care Education"),
        name: "Bachelor of Education Early Childhood Care and Education",
        faculty: "Education",
        duration: "4 years",
        apsRequirement: 26,
        description: "Early childhood education and care",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Early Childhood Educator",
          "Preschool Teacher",
          "Child Development Specialist",
        ],
      },
      {
        id: createDegreeId("Bachelor Education Foundation Phase"),
        name: "Bachelor of Education Foundation Phase",
        faculty: "Education",
        duration: "4 years",
        apsRequirement: 26,
        description: "Foundation phase teaching (Grade R-3)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Foundation Phase Teacher",
          "Primary School Teacher",
          "Educational Specialist",
        ],
      },
      {
        id: createDegreeId("Bachelor Education Intermediate Phase"),
        name: "Bachelor of Education Intermediate Phase",
        faculty: "Education",
        duration: "4 years",
        apsRequirement: 26,
        description: "Intermediate phase teaching (Grade 4-6)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Intermediate Phase Teacher",
          "Primary School Teacher",
          "Subject Specialist",
        ],
      },
      {
        id: createDegreeId("Bachelor Education Senior Further Education"),
        name: "Bachelor of Education Senior and Further Education",
        faculty: "Education",
        duration: "4 years",
        apsRequirement: 26,
        description: "Senior and FET phase teaching (Grade 7-12)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Teaching Subject", level: 4, isRequired: true },
        ],
        careerProspects: [
          "High School Teacher",
          "Subject Head",
          "Educational Manager",
        ],
      },
    ],
  },
  {
    id: createFacultyId("Faculty of Engineering"),
    name: "Faculty of Engineering",
    description: "Engineering programs across multiple disciplines",
    degrees: [
      {
        id: createDegreeId("Bachelor Engineering Multiple Disciplines"),
        name: "Bachelor of Engineering (Chemical, Electrical, Computer & Electronic, Electromechanical, Mechanical, Industrial, Mechatronic)",
        faculty: "Engineering",
        duration: "4 years",
        apsRequirement: 34,
        description: "Multiple engineering disciplines available",
        subjects: [
          { name: "Mathematics", level: 6, isRequired: true },
          { name: "Physical Sciences", level: 6, isRequired: true },
          { name: "English", level: 5, isRequired: true },
        ],
        careerProspects: [
          "Professional Engineer",
          "Design Engineer",
          "Project Manager",
          "Engineering Consultant",
        ],
      },
    ],
  },
  {
    id: createFacultyId("Faculty of Health Sciences"),
    name: "Faculty of Health Sciences",
    description: "Health sciences, medical, and wellness programs",
    degrees: [
      {
        id: createDegreeId("Diploma Coaching Science"),
        name: "Diploma in Coaching Science",
        faculty: "Health Sciences",
        duration: "3 years",
        apsRequirement: 18,
        description: "Sports coaching and exercise science",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Life Sciences", level: 3, isRequired: true },
        ],
        careerProspects: [
          "Sports Coach",
          "Fitness Trainer",
          "Sports Scientist",
        ],
      },
      {
        id: createDegreeId("Bachelor Health Sciences Physiology Biochemistry"),
        name: "Bachelor of Health Sciences (with Physiology and Biochemistry)",
        faculty: "Health Sciences",
        duration: "3 years",
        apsRequirement: 26,
        description: "Health sciences with physiology and biochemistry focus",
        subjects: [
          { name: "Life Sciences", level: 5, isRequired: true },
          { name: "Physical Sciences", level: 5, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "English", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Health Scientist",
          "Researcher",
          "Medical Technologist",
        ],
      },
      {
        id: createDegreeId("Bachelor Health Sciences Physiology Psychology"),
        name: "Bachelor of Health Sciences (with Physiology and Psychology)",
        faculty: "Health Sciences",
        duration: "3 years",
        apsRequirement: 26,
        description: "Health sciences with physiology and psychology focus",
        subjects: [
          { name: "Life Sciences", level: 5, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "English", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Health Psychologist",
          "Research Scientist",
          "Health Educator",
        ],
      },
      {
        id: createDegreeId(
          "Bachelor Health Sciences Sport Coaching Human Movement",
        ),
        name: "Bachelor of Health Sciences (with Sport Coaching and Human Movement Sciences)",
        faculty: "Health Sciences",
        duration: "3 years",
        apsRequirement: 24,
        description: "Health sciences with sport coaching and human movement",
        subjects: [
          { name: "Life Sciences", level: 4, isRequired: true },
          { name: "English", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Sports Scientist",
          "Movement Analyst",
          "Sports Coach",
        ],
      },
      {
        id: createDegreeId(
          "Bachelor Health Sciences Recreation Sciences Psychology",
        ),
        name: "Bachelor of Health Sciences (with Recreation Sciences and Psychology)",
        faculty: "Health Sciences",
        duration: "3 years",
        apsRequirement: 26,
        description: "Health sciences with recreation and psychology focus",
        subjects: [
          { name: "Life Sciences", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "English", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Recreation Therapist",
          "Health Psychologist",
          "Wellness Coordinator",
        ],
      },
      {
        id: createDegreeId(
          "Bachelor Health Sciences Recreation Tourism Sport Administration",
        ),
        name: "Bachelor of Health Sciences (with Recreation Science and Tourism Management, with Sport and Recreation Administration)",
        faculty: "Health Sciences",
        duration: "3 years",
        apsRequirement: 24,
        description:
          "Health sciences with recreation, tourism, and sport administration",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Life Sciences", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Recreation Manager",
          "Sports Administrator",
          "Tourism Health Specialist",
        ],
      },
      {
        id: createDegreeId(
          "Bachelor Arts Behavioural Sciences Psychology Geography Tourism",
        ),
        name: "Bachelor of Arts in Behavioural Sciences (with Psychology and Geography and Environmental Management, with Psychology and Tourism Management)",
        faculty: "Health Sciences",
        duration: "3 years",
        apsRequirement: 26,
        description: "Behavioural sciences with multiple specializations",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Behavioural Scientist",
          "Environmental Psychologist",
          "Tourism Psychologist",
        ],
      },
      {
        id: createDegreeId("Bachelor Social Sciences Psychology"),
        name: "Bachelor of Social Sciences (with Psychology)",
        faculty: "Health Sciences",
        duration: "3 years",
        apsRequirement: 26,
        description: "Social sciences with psychology specialization",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Social Scientist",
          "Psychologist",
          "Research Analyst",
        ],
      },
      {
        id: createDegreeId("Bachelor Consumer Studies"),
        name: "Bachelor of Consumer Studies",
        faculty: "Health Sciences",
        duration: "3 years",
        apsRequirement: 24,
        description: "Consumer science and family studies",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Life Sciences", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Consumer Scientist",
          "Family Counselor",
          "Nutrition Educator",
        ],
      },
      {
        id: createDegreeId(
          "Bachelor Consumer Studies Food Production Management",
        ),
        name: "Bachelor of Consumer Studies (in Food Production Management)",
        faculty: "Health Sciences",
        duration: "3 years",
        apsRequirement: 24,
        description: "Consumer studies with food production focus",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Life Sciences", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Food Production Manager",
          "Nutrition Specialist",
          "Quality Control Manager",
        ],
      },
      {
        id: createDegreeId(
          "Bachelor Consumer Studies Fashion Retail Management",
        ),
        name: "Bachelor of Consumer Studies (in Fashion Retail Management)",
        faculty: "Health Sciences",
        duration: "3 years",
        apsRequirement: 24,
        description: "Consumer studies with fashion retail focus",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Fashion Retail Manager",
          "Merchandising Manager",
          "Fashion Buyer",
        ],
      },
      {
        id: createDegreeId("Bachelor Social Work"),
        name: "Bachelor of Social Work",
        faculty: "Health Sciences",
        duration: "4 years",
        apsRequirement: 28,
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
        id: createDegreeId("Bachelor Pharmacy"),
        name: "Bachelor of Pharmacy",
        faculty: "Health Sciences",
        duration: "4 years",
        apsRequirement: 32,
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
      {
        id: createDegreeId("Bachelor Science Dietetics"),
        name: "Bachelor of Science in Dietetics",
        faculty: "Health Sciences",
        duration: "4 years",
        apsRequirement: 30,
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
        id: createDegreeId("Bachelor Health Science Occupational Hygiene"),
        name: "Bachelor of Health Science in Occupational Hygiene",
        faculty: "Health Sciences",
        duration: "4 years",
        apsRequirement: 27,
        description: "Occupational health and safety",
        subjects: [
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Physical Sciences", level: 4, isRequired: true },
          { name: "Life Sciences", level: 4, isRequired: true },
          { name: "English", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Occupational Hygienist",
          "Health and Safety Officer",
          "Environmental Health Specialist",
        ],
      },
      {
        id: createDegreeId("Bachelor Health Science Biokinetics"),
        name: "Bachelor of Health Science in Biokinetics",
        faculty: "Health Sciences",
        duration: "4 years",
        apsRequirement: 32,
        description: "Exercise science and rehabilitation",
        subjects: [
          { name: "Mathematics", level: 5, isRequired: true },
          { name: "Life Sciences", level: 5, isRequired: true },
          { name: "Physical Sciences", level: 4, isRequired: true },
          { name: "English", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Biokineticist",
          "Exercise Physiologist",
          "Rehabilitation Specialist",
        ],
      },
      {
        id: createDegreeId("Bachelor Nursing"),
        name: "Bachelor of Nursing",
        faculty: "Health Sciences",
        duration: "4 years",
        apsRequirement: 25,
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
    ],
  },
];
export const WSU_FACULTIES: Faculty[] = [
  {
    id: createFacultyId("Faculty of Education"),
    name: "Faculty of Education",
    description: "Teacher education and educational development",
    degrees: [
      {
        id: createDegreeId("Bachelor Education Foundation Phase Teaching"),
        name: "Bachelor of Education in Foundation Phase Teaching",
        faculty: "Education",
        duration: "4 years",
        apsRequirement: 26,
        description: "Foundation phase teaching (Grade R-3)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Foundation Phase Teacher",
          "Primary School Teacher",
          "Educational Specialist",
        ],
      },
      {
        id: createDegreeId(
          "Bachelor Education Senior Phase FET Economic Management Sciences",
        ),
        name: "Bachelor of Education in Senior Phase and Further Education and Training Teaching (Economic & Management Sciences)",
        faculty: "Education",
        duration: "4 years",
        apsRequirement: 26,
        description:
          "Senior phase and FET teaching in economic and management sciences",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Economics", level: 4, isRequired: true },
        ],
        careerProspects: [
          "High School Teacher",
          "Subject Head",
          "Educational Manager",
        ],
      },
      {
        id: createDegreeId(
          "Bachelor Education Senior Phase FET Consumer Management Sciences",
        ),
        name: "Bachelor of Education in Senior Phase and Further Education and Training Teaching (Consumer and Management Sciences)",
        faculty: "Education",
        duration: "4 years",
        apsRequirement: 26,
        description:
          "Senior phase and FET teaching in consumer and management sciences",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Consumer Studies", level: 4, isRequired: true },
        ],
        careerProspects: [
          "High School Teacher",
          "Subject Head",
          "Educational Manager",
        ],
      },
      {
        id: createDegreeId("Bachelor Education Senior Phase FET Creative Arts"),
        name: "Bachelor of Education in Senior Phase and Further Education and Training Teaching (Creative Arts)",
        faculty: "Education",
        duration: "4 years",
        apsRequirement: 26,
        description: "Senior phase and FET teaching in creative arts",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Visual Arts", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Arts Teacher",
          "Creative Arts Coordinator",
          "Educational Manager",
        ],
      },
      {
        id: createDegreeId("Bachelor Education Senior Phase FET Humanities"),
        name: "Bachelor of Education in Senior Phase and Further Education and Training Teaching (Humanities)",
        faculty: "Education",
        duration: "4 years",
        apsRequirement: 26,
        description: "Senior phase and FET teaching in humanities",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "History", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Humanities Teacher",
          "Subject Head",
          "Educational Manager",
        ],
      },
      {
        id: createDegreeId("Bachelor Education Senior Phase FET Languages"),
        name: "Bachelor of Education in Senior Phase and Further Education and Training Teaching (Languages)",
        faculty: "Education",
        duration: "4 years",
        apsRequirement: 26,
        description: "Senior phase and FET teaching in languages",
        subjects: [
          { name: "English", level: 5, isRequired: true },
          { name: "Additional Language", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Language Teacher",
          "Subject Head",
          "Educational Manager",
        ],
      },
      {
        id: createDegreeId(
          "Bachelor Education Senior Phase FET Mathematics Science Technology",
        ),
        name: "Bachelor of Education in Senior Phase and Further Education and Training Teaching (Mathematics, Science & Technology)",
        faculty: "Education",
        duration: "4 years",
        apsRequirement: 26,
        description:
          "Senior phase and FET teaching in mathematics, science and technology",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 5, isRequired: true },
          { name: "Physical Sciences", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Mathematics Teacher",
          "Science Teacher",
          "Technology Teacher",
        ],
      },
      {
        id: createDegreeId(
          "Bachelor Education Senior Phase FET Technical Vocational",
        ),
        name: "Bachelor of Education in Senior Phase and Further Education and Training Teaching (Technical and Vocational Education)",
        faculty: "Education",
        duration: "4 years",
        apsRequirement: 26,
        description:
          "Senior phase and FET teaching in technical and vocational education",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Technical Teacher",
          "Vocational Educator",
          "Skills Trainer",
        ],
      },
      {
        id: createDegreeId("Diploma Adult Community Education Training"),
        name: "Diploma in Adult and Community Education and Training (ACET)",
        faculty: "Education",
        duration: "3 years",
        apsRequirement: 21,
        description: "Adult and community education",
        subjects: [{ name: "English", level: 4, isRequired: true }],
        careerProspects: [
          "Adult Educator",
          "Community Educator",
          "Training Coordinator",
        ],
      },
    ],
  },
  {
    id: createFacultyId("Faculty of Law, Humanities and Social Sciences"),
    name: "Faculty of Law, Humanities and Social Sciences",
    description: "Legal studies, humanities, and social sciences",
    degrees: [
      {
        id: createDegreeId("Diploma Fine Art"),
        name: "Diploma in Fine Art",
        faculty: "Law, Humanities and Social Sciences",
        duration: "3 years",
        apsRequirement: 20,
        description: "Fine arts and creative expression",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Visual Arts", level: 4, isRequired: true },
        ],
        careerProspects: ["Fine Artist", "Art Teacher", "Gallery Curator"],
      },
      {
        id: createDegreeId("Advanced Diploma Fine Art"),
        name: "Advanced Diploma in Fine Art",
        faculty: "Law, Humanities and Social Sciences",
        duration: "1 year",
        apsRequirement: 20,
        description: "Advanced fine arts studies",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Visual Arts", level: 5, isRequired: true },
        ],
        careerProspects: [
          "Professional Artist",
          "Art Director",
          "Arts Educator",
        ],
      },
      {
        id: createDegreeId("Diploma Fashion"),
        name: "Diploma in Fashion",
        faculty: "Law, Humanities and Social Sciences",
        duration: "3 years",
        apsRequirement: 21,
        description: "Fashion design and clothing technology",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Visual Arts", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Fashion Designer",
          "Clothing Technologist",
          "Fashion Merchandiser",
        ],
      },
      {
        id: createDegreeId("Bachelor Arts"),
        name: "Bachelor of Arts",
        faculty: "Law, Humanities and Social Sciences",
        duration: "3 years",
        apsRequirement: 27,
        description: "Liberal arts and humanities",
        subjects: [{ name: "English", level: 4, isRequired: true }],
        careerProspects: [
          "Arts Graduate",
          "Research Assistant",
          "Communications Specialist",
        ],
      },
      {
        id: createDegreeId("Bachelor Social Science"),
        name: "Bachelor of Social Science",
        faculty: "Law, Humanities and Social Sciences",
        duration: "3 years",
        apsRequirement: 27,
        description: "Social sciences and human behavior",
        subjects: [{ name: "English", level: 4, isRequired: true }],
        careerProspects: [
          "Social Scientist",
          "Research Analyst",
          "Community Developer",
        ],
      },
      {
        id: createDegreeId("Bachelor Social Science Extended"),
        name: "Bachelor of Social Science (Extended Curriculum Programme)",
        faculty: "Law, Humanities and Social Sciences",
        duration: "4 years",
        apsRequirement: 26,
        description: "Extended programme for social sciences",
        subjects: [{ name: "English", level: 4, isRequired: true }],
        careerProspects: [
          "Social Scientist",
          "Research Analyst",
          "Community Developer",
        ],
      },
      {
        id: createDegreeId("Bachelor Laws LLB"),
        name: "Bachelor of Laws (LLB)",
        faculty: "Law, Humanities and Social Sciences",
        duration: "4 years",
        apsRequirement: 28,
        description: "Professional law degree",
        subjects: [
          { name: "English", level: 5, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
        ],
        careerProspects: ["Attorney", "Advocate", "Legal Advisor"],
      },
      {
        id: createDegreeId("Bachelor Social Work"),
        name: "Bachelor of Social Work",
        faculty: "Law, Humanities and Social Sciences",
        duration: "4 years",
        apsRequirement: 28,
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
        id: createDegreeId("Bachelor Psychology"),
        name: "Bachelor of Psychology",
        faculty: "Law, Humanities and Social Sciences",
        duration: "3 years",
        apsRequirement: 28,
        description: "Psychology and human behavior",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
        ],
        careerProspects: ["Psychologist", "Counselor", "Research Psychologist"],
      },
    ],
  },
  {
    id: createFacultyId(
      "Faculty of Management and Public Administration Sciences",
    ),
    name: "Faculty of Management and Public Administration Sciences",
    description: "Management, business administration, and public service",
    degrees: [
      {
        id: createDegreeId("Bachelor Administration"),
        name: "Bachelor of Administration",
        faculty: "Management and Public Administration Sciences",
        duration: "3 years",
        apsRequirement: 30,
        description: "Public and business administration",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Administrator",
          "Government Official",
          "Public Servant",
        ],
      },
      {
        id: createDegreeId("Diploma Administrative Management"),
        name: "Diploma in Administrative Management",
        faculty: "Management and Public Administration Sciences",
        duration: "3 years",
        apsRequirement: 21,
        description: "Administrative management and office administration",
        subjects: [{ name: "English", level: 4, isRequired: true }],
        careerProspects: [
          "Administrative Manager",
          "Office Manager",
          "Executive Assistant",
        ],
      },
      {
        id: createDegreeId("Diploma Journalism"),
        name: "Diploma in Journalism",
        faculty: "Management and Public Administration Sciences",
        duration: "3 years",
        apsRequirement: 21,
        description: "Journalism and media communication",
        subjects: [{ name: "English", level: 5, isRequired: true }],
        careerProspects: ["Journalist", "Reporter", "Media Producer"],
      },
      {
        id: createDegreeId("Diploma Public Relations"),
        name: "Diploma in Public Relations",
        faculty: "Management and Public Administration Sciences",
        duration: "3 years",
        apsRequirement: 21,
        description: "Public relations and communications",
        subjects: [{ name: "English", level: 5, isRequired: true }],
        careerProspects: [
          "Public Relations Officer",
          "Communications Specialist",
          "Media Coordinator",
        ],
      },
      {
        id: createDegreeId("Diploma Public Management"),
        name: "Diploma in Public Management",
        faculty: "Management and Public Administration Sciences",
        duration: "3 years",
        apsRequirement: 21,
        description: "Public sector management",
        subjects: [{ name: "English", level: 4, isRequired: true }],
        careerProspects: [
          "Public Manager",
          "Government Administrator",
          "Policy Officer",
        ],
      },
      {
        id: createDegreeId("Diploma Policing"),
        name: "Diploma in Policing",
        faculty: "Management and Public Administration Sciences",
        duration: "3 years",
        apsRequirement: 21,
        description: "Police science and law enforcement",
        subjects: [{ name: "English", level: 4, isRequired: true }],
        careerProspects: ["Police Officer", "Detective", "Security Manager"],
      },
      {
        id: createDegreeId("Diploma Local Government Finance"),
        name: "Diploma in Local Government Finance",
        faculty: "Management and Public Administration Sciences",
        duration: "3 years",
        apsRequirement: 21,
        description: "Local government financial management",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Municipal Finance Officer",
          "Local Government Accountant",
          "Budget Analyst",
        ],
      },
      {
        id: createDegreeId("Diploma Management"),
        name: "Diploma in Management",
        faculty: "Management and Public Administration Sciences",
        duration: "3 years",
        apsRequirement: 21,
        description: "General management principles",
        subjects: [{ name: "English", level: 4, isRequired: true }],
        careerProspects: ["Manager", "Supervisor", "Team Leader"],
      },
      {
        id: createDegreeId("Diploma Small Business Management"),
        name: "Diploma in Small Business Management",
        faculty: "Management and Public Administration Sciences",
        duration: "3 years",
        apsRequirement: 21,
        description: "Small business development and management",
        subjects: [{ name: "English", level: 4, isRequired: true }],
        careerProspects: [
          "Small Business Owner",
          "Business Consultant",
          "Entrepreneur",
        ],
      },
      {
        id: createDegreeId("Diploma Office Management Technology"),
        name: "Diploma in Office Management and Technology",
        faculty: "Management and Public Administration Sciences",
        duration: "3 years",
        apsRequirement: 21,
        description: "Office management and technology",
        subjects: [{ name: "English", level: 4, isRequired: true }],
        careerProspects: [
          "Office Manager",
          "Administrative Coordinator",
          "Executive Assistant",
        ],
      },
      {
        id: createDegreeId("Diploma Human Resources Management"),
        name: "Diploma in Human Resources Management",
        faculty: "Management and Public Administration Sciences",
        duration: "3 years",
        apsRequirement: 21,
        description: "Human resources and personnel management",
        subjects: [{ name: "English", level: 4, isRequired: true }],
        careerProspects: [
          "HR Officer",
          "Recruitment Specialist",
          "Training Coordinator",
        ],
      },
      {
        id: createDegreeId("Diploma Tourism Management"),
        name: "Diploma in Tourism Management",
        faculty: "Management and Public Administration Sciences",
        duration: "3 years",
        apsRequirement: 21,
        description: "Tourism and hospitality management",
        subjects: [{ name: "English", level: 4, isRequired: true }],
        careerProspects: [
          "Tourism Manager",
          "Travel Consultant",
          "Hotel Manager",
        ],
      },
      {
        id: createDegreeId("Diploma Hospitality Management"),
        name: "Diploma in Hospitality Management",
        faculty: "Management and Public Administration Sciences",
        duration: "3 years",
        apsRequirement: 21,
        description: "Hospitality and service management",
        subjects: [{ name: "English", level: 4, isRequired: true }],
        careerProspects: [
          "Hospitality Manager",
          "Hotel Manager",
          "Event Coordinator",
        ],
      },
      {
        id: createDegreeId("Diploma Sport Management"),
        name: "Diploma in Sport Management",
        faculty: "Management and Public Administration Sciences",
        duration: "3 years",
        apsRequirement: 22,
        description: "Sports management and administration",
        subjects: [{ name: "English", level: 4, isRequired: true }],
        careerProspects: [
          "Sports Manager",
          "Sports Administrator",
          "Event Manager",
        ],
      },
      {
        id: createDegreeId("Diploma Financial Information Systems"),
        name: "Diploma in Financial Information Systems",
        faculty: "Management and Public Administration Sciences",
        duration: "3 years",
        apsRequirement: 21,
        description: "Financial information systems and technology",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Financial Systems Analyst",
          "IT Financial Specialist",
          "Database Administrator",
        ],
      },
      {
        id: createDegreeId("Diploma Accountancy"),
        name: "Diploma in Accountancy",
        faculty: "Management and Public Administration Sciences",
        duration: "3 years",
        apsRequirement: 21,
        description: "Basic accounting and bookkeeping",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Bookkeeper",
          "Accounting Clerk",
          "Financial Assistant",
        ],
      },
      {
        id: createDegreeId("Diploma Internal Auditing"),
        name: "Diploma in Internal Auditing",
        faculty: "Management and Public Administration Sciences",
        duration: "3 years",
        apsRequirement: 21,
        description: "Internal auditing and compliance",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Internal Auditor",
          "Compliance Officer",
          "Risk Analyst",
        ],
      },
      {
        id: createDegreeId("Higher Certificate Versatile Broadcasting"),
        name: "Higher Certificate in Versatile Broadcasting",
        faculty: "Management and Public Administration Sciences",
        duration: "1 year",
        apsRequirement: 20,
        description: "Broadcasting and media production",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Additional Language", level: 3, isRequired: true },
        ],
        careerProspects: ["Radio Presenter", "TV Producer", "Media Technician"],
      },
    ],
  },
];
export const UNIZULU_FACULTIES: Faculty[] = [
  {
    id: createFacultyId("Faculty of Commerce, Administration & Law"),
    name: "Faculty of Commerce, Administration & Law (FCAL)",
    description: "Business, commerce, administration, and legal studies",
    degrees: [
      {
        id: createDegreeId("Bachelor Commerce Accounting"),
        name: "Bachelor of Commerce in Accounting",
        faculty: "Commerce, Administration & Law",
        duration: "3 years",
        apsRequirement: 28,
        description: "Professional accounting education",
        subjects: [
          { name: "Mathematics", level: 5, isRequired: true },
          { name: "English", level: 4, isRequired: true },
        ],
        careerProspects: ["Accountant", "Financial Manager", "Auditor"],
      },
      {
        id: createDegreeId("Bachelor Commerce Accounting Science CTA"),
        name: "Bachelor of Commerce in Accounting Science (CTA stream)",
        faculty: "Commerce, Administration & Law",
        duration: "3 years",
        apsRequirement: 28,
        description: "Accounting science leading to chartered accountancy",
        subjects: [
          { name: "Mathematics", level: 5, isRequired: true },
          { name: "English", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Chartered Accountant",
          "Financial Manager",
          "Tax Consultant",
        ],
      },
      {
        id: createDegreeId("Extended Bachelor Commerce"),
        name: "Extended Bachelor of Commerce (Extended Programme)",
        faculty: "Commerce, Administration & Law",
        duration: "4 years",
        apsRequirement: 26,
        description: "Extended programme for commerce studies",
        subjects: [
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "English", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Business Professional",
          "Commerce Graduate",
          "Financial Analyst",
        ],
      },
      {
        id: createDegreeId("Bachelor Commerce Management Information Systems"),
        name: "Bachelor of Commerce in Management Information Systems",
        faculty: "Commerce, Administration & Law",
        duration: "3 years",
        apsRequirement: 28,
        description: "Information systems and business management",
        subjects: [
          { name: "Mathematics", level: 5, isRequired: true },
          { name: "English", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Information Systems Manager",
          "Business Analyst",
          "IT Consultant",
        ],
      },
      {
        id: createDegreeId("Bachelor Administration"),
        name: "Bachelor of Administration",
        faculty: "Commerce, Administration & Law",
        duration: "3 years",
        apsRequirement: 28,
        description: "Public and business administration",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Administrator",
          "Government Official",
          "Public Servant",
        ],
      },
      {
        id: createDegreeId("Bachelor Laws LLB"),
        name: "Bachelor of Laws (LLB)",
        faculty: "Commerce, Administration & Law",
        duration: "4 years",
        apsRequirement: 30,
        description: "Professional law degree",
        subjects: [
          { name: "English", level: 6, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
        ],
        careerProspects: ["Attorney", "Advocate", "Legal Advisor"],
      },
      {
        id: createDegreeId("Higher Certificate Accountancy"),
        name: "Higher Certificate in Accountancy",
        faculty: "Commerce, Administration & Law",
        duration: "1 year",
        apsRequirement: 22,
        description: "Basic accounting certificate",
        subjects: [
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "English", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Bookkeeper",
          "Accounting Clerk",
          "Financial Assistant",
        ],
      },
    ],
  },
  {
    id: createFacultyId("Faculty of Science, Agriculture & Engineering"),
    name: "Faculty of Science, Agriculture & Engineering",
    description: "Natural sciences, agricultural sciences, and engineering",
    degrees: [
      {
        id: createDegreeId("Bachelor Engineering Mechanical"),
        name: "Bachelor of Engineering (Mechanical Engineering)",
        faculty: "Science, Agriculture & Engineering",
        duration: "4 years",
        apsRequirement: 30,
        description: "Mechanical engineering program",
        subjects: [
          { name: "Mathematics", level: 6, isRequired: true },
          { name: "Physical Sciences", level: 6, isRequired: true },
          { name: "English", level: 5, isRequired: true },
        ],
        careerProspects: [
          "Mechanical Engineer",
          "Design Engineer",
          "Project Manager",
        ],
      },
      {
        id: createDegreeId("Bachelor Engineering Electrical"),
        name: "Bachelor of Engineering (Electrical Engineering)",
        faculty: "Science, Agriculture & Engineering",
        duration: "4 years",
        apsRequirement: 30,
        description: "Electrical engineering program",
        subjects: [
          { name: "Mathematics", level: 6, isRequired: true },
          { name: "Physical Sciences", level: 6, isRequired: true },
          { name: "English", level: 5, isRequired: true },
        ],
        careerProspects: [
          "Electrical Engineer",
          "Electronics Engineer",
          "Power Systems Engineer",
        ],
      },
      {
        id: createDegreeId("Bachelor Science Mainstream"),
        name: "Bachelor of Science (Mainstream BSc)",
        faculty: "Science, Agriculture & Engineering",
        duration: "3 years",
        apsRequirement: 28,
        description: "General science degree",
        subjects: [
          { name: "Mathematics", level: 5, isRequired: true },
          { name: "Physical Sciences", level: 5, isRequired: true },
          { name: "English", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Scientist",
          "Research Analyst",
          "Laboratory Technician",
        ],
      },
      {
        id: createDegreeId("Bachelor Science Agriculture"),
        name: "Bachelor of Science in Agriculture (Agronomy / Animal Science)",
        faculty: "Science, Agriculture & Engineering",
        duration: "4 years",
        apsRequirement: 28,
        description:
          "Agricultural sciences with agronomy or animal science specialization",
        subjects: [
          { name: "Life Sciences", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "English", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Agricultural Scientist",
          "Farm Manager",
          "Extension Officer",
        ],
      },
      {
        id: createDegreeId("Bachelor Science Foundational Augmented"),
        name: "Bachelor of Science Foundational/Augmented Stream",
        faculty: "Science, Agriculture & Engineering",
        duration: "4 years",
        apsRequirement: 28,
        description: "Foundation/augmented science programme",
        subjects: [
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Physical Sciences", level: 4, isRequired: true },
          { name: "English", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Scientist",
          "Research Assistant",
          "Laboratory Technician",
        ],
      },
      {
        id: createDegreeId("Bachelor Education Science"),
        name: "Bachelor of Education stream BSc",
        faculty: "Science, Agriculture & Engineering",
        duration: "4 years",
        apsRequirement: 26,
        description: "Science education degree (foundation)",
        subjects: [
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Life Sciences", level: 4, isRequired: true },
          { name: "English", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Science Teacher",
          "Educational Specialist",
          "Curriculum Developer",
        ],
      },
      {
        id: createDegreeId("Bachelor Nursing Science"),
        name: "Bachelor of Nursing Science",
        faculty: "Science, Agriculture & Engineering",
        duration: "4 years",
        apsRequirement: 30,
        description: "Professional nursing education",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Life Sciences", level: 5, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Professional Nurse",
          "Clinical Nurse",
          "Community Health Nurse",
        ],
      },
      {
        id: createDegreeId(
          "Bachelor Consumer Science Extension Rural Development",
        ),
        name: "Bachelor of Consumer Science: Extension & Rural Development",
        faculty: "Science, Agriculture & Engineering",
        duration: "4 years",
        apsRequirement: 28,
        description:
          "Consumer science with extension and rural development focus",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Life Sciences", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Extension Officer",
          "Rural Development Specialist",
          "Community Developer",
        ],
      },
      {
        id: createDegreeId("Bachelor Consumer Science Hospitality Tourism"),
        name: "Bachelor of Consumer Science: Hospitality & Tourism",
        faculty: "Science, Agriculture & Engineering",
        duration: "4 years",
        apsRequirement: 28,
        description: "Consumer science with hospitality and tourism focus",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Geography", level: 4, isRequired: false },
        ],
        careerProspects: [
          "Hospitality Manager",
          "Tourism Manager",
          "Event Coordinator",
        ],
      },
      {
        id: createDegreeId("Diploma Sport Exercise"),
        name: "Diploma in Sport & Exercise",
        faculty: "Science, Agriculture & Engineering",
        duration: "3 years",
        apsRequirement: 26,
        description: "Sport and exercise science",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Life Sciences", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Sports Scientist",
          "Exercise Physiologist",
          "Fitness Trainer",
        ],
      },
      {
        id: createDegreeId("Diploma Hospitality Management"),
        name: "Diploma in Hospitality Management",
        faculty: "Science, Agriculture & Engineering",
        duration: "3 years",
        apsRequirement: 26,
        description: "Hospitality management and service",
        subjects: [{ name: "English", level: 4, isRequired: true }],
        careerProspects: [
          "Hospitality Manager",
          "Hotel Manager",
          "Event Coordinator",
        ],
      },
    ],
  },
  {
    id: createFacultyId("Faculty of Education"),
    name: "Faculty of Education",
    description: "Teacher education and educational development",
    degrees: [
      {
        id: createDegreeId("Bachelor Education Foundation Phase Teaching"),
        name: "Bachelor of Education (Foundation Phase Teaching)",
        faculty: "Education",
        duration: "4 years",
        apsRequirement: 26,
        description: "Foundation phase teaching (Grade R-3)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Foundation Phase Teacher",
          "Primary School Teacher",
          "Educational Specialist",
        ],
      },
      {
        id: createDegreeId("Bachelor Education Intermediate Phase Languages"),
        name: "Bachelor of Education (Intermediate Phase Teaching: Languages)",
        faculty: "Education",
        duration: "4 years",
        apsRequirement: 26,
        description: "Intermediate phase teaching with languages focus",
        subjects: [
          { name: "English", level: 5, isRequired: true },
          { name: "Additional Language", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Language Teacher",
          "Intermediate Phase Teacher",
          "Educational Specialist",
        ],
      },
      {
        id: createDegreeId(
          "Bachelor Education Intermediate Phase Languages Maths Science",
        ),
        name: "Bachelor of Education (Intermediate Phase: Languages, Maths, Natural Science & Tech)",
        faculty: "Education",
        duration: "4 years",
        apsRequirement: 26,
        description: "Intermediate phase teaching with multiple subject focus",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Life Sciences", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Intermediate Phase Teacher",
          "Subject Specialist",
          "Educational Coordinator",
        ],
      },
      {
        id: createDegreeId("Bachelor Education Senior Social Science"),
        name: "Bachelor of Education (Senior & Social Science Education)",
        faculty: "Education",
        duration: "4 years",
        apsRequirement: 26,
        description: "Senior phase social science education",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "History", level: 4, isRequired: true },
          { name: "Geography", level: 4, isRequired: false },
        ],
        careerProspects: [
          "Social Science Teacher",
          "History Teacher",
          "Geography Teacher",
        ],
      },
      {
        id: createDegreeId("Bachelor Education Senior Science Technology"),
        name: "Bachelor of Education (Senior Science & Technology Education)",
        faculty: "Education",
        duration: "4 years",
        apsRequirement: 26,
        description: "Senior phase science and technology education",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Physical Sciences", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Science Teacher",
          "Technology Teacher",
          "STEM Educator",
        ],
      },
      {
        id: createDegreeId("Bachelor Education Senior Management Sciences EMS"),
        name: "Bachelor of Education (Senior Management Sciences – EMS)",
        faculty: "Education",
        duration: "4 years",
        apsRequirement: 26,
        description: "Senior phase economic and management sciences education",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Economics", level: 4, isRequired: false },
        ],
        careerProspects: [
          "EMS Teacher",
          "Business Studies Teacher",
          "Economics Teacher",
        ],
      },
    ],
  },
  {
    id: createFacultyId("Faculty of Humanities & Social Sciences"),
    name: "Faculty of Humanities & Social Sciences",
    description: "Liberal arts, humanities, and social sciences",
    degrees: [
      {
        id: createDegreeId("Diploma Public Relations Management"),
        name: "Diploma in Public Relations Management",
        faculty: "Humanities & Social Sciences",
        duration: "3 years",
        apsRequirement: 24,
        description: "Public relations and communications management",
        subjects: [{ name: "English", level: 5, isRequired: true }],
        careerProspects: [
          "Public Relations Officer",
          "Communications Manager",
          "Media Coordinator",
        ],
      },
      {
        id: createDegreeId("Diploma Media Studies"),
        name: "Diploma in Media Studies",
        faculty: "Humanities & Social Sciences",
        duration: "3 years",
        apsRequirement: 24,
        description: "Media studies and journalism",
        subjects: [{ name: "English", level: 5, isRequired: true }],
        careerProspects: ["Journalist", "Media Producer", "Content Creator"],
      },
      {
        id: createDegreeId("Diploma Tourism Management"),
        name: "Diploma in Tourism Management",
        faculty: "Humanities & Social Sciences",
        duration: "3 years",
        apsRequirement: 24,
        description: "Tourism management and hospitality",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Geography", level: 4, isRequired: false },
        ],
        careerProspects: [
          "Tourism Manager",
          "Travel Consultant",
          "Hotel Manager",
        ],
      },
      {
        id: createDegreeId("Bachelor Arts Anthropology History"),
        name: "Bachelor of Arts (Anthropology & History)",
        faculty: "Humanities & Social Sciences",
        duration: "3 years",
        apsRequirement: 26,
        description: "Anthropology and history studies",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "History", level: 4, isRequired: true },
        ],
        careerProspects: ["Anthropologist", "Historian", "Cultural Researcher"],
      },
      {
        id: createDegreeId("Bachelor Arts Linguistics English"),
        name: "Bachelor of Arts (Linguistics & English)",
        faculty: "Humanities & Social Sciences",
        duration: "3 years",
        apsRequirement: 26,
        description: "Linguistics and English language studies",
        subjects: [
          { name: "English", level: 6, isRequired: true },
          { name: "Additional Language", level: 4, isRequired: true },
        ],
        careerProspects: ["Linguist", "Language Teacher", "Translator"],
      },
      {
        id: createDegreeId("Bachelor Arts Geography History"),
        name: "Bachelor of Arts (Geography & History)",
        faculty: "Humanities & Social Sciences",
        duration: "3 years",
        apsRequirement: 26,
        description: "Geography and history studies",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Geography", level: 4, isRequired: true },
          { name: "History", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Geographer",
          "Historian",
          "Geographic Information Specialist",
        ],
      },
      {
        id: createDegreeId("Bachelor Arts Geography Tourism"),
        name: "Bachelor of Arts (Geography & Tourism)",
        faculty: "Humanities & Social Sciences",
        duration: "3 years",
        apsRequirement: 26,
        description: "Geography and tourism studies",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Geography", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Tourism Geographer",
          "Destination Planner",
          "Travel Consultant",
        ],
      },
      {
        id: createDegreeId("Bachelor Arts History IsiZulu"),
        name: "Bachelor of Arts (History & IsiZulu)",
        faculty: "Humanities & Social Sciences",
        duration: "3 years",
        apsRequirement: 26,
        description: "History and IsiZulu language studies",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "History", level: 4, isRequired: true },
          { name: "IsiZulu", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Historian",
          "Language Teacher",
          "Cultural Specialist",
        ],
      },
      {
        id: createDegreeId("Bachelor Arts Philosophy Psychology"),
        name: "Bachelor of Arts (Philosophy & Psychology)",
        faculty: "Humanities & Social Sciences",
        duration: "3 years",
        apsRequirement: 26,
        description: "Philosophy and psychology studies",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
        ],
        careerProspects: ["Philosopher", "Psychologist", "Counselor"],
      },
      {
        id: createDegreeId("Bachelor Arts Correctional Studies"),
        name: "Bachelor of Arts in Correctional Studies",
        faculty: "Humanities & Social Sciences",
        duration: "3 years",
        apsRequirement: 26,
        description: "Correctional and criminal justice studies",
        subjects: [{ name: "English", level: 4, isRequired: true }],
        careerProspects: [
          "Correctional Officer",
          "Probation Officer",
          "Criminal Justice Specialist",
        ],
      },
      {
        id: createDegreeId("Bachelor Arts Development Studies"),
        name: "Bachelor of Arts in Development Studies",
        faculty: "Humanities & Social Sciences",
        duration: "3 years",
        apsRequirement: 26,
        description: "Development studies and community development",
        subjects: [{ name: "English", level: 4, isRequired: true }],
        careerProspects: [
          "Development Worker",
          "Project Coordinator",
          "NGO Manager",
        ],
      },
      {
        id: createDegreeId("Bachelor Social Work"),
        name: "Bachelor of Social Work",
        faculty: "Humanities & Social Sciences",
        duration: "4 years",
        apsRequirement: 28,
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
        id: createDegreeId("Bachelor Arts Environmental Planning Development"),
        name: "Bachelor of Arts in Environmental Planning & Development",
        faculty: "Humanities & Social Sciences",
        duration: "3 years",
        apsRequirement: 26,
        description: "Environmental planning and sustainable development",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Geography", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Environmental Planner",
          "Development Planner",
          "Sustainability Consultant",
        ],
      },
      {
        id: createDegreeId("Bachelor Arts Industrial Sociology"),
        name: "Bachelor of Arts in Industrial Sociology",
        faculty: "Humanities & Social Sciences",
        duration: "3 years",
        apsRequirement: 26,
        description: "Industrial sociology and workplace studies",
        subjects: [{ name: "English", level: 4, isRequired: true }],
        careerProspects: [
          "Industrial Sociologist",
          "Labour Relations Specialist",
          "Workplace Analyst",
        ],
      },
      {
        id: createDegreeId("Bachelor Arts Intercultural Communication"),
        name: "Bachelor of Arts in Intercultural Communication",
        faculty: "Humanities & Social Sciences",
        duration: "3 years",
        apsRequirement: 26,
        description: "Intercultural communication and diversity studies",
        subjects: [
          { name: "English", level: 5, isRequired: true },
          { name: "Additional Language", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Communications Specialist",
          "Cultural Liaison Officer",
          "International Relations Officer",
        ],
      },
      {
        id: createDegreeId("Bachelor Library Information Science"),
        name: "Bachelor of Library & Information Science",
        faculty: "Humanities & Social Sciences",
        duration: "3 years",
        apsRequirement: 26,
        description: "Library and information management",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Librarian",
          "Information Manager",
          "Knowledge Manager",
        ],
      },
      {
        id: createDegreeId("Bachelor Psychology"),
        name: "Bachelor of Psychology",
        faculty: "Humanities & Social Sciences",
        duration: "3 years",
        apsRequirement: 28,
        description: "Psychology and human behavior",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
        ],
        careerProspects: ["Psychologist", "Counselor", "Research Psychologist"],
      },
      {
        id: createDegreeId(
          "Bachelor Social Science Political International Studies",
        ),
        name: "Bachelor of Social Science in Political & International Studies",
        faculty: "Humanities & Social Sciences",
        duration: "3 years",
        apsRequirement: 30,
        description: "Political studies and international relations",
        subjects: [
          { name: "English", level: 5, isRequired: true },
          { name: "History", level: 4, isRequired: false },
        ],
        careerProspects: [
          "Political Analyst",
          "Diplomat",
          "International Relations Specialist",
        ],
      },
      {
        id: createDegreeId("Bachelor Tourism Studies"),
        name: "Bachelor of Tourism Studies",
        faculty: "Humanities & Social Sciences",
        duration: "3 years",
        apsRequirement: 26,
        description: "Tourism development and management",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Geography", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Tourism Manager",
          "Destination Developer",
          "Tourism Researcher",
        ],
      },
    ],
  },
];
export const SPU_FACULTIES: Faculty[] = [
  {
    id: createFacultyId("Faculty of Education"),
    name: "Faculty of Education",
    description: "Teacher education and educational development",
    degrees: [
      {
        id: createDegreeId("Bachelor Education Foundation Phase R-3"),
        name: "Bachelor of Education (Foundation Phase, Grade R–3)",
        faculty: "Education",
        duration: "4 years",
        apsRequirement: 30,
        description: "Foundation phase teaching for early years",
        subjects: [
          { name: "English", level: 5, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Foundation Phase Teacher",
          "Early Childhood Educator",
          "Primary School Teacher",
        ],
      },
      {
        id: createDegreeId("Bachelor Education Intermediate Phase 4-6"),
        name: "Bachelor of Education (Intermediate Phase, Grades 4–6)",
        faculty: "Education",
        duration: "4 years",
        apsRequirement: 30,
        description: "Intermediate phase teaching",
        subjects: [
          { name: "English", level: 5, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Intermediate Phase Teacher",
          "Primary School Teacher",
          "Subject Specialist",
        ],
      },
      {
        id: createDegreeId("Bachelor Education Senior FET Phase 7-12"),
        name: "Bachelor of Education (Senior & FET Phase, Grades 7–12)",
        faculty: "Education",
        duration: "4 years",
        apsRequirement: 30,
        description: "Senior and FET phase teaching",
        subjects: [
          { name: "English", level: 5, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Teaching Subject", level: 4, isRequired: true },
        ],
        careerProspects: [
          "High School Teacher",
          "Subject Head",
          "Educational Manager",
        ],
      },
    ],
  },
  {
    id: createFacultyId("Faculty of Natural & Applied Sciences"),
    name: "Faculty of Natural & Applied Sciences",
    description: "Natural sciences and applied scientific disciplines",
    degrees: [
      {
        id: createDegreeId("Bachelor Science BSc"),
        name: "Bachelor of Science (BSc)",
        faculty: "Natural & Applied Sciences",
        duration: "3 years",
        apsRequirement: 30,
        description: "General science degree",
        subjects: [
          { name: "Mathematics", level: 5, isRequired: true },
          { name: "Physical Sciences", level: 5, isRequired: true },
          { name: "English", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Scientist",
          "Research Analyst",
          "Laboratory Technician",
        ],
      },
      {
        id: createDegreeId("Bachelor Science Data Science"),
        name: "Bachelor of Science in Data Science",
        faculty: "Natural & Applied Sciences",
        duration: "3 years",
        apsRequirement: 30,
        description: "Data science and analytics",
        subjects: [
          { name: "Mathematics", level: 6, isRequired: true },
          { name: "English", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Data Scientist",
          "Data Analyst",
          "Business Intelligence Analyst",
        ],
      },
    ],
  },
  {
    id: createFacultyId("Faculty of Economic & Management Sciences"),
    name: "Faculty of Economic & Management Sciences (EMS)",
    description: "Business, economics, and management studies",
    degrees: [
      {
        id: createDegreeId("Bachelor Commerce Accounting"),
        name: "Bachelor of Commerce in Accounting",
        faculty: "Economic & Management Sciences",
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
        id: createDegreeId("Bachelor Commerce Economics"),
        name: "Bachelor of Commerce in Economics",
        faculty: "Economic & Management Sciences",
        duration: "3 years",
        apsRequirement: 30,
        description: "Economic theory and analysis",
        subjects: [
          { name: "Mathematics", level: 5, isRequired: true },
          { name: "English", level: 5, isRequired: true },
        ],
        careerProspects: ["Economist", "Policy Analyst", "Financial Analyst"],
      },
      {
        id: createDegreeId("Diploma Retail Business Management"),
        name: "Diploma in Retail Business Management",
        faculty: "Economic & Management Sciences",
        duration: "3 years",
        apsRequirement: 25,
        description: "Retail business and management",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
        ],
        careerProspects: ["Retail Manager", "Store Manager", "Business Owner"],
      },
    ],
  },
  {
    id: createFacultyId("Faculty of Humanities & Heritage Studies"),
    name: "Faculty of Humanities & Heritage Studies",
    description: "Liberal arts, humanities, and heritage studies",
    degrees: [
      {
        id: createDegreeId("Bachelor Arts BA"),
        name: "Bachelor of Arts (BA)",
        faculty: "Humanities & Heritage Studies",
        duration: "3 years",
        apsRequirement: 30,
        description: "Liberal arts and humanities",
        subjects: [{ name: "English", level: 5, isRequired: true }],
        careerProspects: [
          "Arts Graduate",
          "Research Assistant",
          "Communications Specialist",
        ],
      },
      {
        id: createDegreeId("Higher Certificate Heritage Studies"),
        name: "Higher Certificate in Heritage Studies",
        faculty: "Humanities & Heritage Studies",
        duration: "1 year",
        apsRequirement: 25,
        description: "Heritage conservation and management",
        subjects: [{ name: "English", level: 4, isRequired: true }],
        careerProspects: [
          "Heritage Officer",
          "Museum Assistant",
          "Cultural Coordinator",
        ],
      },
      {
        id: createDegreeId("Higher Certificate Court Interpreting"),
        name: "Higher Certificate in Court Interpreting",
        faculty: "Humanities & Heritage Studies",
        duration: "1 year",
        apsRequirement: 25,
        description: "Court interpreting and translation",
        subjects: [
          { name: "English", level: 5, isRequired: true },
          { name: "Additional Language", level: 5, isRequired: true },
        ],
        careerProspects: [
          "Court Interpreter",
          "Legal Translator",
          "Language Services Provider",
        ],
      },
    ],
  },
  {
    id: createFacultyId("School of ICT"),
    name: "School of ICT",
    description: "Information and communication technology",
    degrees: [
      {
        id: createDegreeId("Diploma ICT Applications Development"),
        name: "Diploma in Information & Communication Technology (Applications Development)",
        faculty: "ICT",
        duration: "3 years",
        apsRequirement: 25,
        description: "ICT and applications development",
        subjects: [
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "English", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Software Developer",
          "Applications Developer",
          "IT Specialist",
        ],
      },
    ],
  },
];
export const UMP_FACULTIES: Faculty[] = [
  {
    id: createFacultyId("Faculty of Social Sciences"),
    name: "Faculty of Social Sciences",
    description: "Social sciences and community studies",
    degrees: [
      {
        id: createDegreeId("Bachelor Arts General"),
        name: "Bachelor of Arts (General)",
        faculty: "Social Sciences",
        duration: "3 years",
        apsRequirement: 28,
        description:
          "General arts degree requiring English Level 4; Mathematics Level 2 or Math level 3",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 3, isRequired: true },
        ],
        careerProspects: [
          "Arts Graduate",
          "Research Assistant",
          "Communications Specialist",
        ],
      },
      {
        id: createDegreeId("Bachelor Social Work"),
        name: "Bachelor of Social Work",
        faculty: "Social Sciences",
        duration: "4 years",
        apsRequirement: 32,
        description:
          "Professional social work requiring English Level 4; Mathematics Level 2 or Math level 3",
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
    ],
  },
  {
    id: createFacultyId("Faculty of Agriculture & Natural Sciences"),
    name: "Faculty of Agriculture & Natural Sciences",
    description:
      "Agricultural sciences, natural sciences, and environmental studies",
    degrees: [
      {
        id: createDegreeId(
          "Bachelor Science Agriculture Extension Rural Resource Management",
        ),
        name: "Bachelor of Science in Agriculture (Agricultural Extension & Rural Resource Management)",
        faculty: "Agriculture & Natural Sciences",
        duration: "4 years",
        apsRequirement: 26,
        description:
          "Agricultural extension and rural resource management - 26 APS (with Math) / 28 APS (with Math Lit)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Life Sciences", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Agricultural Extension Officer",
          "Rural Development Specialist",
          "Farm Manager",
        ],
      },
      {
        id: createDegreeId("Bachelor Science Forestry"),
        name: "Bachelor of Science in Forestry",
        faculty: "Agriculture & Natural Sciences",
        duration: "4 years",
        apsRequirement: 30,
        description: "Forestry science and management",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Life Sciences", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
        ],
        careerProspects: ["Forester", "Forest Manager", "Conservation Officer"],
      },
      {
        id: createDegreeId("Bachelor Science General"),
        name: "Bachelor of Science (General)",
        faculty: "Agriculture & Natural Sciences",
        duration: "3 years",
        apsRequirement: 30,
        description: "General science degree",
        subjects: [
          { name: "Mathematics", level: 5, isRequired: true },
          { name: "Physical Sciences", level: 5, isRequired: true },
          { name: "English", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Scientist",
          "Research Analyst",
          "Laboratory Technician",
        ],
      },
      {
        id: createDegreeId("Bachelor Science Environmental Science"),
        name: "Bachelor of Science in Environmental Science",
        faculty: "Agriculture & Natural Sciences",
        duration: "3 years",
        apsRequirement: 30,
        description: "Environmental science and conservation",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Life Sciences", level: 4, isRequired: true },
          { name: "Geography", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Environmental Scientist",
          "Conservation Officer",
          "Environmental Consultant",
        ],
      },
      {
        id: createDegreeId("Diploma Plant Production"),
        name: "Diploma in Plant Production",
        faculty: "Agriculture & Natural Sciences",
        duration: "3 years",
        apsRequirement: 23,
        description: "Plant production - 23 APS (Math) / 24 APS (Math Lit)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Life Sciences", level: 4, isRequired: true },
          { name: "Mathematics", level: 3, isRequired: true },
        ],
        careerProspects: [
          "Plant Production Specialist",
          "Farm Supervisor",
          "Agricultural Technician",
        ],
      },
      {
        id: createDegreeId("Diploma Animal Production"),
        name: "Diploma in Animal Production",
        faculty: "Agriculture & Natural Sciences",
        duration: "3 years",
        apsRequirement: 24,
        description: "Animal production - 24 APS (Math) / 27 APS (Math Lit)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Life Sciences", level: 4, isRequired: true },
          { name: "Mathematics", level: 3, isRequired: true },
        ],
        careerProspects: [
          "Animal Production Specialist",
          "Livestock Manager",
          "Animal Health Technician",
        ],
      },
    ],
  },
  {
    id: createFacultyId("Faculty of Development Studies & Business Sciences"),
    name: "Faculty of Development Studies & Business Sciences",
    description: "Development studies, business, and commerce",
    degrees: [
      {
        id: createDegreeId("Bachelor Commerce General"),
        name: "Bachelor of Commerce (General)",
        faculty: "Development Studies & Business Sciences",
        duration: "3 years",
        apsRequirement: 30,
        description:
          "General commerce - 30 APS (Math required; Math Lit not accepted)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 5, isRequired: true },
        ],
        careerProspects: [
          "Business Professional",
          "Commerce Graduate",
          "Financial Analyst",
        ],
      },
      {
        id: createDegreeId("Bachelor Administration"),
        name: "Bachelor of Administration",
        faculty: "Development Studies & Business Sciences",
        duration: "3 years",
        apsRequirement: 32,
        description: "Public and business administration",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Administrator",
          "Government Official",
          "Public Servant",
        ],
      },
      {
        id: createDegreeId("Bachelor Development Studies"),
        name: "Bachelor of Development Studies",
        faculty: "Development Studies & Business Sciences",
        duration: "3 years",
        apsRequirement: 32,
        description: "Development studies - 32 APS (Math) / 31 APS (Math Lit)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Development Worker",
          "Project Coordinator",
          "NGO Manager",
        ],
      },
    ],
  },
  {
    id: createFacultyId("Faculty of Education"),
    name: "Faculty of Education",
    description: "Teacher education and educational development",
    degrees: [
      {
        id: createDegreeId("Bachelor Education Foundation Phase Teaching"),
        name: "Bachelor of Education (Foundation Phase Teaching)",
        faculty: "Education",
        duration: "4 years",
        apsRequirement: 26,
        description:
          "Foundation phase teaching - 26 APS (Math) / 27 APS (Math Lit)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Foundation Phase Teacher",
          "Primary School Teacher",
          "Educational Specialist",
        ],
      },
    ],
  },
  {
    id: createFacultyId("Faculty of ICT & Computing"),
    name: "Faculty of ICT & Computing",
    description: "Information and communication technology",
    degrees: [
      {
        id: createDegreeId("Bachelor ICT"),
        name: "Bachelor of Information & Communication Technology (ICT)",
        faculty: "ICT & Computing",
        duration: "4 years",
        apsRequirement: 32,
        description:
          "ICT requires English Level 4 and Math/Math Lit at Level 4",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
        ],
        careerProspects: [
          "ICT Specialist",
          "Software Developer",
          "Systems Analyst",
        ],
      },
      {
        id: createDegreeId("Diploma ICT Applications Development"),
        name: "Diploma in ICT (Applications Development)",
        faculty: "ICT & Computing",
        duration: "3 years",
        apsRequirement: 24,
        description: "ICT applications development",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Applications Developer",
          "Software Developer",
          "IT Technician",
        ],
      },
      {
        id: createDegreeId("Higher Certificate ICT User Support"),
        name: "Higher Certificate in ICT (User Support)",
        faculty: "ICT & Computing",
        duration: "1 year",
        apsRequirement: 20,
        description: "ICT user support - 20 APS (Math) / 22 APS (Math Lit)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
        ],
        careerProspects: [
          "IT Support Technician",
          "Help Desk Specialist",
          "User Support Officer",
        ],
      },
    ],
  },
  {
    id: createFacultyId("Faculty of Hospitality & Tourism"),
    name: "Faculty of Hospitality & Tourism",
    description: "Hospitality management and tourism studies",
    degrees: [
      {
        id: createDegreeId("Diploma Hospitality Management"),
        name: "Diploma in Hospitality Management",
        faculty: "Hospitality & Tourism",
        duration: "3 years",
        apsRequirement: 24,
        description:
          "Hospitality management - 24 APS (Math) / 25 APS (Math Lit)",
        subjects: [{ name: "English", level: 4, isRequired: true }],
        careerProspects: [
          "Hospitality Manager",
          "Hotel Manager",
          "Event Coordinator",
        ],
      },
      {
        id: createDegreeId("Higher Certificate Event Management"),
        name: "Higher Certificate in Event Management",
        faculty: "Hospitality & Tourism",
        duration: "1 year",
        apsRequirement: 19,
        description: "Event management - 19 APS (Math) / 21 APS (Math Lit)",
        subjects: [{ name: "English", level: 4, isRequired: true }],
        careerProspects: [
          "Event Coordinator",
          "Event Planner",
          "Functions Manager",
        ],
      },
    ],
  },
];
export const CPUT_FACULTIES: Faculty[] = [
  {
    id: createFacultyId("Faculty of Agriculture & Natural Sciences"),
    name: "Faculty of Agriculture & Natural Sciences",
    description:
      "Agricultural sciences, natural sciences, and applied sciences",
    degrees: [
      {
        id: createDegreeId("Diploma Agriculture"),
        name: "Diploma in Agriculture",
        faculty: "Agriculture & Natural Sciences",
        duration: "3 years",
        apsRequirement: 28,
        description:
          "Agriculture - 28 APS (with Maths) / 29 APS (with Tech Maths); mainstream requires 30 APS w/Maths or 31 APS w/Tech Maths",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Life Sciences", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Agricultural Technician",
          "Farm Manager",
          "Agricultural Consultant",
        ],
      },
      {
        id: createDegreeId("Diploma Agricultural Management"),
        name: "Diploma in Agricultural Management",
        faculty: "Agriculture & Natural Sciences",
        duration: "3 years",
        apsRequirement: 28,
        description:
          "Agricultural management - 28 APS (w/Maths) / 29 APS (Tech Maths) / 30 APS (Maths Literacy); mainstream 30/31/32 APS respectively",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Life Sciences", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Agricultural Manager",
          "Farm Business Manager",
          "Agricultural Advisor",
        ],
      },
      {
        id: createDegreeId("Diploma Analytical Chemistry"),
        name: "Diploma in Analytical Chemistry",
        faculty: "Agriculture & Natural Sciences",
        duration: "3 years",
        apsRequirement: 28,
        description:
          "Analytical chemistry - 28 APS (Maths) or 29 APS (Tech Maths); mainstream 30/31 APS",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Physical Sciences", level: 5, isRequired: true },
          { name: "Mathematics", level: 5, isRequired: true },
        ],
        careerProspects: [
          "Analytical Chemist",
          "Laboratory Technician",
          "Quality Control Analyst",
        ],
      },
      {
        id: createDegreeId("Diploma Biotechnology"),
        name: "Diploma in Biotechnology",
        faculty: "Agriculture & Natural Sciences",
        duration: "3 years",
        apsRequirement: 28,
        description:
          "Biotechnology - 28 APS (Maths) or 29 APS (Tech Maths); mainstream 30/31 APS",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Life Sciences", level: 5, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Biotechnologist",
          "Research Technician",
          "Laboratory Analyst",
        ],
      },
      {
        id: createDegreeId("Diploma Consumer Science Food Nutrition"),
        name: "Diploma in Consumer Science: Food & Nutrition",
        faculty: "Agriculture & Natural Sciences",
        duration: "3 years",
        apsRequirement: 26,
        description:
          "Consumer science: food & nutrition - 26 APS (Maths) / 27 APS (Tech Maths); mainstream 28/29 APS",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Life Sciences", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Food Technologist",
          "Nutritionist",
          "Food Safety Officer",
        ],
      },
      {
        id: createDegreeId("Diploma Environmental Management"),
        name: "Diploma in Environmental Management",
        faculty: "Agriculture & Natural Sciences",
        duration: "3 years",
        apsRequirement: 26,
        description:
          "Environmental management - 26 APS (Maths) / 27 APS (Tech Maths) / 28 APS (Maths Lit); mainstream 28/29/30 APS",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Life Sciences", level: 4, isRequired: true },
          { name: "Geography", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Environmental Manager",
          "Environmental Consultant",
          "Sustainability Officer",
        ],
      },
    ],
  },
  {
    id: createFacultyId("Faculty of Health & Wellness Sciences"),
    name: "Faculty of Health & Wellness Sciences",
    description: "Health sciences and medical technology",
    degrees: [
      {
        id: createDegreeId(
          "Bachelor Health Sciences Medical Laboratory Science",
        ),
        name: "Bachelor of Health Sciences: Medical Laboratory Science",
        faculty: "Health & Wellness Sciences",
        duration: "4 years",
        apsRequirement: 38,
        description:
          "Medical laboratory science - 38+ APS (Mainstream) / 30–37 APS (Extended)",
        subjects: [
          { name: "English", level: 5, isRequired: true },
          { name: "Mathematics", level: 5, isRequired: true },
          { name: "Physical Sciences", level: 6, isRequired: true },
          { name: "Life Sciences", level: 6, isRequired: true },
        ],
        careerProspects: [
          "Medical Laboratory Scientist",
          "Laboratory Manager",
          "Research Technologist",
        ],
      },
    ],
  },
];
export const CUT_FACULTIES: Faculty[] = [
  {
    id: createFacultyId(
      "Faculty of Engineering, Built Environment & Information Technology",
    ),
    name: "Faculty of Engineering, Built Environment & Information Technology",
    description: "Engineering, construction, and information technology",
    degrees: [
      {
        id: createDegreeId("Diploma Civil Engineering"),
        name: "Diploma in Civil Engineering",
        faculty: "Engineering, Built Environment & Information Technology",
        duration: "3 years",
        apsRequirement: 27,
        description:
          "Civil engineering - 27 APS (NSC 2008+) or 32 APS for degree + subject-level requirements",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Physical Sciences", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Civil Engineering Technician",
          "Construction Supervisor",
          "Project Coordinator",
        ],
      },
      {
        id: createDegreeId("Diploma Mechanical Engineering Technology"),
        name: "Diploma in Mechanical Engineering Technology",
        faculty: "Engineering, Built Environment & Information Technology",
        duration: "3 years",
        apsRequirement: 27,
        description:
          "Mechanical engineering technology - 27 APS plus subject-level thresholds",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Physical Sciences", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Mechanical Engineering Technician",
          "Maintenance Engineer",
          "Manufacturing Technician",
        ],
      },
      {
        id: createDegreeId("Bachelor Engineering Technology Mechanical"),
        name: "Bachelor of Engineering Technology in Mechanical Engineering",
        faculty: "Engineering, Built Environment & Information Technology",
        duration: "4 years",
        apsRequirement: 32,
        description:
          "Mechanical engineering technology - 32 APS, with subject-level conditions",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 5, isRequired: true },
          { name: "Physical Sciences", level: 5, isRequired: true },
        ],
        careerProspects: [
          "Mechanical Engineering Technologist",
          "Design Engineer",
          "Production Manager",
        ],
      },
      {
        id: createDegreeId("Diploma Information Technology"),
        name: "Diploma in Information Technology",
        faculty: "Engineering, Built Environment & Information Technology",
        duration: "3 years",
        apsRequirement: 27,
        description:
          "Information technology - 27 APS plus English & Maths levels",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
        ],
        careerProspects: [
          "IT Technician",
          "Software Developer",
          "Systems Administrator",
        ],
      },
      {
        id: createDegreeId("Bachelor IT BTech"),
        name: "Bachelor's-level IT (BTech/Bachelor)",
        faculty: "Engineering, Built Environment & Information Technology",
        duration: "4 years",
        apsRequirement: 30,
        description: "Bachelor-level IT - 30 APS+ depending on programme",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
        ],
        careerProspects: [
          "IT Professional",
          "Software Engineer",
          "Systems Analyst",
        ],
      },
    ],
  },
  {
    id: createFacultyId("Faculty of Health & Environmental Sciences"),
    name: "Faculty of Health & Environmental Sciences",
    description: "Health sciences and environmental studies",
    degrees: [
      {
        id: createDegreeId(
          "Bachelor Health Sciences Medical Laboratory Sciences",
        ),
        name: "Bachelor of Health Sciences: Medical Laboratory Sciences",
        faculty: "Health & Environmental Sciences",
        duration: "4 years",
        apsRequirement: 30,
        description: "Medical laboratory sciences",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Physical Sciences", level: 5, isRequired: true },
          { name: "Life Sciences", level: 5, isRequired: true },
        ],
        careerProspects: [
          "Medical Laboratory Scientist",
          "Laboratory Manager",
          "Health Researcher",
        ],
      },
      {
        id: createDegreeId("Diploma Environmental Health"),
        name: "Diploma in Environmental Health",
        faculty: "Health & Environmental Sciences",
        duration: "3 years",
        apsRequirement: 27,
        description: "Environmental health and safety",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Life Sciences", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Environmental Health Officer",
          "Health Inspector",
          "Public Health Officer",
        ],
      },
      {
        id: createDegreeId("Diploma Dental Assisting"),
        name: "Diploma in Dental Assisting",
        faculty: "Health & Environmental Sciences",
        duration: "3 years",
        apsRequirement: 27,
        description: "Dental assisting and oral health",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Life Sciences", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Dental Assistant",
          "Oral Health Educator",
          "Dental Practice Manager",
        ],
      },
    ],
  },
  {
    id: createFacultyId("Faculty of Management Sciences & Humanities"),
    name: "Faculty of Management Sciences & Humanities",
    description: "Business management, commerce, and humanities",
    degrees: [
      {
        id: createDegreeId("Diploma Public Management"),
        name: "Diploma in Public Management",
        faculty: "Management Sciences & Humanities",
        duration: "3 years",
        apsRequirement: 27,
        description: "Public sector management",
        subjects: [{ name: "English", level: 4, isRequired: true }],
        careerProspects: [
          "Public Manager",
          "Government Administrator",
          "Policy Officer",
        ],
      },
      {
        id: createDegreeId("Diploma Marketing"),
        name: "Diploma in Marketing",
        faculty: "Management Sciences & Humanities",
        duration: "3 years",
        apsRequirement: 27,
        description: "Marketing and business promotion",
        subjects: [{ name: "English", level: 4, isRequired: true }],
        careerProspects: [
          "Marketing Officer",
          "Sales Representative",
          "Brand Coordinator",
        ],
      },
      {
        id: createDegreeId("Diploma Internal Auditing"),
        name: "Diploma in Internal Auditing",
        faculty: "Management Sciences & Humanities",
        duration: "3 years",
        apsRequirement: 28,
        description: "Internal auditing and compliance",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Internal Auditor",
          "Compliance Officer",
          "Risk Analyst",
        ],
      },
      {
        id: createDegreeId("Diploma Office Management Technology"),
        name: "Diploma in Office Management & Technology",
        faculty: "Management Sciences & Humanities",
        duration: "3 years",
        apsRequirement: 27,
        description: "Office management and administrative technology",
        subjects: [{ name: "English", level: 4, isRequired: true }],
        careerProspects: [
          "Office Manager",
          "Administrative Coordinator",
          "Executive Assistant",
        ],
      },
      {
        id: createDegreeId("Bachelor Hospitality Management"),
        name: "Bachelor of Hospitality Management",
        faculty: "Management Sciences & Humanities",
        duration: "4 years",
        apsRequirement: 30,
        description: "Hospitality and tourism management",
        subjects: [{ name: "English", level: 4, isRequired: true }],
        careerProspects: [
          "Hospitality Manager",
          "Hotel Manager",
          "Event Coordinator",
        ],
      },
      {
        id: createDegreeId("Bachelor Accountancy"),
        name: "Bachelor of Accountancy",
        faculty: "Management Sciences & Humanities",
        duration: "4 years",
        apsRequirement: 30,
        description: "Professional accounting education",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
        ],
        careerProspects: ["Accountant", "Financial Manager", "Auditor"],
      },
      {
        id: createDegreeId("Bachelor Tourism Management"),
        name: "Bachelor of Tourism Management",
        faculty: "Management Sciences & Humanities",
        duration: "4 years",
        apsRequirement: 30,
        description: "Tourism development and management",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Geography", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Tourism Manager",
          "Destination Developer",
          "Tourism Consultant",
        ],
      },
    ],
  },
  {
    id: createFacultyId("Faculty of Education"),
    name: "Faculty of Education",
    description: "Teacher education and educational development",
    degrees: [
      {
        id: createDegreeId("Bachelor Education Foundation Phase"),
        name: "Bachelor of Education (Foundation Phase)",
        faculty: "Education",
        duration: "4 years",
        apsRequirement: 27,
        description:
          "Foundation phase teaching - 27 APS with subject-level criteria",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Foundation Phase Teacher",
          "Primary School Teacher",
          "Educational Specialist",
        ],
      },
      {
        id: createDegreeId("Bachelor Education SP FET Various Streams"),
        name: "Bachelor of Education (SP & FET – various streams like Economics, Natural Science, Languages, Maths, Computer Science)",
        faculty: "Education",
        duration: "4 years",
        apsRequirement: 27,
        description: "Senior phase and FET teaching in various subjects",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Teaching Subject", level: 4, isRequired: true },
        ],
        careerProspects: [
          "High School Teacher",
          "Subject Specialist",
          "Educational Manager",
        ],
      },
    ],
  },
];
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
