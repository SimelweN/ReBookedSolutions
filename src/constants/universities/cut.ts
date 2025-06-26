import { Faculty } from "@/types/university";
import { createDegreeId, createFacultyId } from "./base";

// Central University of Technology (CUT) - Faculty Data
export const CUT_FACULTIES: Faculty[] = [
  {
    id: createFacultyId(
      "Faculty of Engineering Built Environment and Information Technology CUT",
    ),
    name: "Faculty of Engineering, Built Environment & Information Technology",
    description:
      "Engineering, construction, and information technology programs",
    degrees: [
      {
        id: createDegreeId("Diploma Civil Engineering CUT"),
        name: "Diploma in Civil Engineering",
        faculty: "Engineering, Built Environment & Information Technology",
        duration: "3 years",
        apsRequirement: 27,
        description:
          "Civil engineering diploma (NSC 2008+) with subject-level requirements",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Physical Sciences", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Civil Engineering Technician",
          "Construction Manager",
          "Project Coordinator",
        ],
      },
      {
        id: createDegreeId("Bachelor Civil Engineering CUT"),
        name: "Bachelor of Engineering in Civil Engineering",
        faculty: "Engineering, Built Environment & Information Technology",
        duration: "4 years",
        apsRequirement: 32,
        description:
          "Professional civil engineering degree with subject-level conditions",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 5, isRequired: true },
          { name: "Physical Sciences", level: 5, isRequired: true },
        ],
        careerProspects: [
          "Civil Engineer",
          "Structural Engineer",
          "Water Engineer",
        ],
      },
      {
        id: createDegreeId("Diploma Mechanical Engineering Technology CUT"),
        name: "Diploma in Mechanical Engineering Technology",
        faculty: "Engineering, Built Environment & Information Technology",
        duration: "3 years",
        apsRequirement: 27,
        description:
          "Mechanical engineering technology with subject-level thresholds",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Physical Sciences", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Mechanical Engineering Technician",
          "Manufacturing Technologist",
          "Maintenance Engineer",
        ],
      },
      {
        id: createDegreeId("BTech Mechanical Engineering CUT"),
        name: "Bachelor of Engineering Technology in Mechanical Engineering",
        faculty: "Engineering, Built Environment & Information Technology",
        duration: "4 years",
        apsRequirement: 32,
        description:
          "Mechanical engineering technology degree with subject-level conditions",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 5, isRequired: true },
          { name: "Physical Sciences", level: 5, isRequired: true },
        ],
        careerProspects: [
          "Mechanical Engineer",
          "Design Engineer",
          "Production Engineer",
        ],
      },
      {
        id: createDegreeId("Diploma Information Technology CUT"),
        name: "Diploma in Information Technology",
        faculty: "Engineering, Built Environment & Information Technology",
        duration: "3 years",
        apsRequirement: 27,
        description:
          "Information technology diploma with English & Maths level requirements",
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
        id: createDegreeId("Bachelor Information Technology CUT"),
        name: "Bachelor of Information Technology",
        faculty: "Engineering, Built Environment & Information Technology",
        duration: "3 years",
        apsRequirement: 30,
        description: "Bachelor's-level IT program depending on specialization",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Information Technology", level: 4, isRequired: false },
        ],
        careerProspects: ["IT Manager", "Systems Analyst", "Software Engineer"],
      },
    ],
  },
  {
    id: createFacultyId("Faculty of Health and Environmental Sciences CUT"),
    name: "Faculty of Health & Environmental Sciences",
    description: "Health sciences and environmental programs",
    degrees: [
      {
        id: createDegreeId("BHealthSci Medical Laboratory Sciences CUT"),
        name: "Bachelor of Health Sciences: Medical Laboratory Sciences",
        faculty: "Health & Environmental Sciences",
        duration: "4 years",
        apsRequirement: 30,
        description: "Medical laboratory sciences program",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Physical Sciences", level: 4, isRequired: true },
          { name: "Life Sciences", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Medical Laboratory Scientist",
          "Clinical Laboratory Technologist",
          "Research Scientist",
        ],
      },
      {
        id: createDegreeId("Diploma Environmental Health CUT"),
        name: "Diploma in Environmental Health",
        faculty: "Health & Environmental Sciences",
        duration: "3 years",
        apsRequirement: 27,
        description: "Environmental health and safety",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 3, isRequired: true },
          { name: "Life Sciences", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Environmental Health Officer",
          "Public Health Inspector",
          "Safety Officer",
        ],
      },
      {
        id: createDegreeId("Diploma Dental Assisting CUT"),
        name: "Diploma in Dental Assisting",
        faculty: "Health & Environmental Sciences",
        duration: "3 years",
        apsRequirement: 27,
        description: "Dental assistance and oral health care",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Life Sciences", level: 4, isRequired: true },
          { name: "Physical Sciences", level: 3, isRequired: false },
        ],
        careerProspects: [
          "Dental Assistant",
          "Oral Health Therapist",
          "Dental Practice Manager",
        ],
      },
    ],
  },
  {
    id: createFacultyId("Faculty of Management Sciences and Humanities CUT"),
    name: "Faculty of Management Sciences & Humanities",
    description: "Business management, humanities, and hospitality programs",
    degrees: [
      {
        id: createDegreeId("Diploma Public Management CUT"),
        name: "Diploma in Public Management",
        faculty: "Management Sciences & Humanities",
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
        id: createDegreeId("Diploma Marketing CUT"),
        name: "Diploma in Marketing",
        faculty: "Management Sciences & Humanities",
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
        id: createDegreeId("Diploma Internal Auditing CUT"),
        name: "Diploma in Internal Auditing",
        faculty: "Management Sciences & Humanities",
        duration: "3 years",
        apsRequirement: 28,
        description: "Internal auditing and risk management",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Internal Auditor",
          "Risk Analyst",
          "Compliance Officer",
        ],
      },
      {
        id: createDegreeId("Diploma Office Management Technology CUT"),
        name: "Diploma in Office Management & Technology",
        faculty: "Management Sciences & Humanities",
        duration: "3 years",
        apsRequirement: 27,
        description: "Office management with technology integration",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 3, isRequired: true },
          { name: "Information Technology", level: 3, isRequired: false },
        ],
        careerProspects: [
          "Office Manager",
          "Administrative Assistant",
          "Executive Secretary",
        ],
      },
      {
        id: createDegreeId("Bachelor Hospitality Management CUT"),
        name: "Bachelor of Hospitality Management",
        faculty: "Management Sciences & Humanities",
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
        id: createDegreeId("Bachelor of Accountancy CUT"),
        name: "Bachelor of Accountancy",
        faculty: "Management Sciences & Humanities",
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
        id: createDegreeId("Bachelor Tourism Management CUT"),
        name: "Bachelor of Tourism Management",
        faculty: "Management Sciences & Humanities",
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
    id: createFacultyId("Faculty of Education CUT"),
    name: "Faculty of Education",
    description: "Teacher education and educational programs",
    degrees: [
      {
        id: createDegreeId("BEd Foundation Phase CUT"),
        name: "Bachelor of Education (Foundation Phase)",
        faculty: "Education",
        duration: "4 years",
        apsRequirement: 27,
        description:
          "Foundation phase teacher education with subject-level criteria",
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
        id: createDegreeId("BEd SP FET Economics CUT"),
        name: "Bachelor of Education (SP & FET – Economics)",
        faculty: "Education",
        duration: "4 years",
        apsRequirement: 27,
        description: "Senior phase and FET economics teaching",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Economics", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Economics Teacher",
          "Business Studies Teacher",
          "Education Specialist",
        ],
      },
      {
        id: createDegreeId("BEd SP FET Natural Science CUT"),
        name: "Bachelor of Education (SP & FET – Natural Science)",
        faculty: "Education",
        duration: "4 years",
        apsRequirement: 27,
        description: "Senior phase and FET natural science teaching",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Physical Sciences", level: 4, isRequired: true },
          { name: "Life Sciences", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Science Teacher",
          "Natural Science Educator",
          "Curriculum Specialist",
        ],
      },
      {
        id: createDegreeId("BEd SP FET Languages CUT"),
        name: "Bachelor of Education (SP & FET – Languages)",
        faculty: "Education",
        duration: "4 years",
        apsRequirement: 27,
        description: "Senior phase and FET language teaching",
        subjects: [
          { name: "English", level: 5, isRequired: true },
          { name: "Additional Language", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Language Teacher",
          "English Teacher",
          "Language Specialist",
        ],
      },
      {
        id: createDegreeId("BEd SP FET Maths CUT"),
        name: "Bachelor of Education (SP & FET – Maths)",
        faculty: "Education",
        duration: "4 years",
        apsRequirement: 27,
        description: "Senior phase and FET mathematics teaching",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 5, isRequired: true },
        ],
        careerProspects: [
          "Mathematics Teacher",
          "Mathematical Sciences Educator",
          "Curriculum Developer",
        ],
      },
      {
        id: createDegreeId("BEd SP FET Computer Science CUT"),
        name: "Bachelor of Education (SP & FET – Computer Science)",
        faculty: "Education",
        duration: "4 years",
        apsRequirement: 27,
        description: "Senior phase and FET computer science teaching",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Information Technology", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Computer Science Teacher",
          "IT Educator",
          "Technology Coordinator",
        ],
      },
    ],
  },
];
