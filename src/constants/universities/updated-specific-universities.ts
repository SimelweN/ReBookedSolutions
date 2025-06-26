import { Faculty, Degree } from "@/types/university";

/**
 * UPDATED SPECIFIC UNIVERSITY DATA
 *
 * This file contains the updated faculty, program, and APS data for specific universities
 * as provided in the latest data update. These override the general course database.
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
          "Policy Advisor",
          "Diplomat",
        ],
      },
      {
        id: createDegreeId("Bachelor of Psychology"),
        name: "Bachelor of Psychology",
        faculty: "Humanities",
        duration: "3 years",
        apsRequirement: 25,
        description:
          "Comprehensive study of human behavior and mental processes",
        subjects: [
          { name: "English", level: 5, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Life Sciences", level: 4, isRequired: false },
        ],
        careerProspects: [
          "Clinical Psychologist",
          "Educational Psychologist",
          "Counselor",
          "Researcher",
        ],
      },
      {
        id: createDegreeId("Bachelor of Arts Criminology Psychology Extended"),
        name: "Bachelor of Arts (Criminology & Psychology Stream) Extended Curriculum Programme",
        faculty: "Humanities",
        duration: "4 years",
        apsRequirement: 24,
        description:
          "Extended program with foundational support for criminology and psychology",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 3, isRequired: true },
        ],
        careerProspects: [
          "Criminologist",
          "Psychologist",
          "Social Worker",
          "Police Officer",
        ],
      },
      {
        id: createDegreeId("Bachelor of Social Work"),
        name: "Bachelor of Social Work",
        faculty: "Humanities",
        duration: "4 years",
        apsRequirement: 25,
        description: "Professional social work training and practice",
        subjects: [
          { name: "English", level: 5, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Social Worker",
          "Community Development Worker",
          "Family Counselor",
          "NGO Manager",
        ],
      },
      {
        id: createDegreeId("Bachelor of Arts Languages"),
        name: "Bachelor of Arts (Languages Stream)",
        faculty: "Humanities",
        duration: "3 years",
        apsRequirement: 25,
        description: "Study of language, literature, and linguistics",
        subjects: [
          { name: "English", level: 6, isRequired: true },
          { name: "Additional Language", level: 5, isRequired: true },
        ],
        careerProspects: [
          "Translator",
          "Interpreter",
          "Language Teacher",
          "Editor",
        ],
      },
      {
        id: createDegreeId("Bachelor of Arts Translation Linguistics"),
        name: "Bachelor of Arts (Translation and Linguistics Stream)",
        faculty: "Humanities",
        duration: "3 years",
        apsRequirement: 25,
        description: "Professional translation and linguistic studies",
        subjects: [
          { name: "English", level: 6, isRequired: true },
          { name: "Additional Language", level: 5, isRequired: true },
        ],
        careerProspects: [
          "Professional Translator",
          "Linguist",
          "Interpreter",
          "Language Specialist",
        ],
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
          "Archivist",
          "Data Analyst",
        ],
      },
      {
        id: createDegreeId(
          "Bachelor of Arts Contemporary English Multilingual",
        ),
        name: "Bachelor of Arts in Contemporary English and Multilingual Studies",
        faculty: "Humanities",
        duration: "3 years",
        apsRequirement: 25,
        description: "Modern English studies with multilingual focus",
        subjects: [
          { name: "English", level: 6, isRequired: true },
          { name: "Additional Language", level: 5, isRequired: true },
        ],
        careerProspects: [
          "Language Teacher",
          "Translator",
          "Communications Specialist",
          "Editor",
        ],
      },
      {
        id: createDegreeId("Bachelor of Arts Communication Studies"),
        name: "Bachelor of Arts in Communication Studies",
        faculty: "Humanities",
        duration: "3 years",
        apsRequirement: 25,
        description: "Communication theory and media studies",
        subjects: [
          { name: "English", level: 5, isRequired: true },
          { name: "History", level: 4, isRequired: false },
        ],
        careerProspects: [
          "Communications Manager",
          "PR Specialist",
          "Journalist",
          "Media Producer",
        ],
      },
      {
        id: createDegreeId("Bachelor of Arts Media Studies"),
        name: "Bachelor of Arts in Media Studies",
        faculty: "Humanities",
        duration: "3 years",
        apsRequirement: 25,
        description: "Media production and digital communication",
        subjects: [
          { name: "English", level: 5, isRequired: true },
          { name: "Visual Arts", level: 4, isRequired: false },
        ],
        careerProspects: [
          "Media Producer",
          "Journalist",
          "Content Creator",
          "Digital Marketing Specialist",
        ],
      },
      {
        id: createDegreeId("Bachelor of Arts Media Studies Extended"),
        name: "Bachelor of Arts in Media Studies Extended Curriculum Programme",
        faculty: "Humanities",
        duration: "4 years",
        apsRequirement: 23,
        description: "Extended media studies program with foundational support",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Visual Arts", level: 3, isRequired: false },
        ],
        careerProspects: [
          "Media Producer",
          "Journalist",
          "Content Creator",
          "Digital Marketing Specialist",
        ],
      },
    ],
  },
  {
    id: createFacultyId("Faculty of Management and Law"),
    name: "Faculty of Management and Law",
    description: "Business, commerce, administration, and legal studies",
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
          { name: "Accounting", level: 5, isRequired: false },
        ],
        careerProspects: [
          "Chartered Accountant",
          "Financial Manager",
          "Auditor",
          "Tax Consultant",
        ],
      },
      {
        id: createDegreeId("Bachelor of Commerce Accountancy"),
        name: "Bachelor of Commerce in Accountancy",
        faculty: "Management and Law",
        duration: "3 years",
        apsRequirement: 28,
        description: "Commerce degree with accounting specialization",
        subjects: [
          { name: "Mathematics", level: 5, isRequired: true },
          { name: "English", level: 5, isRequired: true },
          { name: "Accounting", level: 4, isRequired: false },
        ],
        careerProspects: [
          "Accountant",
          "Financial Analyst",
          "Business Manager",
          "Auditor",
        ],
      },
      {
        id: createDegreeId("Bachelor of Commerce Accountancy Extended"),
        name: "Bachelor of Commerce in Accountancy Extended Curriculum Programme",
        faculty: "Management and Law",
        duration: "4 years",
        apsRequirement: 26,
        description: "Extended commerce and accountancy program",
        subjects: [
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "English", level: 5, isRequired: true },
        ],
        careerProspects: [
          "Accountant",
          "Financial Analyst",
          "Business Manager",
          "Auditor",
        ],
      },
      {
        id: createDegreeId("Bachelor of Commerce Human Resources"),
        name: "Bachelor of Commerce in Human Resources Management",
        faculty: "Management and Law",
        duration: "3 years",
        apsRequirement: 26,
        description: "Human resource management and organizational behavior",
        subjects: [
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "English", level: 5, isRequired: true },
          { name: "Business Studies", level: 4, isRequired: false },
        ],
        careerProspects: [
          "HR Manager",
          "Recruitment Specialist",
          "Training Manager",
          "Employee Relations",
        ],
      },
      {
        id: createDegreeId("Bachelor of Commerce Business Management"),
        name: "Bachelor of Commerce in Business Management",
        faculty: "Management and Law",
        duration: "3 years",
        apsRequirement: 26,
        description: "Comprehensive business management education",
        subjects: [
          { name: "Mathematics", level: 5, isRequired: true },
          { name: "English", level: 5, isRequired: true },
          { name: "Business Studies", level: 4, isRequired: false },
        ],
        careerProspects: [
          "Business Manager",
          "Operations Manager",
          "Project Manager",
          "Entrepreneur",
        ],
      },
      {
        id: createDegreeId("Bachelor of Commerce Business Management Extended"),
        name: "Bachelor of Commerce in Business Management Extended Curriculum Programme",
        faculty: "Management and Law",
        duration: "4 years",
        apsRequirement: 22,
        description:
          "Extended business management program with foundational support",
        subjects: [
          { name: "Mathematics", level: 3, isRequired: true },
          { name: "English", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Business Manager",
          "Operations Manager",
          "Project Manager",
          "Entrepreneur",
        ],
      },
      {
        id: createDegreeId("Bachelor of Commerce Economics"),
        name: "Bachelor of Commerce in Economics",
        faculty: "Management and Law",
        duration: "3 years",
        apsRequirement: 26,
        description: "Economic theory and business applications",
        subjects: [
          { name: "Mathematics", level: 6, isRequired: true },
          { name: "English", level: 5, isRequired: true },
          { name: "Economics", level: 4, isRequired: false },
        ],
        careerProspects: [
          "Economist",
          "Financial Analyst",
          "Policy Analyst",
          "Investment Consultant",
        ],
      },
      {
        id: createDegreeId("Bachelor of Commerce Economics Extended"),
        name: "Bachelor of Commerce in Economics Extended Curriculum Programme",
        faculty: "Management and Law",
        duration: "4 years",
        apsRequirement: 22,
        description: "Extended economics program with foundational support",
        subjects: [
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "English", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Economist",
          "Financial Analyst",
          "Policy Analyst",
          "Investment Consultant",
        ],
      },
      {
        id: createDegreeId("Bachelor of Administration"),
        name: "Bachelor of Administration",
        faculty: "Management and Law",
        duration: "3 years",
        apsRequirement: 26,
        description: "Public and business administration",
        subjects: [
          { name: "English", level: 5, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Administrator",
          "Government Official",
          "Public Manager",
          "Project Coordinator",
        ],
      },
      {
        id: createDegreeId("Bachelor of Administration Local Government"),
        name: "Bachelor of Administration in Local Government",
        faculty: "Management and Law",
        duration: "3 years",
        apsRequirement: 26,
        description: "Local government administration and management",
        subjects: [
          { name: "English", level: 5, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Local Government Manager",
          "Municipal Official",
          "Public Administrator",
          "Policy Advisor",
        ],
      },
      {
        id: createDegreeId("Bachelor of Development Planning Management"),
        name: "Bachelor of Development in Planning and Management",
        faculty: "Management and Law",
        duration: "3 years",
        apsRequirement: 26,
        description: "Development planning and project management",
        subjects: [
          { name: "English", level: 5, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Geography", level: 4, isRequired: false },
        ],
        careerProspects: [
          "Development Planner",
          "Project Manager",
          "Community Development Officer",
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
          { name: "English", level: 6, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "History", level: 4, isRequired: false },
        ],
        careerProspects: [
          "Advocate",
          "Attorney",
          "Legal Advisor",
          "Magistrate",
          "Corporate Lawyer",
        ],
      },
      {
        id: createDegreeId("Bachelor of Laws LLB Extended"),
        name: "Bachelor of Laws (LLB) Extended Curriculum Programme",
        faculty: "Management and Law",
        duration: "5 years",
        apsRequirement: 26,
        description: "Extended law program with foundational support",
        subjects: [
          { name: "English", level: 5, isRequired: true },
          { name: "Mathematics", level: 3, isRequired: true },
        ],
        careerProspects: [
          "Advocate",
          "Attorney",
          "Legal Advisor",
          "Magistrate",
          "Corporate Lawyer",
        ],
      },
    ],
  },
  {
    id: createFacultyId("Faculty of Science and Agriculture"),
    name: "Faculty of Science and Agriculture",
    description: "Science, agriculture, and environmental studies programs",
    degrees: [
      {
        id: createDegreeId("Bachelor of Agricultural Management"),
        name: "Bachelor of Agricultural Management",
        faculty: "Science and Agriculture",
        duration: "3 years",
        apsRequirement: 24,
        description: "Agricultural business and farm management",
        subjects: [
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Life Sciences", level: 5, isRequired: true },
          { name: "English", level: 5, isRequired: true },
        ],
        careerProspects: [
          "Farm Manager",
          "Agricultural Consultant",
          "Agribusiness Manager",
          "Agricultural Economist",
        ],
      },
      {
        id: createDegreeId(
          "Bachelor of Science Agriculture Agricultural Economics",
        ),
        name: "Bachelor of Science in Agriculture in Agricultural Economics",
        faculty: "Science and Agriculture",
        duration: "4 years",
        apsRequirement: 24,
        description: "Economics applied to agricultural systems",
        subjects: [
          { name: "Mathematics", level: 5, isRequired: true },
          { name: "Life Sciences", level: 5, isRequired: true },
          { name: "English", level: 5, isRequired: true },
        ],
        careerProspects: [
          "Agricultural Economist",
          "Farm Manager",
          "Agricultural Policy Analyst",
          "Rural Development Specialist",
        ],
      },
      {
        id: createDegreeId("Bachelor of Science Agriculture Plant Production"),
        name: "Bachelor of Science in Agriculture in Plant Production",
        faculty: "Science and Agriculture",
        duration: "4 years",
        apsRequirement: 24,
        description: "Crop science and plant production systems",
        subjects: [
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Life Sciences", level: 6, isRequired: true },
          { name: "Physical Sciences", level: 5, isRequired: true },
        ],
        careerProspects: [
          "Crop Scientist",
          "Plant Breeder",
          "Agricultural Researcher",
          "Farm Manager",
        ],
      },
      {
        id: createDegreeId("Bachelor of Science Agriculture Animal Production"),
        name: "Bachelor of Science in Agriculture in Animal Production",
        faculty: "Science and Agriculture",
        duration: "4 years",
        apsRequirement: 24,
        description: "Animal science and livestock production",
        subjects: [
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Life Sciences", level: 6, isRequired: true },
          { name: "Physical Sciences", level: 4, isRequired: false },
        ],
        careerProspects: [
          "Animal Scientist",
          "Livestock Specialist",
          "Veterinary Technician",
          "Farm Manager",
        ],
      },
      {
        id: createDegreeId("Bachelor of Science Agriculture Soil Science"),
        name: "Bachelor of Science in Agriculture in Soil Science",
        faculty: "Science and Agriculture",
        duration: "4 years",
        apsRequirement: 25,
        description: "Soil management and conservation",
        subjects: [
          { name: "Mathematics", level: 5, isRequired: true },
          { name: "Physical Sciences", level: 6, isRequired: true },
          { name: "Life Sciences", level: 5, isRequired: true },
        ],
        careerProspects: [
          "Soil Scientist",
          "Environmental Consultant",
          "Agricultural Researcher",
          "Conservation Specialist",
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
        description: "Environmental science and natural resource management",
        subjects: [
          { name: "Life Sciences", level: 5, isRequired: true },
          { name: "Mathematics", level: 5, isRequired: true },
          { name: "Geography", level: 4, isRequired: false },
        ],
        careerProspects: [
          "Environmental Scientist",
          "Conservation Officer",
          "Resource Manager",
          "Environmental Consultant",
        ],
      },
      {
        id: createDegreeId("Bachelor of Science Water Sanitation Sciences"),
        name: "Bachelor of Science in Water & Sanitation Sciences",
        faculty: "Science and Agriculture",
        duration: "3 years",
        apsRequirement: 24,
        description: "Water management and sanitation engineering",
        subjects: [
          { name: "Mathematics", level: 5, isRequired: true },
          { name: "Physical Sciences", level: 5, isRequired: true },
          { name: "Life Sciences", level: 4, isRequired: false },
        ],
        careerProspects: [
          "Water Engineer",
          "Sanitation Specialist",
          "Environmental Engineer",
          "Water Quality Analyst",
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
          { name: "Mathematics", level: 7, isRequired: true },
          { name: "Physical Sciences", level: 5, isRequired: false },
          { name: "English", level: 5, isRequired: true },
        ],
        careerProspects: [
          "Mathematician",
          "Data Analyst",
          "Statistician",
          "Research Scientist",
        ],
      },
      {
        id: createDegreeId(
          "Bachelor of Science Mathematical Sciences Extended",
        ),
        name: "Bachelor of Science (Mathematical Sciences Stream) Extended Curriculum Programme",
        faculty: "Science and Agriculture",
        duration: "4 years",
        apsRequirement: 22,
        description: "Extended mathematics program with foundational support",
        subjects: [
          { name: "Mathematics", level: 5, isRequired: true },
          { name: "English", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Mathematician",
          "Data Analyst",
          "Statistician",
          "Research Scientist",
        ],
      },
      {
        id: createDegreeId("Bachelor of Science Life Sciences"),
        name: "Bachelor of Science (Life Sciences Stream)",
        faculty: "Science and Agriculture",
        duration: "3 years",
        apsRequirement: 24,
        description: "Biological sciences and life systems",
        subjects: [
          { name: "Life Sciences", level: 6, isRequired: true },
          { name: "Mathematics", level: 5, isRequired: true },
          { name: "Physical Sciences", level: 5, isRequired: false },
        ],
        careerProspects: [
          "Biologist",
          "Research Scientist",
          "Biotechnologist",
          "Environmental Scientist",
        ],
      },
      {
        id: createDegreeId("Bachelor of Science Life Sciences Extended"),
        name: "Bachelor of Science (Life Sciences Stream) Extended Curriculum Programme",
        faculty: "Science and Agriculture",
        duration: "4 years",
        apsRequirement: 22,
        description: "Extended life sciences program with foundational support",
        subjects: [
          { name: "Life Sciences", level: 5, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Biologist",
          "Research Scientist",
          "Biotechnologist",
          "Environmental Scientist",
        ],
      },
      {
        id: createDegreeId("Bachelor of Science Physical Sciences"),
        name: "Bachelor of Science (Physical Sciences Stream)",
        faculty: "Science and Agriculture",
        duration: "3 years",
        apsRequirement: 26,
        description: "Physics, chemistry, and physical sciences",
        subjects: [
          { name: "Physical Sciences", level: 6, isRequired: true },
          { name: "Mathematics", level: 6, isRequired: true },
          { name: "English", level: 5, isRequired: true },
        ],
        careerProspects: [
          "Physicist",
          "Chemist",
          "Research Scientist",
          "Laboratory Technician",
        ],
      },
      {
        id: createDegreeId("Bachelor of Science Physical Sciences Extended"),
        name: "Bachelor of Science (Physical Sciences Stream) Extended Curriculum Programme",
        faculty: "Science and Agriculture",
        duration: "4 years",
        apsRequirement: 22,
        description:
          "Extended physical sciences program with foundational support",
        subjects: [
          { name: "Physical Sciences", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Physicist",
          "Chemist",
          "Research Scientist",
          "Laboratory Technician",
        ],
      },
      {
        id: createDegreeId("Bachelor of Science Geology"),
        name: "Bachelor of Science in Geology",
        faculty: "Science and Agriculture",
        duration: "3 years",
        apsRequirement: 26,
        description: "Earth sciences and geological studies",
        subjects: [
          { name: "Physical Sciences", level: 6, isRequired: true },
          { name: "Mathematics", level: 6, isRequired: true },
          { name: "Geography", level: 5, isRequired: false },
        ],
        careerProspects: [
          "Geologist",
          "Mining Geologist",
          "Environmental Geologist",
          "Geotechnical Engineer",
        ],
      },
    ],
  },
  {
    id: createFacultyId("Faculty of Health Sciences"),
    name: "Faculty of Health Sciences",
    description: "Medical and health professional programs",
    degrees: [
      {
        id: createDegreeId("Bachelor of Medicine Surgery"),
        name: "Bachelor of Medicine & Bachelor of Surgery",
        faculty: "Health Sciences",
        duration: "6 years",
        apsRequirement: 27,
        description: "Medical degree with comprehensive clinical training",
        subjects: [
          { name: "Mathematics", level: 6, isRequired: true },
          { name: "Physical Sciences", level: 6, isRequired: true },
          { name: "Life Sciences", level: 6, isRequired: true },
          { name: "English", level: 5, isRequired: true },
        ],
        careerProspects: [
          "Medical Doctor",
          "Specialist Physician",
          "General Practitioner",
          "Medical Researcher",
        ],
      },
      {
        id: createDegreeId("Bachelor of Science Medical Studies"),
        name: "Bachelor of Science in Medical Studies",
        faculty: "Health Sciences",
        duration: "3 years",
        apsRequirement: 26,
        description: "Pre-medical and medical sciences foundation",
        subjects: [
          { name: "Mathematics", level: 5, isRequired: true },
          { name: "Physical Sciences", level: 6, isRequired: true },
          { name: "Life Sciences", level: 6, isRequired: true },
        ],
        careerProspects: [
          "Medical Researcher",
          "Laboratory Technician",
          "Healthcare Administrator",
          "Medical Sales",
        ],
      },
      {
        id: createDegreeId("Bachelor of Science Dietetics"),
        name: "Bachelor of Science in Dietetics",
        faculty: "Health Sciences",
        duration: "4 years",
        apsRequirement: 26,
        description: "Nutrition science and dietary therapy",
        subjects: [
          { name: "Mathematics", level: 5, isRequired: true },
          { name: "Life Sciences", level: 6, isRequired: true },
          { name: "Physical Sciences", level: 5, isRequired: true },
        ],
        careerProspects: [
          "Dietitian",
          "Nutritionist",
          "Sports Nutritionist",
          "Clinical Dietitian",
        ],
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
          { name: "Physical Sciences", level: 6, isRequired: true },
          { name: "Life Sciences", level: 6, isRequired: true },
        ],
        careerProspects: [
          "Optometrist",
          "Vision Therapist",
          "Eye Care Specialist",
          "Vision Researcher",
        ],
      },
      {
        id: createDegreeId("Bachelor of Nursing"),
        name: "Bachelor of Nursing",
        faculty: "Health Sciences",
        duration: "4 years",
        apsRequirement: 26,
        description: "Professional nursing education and practice",
        subjects: [
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Life Sciences", level: 5, isRequired: true },
          { name: "English", level: 5, isRequired: true },
        ],
        careerProspects: [
          "Professional Nurse",
          "Nurse Manager",
          "Clinical Nurse Specialist",
          "Community Health Nurse",
        ],
      },
      {
        id: createDegreeId("Bachelor of Pharmacy"),
        name: "Bachelor of Pharmacy",
        faculty: "Health Sciences",
        duration: "4 years",
        apsRequirement: 27,
        description: "Pharmaceutical sciences and practice",
        subjects: [
          { name: "Mathematics", level: 5, isRequired: true },
          { name: "Physical Sciences", level: 6, isRequired: true },
          { name: "Life Sciences", level: 6, isRequired: true },
        ],
        careerProspects: [
          "Pharmacist",
          "Clinical Pharmacist",
          "Pharmaceutical Researcher",
          "Hospital Pharmacist",
        ],
      },
    ],
  },
];

// North-West University (NWU) - Updated Data
export const NWU_FACULTIES: Faculty[] = [
  {
    id: createFacultyId("Faculty of Economic and Management Sciences"),
    name: "Faculty of Economic and Management Sciences",
    description: "Comprehensive business, economics, and management programs",
    degrees: [
      {
        id: createDegreeId("Bachelor of Commerce Accounting"),
        name: "Bachelor of Commerce in Accounting",
        faculty: "Economic and Management Sciences",
        duration: "3 years",
        apsRequirement: 24,
        description: "General commerce accounting program",
        subjects: [
          { name: "Mathematics", level: 5, isRequired: true },
          { name: "English", level: 5, isRequired: true },
          { name: "Accounting", level: 4, isRequired: false },
        ],
        careerProspects: [
          "Accountant",
          "Financial Manager",
          "Auditor",
          "Tax Consultant",
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
          { name: "Accounting", level: 5, isRequired: false },
        ],
        careerProspects: [
          "Chartered Accountant (CA)",
          "Financial Director",
          "Audit Partner",
          "Tax Specialist",
        ],
      },
      {
        id: createDegreeId(
          "Extended Bachelor of Commerce Chartered Accountancy",
        ),
        name: "Extended Bachelor of Commerce in Chartered Accountancy",
        faculty: "Economic and Management Sciences",
        duration: "4 years",
        apsRequirement: 28,
        description:
          "Extended program for chartered accountancy with foundational support",
        subjects: [
          { name: "Mathematics", level: 5, isRequired: true },
          { name: "English", level: 5, isRequired: true },
        ],
        careerProspects: [
          "Chartered Accountant (CA)",
          "Financial Director",
          "Audit Partner",
          "Tax Specialist",
        ],
      },
      {
        id: createDegreeId("Bachelor of Commerce Financial Accountancy"),
        name: "Bachelor of Commerce in Financial Accountancy",
        faculty: "Economic and Management Sciences",
        duration: "3 years",
        apsRequirement: 28,
        description: "Financial accounting and reporting focus",
        subjects: [
          { name: "Mathematics", level: 5, isRequired: true },
          { name: "English", level: 5, isRequired: true },
          { name: "Accounting", level: 5, isRequired: false },
        ],
        careerProspects: [
          "Financial Accountant",
          "Financial Analyst",
          "Management Accountant",
          "Auditor",
        ],
      },
      {
        id: createDegreeId(
          "Extended Bachelor of Commerce Financial Accountancy",
        ),
        name: "Extended Bachelor of Commerce in Financial Accountancy",
        faculty: "Economic and Management Sciences",
        duration: "4 years",
        apsRequirement: 24,
        description: "Extended financial accountancy program",
        subjects: [
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "English", level: 5, isRequired: true },
        ],
        careerProspects: [
          "Financial Accountant",
          "Financial Analyst",
          "Management Accountant",
          "Auditor",
        ],
      },
      {
        id: createDegreeId("Bachelor of Commerce Forensic Accountancy"),
        name: "Bachelor of Commerce in Forensic Accountancy",
        faculty: "Economic and Management Sciences",
        duration: "3 years",
        apsRequirement: 36,
        description: "Forensic accounting and fraud investigation",
        subjects: [
          { name: "Mathematics", level: 6, isRequired: true },
          { name: "English", level: 6, isRequired: true },
          { name: "Accounting", level: 6, isRequired: true },
        ],
        careerProspects: [
          "Forensic Accountant",
          "Fraud Investigator",
          "Litigation Support Specialist",
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
          { name: "English", level: 5, isRequired: true },
          { name: "Accounting", level: 5, isRequired: false },
        ],
        careerProspects: [
          "Management Accountant",
          "Cost Analyst",
          "Financial Controller",
          "Budget Analyst",
        ],
      },
      {
        id: createDegreeId("Bachelor of Commerce Operations Research"),
        name: "Bachelor of Commerce in Operations Research",
        faculty: "Economic and Management Sciences",
        duration: "3 years",
        apsRequirement: 24,
        description: "Mathematical optimization and operations management",
        subjects: [
          { name: "Mathematics", level: 6, isRequired: true },
          { name: "English", level: 5, isRequired: true },
          { name: "Physical Sciences", level: 4, isRequired: false },
        ],
        careerProspects: [
          "Operations Research Analyst",
          "Data Scientist",
          "Supply Chain Analyst",
          "Business Analyst",
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
          { name: "Mathematics", level: 6, isRequired: true },
          { name: "English", level: 5, isRequired: true },
        ],
        careerProspects: [
          "Statistician",
          "Data Scientist",
          "Market Research Analyst",
          "Biostatistician",
        ],
      },
      {
        id: createDegreeId("Extended Bachelor of Commerce Statistics"),
        name: "Extended Bachelor of Commerce in Statistics",
        faculty: "Economic and Management Sciences",
        duration: "4 years",
        apsRequirement: 20,
        description: "Extended statistics program with foundational support",
        subjects: [
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "English", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Statistician",
          "Data Scientist",
          "Market Research Analyst",
          "Biostatistician",
        ],
      },
    ],
  },
  // Continue with other NWU faculties...
];

// Function to get specific faculty data for updated universities
export function getUpdatedUniversityFaculties(
  universityId: string,
): Faculty[] | null {
  const universityFaculties: Record<string, Faculty[]> = {
    ul: UL_FACULTIES,
    nwu: NWU_FACULTIES,
    // Will add others as we continue
  };

  return universityFaculties[universityId] || null;
}

// Export all university specific faculty data
export const UPDATED_UNIVERSITY_DATA = {
  UL_FACULTIES,
  NWU_FACULTIES,
  getUpdatedUniversityFaculties,
};
