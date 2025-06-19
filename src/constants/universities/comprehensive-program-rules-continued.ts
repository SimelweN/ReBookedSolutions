import { ProgramDefinition } from "./comprehensive-program-rules";

// Continuation of COMPREHENSIVE_PROGRAMS - Part 2
export const COMPREHENSIVE_PROGRAMS_PART2: ProgramDefinition[] = [
  // Faculty of Commerce / Business and Management
  {
    name: "Bachelor of Commerce (BCom) in Accounting",
    faculty: "Commerce",
    description: "Financial accounting, auditing, and business finance.",
    duration: "3 years",
    defaultAps: 30,
    assignmentRule: {
      type: "all",
    },
  },
  {
    name: "Finance",
    faculty: "Commerce",
    description:
      "Corporate finance, investment analysis, and financial markets.",
    duration: "3 years",
    defaultAps: 30,
    assignmentRule: {
      type: "all",
    },
  },
  {
    name: "Economics",
    faculty: "Commerce",
    description: "Economic theory, policy analysis, and market behavior.",
    duration: "3 years",
    defaultAps: 28,
    assignmentRule: {
      type: "all",
    },
  },
  {
    name: "Marketing",
    faculty: "Commerce",
    description: "Consumer behavior, brand management, and market research.",
    duration: "3 years",
    defaultAps: 26,
    assignmentRule: {
      type: "all",
    },
  },
  {
    name: "Human Resource Management",
    faculty: "Commerce",
    description:
      "People management, organizational behavior, and employment relations.",
    duration: "3 years",
    defaultAps: 26,
    assignmentRule: {
      type: "all",
    },
  },
  {
    name: "Business Management",
    faculty: "Commerce",
    description: "General business administration and management principles.",
    duration: "3 years",
    defaultAps: 25,
    assignmentRule: {
      type: "all",
    },
  },
  {
    name: "Supply Chain Management",
    faculty: "Commerce",
    description: "Logistics, procurement, and supply chain optimization.",
    duration: "3 years",
    defaultAps: 26,
    assignmentRule: {
      type: "all",
    },
  },
  {
    name: "Logistics",
    faculty: "Commerce",
    description: "Transportation, warehousing, and distribution management.",
    duration: "3 years",
    defaultAps: 25,
    assignmentRule: {
      type: "all",
    },
  },
  {
    name: "Risk Management",
    faculty: "Commerce",
    description:
      "Identification, assessment, and mitigation of business risks.",
    duration: "3 years",
    defaultAps: 28,
    assignmentRule: {
      type: "all",
    },
  },
  {
    name: "Tourism Management",
    faculty: "Commerce",
    description: "Tourism industry management and hospitality services.",
    duration: "3 years",
    defaultAps: 24,
    assignmentRule: {
      type: "all",
    },
  },
  {
    name: "Hospitality Management",
    faculty: "Commerce",
    description: "Hotel and restaurant management and operations.",
    duration: "3 years",
    defaultAps: 24,
    assignmentRule: {
      type: "all",
    },
  },
  {
    name: "Public Administration",
    faculty: "Commerce",
    description: "Government operations and public sector management.",
    duration: "3 years",
    defaultAps: 25,
    assignmentRule: {
      type: "all",
    },
  },
  {
    name: "Labour Relations",
    faculty: "Commerce",
    description: "Industrial relations and workplace conflict resolution.",
    duration: "3 years",
    defaultAps: 26,
    assignmentRule: {
      type: "all",
    },
  },
  {
    name: "Entrepreneurship",
    faculty: "Commerce",
    description: "Business creation, innovation, and startup management.",
    duration: "3 years",
    defaultAps: 25,
    assignmentRule: {
      type: "all",
    },
  },
  {
    name: "Banking",
    faculty: "Commerce",
    description:
      "Banking operations, financial services, and credit management.",
    duration: "3 years",
    defaultAps: 28,
    assignmentRule: {
      type: "all",
    },
  },
  {
    name: "Insurance",
    faculty: "Commerce",
    description:
      "Insurance principles, risk assessment, and claims management.",
    duration: "3 years",
    defaultAps: 26,
    assignmentRule: {
      type: "all",
    },
  },
  {
    name: "Auditing",
    faculty: "Commerce",
    description: "Financial auditing, compliance, and assurance services.",
    duration: "3 years",
    defaultAps: 30,
    assignmentRule: {
      type: "all",
    },
  },
  {
    name: "Actuarial Science",
    faculty: "Commerce",
    description: "Mathematical analysis of financial risk and uncertainty.",
    duration: "3 years",
    defaultAps: 36,
    assignmentRule: {
      type: "exclude",
      universities: ["ufh", "mut"],
    },
    apsRequirements: {
      uct: 40,
      wits: 40,
      su: 38,
      up: 36,
    },
  },
  {
    name: "Taxation",
    faculty: "Commerce",
    description: "Tax law, compliance, and financial planning.",
    duration: "3 years",
    defaultAps: 28,
    assignmentRule: {
      type: "all",
    },
  },
  {
    name: "Investment Management",
    faculty: "Commerce",
    description: "Portfolio management and investment analysis.",
    duration: "3 years",
    defaultAps: 30,
    assignmentRule: {
      type: "all",
    },
  },
  {
    name: "Business Analytics",
    faculty: "Commerce",
    description: "Data analysis for business decision making.",
    duration: "3 years",
    defaultAps: 30,
    assignmentRule: {
      type: "all",
    },
  },
  {
    name: "Strategic Management",
    faculty: "Commerce",
    description: "Corporate strategy and competitive analysis.",
    duration: "3 years",
    defaultAps: 28,
    assignmentRule: {
      type: "all",
    },
  },
  {
    name: "International Business",
    faculty: "Commerce",
    description: "Global business operations and international trade.",
    duration: "3 years",
    defaultAps: 28,
    assignmentRule: {
      type: "all",
    },
  },

  // Faculty of Law
  {
    name: "Bachelor of Laws (LLB)",
    faculty: "Law",
    description: "Comprehensive legal education and jurisprudence.",
    duration: "4 years",
    defaultAps: 32,
    assignmentRule: {
      type: "all",
    },
    apsRequirements: {
      uct: 36,
      wits: 35,
      su: 34,
      up: 33,
    },
  },
  {
    name: "Bachelor of Criminal Justice",
    faculty: "Law",
    description:
      "Criminal law, criminology, and justice system administration.",
    duration: "3 years",
    defaultAps: 26,
    assignmentRule: {
      type: "all",
    },
  },
  {
    name: "Bachelor of Forensic Science",
    faculty: "Law",
    description: "Scientific investigation of crime and legal evidence.",
    duration: "3 years",
    defaultAps: 30,
    assignmentRule: {
      type: "exclude",
      universities: ["ufh", "mut"],
    },
  },
  {
    name: "Bachelor of International Law",
    faculty: "Law",
    description: "International legal frameworks and treaties.",
    duration: "4 years",
    defaultAps: 32,
    assignmentRule: {
      type: "all",
    },
  },
  {
    name: "Bachelor of Environmental Law",
    faculty: "Law",
    description: "Environmental regulations and sustainability law.",
    duration: "4 years",
    defaultAps: 30,
    assignmentRule: {
      type: "all",
    },
  },
  {
    name: "Bachelor of Labour Law",
    faculty: "Law",
    description: "Employment law and industrial relations.",
    duration: "4 years",
    defaultAps: 30,
    assignmentRule: {
      type: "all",
    },
  },
  {
    name: "Bachelor of Tax Law",
    faculty: "Law",
    description: "Taxation law and fiscal policy.",
    duration: "4 years",
    defaultAps: 30,
    assignmentRule: {
      type: "all",
    },
  },
  {
    name: "Bachelor of Commercial Law",
    faculty: "Law",
    description: "Business law and commercial transactions.",
    duration: "4 years",
    defaultAps: 30,
    assignmentRule: {
      type: "all",
    },
  },
  {
    name: "Bachelor of Constitutional Law",
    faculty: "Law",
    description: "Constitutional principles and governance.",
    duration: "4 years",
    defaultAps: 32,
    assignmentRule: {
      type: "all",
    },
  },
  {
    name: "Bachelor of Human Rights Law",
    faculty: "Law",
    description: "Human rights advocacy and international law.",
    duration: "4 years",
    defaultAps: 30,
    assignmentRule: {
      type: "all",
    },
  },

  // Faculty of Science / Natural Sciences
  {
    name: "Bachelor of Science (BSc) in Biological Sciences",
    faculty: "Science",
    description: "Study of living organisms and biological processes.",
    duration: "3 years",
    defaultAps: 28,
    assignmentRule: {
      type: "all",
    },
  },
  {
    name: "Chemistry",
    faculty: "Science",
    description: "Organic, inorganic, analytical, and physical chemistry.",
    duration: "3 years",
    defaultAps: 30,
    assignmentRule: {
      type: "all",
    },
  },
  {
    name: "Physics",
    faculty: "Science",
    description: "Fundamental principles of matter, energy, and forces.",
    duration: "3 years",
    defaultAps: 32,
    assignmentRule: {
      type: "all",
    },
  },
  {
    name: "Mathematics",
    faculty: "Science",
    description: "Pure and applied mathematics, statistics, and modeling.",
    duration: "3 years",
    defaultAps: 30,
    assignmentRule: {
      type: "all",
    },
  },
  {
    name: "Computer Science",
    faculty: "Science",
    description: "Programming, algorithms, and computational theory.",
    duration: "3 years",
    defaultAps: 32,
    assignmentRule: {
      type: "all",
    },
  },
  {
    name: "Environmental Science",
    faculty: "Science",
    description: "Study of environmental problems and solutions.",
    duration: "3 years",
    defaultAps: 28,
    assignmentRule: {
      type: "all",
    },
  },
  {
    name: "Geology",
    faculty: "Science",
    description: "Earth sciences, minerals, and geological processes.",
    duration: "3 years",
    defaultAps: 28,
    assignmentRule: {
      type: "all",
    },
  },
  {
    name: "Statistics",
    faculty: "Science",
    description: "Statistical analysis and data interpretation.",
    duration: "3 years",
    defaultAps: 30,
    assignmentRule: {
      type: "all",
    },
  },
  {
    name: "Biochemistry",
    faculty: "Science",
    description: "Chemical processes in living organisms.",
    duration: "3 years",
    defaultAps: 32,
    assignmentRule: {
      type: "all",
    },
  },
  {
    name: "Microbiology",
    faculty: "Science",
    description: "Study of microorganisms and their applications.",
    duration: "3 years",
    defaultAps: 30,
    assignmentRule: {
      type: "all",
    },
  },
  {
    name: "Genetics",
    faculty: "Science",
    description: "Heredity, gene expression, and genetic engineering.",
    duration: "3 years",
    defaultAps: 32,
    assignmentRule: {
      type: "all",
    },
  },
  {
    name: "Botany",
    faculty: "Science",
    description: "Study of plant life and botanical sciences.",
    duration: "3 years",
    defaultAps: 26,
    assignmentRule: {
      type: "all",
    },
  },
  {
    name: "Zoology",
    faculty: "Science",
    description: "Study of animal life and behavior.",
    duration: "3 years",
    defaultAps: 26,
    assignmentRule: {
      type: "all",
    },
  },
  {
    name: "Astronomy",
    faculty: "Science",
    description: "Study of celestial objects and space.",
    duration: "3 years",
    defaultAps: 34,
    assignmentRule: {
      type: "include_only",
      universities: ["uct", "ru"],
    },
  },
  {
    name: "Meteorology",
    faculty: "Science",
    description: "Weather patterns and atmospheric science.",
    duration: "3 years",
    defaultAps: 32,
    assignmentRule: {
      type: "include_only",
      universities: ["uct", "ru"],
    },
  },
  {
    name: "Marine Biology",
    faculty: "Science",
    description: "Study of ocean life and marine ecosystems.",
    duration: "3 years",
    defaultAps: 30,
    assignmentRule: {
      type: "include_only",
      universities: ["uct", "ru"],
    },
  },
  {
    name: "Biotechnology",
    faculty: "Science",
    description: "Application of biological systems in technology.",
    duration: "3 years",
    defaultAps: 32,
    assignmentRule: {
      type: "all",
    },
  },
  {
    name: "Ecology",
    faculty: "Science",
    description: "Study of ecosystems and environmental interactions.",
    duration: "3 years",
    defaultAps: 28,
    assignmentRule: {
      type: "all",
    },
  },
  {
    name: "Entomology",
    faculty: "Science",
    description: "Study of insects and their ecological roles.",
    duration: "3 years",
    defaultAps: 26,
    assignmentRule: {
      type: "all",
    },
  },
  {
    name: "Mycology",
    faculty: "Science",
    description: "Study of fungi and fungal biology.",
    duration: "3 years",
    defaultAps: 26,
    assignmentRule: {
      type: "exclude",
      universities: ["ufh"],
    },
  },
  {
    name: "Phycology",
    faculty: "Science",
    description: "Study of algae and aquatic plant life.",
    duration: "3 years",
    defaultAps: 26,
    assignmentRule: {
      type: "exclude",
      universities: ["ufh"],
    },
  },
  {
    name: "Limnology",
    faculty: "Science",
    description: "Study of freshwater ecosystems.",
    duration: "3 years",
    defaultAps: 28,
    assignmentRule: {
      type: "exclude",
      universities: ["ufh"],
    },
  },
  {
    name: "Hydrology",
    faculty: "Science",
    description: "Study of water movement and distribution.",
    duration: "3 years",
    defaultAps: 28,
    assignmentRule: {
      type: "all",
    },
  },
  {
    name: "Soil Science",
    faculty: "Science",
    description: "Study of soil formation, classification, and management.",
    duration: "3 years",
    defaultAps: 26,
    assignmentRule: {
      type: "all",
    },
  },
  {
    name: "Agricultural Science",
    faculty: "Science",
    description: "Scientific principles applied to agriculture.",
    duration: "3 years",
    defaultAps: 26,
    assignmentRule: {
      type: "all",
    },
  },

  // Faculty of Education
  {
    name: "Bachelor of Education (BEd) in Foundation Phase",
    faculty: "Education",
    description: "Teaching children in grades R-3.",
    duration: "4 years",
    defaultAps: 24,
    assignmentRule: {
      type: "all",
    },
  },
  {
    name: "Intermediate Phase",
    faculty: "Education",
    description: "Teaching children in grades 4-6.",
    duration: "4 years",
    defaultAps: 24,
    assignmentRule: {
      type: "all",
    },
  },
  {
    name: "Senior Phase",
    faculty: "Education",
    description: "Teaching learners in grades 7-9.",
    duration: "4 years",
    defaultAps: 24,
    assignmentRule: {
      type: "all",
    },
  },
  {
    name: "Further Education and Training (FET) Phase",
    faculty: "Education",
    description: "Teaching learners in grades 10-12.",
    duration: "4 years",
    defaultAps: 26,
    assignmentRule: {
      type: "all",
    },
  },
  {
    name: "Special Education",
    faculty: "Education",
    description: "Teaching learners with special educational needs.",
    duration: "4 years",
    defaultAps: 26,
    assignmentRule: {
      type: "all",
    },
  },
  {
    name: "Adult Education",
    faculty: "Education",
    description: "Teaching adult learners and continuing education.",
    duration: "4 years",
    defaultAps: 24,
    assignmentRule: {
      type: "all",
    },
  },
  {
    name: "Educational Psychology",
    faculty: "Education",
    description: "Psychology applied to educational contexts.",
    duration: "4 years",
    defaultAps: 28,
    assignmentRule: {
      type: "all",
    },
  },
  {
    name: "Educational Management",
    faculty: "Education",
    description: "Leadership and administration in educational institutions.",
    duration: "4 years",
    defaultAps: 26,
    assignmentRule: {
      type: "all",
    },
  },
  {
    name: "Curriculum Studies",
    faculty: "Education",
    description: "Curriculum development and educational program design.",
    duration: "4 years",
    defaultAps: 26,
    assignmentRule: {
      type: "all",
    },
  },
  {
    name: "Language Education",
    faculty: "Education",
    description: "Teaching languages and language acquisition.",
    duration: "4 years",
    defaultAps: 25,
    assignmentRule: {
      type: "all",
    },
  },
  {
    name: "Mathematics Education",
    faculty: "Education",
    description: "Teaching mathematics at various educational levels.",
    duration: "4 years",
    defaultAps: 28,
    assignmentRule: {
      type: "all",
    },
  },
  {
    name: "Science Education",
    faculty: "Education",
    description: "Teaching science subjects in schools.",
    duration: "4 years",
    defaultAps: 28,
    assignmentRule: {
      type: "all",
    },
  },
  {
    name: "Technology Education",
    faculty: "Education",
    description: "Teaching technology and technical subjects.",
    duration: "4 years",
    defaultAps: 26,
    assignmentRule: {
      type: "all",
    },
  },
  {
    name: "Social Sciences Education",
    faculty: "Education",
    description: "Teaching social sciences in educational settings.",
    duration: "4 years",
    defaultAps: 25,
    assignmentRule: {
      type: "all",
    },
  },
  {
    name: "Life Orientation Education",
    faculty: "Education",
    description: "Teaching life skills and personal development.",
    duration: "4 years",
    defaultAps: 24,
    assignmentRule: {
      type: "all",
    },
  },
  {
    name: "Arts and Culture Education",
    faculty: "Education",
    description: "Teaching arts and cultural subjects.",
    duration: "4 years",
    defaultAps: 25,
    assignmentRule: {
      type: "all",
    },
  },
  {
    name: "Economic and Management Sciences Education",
    faculty: "Education",
    description: "Teaching business and economic subjects.",
    duration: "4 years",
    defaultAps: 26,
    assignmentRule: {
      type: "all",
    },
  },
  {
    name: "Physical Education",
    faculty: "Education",
    description: "Teaching physical education and sports.",
    duration: "4 years",
    defaultAps: 24,
    assignmentRule: {
      type: "all",
    },
  },
];

// More programs will continue in the next part...
