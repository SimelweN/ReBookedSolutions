import { Degree } from "@/types/university";

// University-specific program mappings based on actual offerings
// This ensures only programs that actually exist at each university are included

export interface UniversityProgramMapping {
  universityId: string;
  availableFaculties: {
    id: string;
    name: string;
    description: string;
    programIds: string[]; // IDs of programs actually offered by this faculty at this university
  }[];
}

// Specific faculty structures with accurate names for different university types
export const FACULTY_STRUCTURES = {
  // Traditional Research Universities (UCT, Wits, UP, UKZN, etc.)
  traditional: {
    engineering: {
      id: "engineering",
      name: "Faculty of Engineering and the Built Environment",
      commonPrograms: [
        "bsc-eng-civil",
        "bsc-eng-mechanical",
        "bsc-eng-electrical",
        "bsc-eng-chemical",
        "bsc-eng-industrial",
        "bsc-construction-management",
        "bsc-quantity-surveying",
        "barch-architecture",
      ],
    },
    health: {
      id: "health-sciences",
      name: "Faculty of Health Sciences",
      commonPrograms: [
        "mbchb-medicine-surgery",
        "bds-dental-surgery",
        "bpharm-pharmacy",
        "bsc-physiotherapy",
        "bns-nursing-science",
        "bsc-occupational-therapy",
      ],
    },
    commerce: {
      id: "commerce",
      name: "Faculty of Commerce",
      commonPrograms: [
        "bcom-accounting",
        "bcom-finance",
        "bcom-economics",
        "bcom-marketing",
        "bcom-business-management",
        "bsc-actuarial-science",
      ],
    },
    humanities: {
      id: "humanities",
      name: "Faculty of Humanities",
      commonPrograms: [
        "ba-english",
        "ba-history",
        "ba-psychology",
        "ba-sociology",
        "ba-political-science",
        "ba-philosophy",
      ],
    },
    science: {
      id: "science",
      name: "Faculty of Science",
      commonPrograms: [
        "bsc-computer-science",
        "bsc-mathematics",
        "bsc-physics",
        "bsc-chemistry",
        "bsc-biological-sciences",
        "bsc-statistics",
      ],
    },
    law: {
      id: "law",
      name: "Faculty of Law",
      commonPrograms: ["llb-law"],
    },
    education: {
      id: "education",
      name: "Faculty of Education",
      commonPrograms: [
        "bed-foundation-phase",
        "bed-intermediate-phase",
        "bed-senior-phase",
        "bed-fet-phase",
      ],
    },
  },

  // Universities of Technology (CPUT, DUT, TUT, etc.)
  technology: {
    engineering: {
      id: "engineering",
      name: "Faculty of Engineering and the Built Environment",
      commonPrograms: [
        "bsc-eng-civil",
        "bsc-eng-mechanical",
        "bsc-eng-electrical",
        "bsc-eng-industrial",
        "bsc-construction-management",
        "bsc-quantity-surveying",
      ],
    },
    informationTechnology: {
      id: "information-technology",
      name: "Faculty of Informatics and Design",
      commonPrograms: [
        "bit-information-technology",
        "bsc-computer-science",
        "bsc-software-engineering",
        "bis-information-systems",
        "bdes-graphic-design",
      ],
    },
    business: {
      id: "business",
      name: "Faculty of Business and Management Sciences",
      commonPrograms: [
        "bcom-accounting",
        "bcom-business-management",
        "bcom-marketing",
        "bcom-human-resource-management",
        "bcom-logistics",
      ],
    },
    health: {
      id: "health",
      name: "Faculty of Health and Wellness Sciences",
      commonPrograms: [
        "bns-nursing-science",
        "bsc-environmental-health",
        "bsc-clinical-technology",
        "bemc-emergency-medical-care",
      ],
    },
    appliedSciences: {
      id: "applied-sciences",
      name: "Faculty of Applied Sciences",
      commonPrograms: [
        "bsc-biotechnology",
        "bsc-food-science-technology",
        "bsc-environmental-science",
      ],
    },
  },

  // Comprehensive Universities (UJ, UWC, NWU, etc.)
  comprehensive: {
    engineering: {
      id: "engineering",
      name: "Faculty of Engineering and the Built Environment",
      commonPrograms: [
        "bsc-eng-civil",
        "bsc-eng-mechanical",
        "bsc-eng-electrical",
        "bsc-eng-mining",
        "bsc-construction-management",
        "barch-architecture",
      ],
    },
    health: {
      id: "health-sciences",
      name: "Faculty of Health Sciences",
      commonPrograms: [
        "mbchb-medicine-surgery",
        "bpharm-pharmacy",
        "bns-nursing-science",
        "bsc-physiotherapy",
        "bsc-occupational-therapy",
        "bsc-dietetics",
      ],
    },
    management: {
      id: "management",
      name: "Faculty of Management",
      commonPrograms: [
        "bcom-accounting",
        "bcom-finance",
        "bcom-business-management",
        "bcom-marketing",
        "bpa-public-administration",
      ],
    },
    humanities: {
      id: "humanities",
      name: "Faculty of Humanities",
      commonPrograms: [
        "ba-english",
        "ba-psychology",
        "ba-sociology",
        "ba-communication-science",
        "ba-development-studies",
      ],
    },
    science: {
      id: "science",
      name: "Faculty of Science",
      commonPrograms: [
        "bsc-computer-science",
        "bsc-mathematics",
        "bsc-environmental-science",
        "bsc-geography",
      ],
    },
    education: {
      id: "education",
      name: "Faculty of Education",
      commonPrograms: [
        "bed-foundation-phase",
        "bed-intermediate-phase",
        "bed-senior-phase",
      ],
    },
  },
};

