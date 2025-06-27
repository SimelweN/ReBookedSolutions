import { Faculty } from "@/types/university";
import { createDegreeId, createFacultyId } from "./base";

// Durban University of Technology (DUT) - Faculty Data - Complete Update
export const DUT_FACULTIES: Faculty[] = [
  {
    id: createFacultyId("Engineering and Built Environment DUT"),
    name: "Engineering & Built Environment",
    description: "Engineering and construction technology programs",
    degrees: [
      {
        id: createDegreeId("Diploma Engineering Civil DUT"),
        name: "Diploma in Engineering (Civil)",
        faculty: "Engineering & Built Environment",
        duration: "3 years",
        apsRequirement: 24,
        description:
          "Civil engineering diploma with Maths & Physical Sciences L4+",
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
        id: createDegreeId("Diploma Engineering Electrical DUT"),
        name: "Diploma in Engineering (Electrical)",
        faculty: "Engineering & Built Environment",
        duration: "3 years",
        apsRequirement: 24,
        description:
          "Electrical engineering diploma with Maths & Physical Sciences L4+",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Physical Sciences", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Electrical Engineering Technician",
          "Electrical Supervisor",
          "Power Systems Technician",
        ],
      },
      {
        id: createDegreeId("Diploma Engineering Mechanical DUT"),
        name: "Diploma in Engineering (Mechanical)",
        faculty: "Engineering & Built Environment",
        duration: "3 years",
        apsRequirement: 24,
        description:
          "Mechanical engineering diploma with Maths & Physical Sciences L4+",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Physical Sciences", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Mechanical Engineering Technician",
          "Manufacturing Technologist",
          "Maintenance Supervisor",
        ],
      },
      {
        id: createDegreeId("BEng Technology DUT"),
        name: "BEng Technology (Engineering Technology)",
        faculty: "Engineering & Built Environment",
        duration: "4 years",
        apsRequirement: 28,
        description:
          "Engineering technology degree with L4 in Maths & Physical Sciences",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Physical Sciences", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Engineering Technologist",
          "Design Engineer",
          "Project Engineer",
        ],
      },
    ],
  },
  {
    id: createFacultyId("Health and Wellness Sciences DUT"),
    name: "Health & Wellness Sciences",
    description: "Health sciences and medical technology programs",
    degrees: [
      {
        id: createDegreeId("BHealthSci Medical Laboratory Science DUT"),
        name: "Bachelor of Health Sciences (Medical Laboratory Science)",
        faculty: "Health & Wellness Sciences",
        duration: "4 years",
        apsRequirement: 36,
        description:
          "Medical laboratory science with Maths, Physical Science, Life Sciences prerequisites",
        subjects: [
          { name: "English", level: 5, isRequired: true },
          { name: "Mathematics", level: 5, isRequired: true },
          { name: "Physical Sciences", level: 5, isRequired: true },
          { name: "Life Sciences", level: 5, isRequired: true },
        ],
        careerProspects: [
          "Medical Laboratory Scientist",
          "Clinical Laboratory Technologist",
          "Research Scientist",
        ],
      },
    ],
  },
  {
    id: createFacultyId("Information Technology DUT"),
    name: "Information Technology",
    description: "Computing and information technology programs",
    degrees: [
      {
        id: createDegreeId("Diploma IT Various Streams DUT"),
        name: "Diploma in IT",
        faculty: "Information Technology",
        duration: "3 years",
        apsRequirement: 26,
        description: "IT diploma depending on the stream; Maths L4+ required",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Information Technology", level: 3, isRequired: false },
        ],
        careerProspects: [
          "IT Technician",
          "Software Developer",
          "Network Administrator",
        ],
      },
      {
        id: createDegreeId("Diploma IT Advanced Stream DUT"),
        name: "Diploma in IT (Advanced Stream)",
        faculty: "Information Technology",
        duration: "3 years",
        apsRequirement: 28,
        description: "Advanced IT diploma with higher requirements",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Information Technology", level: 4, isRequired: false },
        ],
        careerProspects: ["Software Engineer", "Systems Analyst", "IT Manager"],
      },
      {
        id: createDegreeId("Bachelor IT DUT"),
        name: "Bachelor-level IT",
        faculty: "Information Technology",
        duration: "3 years",
        apsRequirement: 30,
        description: "Bachelor's level IT program with programme details",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Information Technology", level: 4, isRequired: false },
        ],
        careerProspects: [
          "IT Manager",
          "Software Engineer",
          "Systems Architect",
        ],
      },
    ],
  },
  {
    id: createFacultyId("Management Sciences and Arts DUT"),
    name: "Management Sciences & Arts",
    description: "Business management, arts, and commerce programs",
    degrees: [
      {
        id: createDegreeId("Diploma Public Management DUT"),
        name: "Diploma in Public Management",
        faculty: "Management Sciences & Arts",
        duration: "3 years",
        apsRequirement: 27,
        description: "Public sector management and administration",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 3, isRequired: true },
        ],
        careerProspects: [
          "Public Manager",
          "Government Official",
          "Municipal Officer",
        ],
      },
      {
        id: createDegreeId("Diploma Marketing DUT"),
        name: "Diploma in Marketing",
        faculty: "Management Sciences & Arts",
        duration: "3 years",
        apsRequirement: 27,
        description: "Marketing and sales management",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 3, isRequired: true },
        ],
        careerProspects: [
          "Marketing Manager",
          "Sales Representative",
          "Brand Manager",
        ],
      },
      {
        id: createDegreeId("Diploma Internal Auditing DUT"),
        name: "Diploma in Internal Auditing",
        faculty: "Management Sciences & Arts",
        duration: "3 years",
        apsRequirement: 27,
        description: "Internal auditing and risk management",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 3, isRequired: true },
        ],
        careerProspects: [
          "Internal Auditor",
          "Risk Analyst",
          "Compliance Officer",
        ],
      },
      {
        id: createDegreeId("Diploma Office Management DUT"),
        name: "Diploma in Office Management",
        faculty: "Management Sciences & Arts",
        duration: "3 years",
        apsRequirement: 27,
        description: "Office management and administration",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 3, isRequired: true },
        ],
        careerProspects: [
          "Office Manager",
          "Administrative Assistant",
          "Executive Secretary",
        ],
      },
      {
        id: createDegreeId("Bachelor Hospitality Management DUT"),
        name: "Bachelor of Hospitality Management",
        faculty: "Management Sciences & Arts",
        duration: "3 years",
        apsRequirement: 30,
        description: "Hospitality industry management",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Hotel Manager",
          "Restaurant Manager",
          "Event Coordinator",
        ],
      },
      {
        id: createDegreeId("Bachelor of Accountancy DUT"),
        name: "Bachelor of Accountancy",
        faculty: "Management Sciences & Arts",
        duration: "3 years",
        apsRequirement: 30,
        description: "Professional accounting program",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
        ],
        careerProspects: ["Accountant", "Financial Manager", "Auditor"],
      },
      {
        id: createDegreeId("Bachelor Tourism Management DUT"),
        name: "Bachelor of Tourism Management",
        faculty: "Management Sciences & Arts",
        duration: "3 years",
        apsRequirement: 30,
        description: "Tourism industry management and operations",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Geography", level: 3, isRequired: false },
        ],
        careerProspects: ["Tourism Manager", "Tour Guide", "Travel Consultant"],
      },
    ],
  },
  {
    id: createFacultyId("Humanities and Design DUT"),
    name: "Humanities & Design",
    description: "Liberal arts and creative design programs",
    degrees: [
      {
        id: createDegreeId("Bachelor of Arts DUT"),
        name: "Bachelor of Arts",
        faculty: "Humanities & Design",
        duration: "3 years",
        apsRequirement: 24,
        description: "Liberal arts program with strong language results",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Life Orientation", level: 4, isRequired: false },
        ],
        careerProspects: ["Social Worker", "Researcher", "Community Developer"],
      },
    ],
  },
  {
    id: createFacultyId("Education DUT"),
    name: "Education",
    description: "Teacher education and educational programs",
    degrees: [
      {
        id: createDegreeId("BEd Foundation DUT"),
        name: "Bachelor of Education (Foundation)",
        faculty: "Education",
        duration: "4 years",
        apsRequirement: 27,
        description:
          "Foundation phase teacher education with subject-level requirements",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Life Orientation", level: 4, isRequired: false },
        ],
        careerProspects: [
          "Foundation Phase Teacher",
          "Early Childhood Educator",
        ],
      },
      {
        id: createDegreeId("BEd SP FET Various Subjects DUT"),
        name: "Bachelor of Education (SP & FET: various subjects)",
        faculty: "Education",
        duration: "4 years",
        apsRequirement: 27,
        description:
          "Senior phase and FET teaching in various subject areas with subject-level requirements",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Life Orientation", level: 4, isRequired: false },
        ],
        careerProspects: [
          "High School Teacher",
          "Subject Specialist",
          "Education Coordinator",
        ],
      },
    ],
  },
];
