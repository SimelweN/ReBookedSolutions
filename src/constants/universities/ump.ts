import { Faculty } from "@/types/university";
import { createDegreeId, createFacultyId } from "./base";

// University of Mpumalanga (UMP) - Faculty Data - Complete Update
export const UMP_FACULTIES: Faculty[] = [
  {
    id: createFacultyId("Faculty of Social Sciences UMP"),
    name: "Faculty of Social Sciences",
    description: "Social sciences and human development programs",
    degrees: [
      {
        id: createDegreeId("BA General UMP"),
        name: "Bachelor of Arts (General)",
        faculty: "Social Sciences",
        duration: "3 years",
        apsRequirement: 28,
        description:
          "Liberal arts foundation program requiring English Level 4 and Mathematics Level 2 or Math Lit Level 3",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 2, isRequired: true },
          { name: "Mathematical Literacy", level: 3, isRequired: false },
        ],
        careerProspects: ["Social Worker", "Researcher", "Community Developer"],
      },
      {
        id: createDegreeId("Bachelor of Social Work UMP"),
        name: "Bachelor of Social Work",
        faculty: "Social Sciences",
        duration: "4 years",
        apsRequirement: 32,
        description:
          "Professional social work program requiring English Level 4 and Mathematics Level 2 or Math Lit Level 3",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 2, isRequired: true },
          { name: "Mathematical Literacy", level: 3, isRequired: false },
        ],
        careerProspects: [
          "Social Worker",
          "Community Developer",
          "Case Manager",
        ],
      },
    ],
  },
  {
    id: createFacultyId("Faculty of Agriculture and Natural Sciences UMP"),
    name: "Faculty of Agriculture & Natural Sciences",
    description:
      "Agriculture, environmental sciences, and natural sciences programs",
    degrees: [
      {
        id: createDegreeId(
          "BSc Agriculture Extension Rural Resource Management UMP",
        ),
        name: "Bachelor of Science in Agriculture (Agricultural Extension & Rural Resource Management)",
        faculty: "Agriculture & Natural Sciences",
        duration: "4 years",
        apsRequirement: 26,
        description:
          "Agricultural extension and rural development with Mathematics, requiring English Level 4",
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
        id: createDegreeId(
          "BSc Agriculture Extension Rural Resource Management Math Lit UMP",
        ),
        name: "Bachelor of Science in Agriculture (Agricultural Extension & Rural Resource Management) - Math Lit",
        faculty: "Agriculture & Natural Sciences",
        duration: "4 years",
        apsRequirement: 28,
        description:
          "Agricultural extension and rural development with Mathematical Literacy, requiring English Level 4",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematical Literacy", level: 4, isRequired: true },
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
        description:
          "Forestry science and management, requiring English Level 4 and relevant science subjects",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Life Sciences", level: 4, isRequired: true },
          { name: "Physical Sciences", level: 4, isRequired: false },
        ],
        careerProspects: [
          "Forester",
          "Conservation Officer",
          "Environmental Consultant",
        ],
      },
      {
        id: createDegreeId("BSc General UMP"),
        name: "Bachelor of Science (General)",
        faculty: "Agriculture & Natural Sciences",
        duration: "3 years",
        apsRequirement: 30,
        description:
          "General science degree, requiring English Level 4 and relevant science subjects",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Physical Sciences", level: 4, isRequired: true },
          { name: "Life Sciences", level: 4, isRequired: false },
        ],
        careerProspects: [
          "Research Scientist",
          "Laboratory Technician",
          "Science Teacher",
        ],
      },
      {
        id: createDegreeId("BSc Environmental Science UMP"),
        name: "Bachelor of Science in Environmental Science",
        faculty: "Agriculture & Natural Sciences",
        duration: "3 years",
        apsRequirement: 30,
        description:
          "Environmental science and sustainability, requiring English Level 4 and relevant science subjects",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Physical Sciences", level: 4, isRequired: true },
          { name: "Life Sciences", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Environmental Scientist",
          "Conservation Officer",
          "Sustainability Consultant",
        ],
      },
      {
        id: createDegreeId("Diploma Plant Production UMP"),
        name: "Diploma in Plant Production",
        faculty: "Agriculture & Natural Sciences",
        duration: "3 years",
        apsRequirement: 23,
        description:
          "Plant production and crop science with Mathematics, requiring English Level 4",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 3, isRequired: true },
          { name: "Life Sciences", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Crop Specialist",
          "Farm Manager",
          "Agricultural Technician",
        ],
      },
      {
        id: createDegreeId("Diploma Plant Production Math Lit UMP"),
        name: "Diploma in Plant Production - Math Lit",
        faculty: "Agriculture & Natural Sciences",
        duration: "3 years",
        apsRequirement: 24,
        description:
          "Plant production and crop science with Mathematical Literacy, requiring English Level 4",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematical Literacy", level: 4, isRequired: true },
          { name: "Life Sciences", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Crop Specialist",
          "Farm Manager",
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
          "Animal production and livestock management with Mathematics, requiring English Level 4",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 3, isRequired: true },
          { name: "Life Sciences", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Livestock Manager",
          "Animal Technician",
          "Farm Supervisor",
        ],
      },
      {
        id: createDegreeId("Diploma Animal Production Math Lit UMP"),
        name: "Diploma in Animal Production - Math Lit",
        faculty: "Agriculture & Natural Sciences",
        duration: "3 years",
        apsRequirement: 27,
        description:
          "Animal production and livestock management with Mathematical Literacy, requiring English Level 4",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematical Literacy", level: 4, isRequired: true },
          { name: "Life Sciences", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Livestock Manager",
          "Animal Technician",
          "Farm Supervisor",
        ],
      },
    ],
  },
  {
    id: createFacultyId(
      "Faculty of Development Studies and Business Sciences UMP",
    ),
    name: "Faculty of Development Studies & Business Sciences",
    description: "Business, development studies, and administration programs",
    degrees: [
      {
        id: createDegreeId("BCom General UMP"),
        name: "Bachelor of Commerce (General)",
        faculty: "Development Studies & Business Sciences",
        duration: "3 years",
        apsRequirement: 30,
        description:
          "General commerce program requiring Mathematics (Math Lit not accepted) and English Level 4",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Business Manager",
          "Financial Analyst",
          "Entrepreneur",
        ],
      },
      {
        id: createDegreeId("Bachelor of Administration UMP"),
        name: "Bachelor of Administration",
        faculty: "Development Studies & Business Sciences",
        duration: "3 years",
        apsRequirement: 32,
        description:
          "Public and private sector administration, requiring English Level 4 with additional subject-level requirements",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
        ],
        careerProspects: ["Administrator", "Government Official", "Manager"],
      },
      {
        id: createDegreeId("Bachelor of Development Studies UMP"),
        name: "Bachelor of Development Studies",
        faculty: "Development Studies & Business Sciences",
        duration: "3 years",
        apsRequirement: 32,
        description:
          "Development studies with Mathematics, requiring English Level 4",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Development Specialist",
          "Project Manager",
          "Policy Analyst",
        ],
      },
      {
        id: createDegreeId("Bachelor of Development Studies Math Lit UMP"),
        name: "Bachelor of Development Studies - Math Lit",
        faculty: "Development Studies & Business Sciences",
        duration: "3 years",
        apsRequirement: 31,
        description:
          "Development studies with Mathematical Literacy, requiring English Level 4",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematical Literacy", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Development Specialist",
          "Project Manager",
          "Policy Analyst",
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
          "Foundation phase teacher education with Mathematics, requiring appropriate subject combinations and English Level 4",
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
        id: createDegreeId("BEd Foundation Phase Teaching Math Lit UMP"),
        name: "Bachelor of Education (Foundation Phase Teaching) - Math Lit",
        faculty: "Education",
        duration: "4 years",
        apsRequirement: 27,
        description:
          "Foundation phase teacher education with Mathematical Literacy, requiring appropriate subject combinations and English Level 4",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematical Literacy", level: 4, isRequired: true },
          { name: "Life Orientation", level: 4, isRequired: false },
        ],
        careerProspects: [
          "Foundation Phase Teacher",
          "Early Childhood Educator",
        ],
      },
    ],
  },
  {
    id: createFacultyId("Faculty of ICT and Computing UMP"),
    name: "Faculty of ICT & Computing",
    description: "Information and communication technology programs",
    degrees: [
      {
        id: createDegreeId("Bachelor of ICT UMP"),
        name: "Bachelor of Information & Communication Technology (ICT)",
        faculty: "ICT & Computing",
        duration: "3 years",
        apsRequirement: 32,
        description:
          "ICT program requiring English Level 4 and Math/Math Lit at Level 4",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Mathematical Literacy", level: 4, isRequired: false },
          { name: "Information Technology", level: 4, isRequired: false },
        ],
        careerProspects: [
          "Software Developer",
          "IT Specialist",
          "Systems Analyst",
        ],
      },
      {
        id: createDegreeId("Diploma ICT Applications Development UMP"),
        name: "Diploma in ICT (Applications Development)",
        faculty: "ICT & Computing",
        duration: "3 years",
        apsRequirement: 24,
        description:
          "ICT applications development requiring English Level 4 and Math/Math Lit at Level 4",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Mathematical Literacy", level: 4, isRequired: false },
          { name: "Information Technology", level: 4, isRequired: false },
        ],
        careerProspects: [
          "Applications Developer",
          "Software Programmer",
          "Web Developer",
        ],
      },
      {
        id: createDegreeId("Higher Certificate ICT User Support UMP"),
        name: "Higher Certificate in ICT (User Support)",
        faculty: "ICT & Computing",
        duration: "1 year",
        apsRequirement: 20,
        description:
          "ICT user support with Mathematics, requiring English Level 4 and Math/Math Lit at Level 4",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Information Technology", level: 3, isRequired: false },
        ],
        careerProspects: [
          "IT Support Specialist",
          "Help Desk Technician",
          "Computer Technician",
        ],
      },
      {
        id: createDegreeId("Higher Certificate ICT User Support Math Lit UMP"),
        name: "Higher Certificate in ICT (User Support) - Math Lit",
        faculty: "ICT & Computing",
        duration: "1 year",
        apsRequirement: 22,
        description:
          "ICT user support with Mathematical Literacy, requiring English Level 4 and Math/Math Lit at Level 4",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematical Literacy", level: 4, isRequired: true },
          { name: "Information Technology", level: 3, isRequired: false },
        ],
        careerProspects: [
          "IT Support Specialist",
          "Help Desk Technician",
          "Computer Technician",
        ],
      },
    ],
  },
  {
    id: createFacultyId("Faculty of Hospitality and Tourism UMP"),
    name: "Faculty of Hospitality & Tourism",
    description: "Hospitality management and tourism programs",
    degrees: [
      {
        id: createDegreeId("Diploma Hospitality Management UMP"),
        name: "Diploma in Hospitality Management",
        faculty: "Hospitality & Tourism",
        duration: "3 years",
        apsRequirement: 24,
        description: "Hospitality management with Mathematics",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 3, isRequired: true },
          { name: "Life Orientation", level: 3, isRequired: false },
        ],
        careerProspects: [
          "Hotel Manager",
          "Restaurant Manager",
          "Event Coordinator",
        ],
      },
      {
        id: createDegreeId("Diploma Hospitality Management Math Lit UMP"),
        name: "Diploma in Hospitality Management - Math Lit",
        faculty: "Hospitality & Tourism",
        duration: "3 years",
        apsRequirement: 25,
        description: "Hospitality management with Mathematical Literacy",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematical Literacy", level: 4, isRequired: true },
          { name: "Life Orientation", level: 3, isRequired: false },
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
        description: "Event management with Mathematics",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 3, isRequired: true },
          { name: "Life Orientation", level: 3, isRequired: false },
        ],
        careerProspects: [
          "Event Coordinator",
          "Wedding Planner",
          "Conference Manager",
        ],
      },
      {
        id: createDegreeId("Higher Certificate Event Management Math Lit UMP"),
        name: "Higher Certificate in Event Management - Math Lit",
        faculty: "Hospitality & Tourism",
        duration: "1 year",
        apsRequirement: 21,
        description: "Event management with Mathematical Literacy",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematical Literacy", level: 4, isRequired: true },
          { name: "Life Orientation", level: 3, isRequired: false },
        ],
        careerProspects: [
          "Event Coordinator",
          "Wedding Planner",
          "Conference Manager",
        ],
      },
    ],
  },
];
