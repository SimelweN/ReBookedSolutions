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
      // Commerce programs
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
      // Additional commerce programs...
      {
        id: createDegreeId(
          "Bachelor of Commerce Business Operations Logistics",
        ),
        name: "Bachelor of Commerce in Business Operations (with Logistics Management)",
        faculty: "Economic and Management Sciences",
        duration: "3 years",
        apsRequirement: 24,
        description:
          "Business operations with logistics management specialization",
        subjects: [
          { name: "Mathematics", level: 5, isRequired: true },
          { name: "English", level: 5, isRequired: true },
          { name: "Business Studies", level: 4, isRequired: false },
        ],
        careerProspects: [
          "Logistics Manager",
          "Supply Chain Manager",
          "Operations Manager",
          "Distribution Manager",
        ],
      },
      // Management programs
      {
        id: createDegreeId("Bachelor of Commerce Human Resource Management"),
        name: "Bachelor of Commerce (Human Resource Management)",
        faculty: "Economic and Management Sciences",
        duration: "3 years",
        apsRequirement: 30,
        description: "Advanced human resource management",
        subjects: [
          { name: "Mathematics", level: 5, isRequired: true },
          { name: "English", level: 5, isRequired: true },
          { name: "Business Studies", level: 4, isRequired: false },
        ],
        careerProspects: [
          "HR Director",
          "Talent Manager",
          "Employee Relations Manager",
          "HR Consultant",
        ],
      },
      // Tourism and Business Management
      {
        id: createDegreeId("Bachelor of Commerce Management Sciences Tourism"),
        name: "Bachelor of Commerce in Management Sciences (with Tourism Management)",
        faculty: "Economic and Management Sciences",
        duration: "3 years",
        apsRequirement: 24,
        description: "Management sciences with tourism specialization",
        subjects: [
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "English", level: 5, isRequired: true },
          { name: "Geography", level: 4, isRequired: false },
        ],
        careerProspects: [
          "Tourism Manager",
          "Travel Consultant",
          "Hotel Manager",
          "Tourism Development Officer",
        ],
      },
    ],
  },
  {
    id: createFacultyId("Faculty of Education"),
    name: "Faculty of Education",
    description: "Teacher education and educational development programs",
    degrees: [
      {
        id: createDegreeId("Bachelor of Education Early Childhood"),
        name: "Bachelor of Education Early Childhood Care and Education",
        faculty: "Education",
        duration: "4 years",
        apsRequirement: 26,
        description: "Early childhood development and education",
        subjects: [
          { name: "English", level: 5, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Life Sciences", level: 4, isRequired: false },
        ],
        careerProspects: [
          "Early Childhood Teacher",
          "Preschool Principal",
          "Child Development Specialist",
          "Educational Consultant",
        ],
      },
      {
        id: createDegreeId("Bachelor of Education Foundation Phase"),
        name: "Bachelor of Education Foundation Phase",
        faculty: "Education",
        duration: "4 years",
        apsRequirement: 26,
        description: "Foundation phase teaching (Grade R-3)",
        subjects: [
          { name: "English", level: 5, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Life Sciences", level: 4, isRequired: false },
        ],
        careerProspects: [
          "Foundation Phase Teacher",
          "Education Specialist",
          "Curriculum Developer",
          "School Principal",
        ],
      },
      {
        id: createDegreeId("Bachelor of Education Intermediate Phase"),
        name: "Bachelor of Education Intermediate Phase",
        faculty: "Education",
        duration: "4 years",
        apsRequirement: 26,
        description: "Intermediate phase teaching (Grade 4-6)",
        subjects: [
          { name: "English", level: 5, isRequired: true },
          { name: "Mathematics", level: 5, isRequired: true },
          { name: "Life Sciences", level: 4, isRequired: false },
        ],
        careerProspects: [
          "Intermediate Phase Teacher",
          "Education Specialist",
          "Curriculum Developer",
          "School Principal",
        ],
      },
      {
        id: createDegreeId("Bachelor of Education Senior Further Education"),
        name: "Bachelor of Education Senior and Further Education",
        faculty: "Education",
        duration: "4 years",
        apsRequirement: 26,
        description: "Senior and FET phase teaching (Grade 7-12)",
        subjects: [
          { name: "English", level: 5, isRequired: true },
          { name: "Mathematics", level: 5, isRequired: true },
          { name: "Teaching Subject", level: 5, isRequired: true },
        ],
        careerProspects: [
          "High School Teacher",
          "Subject Specialist",
          "Education Coordinator",
          "School Principal",
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
        id: createDegreeId("Bachelor of Engineering Multiple Disciplines"),
        name: "Bachelor of Engineering (Chemical, Electrical, Computer & Electronic, Electromechanical, Mechanical, Industrial, Mechatronic)",
        faculty: "Engineering",
        duration: "4 years",
        apsRequirement: 34,
        description:
          "Comprehensive engineering program across multiple disciplines",
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
];

// Walter Sisulu University (WSU) - Updated Data
export const WSU_FACULTIES: Faculty[] = [
  {
    id: createFacultyId("Faculty of Education"),
    name: "Faculty of Education",
    description: "Teacher education and training programs",
    degrees: [
      {
        id: createDegreeId("Bachelor of Education Foundation Phase Teaching"),
        name: "Bachelor of Education in Foundation Phase Teaching",
        faculty: "Education",
        duration: "4 years",
        apsRequirement: 26,
        description: "Foundation phase teacher training (Grade R-3)",
        subjects: [
          { name: "English", level: 5, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Life Sciences", level: 4, isRequired: false },
        ],
        careerProspects: [
          "Foundation Phase Teacher",
          "Education Specialist",
          "Curriculum Developer",
          "School Principal",
        ],
      },
      {
        id: createDegreeId("Bachelor of Education Senior Phase EMS"),
        name: "Bachelor of Education in Senior Phase and Further Education and Training Teaching (Economic & Management Sciences)",
        faculty: "Education",
        duration: "4 years",
        apsRequirement: 26,
        description: "Senior phase EMS teacher training",
        subjects: [
          { name: "English", level: 5, isRequired: true },
          { name: "Mathematics", level: 5, isRequired: true },
          { name: "Economics", level: 4, isRequired: false },
        ],
        careerProspects: [
          "EMS Teacher",
          "Business Studies Teacher",
          "Education Specialist",
          "School Principal",
        ],
      },
      {
        id: createDegreeId("Diploma Adult Community Education"),
        name: "Diploma in Adult and Community Education and Training (ACET)",
        faculty: "Education",
        duration: "3 years",
        apsRequirement: 21,
        description: "Adult and community education training",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 3, isRequired: true },
        ],
        careerProspects: [
          "Adult Educator",
          "Community Development Worker",
          "Training Coordinator",
          "Skills Development Facilitator",
        ],
      },
    ],
  },
  {
    id: createFacultyId("Faculty of Law, Humanities and Social Sciences"),
    name: "Faculty of Law, Humanities and Social Sciences",
    description: "Law, humanities, and social science programs",
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
          { name: "Visual Arts", level: 4, isRequired: false },
        ],
        careerProspects: [
          "Fine Artist",
          "Art Teacher",
          "Gallery Curator",
          "Art Therapist",
        ],
      },
      {
        id: createDegreeId("Bachelor of Arts"),
        name: "Bachelor of Arts",
        faculty: "Law, Humanities and Social Sciences",
        duration: "3 years",
        apsRequirement: 27,
        description: "Liberal arts and humanities education",
        subjects: [
          { name: "English", level: 5, isRequired: true },
          { name: "History", level: 4, isRequired: false },
          { name: "Geography", level: 4, isRequired: false },
        ],
        careerProspects: [
          "Teacher",
          "Writer",
          "Journalist",
          "Cultural Worker",
          "Social Researcher",
        ],
      },
      {
        id: createDegreeId("Bachelor of Social Science"),
        name: "Bachelor of Social Science",
        faculty: "Law, Humanities and Social Sciences",
        duration: "3 years",
        apsRequirement: 27,
        description: "Social sciences and behavioral studies",
        subjects: [
          { name: "English", level: 5, isRequired: true },
          { name: "History", level: 4, isRequired: false },
          { name: "Geography", level: 4, isRequired: false },
        ],
        careerProspects: [
          "Social Researcher",
          "Policy Analyst",
          "Community Development Worker",
          "Government Official",
        ],
      },
      {
        id: createDegreeId("Bachelor of Laws LLB"),
        name: "Bachelor of Laws (LLB)",
        faculty: "Law, Humanities and Social Sciences",
        duration: "4 years",
        apsRequirement: 28,
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
        id: createDegreeId("Bachelor of Social Work"),
        name: "Bachelor of Social Work",
        faculty: "Law, Humanities and Social Sciences",
        duration: "4 years",
        apsRequirement: 28,
        description: "Professional social work training",
        subjects: [
          { name: "English", level: 5, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Life Sciences", level: 4, isRequired: false },
        ],
        careerProspects: [
          "Social Worker",
          "Community Development Worker",
          "Family Counselor",
          "NGO Manager",
        ],
      },
      {
        id: createDegreeId("Bachelor of Psychology"),
        name: "Bachelor of Psychology",
        faculty: "Law, Humanities and Social Sciences",
        duration: "3 years",
        apsRequirement: 28,
        description: "Psychological studies and human behavior",
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
    ],
  },
];

// University of Zululand (UNIZULU) - Updated Data
export const UNIZULU_FACULTIES: Faculty[] = [
  {
    id: createFacultyId("Faculty of Commerce, Administration & Law"),
    name: "Faculty of Commerce, Administration & Law (FCAL)",
    description: "Business, administration, and legal studies",
    degrees: [
      {
        id: createDegreeId("Bachelor of Commerce Accounting"),
        name: "Bachelor of Commerce in Accounting",
        faculty: "Commerce, Administration & Law",
        duration: "3 years",
        apsRequirement: 28,
        description: "Professional accounting education",
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
        id: createDegreeId("Bachelor of Commerce Accounting Science CTA"),
        name: "Bachelor of Commerce in Accounting Science (CTA stream)",
        faculty: "Commerce, Administration & Law",
        duration: "3 years",
        apsRequirement: 28,
        description: "Accounting science with CTA preparation",
        subjects: [
          { name: "Mathematics", level: 5, isRequired: true },
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
        id: createDegreeId("Extended Bachelor of Commerce"),
        name: "Extended Bachelor of Commerce (Extended Programme)",
        faculty: "Commerce, Administration & Law",
        duration: "4 years",
        apsRequirement: 26,
        description: "Extended commerce program with foundational support",
        subjects: [
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "English", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Business Manager",
          "Administrator",
          "Financial Analyst",
          "Marketing Specialist",
        ],
      },
      {
        id: createDegreeId("Bachelor of Administration"),
        name: "Bachelor of Administration",
        faculty: "Commerce, Administration & Law",
        duration: "3 years",
        apsRequirement: 28,
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
        id: createDegreeId("Bachelor of Laws LLB"),
        name: "Bachelor of Laws (LLB)",
        faculty: "Commerce, Administration & Law",
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
    ],
  },
];

// Sol Plaatje University (SPU) - Updated Data
export const SPU_FACULTIES: Faculty[] = [
  {
    id: createFacultyId("Faculty of Education"),
    name: "Faculty of Education",
    description: "Teacher education programs across all phases",
    degrees: [
      {
        id: createDegreeId("Bachelor of Education Foundation Phase"),
        name: "Bachelor of Education (Foundation Phase, Grade R–3)",
        faculty: "Education",
        duration: "4 years",
        apsRequirement: 30,
        description: "Foundation phase teacher training",
        subjects: [
          { name: "English", level: 5, isRequired: true },
          { name: "Mathematics", level: 5, isRequired: true },
          { name: "Life Sciences", level: 4, isRequired: false },
        ],
        careerProspects: [
          "Foundation Phase Teacher",
          "Education Specialist",
          "Curriculum Developer",
          "School Principal",
        ],
      },
      {
        id: createDegreeId("Bachelor of Education Intermediate Phase"),
        name: "Bachelor of Education (Intermediate Phase, Grades 4–6)",
        faculty: "Education",
        duration: "4 years",
        apsRequirement: 30,
        description: "Intermediate phase teacher training",
        subjects: [
          { name: "English", level: 5, isRequired: true },
          { name: "Mathematics", level: 5, isRequired: true },
          { name: "Life Sciences", level: 4, isRequired: false },
        ],
        careerProspects: [
          "Intermediate Phase Teacher",
          "Education Specialist",
          "Curriculum Developer",
          "School Principal",
        ],
      },
      {
        id: createDegreeId("Bachelor of Education Senior FET Phase"),
        name: "Bachelor of Education (Senior & FET Phase, Grades 7–12)",
        faculty: "Education",
        duration: "4 years",
        apsRequirement: 30,
        description: "Senior and FET phase teacher training",
        subjects: [
          { name: "English", level: 5, isRequired: true },
          { name: "Mathematics", level: 5, isRequired: true },
          { name: "Teaching Subject", level: 5, isRequired: true },
        ],
        careerProspects: [
          "High School Teacher",
          "Subject Specialist",
          "Education Coordinator",
          "School Principal",
        ],
      },
    ],
  },
  {
    id: createFacultyId("Faculty of Natural & Applied Sciences"),
    name: "Faculty of Natural & Applied Sciences",
    description: "Science and data science programs",
    degrees: [
      {
        id: createDegreeId("Bachelor of Science BSc"),
        name: "Bachelor of Science (BSc)",
        faculty: "Natural & Applied Sciences",
        duration: "3 years",
        apsRequirement: 30,
        description: "General science degree",
        subjects: [
          { name: "Mathematics", level: 6, isRequired: true },
          { name: "Physical Sciences", level: 6, isRequired: true },
          { name: "Life Sciences", level: 5, isRequired: false },
        ],
        careerProspects: [
          "Research Scientist",
          "Laboratory Technician",
          "Environmental Scientist",
          "Data Analyst",
        ],
      },
      {
        id: createDegreeId("Bachelor of Science Data Science"),
        name: "Bachelor of Science in Data Science",
        faculty: "Natural & Applied Sciences",
        duration: "3 years",
        apsRequirement: 30,
        description: "Modern data science and analytics",
        subjects: [
          { name: "Mathematics", level: 6, isRequired: true },
          { name: "Physical Sciences", level: 5, isRequired: false },
          { name: "English", level: 5, isRequired: true },
        ],
        careerProspects: [
          "Data Scientist",
          "Data Analyst",
          "Machine Learning Engineer",
          "Business Intelligence Analyst",
        ],
      },
    ],
  },
  {
    id: createFacultyId("Faculty of Economic & Management Sciences"),
    name: "Faculty of Economic & Management Sciences (EMS)",
    description: "Business and economics programs",
    degrees: [
      {
        id: createDegreeId("Bachelor of Commerce Accounting"),
        name: "Bachelor of Commerce in Accounting",
        faculty: "Economic & Management Sciences",
        duration: "3 years",
        apsRequirement: 30,
        description: "Professional accounting education",
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
        id: createDegreeId("Bachelor of Commerce Economics"),
        name: "Bachelor of Commerce in Economics",
        faculty: "Economic & Management Sciences",
        duration: "3 years",
        apsRequirement: 30,
        description: "Economic theory and analysis",
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
        id: createDegreeId("Diploma Retail Business Management"),
        name: "Diploma in Retail Business Management",
        faculty: "Economic & Management Sciences",
        duration: "3 years",
        apsRequirement: 25,
        description: "Retail and business management",
        subjects: [
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "English", level: 5, isRequired: true },
          { name: "Business Studies", level: 4, isRequired: false },
        ],
        careerProspects: [
          "Retail Manager",
          "Store Manager",
          "Business Owner",
          "Sales Manager",
        ],
      },
    ],
  },
];

// University of Mpumalanga (UMP) - Updated Data
export const UMP_FACULTIES: Faculty[] = [
  {
    id: createFacultyId("Faculty of Social Sciences"),
    name: "Faculty of Social Sciences",
    description: "Social sciences and humanities programs",
    degrees: [
      {
        id: createDegreeId("Bachelor of Arts General"),
        name: "Bachelor of Arts (General)",
        faculty: "Social Sciences",
        duration: "3 years",
        apsRequirement: 28,
        description: "General arts and humanities education",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 2, isRequired: true },
        ],
        careerProspects: [
          "Teacher",
          "Writer",
          "Journalist",
          "Cultural Worker",
          "Social Researcher",
        ],
      },
      {
        id: createDegreeId("Bachelor of Social Work"),
        name: "Bachelor of Social Work",
        faculty: "Social Sciences",
        duration: "4 years",
        apsRequirement: 32,
        description: "Professional social work training",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 2, isRequired: true },
        ],
        careerProspects: [
          "Social Worker",
          "Community Development Worker",
          "Family Counselor",
          "NGO Manager",
        ],
      },
    ],
  },
  {
    id: createFacultyId("Faculty of Agriculture & Natural Sciences"),
    name: "Faculty of Agriculture & Natural Sciences",
    description: "Agricultural and environmental science programs",
    degrees: [
      {
        id: createDegreeId("Bachelor of Science Agriculture Extension"),
        name: "Bachelor of Science in Agriculture (Agricultural Extension & Rural Resource Management)",
        faculty: "Agriculture & Natural Sciences",
        duration: "4 years",
        apsRequirement: 26,
        description: "Agricultural extension and rural development",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Life Sciences", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Agricultural Extension Officer",
          "Rural Development Specialist",
          "Farm Manager",
          "Agricultural Consultant",
        ],
      },
      {
        id: createDegreeId("Bachelor of Science Forestry"),
        name: "Bachelor of Science in Forestry",
        faculty: "Agriculture & Natural Sciences",
        duration: "4 years",
        apsRequirement: 30,
        description: "Forest science and management",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Life Sciences", level: 5, isRequired: true },
        ],
        careerProspects: [
          "Forester",
          "Conservation Officer",
          "Environmental Consultant",
          "Timber Manager",
        ],
      },
    ],
  },
];

