import { University, Degree } from "@/types/university";
import {
  ENGINEERING_PROGRAMS,
  HEALTH_SCIENCES_PROGRAMS,
  HUMANITIES_PROGRAMS,
  COMMERCE_PROGRAMS,
  LAW_PROGRAMS,
  SCIENCE_PROGRAMS,
  EDUCATION_PROGRAMS,
  INFORMATION_TECHNOLOGY_PROGRAMS,
  AGRICULTURE_PROGRAMS,
  VETERINARY_PROGRAMS,
  THEOLOGY_PROGRAMS,
  DESIGN_PROGRAMS,
  MUSIC_PROGRAMS,
  SPORTS_SCIENCE_PROGRAMS,
  SOCIAL_WORK_PROGRAMS,
  getAllProgramsByFaculty,
} from "./comprehensive-university-programs";
import {
  getUniversityPrograms,
  isProgramAvailable,
  getUniversityType,
  getCorrectFacultyName,
  UNIVERSITY_PROGRAM_MAPPINGS,
} from "./university-specific-programs";

// This file contains the complete programs for universities that need more comprehensive degree offerings

// Template programs that can be used across multiple universities
export const COMMON_DEGREE_TEMPLATES = {
  // Medicine and Health Sciences
  medicine: {
    id: "mbchb-medicine",
    name: "MBChB Medicine and Surgery",
    faculty: "Health Sciences",
    duration: "6 years",
    apsRequirement: 42,
    description:
      "Comprehensive medical training leading to medical doctor qualification.",
    subjects: [
      { name: "Mathematics", level: 6, isRequired: true },
      { name: "Physical Sciences", level: 6, isRequired: true },
      { name: "Life Sciences", level: 6, isRequired: true },
      { name: "English", level: 6, isRequired: true },
    ],
    careerProspects: [
      "Medical Doctor",
      "Specialist Physician",
      "Surgeon",
      "Researcher",
      "Medical Consultant",
    ],
  },

  // Engineering Programs
  mechanicalEngineering: {
    id: "beng-mechanical",
    name: "BEng Mechanical Engineering",
    faculty: "Engineering",
    duration: "4 years",
    apsRequirement: 38,
    description: "Design, manufacture, and maintenance of mechanical systems.",
    subjects: [
      { name: "Mathematics", level: 6, isRequired: true },
      { name: "Physical Sciences", level: 6, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    careerProspects: [
      "Mechanical Engineer",
      "Design Engineer",
      "Project Manager",
      "Manufacturing Engineer",
      "Consultant Engineer",
    ],
  },

  electricalEngineering: {
    id: "beng-electrical",
    name: "BEng Electrical Engineering",
    faculty: "Engineering",
    duration: "4 years",
    apsRequirement: 38,
    description: "Electrical systems, electronics, and power engineering.",
    subjects: [
      { name: "Mathematics", level: 6, isRequired: true },
      { name: "Physical Sciences", level: 6, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    careerProspects: [
      "Electrical Engineer",
      "Electronics Engineer",
      "Power Systems Engineer",
      "Control Systems Engineer",
      "Telecommunications Engineer",
    ],
  },

  civilEngineering: {
    id: "beng-civil",
    name: "BEng Civil Engineering",
    faculty: "Engineering",
    duration: "4 years",
    apsRequirement: 36,
    description: "Infrastructure design, construction, and project management.",
    subjects: [
      { name: "Mathematics", level: 6, isRequired: true },
      { name: "Physical Sciences", level: 6, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    careerProspects: [
      "Civil Engineer",
      "Structural Engineer",
      "Construction Manager",
      "Project Engineer",
      "Municipal Engineer",
    ],
  },

  // Commerce and Business
  bcom: {
    id: "bcom-general",
    name: "BCom General",
    faculty: "Commerce",
    duration: "3 years",
    apsRequirement: 30,
    description: "Broad business education with specialization options.",
    subjects: [
      { name: "Mathematics", level: 4, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    careerProspects: [
      "Business Analyst",
      "Financial Advisor",
      "Marketing Manager",
      "Human Resources Manager",
      "Entrepreneur",
    ],
  },

  accounting: {
    id: "bcom-accounting",
    name: "BCom Accounting",
    faculty: "Commerce",
    duration: "3 years",
    apsRequirement: 32,
    description: "Professional accounting qualification pathway.",
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
      "Management Accountant",
    ],
  },

  // Law
  law: {
    id: "llb-law",
    name: "LLB Law",
    faculty: "Law",
    duration: "4 years",
    apsRequirement: 34,
    description: "Comprehensive legal education and training.",
    subjects: [
      { name: "English", level: 6, isRequired: true },
      { name: "Mathematics", level: 4, isRequired: true },
    ],
    careerProspects: [
      "Attorney",
      "Advocate",
      "Legal Advisor",
      "Magistrate",
      "Corporate Lawyer",
    ],
  },

  // Education
  education: {
    id: "bed-foundation-phase",
    name: "BEd Foundation Phase Teaching",
    faculty: "Education",
    duration: "4 years",
    apsRequirement: 26,
    description: "Training for foundation phase (Grade R-3) teaching.",
    subjects: [
      { name: "English", level: 5, isRequired: true },
      { name: "Mathematics", level: 4, isRequired: true },
    ],
    careerProspects: [
      "Foundation Phase Teacher",
      "Educational Specialist",
      "Curriculum Developer",
      "School Principal",
      "Education Consultant",
    ],
  },

  // Humanities
  psychology: {
    id: "ba-psychology",
    name: "BA Psychology",
    faculty: "Humanities",
    duration: "3 years",
    apsRequirement: 28,
    description: "Study of human behavior and mental processes.",
    subjects: [
      { name: "English", level: 5, isRequired: true },
      { name: "Mathematics", level: 4, isRequired: true },
    ],
    careerProspects: [
      "Psychologist",
      "Counselor",
      "Human Resources Specialist",
      "Research Assistant",
      "Social Worker",
    ],
  },

  socialWork: {
    id: "bsw-social-work",
    name: "BSW Social Work",
    faculty: "Humanities",
    duration: "4 years",
    apsRequirement: 26,
    description: "Professional social work training and practice.",
    subjects: [
      { name: "English", level: 5, isRequired: true },
      { name: "Mathematics", level: 3, isRequired: true },
    ],
    careerProspects: [
      "Social Worker",
      "Community Development Officer",
      "Child Protection Officer",
      "Family Counselor",
      "NGO Manager",
    ],
  },

  // Science Programs
  computerScience: {
    id: "bsc-computer-science",
    name: "BSc Computer Science",
    faculty: "Science",
    duration: "3 years",
    apsRequirement: 34,
    description: "Programming, algorithms, and computational thinking.",
    subjects: [
      { name: "Mathematics", level: 6, isRequired: true },
      { name: "English", level: 5, isRequired: true },
      { name: "Information Technology", level: 5, isRequired: false },
    ],
    careerProspects: [
      "Software Developer",
      "Data Scientist",
      "Systems Analyst",
      "IT Consultant",
      "Research Scientist",
    ],
  },

  informationSystems: {
    id: "bsc-information-systems",
    name: "BSc Information Systems",
    faculty: "Science",
    duration: "3 years",
    apsRequirement: 32,
    description: "Business-focused IT solutions and systems management.",
    subjects: [
      { name: "Mathematics", level: 5, isRequired: true },
      { name: "English", level: 5, isRequired: true },
      { name: "Information Technology", level: 4, isRequired: false },
    ],
    careerProspects: [
      "IT Manager",
      "Business Analyst",
      "Systems Administrator",
      "Database Administrator",
      "IT Consultant",
    ],
  },

  // Health Sciences (Non-Medicine)
  nursing: {
    id: "bns-nursing",
    name: "BNS Nursing Science",
    faculty: "Health Sciences",
    duration: "4 years",
    apsRequirement: 30,
    description: "Professional nursing training and healthcare practice.",
    subjects: [
      { name: "English", level: 5, isRequired: true },
      { name: "Life Sciences", level: 5, isRequired: true },
      { name: "Mathematics", level: 4, isRequired: true },
      { name: "Physical Sciences", level: 4, isRequired: false },
    ],
    careerProspects: [
      "Professional Nurse",
      "Nurse Manager",
      "Clinical Specialist",
      "Nurse Educator",
      "Healthcare Administrator",
    ],
  },

  pharmacy: {
    id: "bpharm-pharmacy",
    name: "BPharm Pharmacy",
    faculty: "Health Sciences",
    duration: "4 years",
    apsRequirement: 35,
    description: "Pharmaceutical sciences and pharmacy practice.",
    subjects: [
      { name: "Mathematics", level: 5, isRequired: true },
      { name: "Physical Sciences", level: 6, isRequired: true },
      { name: "Life Sciences", level: 5, isRequired: true },
      { name: "English", level: 5, isRequired: true },
    ],
    careerProspects: [
      "Pharmacist",
      "Clinical Pharmacist",
      "Pharmaceutical Researcher",
      "Hospital Pharmacist",
      "Community Pharmacist",
    ],
  },
};

// Function to generate university-specific faculty structure
export const generateStandardFaculties = (
  universityName: string,
  universityId?: string,
) => {
  const comprehensivePrograms = getAllProgramsByFaculty();

  // If we have a specific university ID, use its specific program mapping
  if (universityId) {
    const mapping = UNIVERSITY_PROGRAM_MAPPINGS.find(
      (m) => m.universityId === universityId,
    );
    if (mapping) {
      return mapping.availableFaculties.map((faculty) => ({
        id: faculty.id,
        name: faculty.name,
        description: faculty.description,
        degrees: faculty.programIds
          .map((programId) => {
            // Find the program in comprehensive programs
            for (const [categoryKey, programs] of Object.entries(
              comprehensivePrograms,
            )) {
              const program = programs.find((p) => p.id === programId);
              if (program) {
                return {
                  ...program,
                  faculty: faculty.name, // Use correct faculty name
                };
              }
            }
            return null;
          })
          .filter(Boolean) as Degree[],
      }));
    }
  }

  // Fallback to comprehensive faculties with university-appropriate names
  const universityType = universityId
    ? getUniversityType(universityId)
    : "comprehensive";

  return [
    {
      id: "engineering",
      name: getCorrectFacultyName(universityId || "", "engineering"),
      description: `Engineering education and innovation at ${universityName}.`,
      degrees: comprehensivePrograms.engineering.map((p) => ({
        ...p,
        faculty: getCorrectFacultyName(universityId || "", "engineering"),
      })),
    },
    {
      id: "health-sciences",
      name: getCorrectFacultyName(universityId || "", "health-sciences"),
      description: `Health sciences education at ${universityName}.`,
      degrees: comprehensivePrograms.healthSciences.map((p) => ({
        ...p,
        faculty: getCorrectFacultyName(universityId || "", "health-sciences"),
      })),
    },
    {
      id: "humanities",
      name: getCorrectFacultyName(universityId || "", "humanities"),
      description: `Humanities and social sciences at ${universityName}.`,
      degrees: comprehensivePrograms.humanities.map((p) => ({
        ...p,
        faculty: getCorrectFacultyName(universityId || "", "humanities"),
      })),
    },
    {
      id: "commerce",
      name: getCorrectFacultyName(universityId || "", "commerce"),
      description: `Business and economics education at ${universityName}.`,
      degrees: comprehensivePrograms.commerce.map((p) => ({
        ...p,
        faculty: getCorrectFacultyName(universityId || "", "commerce"),
      })),
    },
    {
      id: "law",
      name: getCorrectFacultyName(universityId || "", "law"),
      description: `Legal education at ${universityName}.`,
      degrees: comprehensivePrograms.law.map((p) => ({
        ...p,
        faculty: getCorrectFacultyName(universityId || "", "law"),
      })),
    },
    {
      id: "science",
      name: getCorrectFacultyName(universityId || "", "science"),
      description: `Natural sciences education at ${universityName}.`,
      degrees: comprehensivePrograms.science.map((p) => ({
        ...p,
        faculty: getCorrectFacultyName(universityId || "", "science"),
      })),
    },
    {
      id: "education",
      name: getCorrectFacultyName(universityId || "", "education"),
      description: `Teacher training at ${universityName}.`,
      degrees: comprehensivePrograms.education.map((p) => ({
        ...p,
        faculty: getCorrectFacultyName(universityId || "", "education"),
      })),
    },
    {
      id: "information-technology",
      name: getCorrectFacultyName(universityId || "", "information-technology"),
      description: `Information technology at ${universityName}.`,
      degrees: comprehensivePrograms.informationTechnology.map((p) => ({
        ...p,
        faculty: getCorrectFacultyName(
          universityId || "",
          "information-technology",
        ),
      })),
    },
  ];
};

// Universities that need VERIFIED program completion - only for universities with insufficient programs
// Only add verified programs that actually exist at these universities
export const UNIVERSITIES_NEEDING_PROGRAMS = [
  // Only universities that truly have fewer than 50 programs and need enhancement
  // Each program must be verified against the university's official offerings
];

// Force comprehensive program updates for all universities
// ENABLED: Required for APS calculator to show available programs
export const FORCE_COMPREHENSIVE_PROGRAMS = true;