// University-specific program mappings
export const UNIVERSITY_PROGRAM_MAPPINGS: UniversityProgramMapping[] = [
  // Traditional Universities
  {
    universityId: "uct",
    availableFaculties: [
      {
        id: "commerce",
        name: "Faculty of Commerce",
        description: "Leading business school in Africa",
        programIds: [
          "bcom-accounting",
          "bcom-finance",
          "bcom-economics",
          "bcom-marketing",
          "bcom-business-management",
          "bsc-actuarial-science",
          "bcom-investment-management",
        ],
      },
      {
        id: "engineering",
        name: "Faculty of Engineering and the Built Environment",
        description: "Premier engineering education",
        programIds: [
          "bsc-eng-civil",
          "bsc-eng-mechanical",
          "bsc-eng-electrical",
          "bsc-eng-chemical",
          "bsc-construction-management",
          "barch-architecture",
        ],
      },
      {
        id: "health-sciences",
        name: "Faculty of Health Sciences",
        description: "Leading medical school in Africa",
        programIds: [
          "mbchb-medicine-surgery",
          "bpharm-pharmacy",
          "bsc-physiotherapy",
          "bsc-occupational-therapy",
          "bsc-speech-language-pathology",
          "bsc-audiology",
        ],
      },
      {
        id: "humanities",
        name: "Faculty of Humanities",
        description: "Liberal arts and social sciences",
        programIds: [
          "ba-english",
          "ba-history",
          "ba-psychology",
          "ba-sociology",
          "ba-political-science",
          "ba-philosophy",
          "ba-archaeology",
        ],
      },
      {
        id: "science",
        name: "Faculty of Science",
        description: "Natural sciences and mathematics",
        programIds: [
          "bsc-computer-science",
          "bsc-mathematics",
          "bsc-physics",
          "bsc-chemistry",
          "bsc-biological-sciences",
          "bsc-environmental-science",
        ],
      },
      {
        id: "law",
        name: "Faculty of Law",
        description: "Premier law school",
        programIds: ["llb-law"],
      },
    ],
  },
  {
    universityId: "wits",
    availableFaculties: [
      {
        id: "commerce",
        name: "Wits Business School",
        description: "Top-ranked business school",
        programIds: [
          "bcom-accounting",
          "bcom-finance",
          "bcom-economics",
          "bcom-business-management",
          "bsc-actuarial-science",
        ],
      },
      {
        id: "engineering",
        name: "Faculty of Engineering and the Built Environment",
        description: "Leading engineering school",
        programIds: [
          "bsc-eng-civil",
          "bsc-eng-mechanical",
          "bsc-eng-electrical",
          "bsc-eng-chemical",
          "bsc-eng-mining",
          "bsc-eng-industrial",
        ],
      },
      {
        id: "health-sciences",
        name: "Faculty of Health Sciences",
        description: "Medical excellence",
        programIds: [
          "mbchb-medicine-surgery",
          "bds-dental-surgery",
          "bpharm-pharmacy",
          "bsc-physiotherapy",
          "bsc-occupational-therapy",
        ],
      },
      {
        id: "humanities",
        name: "Faculty of Humanities",
        description: "Social sciences and arts",
        programIds: [
          "ba-english",
          "ba-history",
          "ba-psychology",
          "ba-sociology",
          "ba-international-relations",
          "ba-fine-arts",
        ],
      },
      {
        id: "science",
        name: "Faculty of Science",
        description: "Research-intensive science education",
        programIds: [
          "bsc-computer-science",
          "bsc-mathematics",
          "bsc-physics",
          "bsc-chemistry",
          "bsc-biological-sciences",
          "bsc-geology",
        ],
      },
    ],
  },
  // Comprehensive Universities
  {
    universityId: "spu",
    availableFaculties: [
      {
        id: "humanities",
        name: "Faculty of Humanities",
        description: "African-centered humanities education",
        programIds: [
          "ba-english",
          "bachelor-heritage-studies",
          "ba-psychology",
          "ba-sociology",
          "ba-development-studies",
        ],
      },
      {
        id: "natural-agricultural-sciences",
        name: "Faculty of Natural and Agricultural Sciences",
        description: "Science with focus on sustainable development",
        programIds: [
          "bsc-computer-science",
          "bachelor-data-science",
          "bsc-environmental-science",
          "bsc-mathematics",
          "bsc-agriculture-plant-production",
        ],
      },
      {
        id: "education",
        name: "Faculty of Education",
        description: "Teacher training for Northern Cape",
        programIds: [
          "bed-foundation-phase",
          "bed-intermediate-phase",
          "bed-senior-phase",
        ],
      },
    ],
  },
  // Universities of Technology
  {
    universityId: "cput",
    availableFaculties: [
      {
        id: "business-management",
        name: "Faculty of Business and Management Sciences",
        description: "Applied business education",
        programIds: [
          "bcom-accounting",
          "bcom-business-management",
          "bcom-marketing",
          "bcom-human-resource-management",
          "bcom-tourism-management",
        ],
      },
      {
        id: "engineering",
        name: "Faculty of Engineering and the Built Environment",
        description: "Applied engineering solutions",
        programIds: [
          "bsc-eng-civil",
          "bsc-eng-mechanical",
          "bsc-eng-electrical",
          "bsc-construction-management",
          "bsc-quantity-surveying",
        ],
      },
      {
        id: "informatics-design",
        name: "Faculty of Informatics and Design",
        description: "Technology and creative design",
        programIds: [
          "bit-information-technology",
          "bsc-software-engineering",
          "bdes-graphic-design",
          "bdes-fashion-design",
        ],
      },
      {
        id: "health-wellness",
        name: "Faculty of Health and Wellness Sciences",
        description: "Applied health sciences",
        programIds: [
          "bns-nursing-science",
          "bsc-environmental-health",
          "bsc-clinical-technology",
          "bsc-sports-science",
        ],
      },
    ],
  },
];

