import { Faculty } from "@/types/university";
import { createDegreeId, createFacultyId } from "./base";

// Central University of Technology (CUT) - Faculty Data - Comprehensive Update
export const CUT_FACULTIES: Faculty[] = [
  {
    id: createFacultyId("Faculty of Engineering Built Environment IT CUT"),
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
          "Civil engineering technology (27 APS NSC 2008+ or 32 APS for degree + subject-level requirements)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 5, isRequired: true },
          { name: "Physical Sciences", level: 5, isRequired: true },
        ],
        careerProspects: [
          "Civil Engineering Technician",
          "Construction Manager",
          "Project Coordinator",
        ],
      },
      {
        id: createDegreeId("Diploma Mechanical Engineering Technology CUT"),
        name: "Diploma in Mechanical Engineering Technology",
        faculty: "Engineering, Built Environment & Information Technology",
        duration: "3 years",
        apsRequirement: 27,
        description:
          "Mechanical engineering technology (27 APS plus subject-level thresholds)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 5, isRequired: true },
          { name: "Physical Sciences", level: 5, isRequired: true },
        ],
        careerProspects: [
          "Mechanical Engineering Technician",
          "Manufacturing Technologist",
          "Maintenance Engineer",
        ],
      },
      {
        id: createDegreeId("BEng Tech Mechanical Engineering CUT"),
        name: "Bachelor of Engineering Technology in Mechanical Engineering",
        faculty: "Engineering, Built Environment & Information Technology",
        duration: "4 years",
        apsRequirement: 32,
        description:
          "Engineering technology in mechanical engineering (32 APS, with subject-level conditions)",
        subjects: [
          { name: "English", level: 5, isRequired: true },
          { name: "Mathematics", level: 6, isRequired: true },
          { name: "Physical Sciences", level: 6, isRequired: true },
        ],
        careerProspects: [
          "Mechanical Engineer",
          "Design Engineer",
          "Manufacturing Engineer",
        ],
      },
      {
        id: createDegreeId("Diploma Information Technology CUT"),
        name: "Diploma in Information Technology",
        faculty: "Engineering, Built Environment & Information Technology",
        duration: "3 years",
        apsRequirement: 27,
        description:
          "Information technology (27 APS plus English & Maths levels)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 5, isRequired: true },
          { name: "Information Technology", level: 4, isRequired: true },
        ],
        careerProspects: [
          "IT Technician",
          "Software Developer",
          "Systems Administrator",
        ],
      },
      {
        id: createDegreeId("Bachelor IT CUT"),
        name: "Bachelor's-level IT (BTech/Bachelor)",
        faculty: "Engineering, Built Environment & Information Technology",
        duration: "4 years",
        apsRequirement: 30,
        description:
          "Bachelor's-level IT qualification (30 APS+ depending on programme)",
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
    id: createFacultyId("Faculty of Health Environmental Sciences CUT"),
    name: "Faculty of Health & Environmental Sciences",
    description: "Health and environmental science programs",
    degrees: [
      {
        id: createDegreeId("BHSc Medical Laboratory Sciences CUT"),
        name: "Bachelor of Health Sciences: Medical Laboratory Sciences",
        faculty: "Health & Environmental Sciences",
        duration: "4 years",
        apsRequirement: 30,
        description: "Medical laboratory sciences",
        subjects: [
          { name: "English", level: 4, isRequired: true },
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
      {
        id: createDegreeId("Diploma Environmental Health CUT"),
        name: "Diploma in Environmental Health",
        faculty: "Health & Environmental Sciences",
        duration: "3 years",
        apsRequirement: 27,
        description: "Environmental health and safety",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Life Sciences", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Environmental Health Officer",
          "Health Inspector",
          "Environmental Consultant",
        ],
      },
      {
        id: createDegreeId("Diploma Dental Assisting CUT"),
        name: "Diploma in Dental Assisting",
        faculty: "Health & Environmental Sciences",
        duration: "3 years",
        apsRequirement: 27,
        description: "Dental assistance and oral health",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Life Sciences", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Dental Assistant",
          "Oral Hygienist",
          "Dental Clinic Coordinator",
        ],
      },
    ],
  },
  {
    id: createFacultyId("Faculty of Management Sciences Humanities CUT"),
    name: "Faculty of Management Sciences & Humanities",
    description: "Management, business, and humanities programs",
    degrees: [
      {
        id: createDegreeId("Diploma Public Management CUT"),
        name: "Diploma in Public Management",
        faculty: "Management Sciences & Humanities",
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
        id: createDegreeId("Diploma Marketing CUT"),
        name: "Diploma in Marketing",
        faculty: "Management Sciences & Humanities",
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
        id: createDegreeId("Diploma Internal Auditing CUT"),
        name: "Diploma in Internal Auditing",
        faculty: "Management Sciences & Humanities",
        duration: "3 years",
        apsRequirement: 28,
        description: "Internal auditing and compliance",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 5, isRequired: true },
          { name: "Accounting", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Internal Auditor",
          "Compliance Officer",
          "Risk Analyst",
        ],
      },
      {
        id: createDegreeId("Diploma Office Management Technology CUT"),
        name: "Diploma in Office Management & Technology",
        faculty: "Management Sciences & Humanities",
        duration: "3 years",
        apsRequirement: 27,
        description: "Office management and technology systems",
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
        id: createDegreeId("Bachelor Hospitality Management CUT"),
        name: "Bachelor of Hospitality Management",
        faculty: "Management Sciences & Humanities",
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
        id: createDegreeId("Bachelor Accountancy CUT"),
        name: "Bachelor of Accountancy",
        faculty: "Management Sciences & Humanities",
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
        id: createDegreeId("Bachelor Tourism Management CUT"),
        name: "Bachelor of Tourism Management",
        faculty: "Management Sciences & Humanities",
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
          "Foundation phase teaching (27 APS with subject-level criteria)",
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
        id: createDegreeId("BEd SP FET Economics CUT"),
        name: "Bachelor of Education (SP & FET – Economics)",
        faculty: "Education",
        duration: "4 years",
        apsRequirement: 27,
        description: "Senior Phase and FET economics teaching",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 5, isRequired: true },
        ],
        careerProspects: [
          "Economics Teacher",
          "Business Studies Teacher",
          "Economic Education Specialist",
        ],
      },
      {
        id: createDegreeId("BEd SP FET Natural Science CUT"),
        name: "Bachelor of Education (SP & FET – Natural Science)",
        faculty: "Education",
        duration: "4 years",
        apsRequirement: 27,
        description: "Senior Phase and FET natural science teaching",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Physical Sciences", level: 5, isRequired: true },
        ],
        careerProspects: [
          "Science Teacher",
          "Natural Science Teacher",
          "STEM Education Specialist",
        ],
      },
      {
        id: createDegreeId("BEd SP FET Languages CUT"),
        name: "Bachelor of Education (SP & FET – Languages)",
        faculty: "Education",
        duration: "4 years",
        apsRequirement: 27,
        description: "Senior Phase and FET language teaching",
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
        id: createDegreeId("BEd SP FET Mathematics CUT"),
        name: "Bachelor of Education (SP & FET – Mathematics)",
        faculty: "Education",
        duration: "4 years",
        apsRequirement: 27,
        description: "Senior Phase and FET mathematics teaching",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 6, isRequired: true },
        ],
        careerProspects: [
          "Mathematics Teacher",
          "Mathematical Literacy Teacher",
          "STEM Education Specialist",
        ],
      },
      {
        id: createDegreeId("BEd SP FET Computer Science CUT"),
        name: "Bachelor of Education (SP & FET – Computer Science)",
        faculty: "Education",
        duration: "4 years",
        apsRequirement: 27,
        description: "Senior Phase and FET computer science teaching",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 5, isRequired: true },
          { name: "Information Technology", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Computer Science Teacher",
          "IT Teacher",
          "Digital Education Specialist",
        ],
      },
    ],
  },
];
