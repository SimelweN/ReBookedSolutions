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