// Function to get programs available at a specific university
export const getUniversityPrograms = (universityId: string): string[] => {
  const mapping = UNIVERSITY_PROGRAM_MAPPINGS.find(
    (m) => m.universityId === universityId,
  );
  if (!mapping) return [];

  return mapping.availableFaculties.flatMap((faculty) => faculty.programIds);
};

// Function to get faculty structure for a university type
export const getFacultyStructure = (
  universityType: "traditional" | "technology" | "comprehensive",
) => {
  return FACULTY_STRUCTURES[universityType];
};

// Function to validate if a program exists at a university
export const isProgramAvailable = (
  universityId: string,
  programId: string,
): boolean => {
  const availablePrograms = getUniversityPrograms(universityId);
  return availablePrograms.includes(programId);
};

// Function to get university type based on ID
export const getUniversityType = (
  universityId: string,
): "traditional" | "technology" | "comprehensive" => {
  const traditionalUniversities = [
    "uct",
    "wits",
    "up",
    "ukzn",
    "sun",
    "ru",
    "ufh",
  ];
  const technologyUniversities = ["cput", "dut", "tut", "vut", "cut", "mut"];

  if (traditionalUniversities.includes(universityId)) return "traditional";
  if (technologyUniversities.includes(universityId)) return "technology";
  return "comprehensive";
};

// Enhanced faculty mapping with correct names for different university types
export const getCorrectFacultyName = (
  universityId: string,
  baseFacultyId: string,
): string => {
  const universityType = getUniversityType(universityId);
  const structure = FACULTY_STRUCTURES[universityType];

  // Find matching faculty structure
  const facultyKey = Object.keys(structure).find((key) => {
    const faculty = structure[key as keyof typeof structure];
    return faculty.id === baseFacultyId || baseFacultyId.includes(key);
  });

  if (facultyKey) {
    const faculty = structure[facultyKey as keyof typeof structure];
    return faculty.name;
  }

  // Default fallback names
  const fallbackNames: { [key: string]: string } = {
    engineering: "Faculty of Engineering",
    "health-sciences": "Faculty of Health Sciences",
    commerce: "Faculty of Commerce",
    humanities: "Faculty of Humanities",
    science: "Faculty of Science",
    law: "Faculty of Law",
    education: "Faculty of Education",
    "information-technology": "Faculty of Information Technology",
  };

  return fallbackNames[baseFacultyId] || "Faculty";
};
