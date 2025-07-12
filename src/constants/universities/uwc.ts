import { Faculty } from "@/types/university";
import { createDegreeId, createFacultyId } from "./base";

// University of Western Cape (UWC) - Faculty Data
export const UWC_FACULTIES: Faculty[] = [
  {
    id: createFacultyId("Faculty of Community and Health Sciences UWC"),
    name: "Faculty of Community and Health Sciences",
    description: "Health, social work, and community development programs",
    degrees: [
      {
        id: createDegreeId("Bachelor Social Work UWC"),
        name: "Bachelor of Social Work",
        faculty: "Community and Health Sciences",
        duration: "4 years",
        apsRequirement: 34, // 34 UWC points
        description: "Social work practice and community development",
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
        id: createDegreeId("Bachelor Community Development UWC"),
        name: "Bachelor of Community Development",
        faculty: "Community and Health Sciences",
        duration: "3 years",
        apsRequirement: 30, // 30 UWC points
        description: "Community development and social change",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Life Orientation", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Community Developer",
          "Development Worker",
          "Project Coordinator",
        ],
      },
      {
        id: createDegreeId("BA Sport Recreation Exercise Science UWC"),
        name: "BA Sport, Recreation and Exercise Science",
        faculty: "Community and Health Sciences",
        duration: "3 years",
        apsRequirement: 30, // 30 UWC points
        description: "Sports and exercise science",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Life Sciences", level: 4, isRequired: true },
          { name: "Mathematics", level: 3, isRequired: true },
        ],
        careerProspects: [
          "Sports Scientist",
          "Exercise Physiologist",
          "Recreation Officer",
        ],
      },
      {
        id: createDegreeId("BSc Dietetics Nutrition UWC"),
        name: "BSc Dietetics and Nutrition",
        faculty: "Community and Health Sciences",
        duration: "4 years",
        apsRequirement: 33, // 33 UWC points
        description: "Nutrition and dietetic practice",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Life Sciences", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
        ],
        careerProspects: ["Dietitian", "Nutritionist", "Food Service Manager"],
      },
      {
        id: createDegreeId("BSc Sport Exercise Science UWC"),
        name: "BSc Sport and Exercise Science",
        faculty: "Community and Health Sciences",
        duration: "3 years",
        apsRequirement: 33, // 33 UWC points
        description: "Sports science and exercise physiology",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Life Sciences", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Sports Scientist",
          "Exercise Physiologist",
          "Sports Coach",
        ],
      },
      {
        id: createDegreeId("BSc Occupational Therapy UWC"),
        name: "BSc Occupational Therapy",
        faculty: "Community and Health Sciences",
        duration: "4 years",
        apsRequirement: 33, // 33 UWC points
        description: "Occupational therapy practice",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Life Sciences", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Occupational Therapist",
          "Rehabilitation Specialist",
          "Community Health Worker",
        ],
      },
      {
        id: createDegreeId("BSc Physiotherapy UWC"),
        name: "BSc Physiotherapy",
        faculty: "Community and Health Sciences",
        duration: "4 years",
        apsRequirement: 39, // 39 UWC points
        description: "Physical therapy and rehabilitation",
        subjects: [
          { name: "English", level: 5, isRequired: true },
          { name: "Life Sciences", level: 5, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Physical Sciences", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Physiotherapist",
          "Sports Therapist",
          "Rehabilitation Specialist",
        ],
      },
      {
        id: createDegreeId("B Nursing Midwifery UWC"),
        name: "B Nursing and Midwifery",
        faculty: "Community and Health Sciences",
        duration: "4 years",
        apsRequirement: 30, // 30 UWC points
        description: "Professional nursing and midwifery practice",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Life Sciences", level: 4, isRequired: true },
          { name: "Mathematics", level: 3, isRequired: true },
        ],
        careerProspects: [
          "Professional Nurse",
          "Midwife",
          "Clinical Specialist",
        ],
      },
    ],
  },
  {
    id: createFacultyId("Faculty of Economic and Management Sciences UWC"),
    name: "Faculty of Economic and Management Sciences",
    description: "Business, economics, and management programs",
    degrees: [
      {
        id: createDegreeId("BAdmin UWC"),
        name: "BAdmin",
        faculty: "Economic and Management Sciences",
        duration: "3 years",
        apsRequirement: 30, // 30 UWC points
        description: "Public administration and governance",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 3, isRequired: true },
        ],
        careerProspects: [
          "Public Administrator",
          "Government Official",
          "Policy Officer",
        ],
      },
      {
        id: createDegreeId("BCom 3 year stream UWC"),
        name: "BCom",
        faculty: "Economic and Management Sciences",
        duration: "3 years",
        apsRequirement: 30, // 30 UWC points (3-year stream)
        description: "General commerce and business",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Business Analyst",
          "Financial Officer",
          "Management Trainee",
        ],
      },
      {
        id: createDegreeId("BCom Financial Accounting UWC"),
        name: "BCom Financial Accounting",
        faculty: "Economic and Management Sciences",
        duration: "3 years",
        apsRequirement: 30, // 30 UWC points
        description: "Financial accounting and reporting",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Accounting", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Financial Accountant",
          "Bookkeeper",
          "Accounting Officer",
        ],
      },
      {
        id: createDegreeId("BCom Information Systems UWC"),
        name: "BCom Information Systems",
        faculty: "Economic and Management Sciences",
        duration: "3 years",
        apsRequirement: 30, // 30 UWC points (Maths Code 4 required)
        description: "Business information systems",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Systems Analyst",
          "IT Business Analyst",
          "Information Systems Manager",
        ],
      },
      {
        id: createDegreeId("BCom Accounting 3 year stream UWC"),
        name: "BCom Accounting (3-year stream)",
        faculty: "Economic and Management Sciences",
        duration: "3 years",
        apsRequirement: 30, // 30 UWC points (Maths Code 4 AND Accounting Code 5 OR Maths Code 5)
        description: "Professional accounting pathway",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Accounting", level: 5, isRequired: true },
        ],
        careerProspects: [
          "Chartered Accountant",
          "Auditor",
          "Financial Manager",
        ],
      },
      {
        id: createDegreeId("BCom 4 year stream UWC"),
        name: "BCom (4-year stream)",
        faculty: "Economic and Management Sciences",
        duration: "4 years",
        apsRequirement: 30, // 30 UWC points (Maths Code 2 OR Maths Literacy Code 6)
        description: "Extended commerce programme",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematical Literacy", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Business Analyst",
          "Financial Officer",
          "Management Trainee",
        ],
      },
      {
        id: createDegreeId("BCom Accounting 4 year stream UWC"),
        name: "BCom Accounting (4-year stream)",
        faculty: "Economic and Management Sciences",
        duration: "4 years",
        apsRequirement: 30, // 30 UWC points (Maths Code 4 AND Accounting Code 5 OR Maths Code 4)
        description: "Extended accounting programme",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Accounting", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Chartered Accountant",
          "Auditor",
          "Financial Manager",
        ],
      },
    ],
  },
  {
    id: createFacultyId("Faculty of Arts and Humanities UWC"),
    name: "Faculty of Arts and Humanities",
    description: "Arts, humanities, and language programs",
    degrees: [
      {
        id: createDegreeId("Bachelor Arts BA UWC"),
        name: "Bachelor of Arts (BA)",
        faculty: "Arts and Humanities",
        duration: "3 years",
        apsRequirement: 35, // 35 UWC points
        description: "General arts and humanities",
        subjects: [{ name: "English", level: 4, isRequired: true }],
        careerProspects: [
          "Administrative Officer",
          "Communications Officer",
          "Research Assistant",
        ],
      },
      {
        id: createDegreeId("Bachelor Theology BTh UWC"),
        name: "Bachelor of Theology (BTh)",
        faculty: "Arts and Humanities",
        duration: "3 years",
        apsRequirement: 35, // 35 UWC points
        description: "Theological studies and ministry",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Life Orientation", level: 3, isRequired: true },
        ],
        careerProspects: ["Minister", "Chaplain", "Religious Counselor"],
      },
      {
        id: createDegreeId("Bachelor Library Information Science BLIS UWC"),
        name: "Bachelor of Library and Information Science (BLIS)",
        faculty: "Arts and Humanities",
        duration: "3 years",
        apsRequirement: 35, // 35 UWC points
        description: "Library and information management",
        subjects: [{ name: "English", level: 4, isRequired: true }],
        careerProspects: [
          "Librarian",
          "Information Manager",
          "Knowledge Manager",
        ],
      },
    ],
  },
  {
    id: createFacultyId("Faculty of Natural Sciences UWC"),
    name: "Faculty of Natural Sciences",
    description: "Natural sciences and technology programs",
    degrees: [
      {
        id: createDegreeId("BSc Environmental Water Science UWC"),
        name: "BSc Environmental and Water Science",
        faculty: "Natural Sciences",
        duration: "3 years",
        apsRequirement: 33, // 33 UWC points
        description: "Environmental science and water management",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Life Sciences", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Environmental Scientist",
          "Water Resource Manager",
          "Environmental Consultant",
        ],
      },
      {
        id: createDegreeId("BSc Biotechnology UWC"),
        name: "BSc Biotechnology",
        faculty: "Natural Sciences",
        duration: "3 years",
        apsRequirement: 33, // 33 UWC points
        description: "Biological technology applications",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Life Sciences", level: 5, isRequired: true },
          { name: "Physical Sciences", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Biotechnologist",
          "Research Scientist",
          "Product Developer",
        ],
      },
      {
        id: createDegreeId("BSc Biodiversity Conservation Biology UWC"),
        name: "BSc Biodiversity and Conservation Biology",
        faculty: "Natural Sciences",
        duration: "3 years",
        apsRequirement: 33, // 33 UWC points
        description: "Biodiversity conservation and ecology",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Life Sciences", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Conservation Biologist",
          "Ecologist",
          "Environmental Consultant",
        ],
      },
      {
        id: createDegreeId("BSc Medical Bioscience UWC"),
        name: "BSc Medical Bioscience",
        faculty: "Natural Sciences",
        duration: "3 years",
        apsRequirement: 33, // 33 UWC points
        description: "Medical and health sciences foundation",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Life Sciences", level: 5, isRequired: true },
          { name: "Physical Sciences", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Medical Researcher",
          "Laboratory Scientist",
          "Health Specialist",
        ],
      },
      {
        id: createDegreeId("BSc Chemical Sciences UWC"),
        name: "BSc Chemical Sciences",
        faculty: "Natural Sciences",
        duration: "3 years",
        apsRequirement: 33, // 33 UWC points
        description: "Chemical analysis and research",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Physical Sciences", level: 5, isRequired: true },
        ],
        careerProspects: [
          "Chemist",
          "Laboratory Analyst",
          "Research Scientist",
        ],
      },
      {
        id: createDegreeId("BSc Applied Geology UWC"),
        name: "BSc Applied Geology",
        faculty: "Natural Sciences",
        duration: "3 years",
        apsRequirement: 33, // 33 UWC points
        description: "Applied geology and earth sciences",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Physical Sciences", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Geologist",
          "Mining Geologist",
          "Environmental Consultant",
        ],
      },
      {
        id: createDegreeId("BSc Physical Science UWC"),
        name: "BSc Physical Science",
        faculty: "Natural Sciences",
        duration: "3 years",
        apsRequirement: 33, // 33 UWC points
        description: "Physical sciences and physics",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 5, isRequired: true },
          { name: "Physical Sciences", level: 5, isRequired: true },
        ],
        careerProspects: ["Physicist", "Research Scientist", "Science Teacher"],
      },
      {
        id: createDegreeId("BSc Mathematical Statistical Sciences UWC"),
        name: "BSc Mathematical & Statistical Sciences",
        faculty: "Natural Sciences",
        duration: "3 years",
        apsRequirement: 33, // 33 UWC points
        description: "Mathematics and statistical analysis",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 5, isRequired: true },
        ],
        careerProspects: [
          "Statistician",
          "Data Analyst",
          "Mathematics Teacher",
        ],
      },
      {
        id: createDegreeId("BSc Computer Science UWC"),
        name: "BSc Computer Science",
        faculty: "Natural Sciences",
        duration: "3 years",
        apsRequirement: 33, // 33 UWC points
        description: "Computer science and programming",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 5, isRequired: true },
        ],
        careerProspects: [
          "Software Developer",
          "Computer Scientist",
          "Systems Analyst",
        ],
      },
      {
        id: createDegreeId("Bachelor Pharmacy UWC"),
        name: "Bachelor of Pharmacy",
        faculty: "Natural Sciences",
        duration: "4 years",
        apsRequirement: 38, // 38 UWC points
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
    ],
  },
  {
    id: createFacultyId("Faculty of Dentistry UWC"),
    name: "Faculty of Dentistry",
    description: "Dental and oral health programs",
    degrees: [
      {
        id: createDegreeId("Bachelor Dental Surgery BDS UWC"),
        name: "Bachelor of Dental Surgery (BDS)",
        faculty: "Dentistry",
        duration: "5 years",
        apsRequirement: 40, // 40 UWC points
        description: "Dental medicine and surgery",
        subjects: [
          { name: "English", level: 5, isRequired: true },
          { name: "Mathematics", level: 5, isRequired: true },
          { name: "Life Sciences", level: 6, isRequired: true },
          { name: "Physical Sciences", level: 5, isRequired: true },
        ],
        careerProspects: ["Dentist", "Oral Surgeon", "Dental Specialist"],
      },
      {
        id: createDegreeId("Bachelor Oral Health BOH UWC"),
        name: "Bachelor of Oral Health (BOH)",
        faculty: "Dentistry",
        duration: "3 years",
        apsRequirement: 33, // 33 UWC points
        description: "Oral health and dental therapy",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Life Sciences", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Oral Hygienist",
          "Dental Therapist",
          "Oral Health Educator",
        ],
      },
    ],
  },
  {
    id: createFacultyId("Faculty of Law UWC"),
    name: "Faculty of Law",
    description: "Legal education and jurisprudence programs",
    degrees: [
      {
        id: createDegreeId("Bachelor Laws LLB 4 year program UWC"),
        name: "Bachelor of Laws (LLB) (4-year program)",
        faculty: "Law",
        duration: "4 years",
        apsRequirement: 37, // 37 UWC points
        description: "Professional legal qualification",
        subjects: [
          { name: "English", level: 5, isRequired: true },
          { name: "Life Orientation", level: 4, isRequired: true },
        ],
        careerProspects: ["Lawyer", "Attorney", "Legal Advisor"],
      },
      {
        id: createDegreeId("BCom Law UWC"),
        name: "BCom Law",
        faculty: "Law",
        duration: "3 years",
        apsRequirement: 30, // 30 UWC points
        description: "Commerce with legal foundation",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Corporate Legal Officer",
          "Legal Advisor",
          "Compliance Officer",
        ],
      },
      {
        id: createDegreeId("Bachelor Arts Law BA Law 3 year program UWC"),
        name: "Bachelor of Arts in Law - BA (Law) (3-year program)",
        faculty: "Law",
        duration: "3 years",
        apsRequirement: 37, // 37 UWC points
        description: "Liberal arts with legal foundation",
        subjects: [
          { name: "English", level: 5, isRequired: true },
          { name: "Life Orientation", level: 4, isRequired: true },
        ],
        careerProspects: ["Legal Assistant", "Paralegal", "Legal Researcher"],
      },
    ],
  },
  {
    id: createFacultyId("Faculty of Education UWC"),
    name: "Faculty of Education",
    description: "Teacher education and training programs",
    degrees: [
      {
        id: createDegreeId(
          "BEd Accounting FET Economic Management Sciences SP Mathematics SP UWC",
        ),
        name: "BEd Accounting (FET), Economic and Management Sciences (SP), and Mathematics (SP)",
        faculty: "Education",
        duration: "4 years",
        apsRequirement: 33, // 33 UWC points
        description: "Teaching accounting, EMS, and mathematics",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Accounting", level: 4, isRequired: true },
        ],
        careerProspects: [
          "High School Teacher",
          "Subject Specialist",
          "Educational Consultant",
        ],
      },
      {
        id: createDegreeId(
          "BEd Mathematics SP Mathematical Literacy SP FET Natural Science SP UWC",
        ),
        name: "BEd Mathematics (SP), Mathematical Literacy (SP & FET), and Natural Science (SP)",
        faculty: "Education",
        duration: "4 years",
        apsRequirement: 33, // 33 UWC points
        description: "Teaching mathematics and natural sciences",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Life Sciences", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Mathematics Teacher",
          "Science Teacher",
          "Educational Specialist",
        ],
      },
      {
        id: createDegreeId("BEd Languages SP FET Life Orientation SP UWC"),
        name: "BEd Languages (SP & FET) and Life Orientation (SP)",
        faculty: "Education",
        duration: "4 years",
        apsRequirement: 33, // 33 UWC points
        description: "Teaching languages and life orientation",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Additional Language", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Language Teacher",
          "Life Orientation Teacher",
          "Educational Consultant",
        ],
      },
      {
        id: createDegreeId("BEd Languages SP FET Mathematics SP UWC"),
        name: "BEd Languages (SP & FET) and Mathematics (SP)",
        faculty: "Education",
        duration: "4 years",
        apsRequirement: 33, // 33 UWC points
        description: "Teaching languages and mathematics",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Additional Language", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Language Teacher",
          "Mathematics Teacher",
          "Educational Specialist",
        ],
      },
      {
        id: createDegreeId("BEd Languages SP FET Social Sciences SP UWC"),
        name: "BEd Languages (SP & FET) and Social Sciences (SP)",
        faculty: "Education",
        duration: "4 years",
        apsRequirement: 33, // 33 UWC points
        description: "Teaching languages and social sciences",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Additional Language", level: 4, isRequired: true },
          { name: "History", level: 4, isRequired: false },
        ],
        careerProspects: [
          "Language Teacher",
          "Social Sciences Teacher",
          "Educational Consultant",
        ],
      },
      {
        id: createDegreeId("BEd Foundation Phase Teaching UWC"),
        name: "BEd Foundation Phase Teaching",
        faculty: "Education",
        duration: "4 years",
        apsRequirement: 33, // 33 UWC points
        description: "Foundation phase teaching (Grades R-3)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Foundation Phase Teacher",
          "Primary School Teacher",
          "Educational Specialist",
        ],
      },
    ],
  },
];
