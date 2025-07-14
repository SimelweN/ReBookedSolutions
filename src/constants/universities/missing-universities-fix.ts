import { Faculty } from "@/types/university";

/**
 * CRITICAL FIX: Faculty data for universities that were using generic fallbacks
 * These universities were missing comprehensive faculty data, causing data integrity issues
 */

// University of Fort Hare (UFH) - Traditional University focusing on humanities and social sciences
export const UFH_FACULTIES: Faculty[] = [
  {
    id: "ufh-education",
    name: "Faculty of Education",
    description: "Teacher training and educational leadership programs",
    degrees: [
      {
        id: "ufh-bed",
        name: "Bachelor of Education",
        faculty: "Faculty of Education",
        duration: "4 years",
        apsRequirement: 26,
        description: "Comprehensive teacher training program",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Primary School Teacher",
          "Secondary School Teacher",
          "Educational Administrator",
        ],
      },
      {
        id: "ufh-bed-foundation",
        name: "Bachelor of Education (Foundation Phase)",
        faculty: "Faculty of Education",
        duration: "4 years",
        apsRequirement: 24,
        description: "Early childhood and foundation phase teaching",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 3, isRequired: true },
        ],
        careerProspects: [
          "Foundation Phase Teacher",
          "Early Childhood Educator",
        ],
      },
    ],
  },
  {
    id: "ufh-humanities",
    name: "Faculty of Social Sciences and Humanities",
    description: "Liberal arts, social sciences, and development studies",
    degrees: [
      {
        id: "ufh-ba",
        name: "Bachelor of Arts",
        faculty: "Faculty of Social Sciences and Humanities",
        duration: "3 years",
        apsRequirement: 24,
        description: "Liberal arts education with focus on African studies",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          {
            name: "Mathematics or Mathematical Literacy",
            level: 3,
            isRequired: true,
          },
        ],
        careerProspects: [
          "Social Worker",
          "Community Developer",
          "Government Officer",
          "NGO Worker",
        ],
      },
      {
        id: "ufh-bsocwork",
        name: "Bachelor of Social Work",
        faculty: "Faculty of Social Sciences and Humanities",
        duration: "4 years",
        apsRequirement: 26,
        description: "Professional social work training",
        subjects: [
          { name: "English", level: 5, isRequired: true },
          {
            name: "Mathematics or Mathematical Literacy",
            level: 3,
            isRequired: true,
          },
        ],
        careerProspects: [
          "Social Worker",
          "Community Organizer",
          "Child Protection Officer",
        ],
      },
    ],
  },
  {
    id: "ufh-science",
    name: "Faculty of Science and Agriculture",
    description: "Natural sciences and agricultural development",
    degrees: [
      {
        id: "ufh-bsc",
        name: "Bachelor of Science",
        faculty: "Faculty of Science and Agriculture",
        duration: "3 years",
        apsRequirement: 28,
        description:
          "General science with focus on environmental and agricultural sciences",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Physical Sciences", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Agricultural Extension Officer",
          "Environmental Scientist",
          "Research Assistant",
        ],
      },
    ],
  },
];

// University of South Africa (UNISA) - Distance Learning Comprehensive University
export const UNISA_FACULTIES: Faculty[] = [
  {
    id: "unisa-economics",
    name: "College of Economic and Management Sciences",
    description:
      "Business, accounting, and economic sciences via distance learning",
    degrees: [
      {
        id: "unisa-bcom",
        name: "Bachelor of Commerce",
        faculty: "College of Economic and Management Sciences",
        duration: "3 years",
        apsRequirement: 26,
        description:
          "Distance learning commerce degree with various specializations",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Accountant",
          "Financial Analyst",
          "Business Manager",
          "Entrepreneur",
        ],
      },
      {
        id: "unisa-bba",
        name: "Bachelor of Business Administration",
        faculty: "College of Economic and Management Sciences",
        duration: "3 years",
        apsRequirement: 24,
        description: "Business administration via distance learning",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          {
            name: "Mathematics or Mathematical Literacy",
            level: 3,
            isRequired: true,
          },
        ],
        careerProspects: [
          "Business Manager",
          "Operations Manager",
          "Project Manager",
        ],
      },
    ],
  },
  {
    id: "unisa-education",
    name: "College of Education",
    description:
      "Teacher training and educational leadership via distance learning",
    degrees: [
      {
        id: "unisa-bed",
        name: "Bachelor of Education",
        faculty: "College of Education",
        duration: "4 years",
        apsRequirement: 24,
        description: "Distance learning teacher training program",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          {
            name: "Mathematics or Mathematical Literacy",
            level: 3,
            isRequired: true,
          },
        ],
        careerProspects: [
          "Teacher",
          "Educational Administrator",
          "Training Coordinator",
        ],
      },
    ],
  },
  {
    id: "unisa-humanities",
    name: "College of Human Sciences",
    description:
      "Liberal arts, psychology, and social sciences via distance learning",
    degrees: [
      {
        id: "unisa-ba",
        name: "Bachelor of Arts",
        faculty: "College of Human Sciences",
        duration: "3 years",
        apsRequirement: 22,
        description: "Liberal arts education via distance learning",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          {
            name: "Mathematics or Mathematical Literacy",
            level: 3,
            isRequired: true,
          },
        ],
        careerProspects: [
          "Civil Servant",
          "Journalist",
          "Social Worker",
          "Researcher",
        ],
      },
      {
        id: "unisa-bpsych",
        name: "Bachelor of Psychology",
        faculty: "College of Human Sciences",
        duration: "3 years",
        apsRequirement: 28,
        description: "Psychology studies via distance learning",
        subjects: [
          { name: "English", level: 5, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Psychologist",
          "Counselor",
          "Human Resources Officer",
        ],
      },
    ],
  },
];

