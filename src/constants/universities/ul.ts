import { Faculty } from "@/types/university";
import { createDegreeId, createFacultyId } from "./base";

// University of Limpopo (UL) - Faculty Data - Complete and Accurate Update
export const UL_FACULTIES: Faculty[] = [
  {
    id: createFacultyId("Faculty of Health Sciences UL"),
    name: "Faculty of Health Sciences",
    description:
      "Medical, health, and therapeutic programs - School of Medicine and School of Health Care Sciences",
    degrees: [
      {
        id: createDegreeId("Bachelor Medicine Surgery UL"),
        name: "Bachelor of Medicine & Bachelor of Surgery (MBChB)",
        faculty: "Health Sciences",
        duration: "6 years",
        apsRequirement: 27,
        description: "Medical practice and surgery qualification",
        subjects: [
          { name: "English", level: 5, isRequired: true },
          { name: "Mathematics", level: 5, isRequired: true },
          { name: "Life Sciences", level: 6, isRequired: true },
          { name: "Physical Sciences", level: 5, isRequired: true },
        ],
        careerProspects: ["Medical Doctor", "Surgeon", "Medical Specialist"],
      },
      {
        id: createDegreeId("Bachelor Nursing UL"),
        name: "Bachelor of Nursing (BNurs)",
        faculty: "Health Sciences",
        duration: "4 years",
        apsRequirement: 26,
        description: "Professional nursing practice",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Life Sciences", level: 5, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Professional Nurse",
          "Nurse Manager",
          "Clinical Specialist",
        ],
      },
      {
        id: createDegreeId("Bachelor Pharmacy UL"),
        name: "Bachelor of Pharmacy (BPharm)",
        faculty: "Health Sciences",
        duration: "4 years",
        apsRequirement: 27,
        description: "Pharmaceutical sciences and practice",
        subjects: [
          { name: "English", level: 5, isRequired: true },
          { name: "Mathematics", level: 5, isRequired: true },
          { name: "Life Sciences", level: 5, isRequired: true },
          { name: "Physical Sciences", level: 5, isRequired: true },
        ],
        careerProspects: [
          "Pharmacist",
          "Clinical Pharmacist",
          "Pharmaceutical Researcher",
        ],
      },
      {
        id: createDegreeId("Bachelor Optometry UL"),
        name: "Bachelor of Optometry (BOptom)",
        faculty: "Health Sciences",
        duration: "4 years",
        apsRequirement: 27,
        description: "Optometric practice and eye care",
        subjects: [
          { name: "English", level: 5, isRequired: true },
          { name: "Mathematics", level: 5, isRequired: true },
          { name: "Life Sciences", level: 5, isRequired: true },
          { name: "Physical Sciences", level: 5, isRequired: true },
        ],
        careerProspects: [
          "Optometrist",
          "Eye Care Specialist",
          "Contact Lens Practitioner",
        ],
      },
      {
        id: createDegreeId("BSc Dietetics UL"),
        name: "BSc Dietetics",
        faculty: "Health Sciences",
        duration: "4 years",
        apsRequirement: 26,
        description: "Nutrition and dietetic practice",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Life Sciences", level: 5, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Physical Sciences", level: 4, isRequired: true },
        ],
        careerProspects: ["Dietitian", "Nutritionist", "Food Service Manager"],
      },
      {
        id: createDegreeId("BSc Medical Sciences UL"),
        name: "BSc Medical Sciences",
        faculty: "Health Sciences",
        duration: "3 years",
        apsRequirement: 26,
        description: "Medical sciences foundation",
        subjects: [
          { name: "English", level: 5, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Life Sciences", level: 5, isRequired: true },
          { name: "Physical Sciences", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Medical Scientist",
          "Laboratory Scientist",
          "Research Assistant",
        ],
      },
    ],
  },
  {
    id: createFacultyId("Faculty of Humanities UL"),
    name: "Faculty of Humanities",
    description:
      "Education, social sciences, languages and communication programs across multiple schools",
    degrees: [
      // School of Education
      {
        id: createDegreeId("BEd Foundation Phase UL"),
        name: "Bachelor of Education (BEd) - Foundation Phase Teaching",
        faculty: "Humanities",
        duration: "4 years",
        apsRequirement: 24,
        description: "Foundation phase teaching (Grades R-3)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Foundation Phase Teacher",
          "Primary School Teacher",
          "Educational Coordinator",
        ],
      },
      {
        id: createDegreeId("BEd Senior Phase FET Languages UL"),
        name: "Bachelor of Education (BEd) - Senior Phase & FET Teaching (Languages)",
        faculty: "Humanities",
        duration: "4 years",
        apsRequirement: 24,
        description: "Senior Phase and FET language teaching specialization",
        subjects: [
          { name: "English", level: 5, isRequired: true },
          { name: "Home Language", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Language Teacher",
          "English Teacher",
          "Literature Teacher",
        ],
      },
      {
        id: createDegreeId("BEd Senior Phase FET Economics Management UL"),
        name: "Bachelor of Education (BEd) - Senior Phase & FET Teaching (Economics/Management)",
        faculty: "Humanities",
        duration: "4 years",
        apsRequirement: 24,
        description:
          "Senior Phase and FET economics and management sciences teaching",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Accounting", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Economics Teacher",
          "Business Studies Teacher",
          "EMS Teacher",
        ],
      },
      {
        id: createDegreeId("BEd Senior Phase FET Math Science Technology UL"),
        name: "Bachelor of Education (BEd) - Senior Phase & FET Teaching (Math/Science/Technology)",
        faculty: "Humanities",
        duration: "4 years",
        apsRequirement: 24,
        description:
          "Senior Phase and FET mathematics, science and technology teaching",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 5, isRequired: true },
          { name: "Physical Sciences", level: 5, isRequired: true },
        ],
        careerProspects: [
          "Mathematics Teacher",
          "Science Teacher",
          "Technology Teacher",
        ],
      },
      // School of Social Sciences
      {
        id: createDegreeId("Bachelor Social Work UL"),
        name: "Bachelor of Social Work (BSW)",
        faculty: "Humanities",
        duration: "4 years",
        apsRequirement: 25,
        description:
          "Professional social work practice (using higher APS score: 25)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Life Orientation", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Social Worker",
          "Community Developer",
          "Family Counselor",
        ],
      },
      {
        id: createDegreeId("Bachelor Psychology UL"),
        name: "Bachelor of Psychology (BPsych)",
        faculty: "Humanities",
        duration: "3 years",
        apsRequirement: 25,
        description:
          "Psychology theory and practice (using higher APS score: 25)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Life Sciences", level: 4, isRequired: true },
        ],
        careerProspects: ["Psychologist", "Counselor", "Researcher"],
      },
      {
        id: createDegreeId("BA Sociology Anthropology UL"),
        name: "Bachelor of Arts - Sociology & Anthropology",
        faculty: "Humanities",
        duration: "3 years",
        apsRequirement: 25,
        description:
          "Sociology and anthropology studies (using higher APS score: 25)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Life Orientation", level: 4, isRequired: true },
        ],
        careerProspects: ["Sociologist", "Anthropologist", "Social Researcher"],
      },
      {
        id: createDegreeId("BA Political Studies UL"),
        name: "Bachelor of Arts - Political Studies",
        faculty: "Humanities",
        duration: "3 years",
        apsRequirement: 25,
        description: "Political science and governance studies",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "History", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Political Scientist",
          "Government Official",
          "Policy Analyst",
        ],
      },
      {
        id: createDegreeId("BA Criminology Psychology UL"),
        name: "Bachelor of Arts - Criminology & Psychology",
        faculty: "Humanities",
        duration: "3 years",
        apsRequirement: 25,
        description:
          "Criminology and psychology studies (using higher APS score: 25, includes extended option at 24)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Life Orientation", level: 4, isRequired: true },
        ],
        careerProspects: ["Criminologist", "Psychologist", "Social Researcher"],
      },
      {
        id: createDegreeId("BA Criminology Psychology Extended UL"),
        name: "Bachelor of Arts - Criminology & Psychology (Extended)",
        faculty: "Humanities",
        duration: "4 years",
        apsRequirement: 24,
        description:
          "Extended criminology and psychology studies program (using higher APS score: 24)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Life Orientation", level: 4, isRequired: true },
        ],
        careerProspects: ["Criminologist", "Psychologist", "Social Researcher"],
      },
      // School of Languages & Communication
      {
        id: createDegreeId("BA Media Studies UL"),
        name: "Bachelor of Arts - Media Studies",
        faculty: "Humanities",
        duration: "3 years",
        apsRequirement: 25,
        description:
          "Media and communication studies (Standard: APS 25; Extended: APS 23)",
        subjects: [{ name: "English", level: 5, isRequired: true }],
        careerProspects: ["Media Analyst", "Journalist", "Content Creator"],
      },
      {
        id: createDegreeId("BA Journalism Public Relations UL"),
        name: "Bachelor of Arts - Journalism & Public Relations",
        faculty: "Humanities",
        duration: "3 years",
        apsRequirement: 25,
        description: "Journalism and public relations practice",
        subjects: [
          { name: "English", level: 5, isRequired: true },
          { name: "Home Language", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Journalist",
          "Public Relations Officer",
          "Communications Specialist",
        ],
      },
      {
        id: createDegreeId("BA Translation Linguistics UL"),
        name: "Bachelor of Arts - Translation & Linguistics",
        faculty: "Humanities",
        duration: "3 years",
        apsRequirement: 25,
        description: "Translation and linguistic studies",
        subjects: [
          { name: "English", level: 5, isRequired: true },
          { name: "Home Language", level: 5, isRequired: true },
        ],
        careerProspects: ["Translator", "Interpreter", "Language Specialist"],
      },
      {
        id: createDegreeId("BA Contemporary English Multilingual Studies UL"),
        name: "Bachelor of Arts - Contemporary English & Multilingual Studies",
        faculty: "Humanities",
        duration: "3 years",
        apsRequirement: 25,
        description: "Contemporary English and multilingual communication",
        subjects: [
          { name: "English", level: 5, isRequired: true },
          { name: "Home Language", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Language Specialist",
          "Communications Officer",
          "Editor",
        ],
      },
      {
        id: createDegreeId("Bachelor Information Studies UL"),
        name: "Bachelor of Information Studies (BInfSt)",
        faculty: "Humanities",
        duration: "3 years",
        apsRequirement: 25,
        description: "Information science and management",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
        ],
        careerProspects: ["Information Scientist", "Librarian", "Data Manager"],
      },
      {
        id: createDegreeId("BA Languages Stream UL"),
        name: "Bachelor of Arts - Languages Stream",
        faculty: "Humanities",
        duration: "3 years",
        apsRequirement: 25,
        description: "Comprehensive language studies program",
        subjects: [
          { name: "English", level: 5, isRequired: true },
          { name: "Home Language", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Language Teacher",
          "Translator",
          "Language Specialist",
        ],
      },
      {
        id: createDegreeId("BA Communication Studies UL"),
        name: "Bachelor of Arts - Communication Studies",
        faculty: "Humanities",
        duration: "3 years",
        apsRequirement: 25,
        description: "Communication theory and practice",
        subjects: [{ name: "English", level: 5, isRequired: true }],
        careerProspects: [
          "Communications Specialist",
          "Public Relations Officer",
          "Media Analyst",
        ],
      },
      {
        id: createDegreeId("BA Media Studies Extended UL"),
        name: "Bachelor of Arts - Media Studies (Extended)",
        faculty: "Humanities",
        duration: "4 years",
        apsRequirement: 23,
        description: "Extended media studies program",
        subjects: [{ name: "English", level: 4, isRequired: true }],
        careerProspects: ["Media Analyst", "Journalist", "Content Creator"],
      },
    ],
  },
  {
    id: createFacultyId("Faculty of Science Agriculture UL"),
    name: "Faculty of Science & Agriculture",
    description:
      "Agricultural, environmental, and natural science programs across specialized schools",
    degrees: [
      // School of Agricultural & Environmental Sciences
      {
        id: createDegreeId("Bachelor Agricultural Management UL"),
        name: "Bachelor of Agricultural Management",
        faculty: "Science & Agriculture",
        duration: "3 years",
        apsRequirement: 24,
        description: "Agricultural business and farm management",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Life Sciences", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Agricultural Manager",
          "Farm Manager",
          "Agricultural Consultant",
        ],
      },
      {
        id: createDegreeId("BSc Agriculture Animal Production UL"),
        name: "BSc Agriculture - Animal Production",
        faculty: "Science & Agriculture",
        duration: "4 years",
        apsRequirement: 24,
        description: "Animal husbandry and livestock production",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Life Sciences", level: 5, isRequired: true },
        ],
        careerProspects: [
          "Animal Scientist",
          "Livestock Manager",
          "Veterinary Technician",
        ],
      },
      {
        id: createDegreeId("BSc Agriculture Plant Production UL"),
        name: "BSc Agriculture - Plant Production",
        faculty: "Science & Agriculture",
        duration: "4 years",
        apsRequirement: 24,
        description: "Plant science and crop production",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Life Sciences", level: 5, isRequired: true },
        ],
        careerProspects: ["Plant Scientist", "Crop Specialist", "Agronomist"],
      },
      {
        id: createDegreeId("BSc Agriculture Agricultural Economics UL"),
        name: "BSc Agriculture - Agricultural Economics",
        faculty: "Science & Agriculture",
        duration: "4 years",
        apsRequirement: 24,
        description: "Agricultural economics and farm management",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Life Sciences", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Agricultural Economist",
          "Farm Manager",
          "Agricultural Consultant",
        ],
      },
      {
        id: createDegreeId("BSc Agriculture Soil Science UL"),
        name: "BSc Agriculture - Soil Science",
        faculty: "Science & Agriculture",
        duration: "4 years",
        apsRequirement: 25,
        description: "Soil chemistry and management",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Life Sciences", level: 5, isRequired: true },
          { name: "Physical Sciences", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Soil Scientist",
          "Environmental Consultant",
          "Agricultural Researcher",
        ],
      },
      {
        id: createDegreeId("BSc Environmental Resource Studies UL"),
        name: "BSc Environmental & Resource Studies",
        faculty: "Science & Agriculture",
        duration: "3 years",
        apsRequirement: 24,
        description: "Environmental science and resource management",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
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
        id: createDegreeId("BSc Water Sanitation Sciences UL"),
        name: "BSc Water & Sanitation Sciences",
        faculty: "Science & Agriculture",
        duration: "3 years",
        apsRequirement: 24,
        description: "Water management and sanitation technology",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Physical Sciences", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Water Engineer",
          "Sanitation Specialist",
          "Environmental Engineer",
        ],
      },
      // School of Mathematical, Physical & Life Sciences
      {
        id: createDegreeId("BSc Life Sciences UL"),
        name: "BSc Life Sciences",
        faculty: "Science & Agriculture",
        duration: "3 years",
        apsRequirement: 24,
        description:
          "Biological and life sciences (Standard: APS 24; Extended: APS 22)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Life Sciences", level: 5, isRequired: true },
        ],
        careerProspects: ["Life Scientist", "Biologist", "Research Scientist"],
      },
      {
        id: createDegreeId("BSc Physical Sciences UL"),
        name: "BSc Physical Sciences",
        faculty: "Science & Agriculture",
        duration: "3 years",
        apsRequirement: 26,
        description:
          "Physics, chemistry, and physical sciences (Standard: APS 26; Extended: APS 22)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 5, isRequired: true },
          { name: "Physical Sciences", level: 5, isRequired: true },
        ],
        careerProspects: ["Physicist", "Chemist", "Research Scientist"],
      },
      {
        id: createDegreeId("BSc Mathematical Sciences UL"),
        name: "BSc Mathematical Sciences",
        faculty: "Science & Agriculture",
        duration: "3 years",
        apsRequirement: 24,
        description:
          "Mathematics and mathematical sciences (Standard: APS 24; Extended: APS 22)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 5, isRequired: true },
        ],
        careerProspects: ["Mathematician", "Statistician", "Data Analyst"],
      },
      {
        id: createDegreeId("BSc Geology UL"),
        name: "BSc Geology",
        faculty: "Science & Agriculture",
        duration: "3 years",
        apsRequirement: 26,
        description: "Earth sciences and geological processes",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 5, isRequired: true },
          { name: "Physical Sciences", level: 5, isRequired: true },
        ],
        careerProspects: ["Geologist", "Mining Specialist", "Earth Scientist"],
      },
    ],
  },
  {
    id: createFacultyId("Faculty of Management Law UL"),
    name: "Faculty of Management & Law",
    description:
      "Business, management, and legal programs across specialized schools",
    degrees: [
      // School of Law
      {
        id: createDegreeId("LLB UL"),
        name: "Bachelor of Laws (LLB)",
        faculty: "Management & Law",
        duration: "4 years",
        apsRequirement: 30,
        description: "Professional legal qualification (Standard)",
        subjects: [
          { name: "English", level: 5, isRequired: true },
          { name: "Life Orientation", level: 4, isRequired: true },
        ],
        careerProspects: ["Lawyer", "Attorney", "Legal Consultant"],
      },
      {
        id: createDegreeId("LLB Extended UL"),
        name: "Bachelor of Laws (LLB) - Extended Curriculum",
        faculty: "Management & Law",
        duration: "5 years",
        apsRequirement: 26,
        description: "Extended professional legal qualification program",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Life Orientation", level: 4, isRequired: true },
        ],
        careerProspects: ["Lawyer", "Attorney", "Legal Consultant"],
      },
      // School of Accountancy
      {
        id: createDegreeId("Bachelor Accountancy UL"),
        name: "Bachelor of Accountancy (BAcc)",
        faculty: "Management & Law",
        duration: "3 years",
        apsRequirement: 30,
        description: "Professional accounting qualification",
        subjects: [
          { name: "English", level: 5, isRequired: true },
          { name: "Mathematics", level: 5, isRequired: true },
          { name: "Accounting", level: 5, isRequired: true },
        ],
        careerProspects: [
          "Chartered Accountant",
          "Financial Manager",
          "Auditor",
        ],
      },
      {
        id: createDegreeId("BCom Accountancy UL"),
        name: "BCom in Accountancy",
        faculty: "Management & Law",
        duration: "3 years",
        apsRequirement: 28,
        description:
          "Commerce with accounting specialization (Standard: APS 28; Extended: APS 26)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 5, isRequired: true },
          { name: "Accounting", level: 4, isRequired: true },
        ],
        careerProspects: ["Accountant", "Financial Analyst", "Bookkeeper"],
      },
      // School of Economics & Management
      {
        id: createDegreeId("BCom Economics UL"),
        name: "BCom Economics",
        faculty: "Management & Law",
        duration: "3 years",
        apsRequirement: 26,
        description:
          "Economic theory and analysis (Standard: APS 26; Extended: APS 22)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 5, isRequired: true },
        ],
        careerProspects: ["Economist", "Economic Analyst", "Policy Researcher"],
      },
      {
        id: createDegreeId("BCom Business Management UL"),
        name: "BCom Business Management",
        faculty: "Management & Law",
        duration: "3 years",
        apsRequirement: 26,
        description:
          "General business management (Standard: APS 26; Extended: APS 22)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Business Manager",
          "Operations Manager",
          "Project Manager",
        ],
      },
      {
        id: createDegreeId("BCom Human Resource Management UL"),
        name: "BCom Human Resource Management",
        faculty: "Management & Law",
        duration: "3 years",
        apsRequirement: 26,
        description: "Human resource management (Standard: APS 26)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
        ],
        careerProspects: [
          "HR Manager",
          "Recruitment Specialist",
          "Training Coordinator",
        ],
      },
      {
        id: createDegreeId("BCom Human Resource Management Extended UL"),
        name: "BCom Human Resource Management (Extended)",
        faculty: "Management & Law",
        duration: "4 years",
        apsRequirement: 22,
        description: "Extended human resource management program",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
        ],
        careerProspects: [
          "HR Manager",
          "Recruitment Specialist",
          "Training Coordinator",
        ],
      },
      {
        id: createDegreeId("Bachelor Administration UL"),
        name: "Bachelor of Administration (BAdmin)",
        faculty: "Management & Law",
        duration: "3 years",
        apsRequirement: 26,
        description:
          "Public and business administration (General/Local Government)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Administrator",
          "Public Service Officer",
          "Management Trainee",
        ],
      },
      {
        id: createDegreeId("Bachelor Development Planning Management UL"),
        name: "Bachelor of Development Planning & Management (BDev)",
        faculty: "Management & Law",
        duration: "3 years",
        apsRequirement: 26,
        description: "Development planning and project management",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Development Planner",
          "Project Manager",
          "Development Consultant",
        ],
      },
    ],
  },
];
