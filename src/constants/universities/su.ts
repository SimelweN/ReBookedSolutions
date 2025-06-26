import { Faculty } from "@/types/university";
import { createDegreeId, createFacultyId } from "./base";

// Stellenbosch University (SU) - Faculty Data
export const SU_FACULTIES: Faculty[] = [
  {
    id: createFacultyId("Faculty of AgriSciences SU"),
    name: "Faculty of AgriSciences",
    description: "Agricultural and food sciences programs",
    degrees: [
      {
        id: createDegreeId("BAgric Agribusiness Management SU"),
        name: "BAgric in Agribusiness Management",
        faculty: "AgriSciences",
        duration: "3 years",
        apsRequirement: 24, // 60% excluding Life Orientation
        description: "Agricultural business management and economics",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Agribusiness Manager",
          "Agricultural Economist",
          "Farm Manager",
        ],
      },
      {
        id: createDegreeId("BScAgric Agricultural Economics SU"),
        name: "BScAgric in Agricultural Economics",
        faculty: "AgriSciences",
        duration: "4 years",
        apsRequirement: 24, // 60% excluding Life Orientation
        description: "Agricultural economics and policy",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Agricultural Economist",
          "Policy Analyst",
          "Research Economist",
        ],
      },
      {
        id: createDegreeId(
          "BAgric Agricultural Production Management Elsenburg SU",
        ),
        name: "BAgric in Agricultural Production and Management: Elsenburg",
        faculty: "AgriSciences",
        duration: "3 years",
        apsRequirement: 22, // 55% excluding Life Orientation
        description: "Agricultural production and farm management",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 3, isRequired: true },
        ],
        careerProspects: [
          "Farm Manager",
          "Agricultural Advisor",
          "Production Manager",
        ],
      },
      {
        id: createDegreeId("BScAgric Animal Production Systems SU"),
        name: "BScAgric in Animal Production Systems",
        faculty: "AgriSciences",
        duration: "4 years",
        apsRequirement: 24, // 60% excluding Life Orientation
        description: "Animal science and livestock production",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Life Sciences", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Animal Scientist",
          "Livestock Manager",
          "Veterinary Technician",
        ],
      },
      {
        id: createDegreeId("BScAgric Plant Soil Science SU"),
        name: "BScAgric in Plant and Soil Science",
        faculty: "AgriSciences",
        duration: "4 years",
        apsRequirement: 24, // 60% excluding Life Orientation
        description: "Plant production and soil management",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Life Sciences", level: 4, isRequired: true },
        ],
        careerProspects: ["Plant Scientist", "Soil Specialist", "Crop Advisor"],
      },
      {
        id: createDegreeId("BScAgric Viticulture Oenology SU"),
        name: "BScAgric in Viticulture and Oenology",
        faculty: "AgriSciences",
        duration: "4 years",
        apsRequirement: 24, // 60% excluding Life Orientation
        description: "Wine production and viticulture",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Life Sciences", level: 4, isRequired: true },
        ],
        careerProspects: ["Winemaker", "Viticulturist", "Wine Consultant"],
      },
    ],
  },
  {
    id: createFacultyId("Faculty of Arts and Social Sciences SU"),
    name: "Faculty of Arts and Social Sciences",
    description: "Humanities, arts, and social sciences programs",
    degrees: [
      {
        id: createDegreeId("BA Humanities SU"),
        name: "BA in Humanities",
        faculty: "Arts and Social Sciences",
        duration: "3 years",
        apsRequirement: 25, // 63% excluding Life Orientation
        description: "Humanities and liberal arts",
        subjects: [{ name: "English", level: 4, isRequired: true }],
        careerProspects: [
          "Administrative Officer",
          "Communications Officer",
          "Research Assistant",
        ],
      },
      {
        id: createDegreeId("BA Language Culture SU"),
        name: "BA in Language and Culture",
        faculty: "Arts and Social Sciences",
        duration: "3 years",
        apsRequirement: 25, // 63% excluding Life Orientation
        description: "Language studies and cultural analysis",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Additional Language", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Translator",
          "Language Teacher",
          "Cultural Consultant",
        ],
      },
      {
        id: createDegreeId("BA Development Environment SU"),
        name: "BA in Development and the Environment",
        faculty: "Arts and Social Sciences",
        duration: "3 years",
        apsRequirement: 25, // 63% excluding Life Orientation
        description: "Development studies and environmental issues",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Geography", level: 4, isRequired: false },
        ],
        careerProspects: [
          "Development Worker",
          "Environmental Consultant",
          "Project Coordinator",
        ],
      },
      {
        id: createDegreeId("BA Drama Theatre Studies SU"),
        name: "BA in Drama and Theatre Studies",
        faculty: "Arts and Social Sciences",
        duration: "3 years",
        apsRequirement: 26, // 65% excluding Life Orientation
        description: "Theatre and dramatic arts",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Dramatic Arts", level: 4, isRequired: true },
        ],
        careerProspects: ["Actor", "Theatre Director", "Drama Teacher"],
      },
      {
        id: createDegreeId("BA Human Resource Management SU"),
        name: "BA in Human Resource Management",
        faculty: "Arts and Social Sciences",
        duration: "3 years",
        apsRequirement: 25, // 63% excluding Life Orientation
        description: "Human resources and people management",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 3, isRequired: true },
        ],
        careerProspects: [
          "HR Manager",
          "Recruitment Specialist",
          "Training Officer",
        ],
      },
      {
        id: createDegreeId("BA International Studies SU"),
        name: "BA in International Studies",
        faculty: "Arts and Social Sciences",
        duration: "3 years",
        apsRequirement: 25, // 63% excluding Life Orientation
        description: "International relations and global studies",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "History", level: 4, isRequired: false },
        ],
        careerProspects: [
          "Diplomat",
          "International Relations Officer",
          "Policy Analyst",
        ],
      },
      {
        id: createDegreeId("BA Law SU"),
        name: "BA in Law",
        faculty: "Arts and Social Sciences",
        duration: "3 years",
        apsRequirement: 28, // 70% excluding Life Orientation
        description: "Liberal arts with legal foundation",
        subjects: [
          { name: "English", level: 5, isRequired: true },
          { name: "Life Orientation", level: 4, isRequired: true },
        ],
        careerProspects: ["Legal Assistant", "Paralegal", "Legal Researcher"],
      },
      {
        id: createDegreeId("Bachelor Music BMus SU"),
        name: "Bachelor of Music (BMus)",
        faculty: "Arts and Social Sciences",
        duration: "4 years",
        apsRequirement: 24, // 60% excluding Life Orientation
        description: "Music performance and composition",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Music", level: 5, isRequired: true },
        ],
        careerProspects: ["Musician", "Music Teacher", "Composer"],
      },
      {
        id: createDegreeId("BA Music SU"),
        name: "BA in Music",
        faculty: "Arts and Social Sciences",
        duration: "3 years",
        apsRequirement: 24, // 60% excluding Life Orientation
        description: "Music studies and theory",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Music", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Music Teacher",
          "Music Therapist",
          "Arts Administrator",
        ],
      },
      {
        id: createDegreeId("Diploma Practical Music SU"),
        name: "Diploma in Practical Music",
        faculty: "Arts and Social Sciences",
        duration: "3 years",
        apsRequirement: 16, // 40% excluding Life Orientation
        description: "Practical music training",
        subjects: [
          { name: "English", level: 3, isRequired: true },
          { name: "Music", level: 3, isRequired: true },
        ],
        careerProspects: [
          "Music Performer",
          "Music Instructor",
          "Studio Musician",
        ],
      },
      {
        id: createDegreeId("Advanced Diploma Practical Music SU"),
        name: "Advanced Diploma in Practical Music",
        faculty: "Arts and Social Sciences",
        duration: "1 year",
        apsRequirement: 20, // Diploma qualification required
        description: "Advanced practical music training",
        subjects: [{ name: "Music", level: 4, isRequired: true }],
        careerProspects: [
          "Professional Musician",
          "Music Director",
          "Performance Artist",
        ],
      },
      {
        id: createDegreeId("Higher Certificate Music SU"),
        name: "Higher Certificate in Music",
        faculty: "Arts and Social Sciences",
        duration: "1 year",
        apsRequirement: 20, // NSC required
        description: "Music foundation qualification",
        subjects: [
          { name: "English", level: 3, isRequired: true },
          { name: "Music", level: 3, isRequired: true },
        ],
        careerProspects: [
          "Music Assistant",
          "Junior Music Teacher",
          "Music Coordinator",
        ],
      },
      {
        id: createDegreeId("BA Political Philosophical Economic Studies SU"),
        name: "BA in Political, Philosophical and Economic Studies (PPE)",
        faculty: "Arts and Social Sciences",
        duration: "3 years",
        apsRequirement: 25, // 63% excluding Life Orientation
        description: "Interdisciplinary PPE studies",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Policy Analyst",
          "Political Researcher",
          "Economic Analyst",
        ],
      },
      {
        id: createDegreeId("Bachelor Social Work SU"),
        name: "Bachelor of Social Work",
        faculty: "Arts and Social Sciences",
        duration: "4 years",
        apsRequirement: 25, // 63% excluding Life Orientation
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
        id: createDegreeId("BA Visual Arts SU"),
        name: "BA in Visual Arts",
        faculty: "Arts and Social Sciences",
        duration: "4 years",
        apsRequirement: 24, // 60% excluding Life Orientation
        description: "Visual arts and creative expression",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Visual Arts", level: 4, isRequired: true },
        ],
        careerProspects: ["Artist", "Art Teacher", "Gallery Curator"],
      },
    ],
  },
  {
    id: createFacultyId("Faculty of Economic and Management Sciences SU"),
    name: "Faculty of Economic and Management Sciences",
    description: "Business, economics, and management programs",
    degrees: [
      {
        id: createDegreeId("Diploma Sustainable Development SU"),
        name: "Diploma in Sustainable Development",
        faculty: "Economic and Management Sciences",
        duration: "3 years",
        apsRequirement: 22, // 55% excluding Life Orientation
        description: "Sustainable development and environmental management",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 3, isRequired: true },
        ],
        careerProspects: [
          "Sustainability Officer",
          "Environmental Consultant",
          "Development Worker",
        ],
      },
      {
        id: createDegreeId("BCom Economic Sciences SU"),
        name: "BCom (Economic Sciences)",
        faculty: "Economic and Management Sciences",
        duration: "3 years",
        apsRequirement: 26, // 65% excluding Life Orientation
        description: "Economics and economic analysis",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
        ],
        careerProspects: ["Economist", "Policy Analyst", "Market Researcher"],
      },
      {
        id: createDegreeId("BCom Management Sciences SU"),
        name: "BCom (Management Sciences)",
        faculty: "Economic and Management Sciences",
        duration: "3 years",
        apsRequirement: 26, // 65% excluding Life Orientation
        description: "Business and management sciences",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Business Manager",
          "Operations Manager",
          "Management Consultant",
        ],
      },
      {
        id: createDegreeId("BCom Management Sciences ECP SU"),
        name: "BCom (Management Sciences) Extended Curriculum Programme (ECP)",
        faculty: "Economic and Management Sciences",
        duration: "4 years",
        apsRequirement: 24, // 60% excluding Life Orientation
        description: "Extended management sciences programme",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 3, isRequired: true },
        ],
        careerProspects: [
          "Business Manager",
          "Operations Manager",
          "Management Consultant",
        ],
      },
      {
        id: createDegreeId("BCom Mathematical Sciences SU"),
        name: "BCom (Mathematical Sciences)",
        faculty: "Economic and Management Sciences",
        duration: "3 years",
        apsRequirement: 28, // 70% excluding Life Orientation
        description: "Business mathematics and quantitative analysis",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 5, isRequired: true },
        ],
        careerProspects: [
          "Financial Analyst",
          "Quantitative Analyst",
          "Risk Manager",
        ],
      },
      {
        id: createDegreeId("BCom International Business SU"),
        name: "BCom (International Business)",
        faculty: "Economic and Management Sciences",
        duration: "4 years",
        apsRequirement: 32, // 80% excluding Life Orientation
        description: "International business and trade",
        subjects: [
          { name: "English", level: 5, isRequired: true },
          { name: "Mathematics", level: 5, isRequired: true },
        ],
        careerProspects: [
          "International Business Manager",
          "Export Manager",
          "Trade Specialist",
        ],
      },
      {
        id: createDegreeId("BCom Actuarial Science SU"),
        name: "BCom (Actuarial Science)",
        faculty: "Economic and Management Sciences",
        duration: "3 years",
        apsRequirement: 32, // 80% excluding Life Orientation
        description: "Actuarial science and risk management",
        subjects: [
          { name: "English", level: 5, isRequired: true },
          { name: "Mathematics", level: 6, isRequired: true },
        ],
        careerProspects: ["Actuary", "Risk Analyst", "Financial Analyst"],
      },
      {
        id: createDegreeId("BCom Industrial Psychology SU"),
        name: "BCom (Industrial Psychology)",
        faculty: "Economic and Management Sciences",
        duration: "3 years",
        apsRequirement: 26, // 65% excluding Life Orientation
        description: "Industrial psychology and human behavior",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Industrial Psychologist",
          "HR Specialist",
          "Organizational Consultant",
        ],
      },
      {
        id: createDegreeId("BAcc SU"),
        name: "BAcc",
        faculty: "Economic and Management Sciences",
        duration: "3 years",
        apsRequirement: 28, // 70% excluding Life Orientation
        description: "Professional accounting qualification",
        subjects: [
          { name: "English", level: 5, isRequired: true },
          { name: "Mathematics", level: 5, isRequired: true },
          { name: "Accounting", level: 5, isRequired: true },
        ],
        careerProspects: [
          "Chartered Accountant",
          "Auditor",
          "Financial Manager",
        ],
      },
      {
        id: createDegreeId("BCom Management Accounting SU"),
        name: "BCom (Management Accounting)",
        faculty: "Economic and Management Sciences",
        duration: "3 years",
        apsRequirement: 26, // 65% excluding Life Orientation
        description: "Management accounting and cost control",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Accounting", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Management Accountant",
          "Cost Accountant",
          "Financial Analyst",
        ],
      },
      {
        id: createDegreeId("BCom Financial Accounting SU"),
        name: "BCom (Financial Accounting)",
        faculty: "Economic and Management Sciences",
        duration: "3 years",
        apsRequirement: 26, // 65% excluding Life Orientation
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
    ],
  },
  {
    id: createFacultyId("Faculty of Education SU"),
    name: "Faculty of Education",
    description: "Teacher education and training programs",
    degrees: [
      {
        id: createDegreeId("BEd Foundation Phase Education SU"),
        name: "BEd (Foundation Phase Education)",
        faculty: "Education",
        duration: "4 years",
        apsRequirement: 24, // 60% excluding Life Orientation
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
      {
        id: createDegreeId("BEd Intermediate Phase Education SU"),
        name: "BEd (Intermediate Phase Education)",
        faculty: "Education",
        duration: "4 years",
        apsRequirement: 24, // 60% excluding Life Orientation
        description: "Intermediate phase teaching (Grades 4-6)",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Intermediate Phase Teacher",
          "Primary School Teacher",
          "Subject Specialist",
        ],
      },
      {
        id: createDegreeId("PGCE SU"),
        name: "Postgraduate Certificate in Education (PGCE)",
        faculty: "Education",
        duration: "1 year",
        apsRequirement: 24, // Degree required
        description: "Postgraduate teacher training",
        subjects: [
          { name: "Degree qualification", level: 1, isRequired: true },
        ],
        careerProspects: [
          "High School Teacher",
          "Subject Specialist",
          "Educational Consultant",
        ],
      },
    ],
  },
  {
    id: createFacultyId("Faculty of Engineering SU"),
    name: "Faculty of Engineering",
    description: "Engineering and technology programs",
    degrees: [
      {
        id: createDegreeId("BEng Chemical SU"),
        name: "BEng (Chemical)",
        faculty: "Engineering",
        duration: "4 years",
        apsRequirement: 28, // 70% excluding Life Orientation
        description: "Chemical process engineering",
        subjects: [
          { name: "English", level: 5, isRequired: true },
          { name: "Mathematics", level: 6, isRequired: true },
          { name: "Physical Sciences", level: 5, isRequired: true },
        ],
        careerProspects: [
          "Chemical Engineer",
          "Process Engineer",
          "Plant Manager",
        ],
      },
      {
        id: createDegreeId("BEng Civil SU"),
        name: "BEng (Civil)",
        faculty: "Engineering",
        duration: "4 years",
        apsRequirement: 28, // 70% excluding Life Orientation
        description: "Infrastructure and construction engineering",
        subjects: [
          { name: "English", level: 5, isRequired: true },
          { name: "Mathematics", level: 6, isRequired: true },
          { name: "Physical Sciences", level: 5, isRequired: true },
        ],
        careerProspects: [
          "Civil Engineer",
          "Structural Engineer",
          "Project Manager",
        ],
      },
      {
        id: createDegreeId("BEng Electrical Electronic SU"),
        name: "BEng (Electrical and Electronic)",
        faculty: "Engineering",
        duration: "4 years",
        apsRequirement: 28, // 70% excluding Life Orientation
        description: "Electrical and electronic engineering",
        subjects: [
          { name: "English", level: 5, isRequired: true },
          { name: "Mathematics", level: 6, isRequired: true },
          { name: "Physical Sciences", level: 5, isRequired: true },
        ],
        careerProspects: [
          "Electrical Engineer",
          "Electronic Engineer",
          "Systems Engineer",
        ],
      },
      {
        id: createDegreeId("BEng Electrical Electronic Data Engineering SU"),
        name: "BEng (Electrical and Electronic) (Data Engineering)",
        faculty: "Engineering",
        duration: "4 years",
        apsRequirement: 28, // 70% excluding Life Orientation
        description: "Data engineering and electrical systems",
        subjects: [
          { name: "English", level: 5, isRequired: true },
          { name: "Mathematics", level: 6, isRequired: true },
          { name: "Physical Sciences", level: 5, isRequired: true },
        ],
        careerProspects: [
          "Data Engineer",
          "Systems Engineer",
          "Software Engineer",
        ],
      },
      {
        id: createDegreeId("BEng Industrial SU"),
        name: "BEng (Industrial)",
        faculty: "Engineering",
        duration: "4 years",
        apsRequirement: 28, // 70% excluding Life Orientation
        description: "Manufacturing and operations engineering",
        subjects: [
          { name: "English", level: 5, isRequired: true },
          { name: "Mathematics", level: 6, isRequired: true },
          { name: "Physical Sciences", level: 5, isRequired: true },
        ],
        careerProspects: [
          "Industrial Engineer",
          "Operations Manager",
          "Quality Engineer",
        ],
      },
      {
        id: createDegreeId("BEng Mechanical SU"),
        name: "BEng (Mechanical)",
        faculty: "Engineering",
        duration: "4 years",
        apsRequirement: 28, // 70% excluding Life Orientation
        description: "Mechanical systems and design engineering",
        subjects: [
          { name: "English", level: 5, isRequired: true },
          { name: "Mathematics", level: 6, isRequired: true },
          { name: "Physical Sciences", level: 5, isRequired: true },
        ],
        careerProspects: [
          "Mechanical Engineer",
          "Design Engineer",
          "Manufacturing Engineer",
        ],
      },
      {
        id: createDegreeId("BEng Mechatronic SU"),
        name: "BEng (Mechatronic)",
        faculty: "Engineering",
        duration: "4 years",
        apsRequirement: 28, // 70% excluding Life Orientation
        description: "Mechatronics and automation engineering",
        subjects: [
          { name: "English", level: 5, isRequired: true },
          { name: "Mathematics", level: 6, isRequired: true },
          { name: "Physical Sciences", level: 5, isRequired: true },
        ],
        careerProspects: [
          "Mechatronics Engineer",
          "Automation Engineer",
          "Robotics Engineer",
        ],
      },
    ],
  },
  {
    id: createFacultyId("Faculty of Law SU"),
    name: "Faculty of Law",
    description: "Legal education and jurisprudence programs",
    degrees: [
      {
        id: createDegreeId("LLB 4 years SU"),
        name: "LLB (4 years)",
        faculty: "Law",
        duration: "4 years",
        apsRequirement: 28, // 70% excluding Life Orientation
        description: "Professional legal qualification",
        subjects: [
          { name: "English", level: 5, isRequired: true },
          { name: "Life Orientation", level: 4, isRequired: true },
        ],
        careerProspects: ["Lawyer", "Attorney", "Legal Advisor"],
      },
      {
        id: createDegreeId("LLB 3 years SU"),
        name: "LLB (3 years)",
        faculty: "Law",
        duration: "3 years",
        apsRequirement: 24, // Prior bachelor's degree with 60% aggregate
        description: "Graduate law degree",
        subjects: [{ name: "Bachelor's degree", level: 1, isRequired: true }],
        careerProspects: ["Lawyer", "Attorney", "Legal Advisor"],
      },
      {
        id: createDegreeId("BA Law Faculty SU"),
        name: "BA (Law)",
        faculty: "Law",
        duration: "3 years",
        apsRequirement: 28, // 70% excluding Life Orientation
        description: "Liberal arts with legal foundation",
        subjects: [
          { name: "English", level: 5, isRequired: true },
          { name: "Life Orientation", level: 4, isRequired: true },
        ],
        careerProspects: ["Legal Assistant", "Paralegal", "Legal Researcher"],
      },
      {
        id: createDegreeId("BCom Law SU"),
        name: "BCom (Law)",
        faculty: "Law",
        duration: "3 years",
        apsRequirement: 28, // 70% excluding Life Orientation
        description: "Commerce with legal foundation",
        subjects: [
          { name: "English", level: 5, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Corporate Legal Officer",
          "Legal Advisor",
          "Compliance Officer",
        ],
      },
      {
        id: createDegreeId("BAccLLB SU"),
        name: "BAccLLB",
        faculty: "Law",
        duration: "5 years",
        apsRequirement: 32, // 80% excluding Life Orientation
        description: "Combined accounting and law degree",
        subjects: [
          { name: "English", level: 5, isRequired: true },
          { name: "Mathematics", level: 5, isRequired: true },
          { name: "Accounting", level: 5, isRequired: true },
        ],
        careerProspects: [
          "Corporate Lawyer",
          "Legal Accountant",
          "Business Attorney",
        ],
      },
    ],
  },
  {
    id: createFacultyId("Faculty of Medicine and Health Sciences SU"),
    name: "Faculty of Medicine and Health Sciences",
    description: "Medical and health-related programs",
    degrees: [
      {
        id: createDegreeId("MBChB SU"),
        name: "MBChB",
        faculty: "Medicine and Health Sciences",
        duration: "6 years",
        apsRequirement: 30, // 75% excluding Life Orientation
        description: "Medical practice and surgery",
        subjects: [
          { name: "English", level: 5, isRequired: true },
          { name: "Mathematics", level: 5, isRequired: true },
          { name: "Life Sciences", level: 6, isRequired: true },
          { name: "Physical Sciences", level: 5, isRequired: true },
        ],
        careerProspects: ["Medical Doctor", "Surgeon", "Medical Specialist"],
      },
      {
        id: createDegreeId("Bachelor Nursing SU"),
        name: "Bachelor of Nursing",
        faculty: "Medicine and Health Sciences",
        duration: "4 years",
        apsRequirement: 24, // 60% excluding Life Orientation
        description: "Professional nursing practice",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Life Sciences", level: 4, isRequired: true },
          { name: "Mathematics", level: 3, isRequired: true },
        ],
        careerProspects: [
          "Professional Nurse",
          "Nurse Manager",
          "Clinical Specialist",
        ],
      },
      {
        id: createDegreeId("BSc Dietetics SU"),
        name: "BSc in Dietetics",
        faculty: "Medicine and Health Sciences",
        duration: "4 years",
        apsRequirement: 24, // 60% excluding Life Orientation
        description: "Nutrition and dietetic practice",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Life Sciences", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
        ],
        careerProspects: ["Dietitian", "Nutritionist", "Food Service Manager"],
      },
      {
        id: createDegreeId("Bachelor Occupational Therapy SU"),
        name: "Bachelor of Occupational Therapy",
        faculty: "Medicine and Health Sciences",
        duration: "4 years",
        apsRequirement: 24, // 60% excluding Life Orientation
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
        id: createDegreeId("BSc Physiotherapy SU"),
        name: "BSc in Physiotherapy",
        faculty: "Medicine and Health Sciences",
        duration: "4 years",
        apsRequirement: 24, // 60% excluding Life Orientation
        description: "Physical therapy and rehabilitation",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Life Sciences", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Physiotherapist",
          "Sports Therapist",
          "Rehabilitation Specialist",
        ],
      },
      {
        id: createDegreeId("Bachelor Speech Language Hearing Therapy SU"),
        name: "Bachelor of Speech-Language and Hearing Therapy",
        faculty: "Medicine and Health Sciences",
        duration: "4 years",
        apsRequirement: 24, // 60% excluding Life Orientation
        description: "Speech, language, and hearing therapy",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Life Sciences", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Speech Therapist",
          "Audiologist",
          "Communication Specialist",
        ],
      },
    ],
  },
  {
    id: createFacultyId("Faculty of Science SU"),
    name: "Faculty of Science",
    description: "Natural sciences and technology programs",
    degrees: [
      {
        id: createDegreeId("BSc Biodiversity Ecology SU"),
        name: "BSc Biodiversity and Ecology",
        faculty: "Science",
        duration: "3 years",
        apsRequirement: 26, // 65% excluding Life Orientation
        description: "Biodiversity conservation and ecological studies",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Life Sciences", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Ecologist",
          "Conservation Scientist",
          "Environmental Consultant",
        ],
      },
      {
        id: createDegreeId("BSc Human Life Sciences SU"),
        name: "BSc Human Life Sciences",
        faculty: "Science",
        duration: "3 years",
        apsRequirement: 26, // 65% excluding Life Orientation
        description: "Human biology and life sciences",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Life Sciences", level: 5, isRequired: true },
        ],
        careerProspects: [
          "Life Scientist",
          "Medical Researcher",
          "Health Specialist",
        ],
      },
      {
        id: createDegreeId("BSc Molecular Biology Biotechnology SU"),
        name: "BSc Molecular Biology and Biotechnology",
        faculty: "Science",
        duration: "3 years",
        apsRequirement: 26, // 65% excluding Life Orientation
        description: "Molecular biology and biotechnology applications",
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
        id: createDegreeId("BSc Sport Science SU"),
        name: "BSc Sport Science",
        faculty: "Science",
        duration: "3 years",
        apsRequirement: 26, // 65% excluding Life Orientation
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
        id: createDegreeId("BSc Chemistry SU"),
        name: "BSc Chemistry",
        faculty: "Science",
        duration: "3 years",
        apsRequirement: 26, // 65% excluding Life Orientation
        description: "Chemical analysis and research",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 5, isRequired: true },
          { name: "Physical Sciences", level: 5, isRequired: true },
        ],
        careerProspects: [
          "Chemist",
          "Laboratory Analyst",
          "Research Scientist",
        ],
      },
      {
        id: createDegreeId("BSc Earth Science SU"),
        name: "BSc Earth Science",
        faculty: "Science",
        duration: "3 years",
        apsRequirement: 26, // 65% excluding Life Orientation
        description: "Earth sciences and geological processes",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
          { name: "Physical Sciences", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Geologist",
          "Earth Scientist",
          "Environmental Consultant",
        ],
      },
      {
        id: createDegreeId("BSc Geoinformatics SU"),
        name: "BSc Geoinformatics",
        faculty: "Science",
        duration: "3 years",
        apsRequirement: 26, // 65% excluding Life Orientation
        description: "Geographic information systems and spatial analysis",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 5, isRequired: true },
          { name: "Geography", level: 4, isRequired: true },
        ],
        careerProspects: ["GIS Specialist", "Spatial Analyst", "Cartographer"],
      },
      {
        id: createDegreeId("BSc Physics SU"),
        name: "BSc Physics",
        faculty: "Science",
        duration: "3 years",
        apsRequirement: 26, // 65% excluding Life Orientation
        description: "Physical sciences and theoretical physics",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 6, isRequired: true },
          { name: "Physical Sciences", level: 5, isRequired: true },
        ],
        careerProspects: ["Physicist", "Research Scientist", "Science Teacher"],
      },
      {
        id: createDegreeId("BSc Mathematical Sciences SU"),
        name: "BSc Mathematical Sciences",
        faculty: "Science",
        duration: "3 years",
        apsRequirement: 26, // 65% excluding Life Orientation
        description: "Pure and applied mathematics",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 6, isRequired: true },
        ],
        careerProspects: [
          "Mathematician",
          "Data Analyst",
          "Mathematics Teacher",
        ],
      },
      {
        id: createDegreeId("BSc Computer Science SU"),
        name: "BSc Computer Science",
        faculty: "Science",
        duration: "3 years",
        apsRequirement: 26, // 65% excluding Life Orientation
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
        id: createDegreeId("BSc Interdisciplinary Programmes SU"),
        name: "BSc (Interdisciplinary Programmes)",
        faculty: "Science",
        duration: "3 years",
        apsRequirement: 26, // 65% excluding Life Orientation
        description: "Interdisciplinary science programmes",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Mathematics", level: 4, isRequired: true },
        ],
        careerProspects: [
          "Research Scientist",
          "Science Consultant",
          "Technical Specialist",
        ],
      },
      {
        id: createDegreeId("Bachelor Data Science BDatSci SU"),
        name: "Bachelor of Data Science (BDatSci)",
        faculty: "Science",
        duration: "4 years",
        apsRequirement: 32, // 80% excluding Life Orientation
        description: "Data science and analytics",
        subjects: [
          { name: "English", level: 5, isRequired: true },
          { name: "Mathematics", level: 6, isRequired: true },
        ],
        careerProspects: [
          "Data Scientist",
          "Data Analyst",
          "Machine Learning Engineer",
        ],
      },
    ],
  },
  {
    id: createFacultyId("Faculty of Theology SU"),
    name: "Faculty of Theology",
    description: "Theological and religious studies programs",
    degrees: [
      {
        id: createDegreeId("BTh Bachelor Theology SU"),
        name: "BTh (Bachelor of Theology)",
        faculty: "Theology",
        duration: "3 years",
        apsRequirement: 24, // 60% excluding Life Orientation
        description: "Theological studies and ministry",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Life Orientation", level: 3, isRequired: true },
        ],
        careerProspects: ["Minister", "Chaplain", "Religious Counselor"],
      },
      {
        id: createDegreeId("BDiv Bachelor Divinity SU"),
        name: "BDiv (Bachelor of Divinity)",
        faculty: "Theology",
        duration: "4 years",
        apsRequirement: 24, // 60% excluding Life Orientation
        description: "Advanced theological studies and divinity",
        subjects: [
          { name: "English", level: 4, isRequired: true },
          { name: "Life Orientation", level: 3, isRequired: true },
        ],
        careerProspects: ["Minister", "Theologian", "Religious Scholar"],
      },
    ],
  },
];