// Nelson Mandela University (NMU) - Comprehensive University
export const NMU_FACULTIES: Faculty[] = [
  {
    id: "nmu-engineering",
    name: "Faculty of Engineering, the Built Environment and Technology",
    description: "Engineering and technology programs",
    degrees: [
      {
        id: "nmu-beng-mech",
        name: "Bachelor of Engineering in Mechanical Engineering",
        faculty: "Faculty of Engineering, the Built Environment and Technology",
        duration: "4 years",
        apsRequirement: 35,
        description: "Mechanical engineering with focus on automotive industry",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 6, isRequired: true },
          { name: "Physical Sciences", level: 6, isRequired: true },
        ],
        careerProspects: [
          "Mechanical Engineer",
          "Automotive Engineer",
          "Manufacturing Engineer",
        ],
      },
      {
        id: "nmu-btech-mechanical",
        name: "Bachelor of Technology in Mechanical Engineering",
        faculty: "Faculty of Engineering, the Built Environment and Technology",
        duration: "4 years",
        apsRequirement: 32,
        description: "Applied mechanical engineering technology",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 5, isRequired: true },
          { name: "Physical Sciences", level: 5, isRequired: true },
        ],
        careerProspects: [
          "Engineering Technologist",
          "Production Manager",
          "Quality Control Manager",
        ],
      },
    ],
  },
  {
    id: "nmu-business",
    name: "Faculty of Business and Economic Sciences",
    description: "Business, commerce, and economic sciences",
    degrees: [
      {
        id: "nmu-bcom",
        name: "Bachelor of Commerce",
        faculty: "Faculty of Business and Economic Sciences",
        duration: "3 years",
        apsRequirement: 28,
        description: "Commerce degree with various specializations",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Accountant",
          "Financial Manager",
          "Business Analyst",
        ],
      },
    ],
  },
  {
    id: "nmu-health",
    name: "Faculty of Health Sciences",
    description: "Health and medical sciences",
    degrees: [
      {
        id: "nmu-nursing",
        name: "Bachelor of Nursing",
        faculty: "Faculty of Health Sciences",
        duration: "4 years",
        apsRequirement: 32,
        description: "Professional nursing training",
        subjects: [
          { name: "English", level: 5, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Life Sciences", level: 5, isRequired: true },
        ],
        careerProspects: [
          "Registered Nurse",
          "Clinical Nurse",
          "Community Health Nurse",
        ],
      },
    ],
  },
];

// Sefako Makgatho Health Sciences University (SMU) - Health Sciences Specialized University
export const SMU_FACULTIES: Faculty[] = [
  {
    id: "smu-medicine",
    name: "School of Medicine",
    description: "Medical education and training",
    degrees: [
      {
        id: "smu-mbchb",
        name: "Bachelor of Medicine and Bachelor of Surgery (MBChB)",
        faculty: "School of Medicine",
        duration: "6 years",
        apsRequirement: 40,
        description: "Professional medical degree",
        subjects: [
          { name: "English", level: 6, isRequired: true },
          { name: "Mathematics", level: 5, isRequired: true },
          { name: "Physical Sciences", level: 6, isRequired: true },
          { name: "Life Sciences", level: 6, isRequired: true },
        ],
        careerProspects: [
          "Medical Doctor",
          "General Practitioner",
          "Medical Specialist",
        ],
      },
    ],
  },
  {
    id: "smu-dentistry",
    name: "School of Oral Health Sciences",
    description: "Dental and oral health education",
    degrees: [
      {
        id: "smu-bchd",
        name: "Bachelor of Dental Surgery (BChD)",
        faculty: "School of Oral Health Sciences",
        duration: "5 years",
        apsRequirement: 38,
        description: "Professional dental degree",
        subjects: [
          { name: "English", level: 6, isRequired: true },
          { name: "Mathematics", level: 5, isRequired: true },
          { name: "Physical Sciences", level: 6, isRequired: true },
          { name: "Life Sciences", level: 6, isRequired: true },
        ],
        careerProspects: ["Dentist", "Oral Surgeon", "Dental Specialist"],
      },
    ],
  },
  {
    id: "smu-health-sciences",
    name: "School of Health Care Sciences",
    description: "Allied health sciences programs",
    degrees: [
      {
        id: "smu-pharmacy",
        name: "Bachelor of Pharmacy",
        faculty: "School of Health Care Sciences",
        duration: "4 years",
        apsRequirement: 35,
        description: "Professional pharmacy training",
        subjects: [
          { name: "English", level: 5, isRequired: true },
          { name: "Mathematics", level: 5, isRequired: true },
          { name: "Physical Sciences", level: 6, isRequired: true },
          { name: "Life Sciences", level: 5, isRequired: true },
        ],
        careerProspects: [
          "Pharmacist",
          "Hospital Pharmacist",
          "Clinical Pharmacist",
        ],
      },
      {
        id: "smu-nursing",
        name: "Bachelor of Nursing Science",
        faculty: "School of Health Care Sciences",
        duration: "4 years",
        apsRequirement: 30,
        description: "Professional nursing science program",
        subjects: [
          { name: "English", level: 5, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Life Sciences", level: 5, isRequired: true },
        ],
        careerProspects: [
          "Registered Nurse",
          "Clinical Nurse Specialist",
          "Nurse Educator",
        ],
      },
    ],
  },
];