// Cape Peninsula University of Technology (CPUT) - Updated Data
export const CPUT_FACULTIES: Faculty[] = [
  {
    id: createFacultyId("Faculty of Agriculture & Natural Sciences"),
    name: "Faculty of Agriculture & Natural Sciences",
    description: "Agriculture, biotechnology, and natural sciences",
    degrees: [
      {
        id: createDegreeId("Diploma Agriculture"),
        name: "Diploma in Agriculture",
        faculty: "Agriculture & Natural Sciences",
        duration: "3 years",
        apsRequirement: 28,
        description: "Agricultural science and production",
        subjects: [
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Life Sciences", level: 5, isRequired: true },
          { name: "English", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Farm Manager",
          "Agricultural Technician",
          "Extension Officer",
          "Agricultural Sales",
        ],
      },
      {
        id: createDegreeId("Diploma Agricultural Management"),
        name: "Diploma in Agricultural Management",
        faculty: "Agriculture & Natural Sciences",
        duration: "3 years",
        apsRequirement: 28,
        description: "Agricultural business and farm management",
        subjects: [
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Life Sciences", level: 4, isRequired: true },
          { name: "English", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Farm Manager",
          "Agribusiness Manager",
          "Agricultural Consultant",
          "Farm Supervisor",
        ],
      },
      {
        id: createDegreeId("Diploma Biotechnology"),
        name: "Diploma in Biotechnology",
        faculty: "Agriculture & Natural Sciences",
        duration: "3 years",
        apsRequirement: 28,
        description: "Biotechnology and biological systems",
        subjects: [
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Life Sciences", level: 6, isRequired: true },
          { name: "Physical Sciences", level: 5, isRequired: true },
        ],
        careerProspects: [
          "Biotechnologist",
          "Research Technician",
          "Quality Control Analyst",
          "Laboratory Manager",
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
        id: createDegreeId("Bachelor of Health Sciences Medical Laboratory"),
        name: "Bachelor of Health Sciences: Medical Laboratory Science",
        faculty: "Health & Wellness Sciences",
        duration: "4 years",
        apsRequirement: 38,
        description: "Medical laboratory science and diagnostics",
        subjects: [
          { name: "Mathematics", level: 5, isRequired: true },
          { name: "Physical Sciences", level: 6, isRequired: true },
          { name: "Life Sciences", level: 6, isRequired: true },
        ],
        careerProspects: [
          "Medical Technologist",
          "Laboratory Manager",
          "Research Technician",
          "Quality Control Specialist",
        ],
      },
    ],
  },
];

// Function to get specific faculty data for updated universities
export function getUpdatedUniversityFaculties(
  universityId: string,
): Faculty[] | null {
  const universityFaculties: Record<string, Faculty[]> = {
    ul: UL_FACULTIES,
    nwu: NWU_FACULTIES,
    wsu: WSU_FACULTIES,
    unizulu: UNIZULU_FACULTIES,
    spu: SPU_FACULTIES,
    ump: UMP_FACULTIES,
    cput: CPUT_FACULTIES,
    // Will add remaining universities
  };

  return universityFaculties[universityId] || null;
}

// Export all university specific faculty data
export const UPDATED_UNIVERSITY_DATA = {
  UL_FACULTIES,
  NWU_FACULTIES,
  WSU_FACULTIES,
  UNIZULU_FACULTIES,
  SPU_FACULTIES,
  UMP_FACULTIES,
  CPUT_FACULTIES,
  getUpdatedUniversityFaculties,
};
