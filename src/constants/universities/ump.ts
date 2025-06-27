import { Faculty } from "@/types/university";
import { createDegreeId, createFacultyId } from "./base";

// University of Mpumalanga (UMP) - Faculty Data - Comprehensive Update
export const UMP_FACULTIES: Faculty[] = [
  {
    id: createFacultyId("Faculty of Social Sciences UMP"),
    name: "Faculty of Social Sciences",
    description: "Social science and community programs",
    degrees: [
      {
        id: createDegreeId("BA General UMP"),
        name: "Bachelor of Arts (General)",
        faculty: "Social Sciences",
        duration: "3 years",
        apsRequirement: 28,
        description:
          "General arts and humanities (requires English Level 4; Mathematics Level 2 or Math Level 3)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 2, isRequired: true },
        ],
        careerProspects: [
          "Social Worker",
          "Community Developer",
          "Government Official",
        ],
      },
      {
        id: createDegreeId("Bachelor Social Work UMP"),
        name: "Bachelor of Social Work",
        faculty: "Social Sciences",
        duration: "4 years",
        apsRequirement: 32,
        description:
          "Professional social work practice (requires English Level 4; Mathematics Level 2 or Math Level 3)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 2, isRequired: true },
          { name: "Life Orientation", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Social Worker",
          "Community Developer",
          "Family Counselor",
        ],
      },
    ],
  },
  {
    id: createFacultyId("Faculty of Agriculture Natural Sciences UMP"),
    name: "Faculty of Agriculture & Natural Sciences",
    description: "Agricultural, environmental, and natural science programs",
    degrees: [
      {
        id: createDegreeId(
          "BSc Agriculture Agricultural Extension Rural Resource Management UMP",
        ),
        name: "Bachelor of Science in Agriculture (Agricultural Extension & Rural Resource Management)",
        faculty: "Agriculture & Natural Sciences",
        duration: "4 years",
        apsRequirement: 26,
        description:
          "Agricultural extension and rural resource management (26 APS with Math / 28 APS with Math Lit)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Life Sciences", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Agricultural Extension Officer",
          "Rural Development Specialist",
          "Agricultural Consultant",
        ],
      },
      {
        id: createDegreeId("BSc Forestry UMP"),
        name: "Bachelor of Science in Forestry",
        faculty: "Agriculture & Natural Sciences",
        duration: "4 years",
        apsRequirement: 30,
        description: "Forestry science and management",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Life Sciences", level: 5, isRequired: true },
        ],
        careerProspects: ["Forester", "Forest Manager", "Conservation Officer"],
      },
      {
        id: createDegreeId("BSc General UMP"),
        name: "Bachelor of Science (General)",
        faculty: "Agriculture & Natural Sciences",
        duration: "3 years",
        apsRequirement: 30,
        description: "General science qualification",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 5, isRequired: true },
          { name: "Physical Sciences", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Scientist",
          "Research Assistant",
          "Laboratory Technician",
        ],
      },
      {
        id: createDegreeId("BSc Environmental Science UMP"),
        name: "Bachelor of Science in Environmental Science",
        faculty: "Agriculture & Natural Sciences",
        duration: "3 years",
        apsRequirement: 30,
        description: "Environmental science and management",
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
        id: createDegreeId("Diploma Plant Production UMP"),
        name: "Diploma in Plant Production",
        faculty: "Agriculture & Natural Sciences",
        duration: "3 years",
        apsRequirement: 23,
        description:
          "Plant production and crop science (23 APS with Math / 24 APS with Math Lit)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Life Sciences", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Plant Production Specialist",
          "Crop Specialist",
          "Agricultural Technician",
        ],
      },
      {
        id: createDegreeId("Diploma Animal Production UMP"),
        name: "Diploma in Animal Production",
        faculty: "Agriculture & Natural Sciences",
        duration: "3 years",
        apsRequirement: 24,
        description:
          "Animal production and livestock management (24 APS with Math / 27 APS with Math Lit)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Life Sciences", level: 5, isRequired: true },
        ],
        careerProspects: [
          "Animal Production Specialist",
          "Livestock Manager",
          "Agricultural Technician",
        ],
      },
    ],
  },
  {
    id: createFacultyId("Faculty of Development Studies Business Sciences UMP"),
    name: "Faculty of Development Studies & Business Sciences",
    description: "Development, business, and administrative programs",
    degrees: [
      {
        id: createDegreeId("BCom General UMP"),
        name: "Bachelor of Commerce (General)",
        faculty: "Development Studies & Business Sciences",
        duration: "3 years",
        apsRequirement: 30,
        description:
          "General commerce qualification (Math required; Math Lit not accepted)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 5, isRequired: true },
        ],
        careerProspects: [
          "Business Manager",
          "Commercial Officer",
          "Financial Analyst",
        ],
      },
      {
        id: createDegreeId("Bachelor Administration UMP"),
        name: "Bachelor of Administration",
        faculty: "Development Studies & Business Sciences",
        duration: "3 years",
        apsRequirement: 32,
        description: "Public and business administration",
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
        id: createDegreeId("Bachelor Development Studies UMP"),
        name: "Bachelor of Development Studies",
        faculty: "Development Studies & Business Sciences",
        duration: "3 years",
        apsRequirement: 32,
        description:
          "Development theory and practice (32 APS with Math / 31 APS with Math Lit)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Development Worker",
          "Project Manager",
          "Social Development Officer",
        ],
      },
    ],
  },
  {
    id: createFacultyId("Faculty of Education UMP"),
    name: "Faculty of Education",
    description: "Teacher education and educational programs",
    degrees: [
      {
        id: createDegreeId("BEd Foundation Phase Teaching UMP"),
        name: "Bachelor of Education (Foundation Phase Teaching)",
        faculty: "Education",
        duration: "4 years",
        apsRequirement: 26,
        description:
          "Foundation phase teaching (26 APS with Math / 27 APS with Math Lit)",
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
    ],
  },
  {
    id: createFacultyId("Faculty of ICT Computing UMP"),
    name: "Faculty of ICT & Computing",
    description: "Information technology and computing programs",
    degrees: [
      {
        id: createDegreeId("Bachelor ICT UMP"),
        name: "Bachelor of Information & Communication Technology (ICT)",
        faculty: "ICT & Computing",
        duration: "3 years",
        apsRequirement: 32,
        description: "Information and communication technology",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Information Technology", level: 4, isRequired: true },
        ],
        careerProspects: [
          "IT Specialist",
          "Software Developer",
          "Systems Administrator",
        ],
      },
      {
        id: createDegreeId("Diploma ICT Applications Development UMP"),
        name: "Diploma in ICT (Applications Development)",
        faculty: "ICT & Computing",
        duration: "3 years",
        apsRequirement: 24,
        description: "ICT with applications development specialization",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Information Technology", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Applications Developer",
          "Software Developer",
          "Systems Analyst",
        ],
      },
      {
        id: createDegreeId("Higher Certificate ICT User Support UMP"),
        name: "Higher Certificate in ICT (User Support)",
        faculty: "ICT & Computing",
        duration: "1 year",
        apsRequirement: 20,
        description:
          "ICT user support (20 APS with Math / 22 APS with Math Lit)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
        ],
        careerProspects: [
          "IT Support Technician",
          "Help Desk Assistant",
          "Computer Technician",
        ],
      },
    ],
  },
  {
    id: createFacultyId("Faculty of Hospitality Tourism UMP"),
    name: "Faculty of Hospitality & Tourism",
    description: "Hospitality and tourism management programs",
    degrees: [
      {
        id: createDegreeId("Diploma Hospitality Management UMP"),
        name: "Diploma in Hospitality Management",
        faculty: "Hospitality & Tourism",
        duration: "3 years",
        apsRequirement: 24,
        description:
          "Hospitality and hotel management (24 APS with Math / 25 APS with Math Lit)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Consumer Studies", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Hotel Manager",
          "Restaurant Manager",
          "Event Coordinator",
        ],
      },
      {
        id: createDegreeId("Higher Certificate Event Management UMP"),
        name: "Higher Certificate in Event Management",
        faculty: "Hospitality & Tourism",
        duration: "1 year",
        apsRequirement: 19,
        description:
          "Event management and coordination (19 APS with Math / 21 APS with Math Lit)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Consumer Studies", level: 3, isRequired: true },
        ],
        careerProspects: [
          "Event Coordinator",
          "Event Assistant",
          "Function Organizer",
        ],
      },
    ],
  },
];
