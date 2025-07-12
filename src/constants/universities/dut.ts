import { Faculty } from "@/types/university";
import { createDegreeId, createFacultyId } from "./base";

// Durban University of Technology (DUT) - Faculty Data - Comprehensive Update
export const DUT_FACULTIES: Faculty[] = [
  {
    id: createFacultyId("Faculty of Engineering Built Environment DUT"),
    name: "Faculty of Engineering & Built Environment",
    description: "Engineering and construction programs",
    degrees: [
      {
        id: createDegreeId("Diploma Engineering Civil DUT"),
        name: "Diploma in Engineering (Civil)",
        faculty: "Engineering & Built Environment",
        duration: "3 years",
        apsRequirement: 24,
        description:
          "Civil engineering technology (24 APS+ with Maths & Physical Sciences L4+)",
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
        id: createDegreeId("Diploma Engineering Electrical DUT"),
        name: "Diploma in Engineering (Electrical)",
        faculty: "Engineering & Built Environment",
        duration: "3 years",
        apsRequirement: 24,
        description:
          "Electrical engineering technology (24 APS+ with Maths & Physical Sciences L4+)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Physical Sciences", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Electrical Engineering Technician",
          "Power Systems Technologist",
          "Control Systems Specialist",
        ],
      },
      {
        id: createDegreeId("Diploma Engineering Mechanical DUT"),
        name: "Diploma in Engineering (Mechanical)",
        faculty: "Engineering & Built Environment",
        duration: "3 years",
        apsRequirement: 24,
        description:
          "Mechanical engineering technology (24 APS+ with Maths & Physical Sciences L4+)",
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
        id: createDegreeId("BEng Technology DUT"),
        name: "BEng Technology (Engineering Technology)",
        faculty: "Engineering & Built Environment",
        duration: "4 years",
        apsRequirement: 28,
        description:
          "Engineering technology degree (28 APS with L4 in Maths & Physical Sciences)",
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
    id: createFacultyId("Faculty of Health Wellness Sciences DUT"),
    name: "Faculty of Health & Wellness Sciences",
    description: "Health and medical science programs",
    degrees: [
      {
        id: createDegreeId("BHSc Medical Laboratory Science DUT"),
        name: "Bachelor of Health Sciences (Medical Laboratory Science)",
        faculty: "Health & Wellness Sciences",
        duration: "4 years",
        apsRequirement: 36,
        description:
          "Medical laboratory science (36 APS plus Maths, Physical Science, Life Sciences prerequisites)",
        subjects: [
          { name: "English", level: 5, isRequired: true },
          { name: "Mathematics", level: 5, isRequired: true },
          { name: "Life Sciences", level: 5, isRequired: true },
          { name: "Physical Sciences", level: 5, isRequired: true },
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
    id: createFacultyId("Faculty of Information Technology DUT"),
    name: "Faculty of Information Technology",
    description: "Information technology and computing programs",
    degrees: [
      {
        id: createDegreeId("Diploma IT DUT"),
        name: "Diploma in IT",
        faculty: "Information Technology",
        duration: "3 years",
        apsRequirement: 26,
        description:
          "Information technology (26–28 APS depending on the stream; Maths L4+ required)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Information Technology", level: 4, isRequired: true },
        ],
        careerProspects: [
          "IT Technician",
          "Software Developer",
          "Systems Administrator",
        ],
      },
      {
        id: createDegreeId("Bachelor IT DUT"),
        name: "Bachelor-level IT",
        faculty: "Information Technology",
        duration: "4 years",
        apsRequirement: 30,
        description:
          "Bachelor's level IT qualification (30 APS+, subject to programme details)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 5, isRequired: true },
          { name: "Information Technology", level: 4, isRequired: true },
        ],
        careerProspects: [
          "IT Specialist",
          "Software Engineer",
          "Systems Analyst",
        ],
      },
    ],
  },
  {
    id: createFacultyId("Faculty of Management Sciences Arts DUT"),
    name: "Faculty of Management Sciences & Arts",
    description: "Management, business, and arts programs",
    degrees: [
      {
        id: createDegreeId("Diploma Public Management DUT"),
        name: "Diploma in Public Management",
        faculty: "Management Sciences & Arts",
        duration: "3 years",
        apsRequirement: 27,
        description: "Public sector management",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
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
        description: "Marketing and business promotion",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Marketing Officer",
          "Brand Manager",
          "Digital Marketing Specialist",
        ],
      },
      {
        id: createDegreeId("Diploma Internal Auditing DUT"),
        name: "Diploma in Internal Auditing",
        faculty: "Management Sciences & Arts",
        duration: "3 years",
        apsRequirement: 27,
        description: "Internal auditing and compliance",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Accounting", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Internal Auditor",
          "Compliance Officer",
          "Risk Analyst",
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
          { name: "Mathematics", level: 4, isRequired: true },
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
        description: "Hospitality and hotel management",
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
        id: createDegreeId("Bachelor Accountancy DUT"),
        name: "Bachelor of Accountancy",
        faculty: "Management Sciences & Arts",
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
        id: createDegreeId("Bachelor Tourism Management DUT"),
        name: "Bachelor of Tourism Management",
        faculty: "Management Sciences & Arts",
        duration: "3 years",
        apsRequirement: 30,
        description: "Tourism management and destination planning",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Geography", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Tourism Manager",
          "Destination Manager",
          "Tourism Planner",
        ],
      },
    ],
  },
  {
    id: createFacultyId("Faculty of Humanities Design DUT"),
    name: "Faculty of Humanities & Design",
    description: "Humanities, arts, and design programs",
    degrees: [
      {
        id: createDegreeId("BA DUT"),
        name: "Bachelor of Arts",
        faculty: "Humanities & Design",
        duration: "3 years",
        apsRequirement: 24,
        description:
          "General arts with strong language results (24 APS+, with strong language results)",
        subjects: [
          { name: "English", level: 5, isRequired: true },
          { name: "Home Language", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Arts Professional",
          "Cultural Worker",
          "Language Specialist",
        ],
      },
    ],
  },
  {
    id: createFacultyId("Faculty of Education DUT"),
    name: "Faculty of Education",
    description: "Teacher education and educational programs",
    degrees: [
      {
        id: createDegreeId("BEd Foundation DUT"),
        name: "Bachelor of Education (Foundation)",
        faculty: "Education",
        duration: "4 years",
        apsRequirement: 27,
        description:
          "Foundation phase teaching (27 APS plus subject-level requirements)",
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
        id: createDegreeId("BEd SP FET Various Subjects DUT"),
        name: "Bachelor of Education (SP & FET: various subjects)",
        faculty: "Education",
        duration: "4 years",
        apsRequirement: 27,
        description:
          "Senior Phase and FET teaching in various subjects (27 APS plus subject-level requirements)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
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
