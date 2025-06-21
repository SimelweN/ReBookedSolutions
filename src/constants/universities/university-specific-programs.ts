import { Degree } from "@/types/university";

// University-specific program mappings based on actual offerings
// This ensures only programs that actually exist at each university are included
// CLEANED: Removed faculty names, marketing phrases, and invalid program IDs

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
        "beng-civil",
        "beng-mechanical",
        "beng-electrical",
        "beng-chemical",
        "beng-industrial",
      ],
    },
    health: {
      id: "health-sciences",
      name: "Faculty of Health Sciences",
      commonPrograms: [
        "mbchb-medicine",
        "bsc-physiotherapy",
        "bnurs-nursing",
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
        "bcom-human-resources",
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
        "bsc-mathematical-sciences",
        "bsc-physics",
        "bsc-chemistry",
        "bsc-biological-sciences",
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
        "bed-senior-fet-phase",
      ],
    },
  },

  // Universities of Technology (CPUT, DUT, TUT, etc.)
  technology: {
    engineering: {
      id: "engineering",
      name: "Faculty of Engineering and the Built Environment",
      commonPrograms: [
        "beng-civil",
        "beng-mechanical",
        "beng-electrical",
        "beng-industrial",
      ],
    },
    informationTechnology: {
      id: "information-technology",
      name: "Faculty of Informatics and Design",
      commonPrograms: ["bsc-computer-science"],
    },
    business: {
      id: "business",
      name: "Faculty of Business and Management Sciences",
      commonPrograms: [
        "bcom-accounting",
        "bcom-business-management",
        "bcom-marketing",
        "bcom-human-resources",
      ],
    },
    health: {
      id: "health",
      name: "Faculty of Health and Wellness Sciences",
      commonPrograms: ["bnurs-nursing", "bsc-medical-laboratory-sciences"],
    },
    appliedSciences: {
      id: "applied-sciences",
      name: "Faculty of Applied Sciences",
      commonPrograms: ["bsc-environmental-science"],
    },
  },

  // Comprehensive Universities (UJ, UWC, NWU, etc.)
  comprehensive: {
    engineering: {
      id: "engineering",
      name: "Faculty of Engineering and the Built Environment",
      commonPrograms: ["beng-civil", "beng-mechanical", "beng-electrical"],
    },
    health: {
      id: "health-sciences",
      name: "Faculty of Health Sciences",
      commonPrograms: [
        "mbchb-medicine",
        "bnurs-nursing",
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
      ],
    },
    humanities: {
      id: "humanities",
      name: "Faculty of Humanities",
      commonPrograms: [
        "ba-english",
        "ba-psychology",
        "ba-sociology",
        "ba-media-communication",
      ],
    },
    science: {
      id: "science",
      name: "Faculty of Science",
      commonPrograms: [
        "bsc-computer-science",
        "bsc-mathematical-sciences",
        "bsc-environmental-science",
      ],
    },
    education: {
      id: "education",
      name: "Faculty of Education",
      commonPrograms: [
        "bed-foundation-phase",
        "bed-intermediate-phase",
        "bed-senior-fet-phase",
      ],
    },
  },
};

// University-specific program mappings
// CLEANED: Only valid program IDs from comprehensive-programs.ts
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
        ],
      },
      {
        id: "engineering",
        name: "Faculty of Engineering and the Built Environment",
        description: "Premier engineering education",
        programIds: [
          "beng-civil",
          "beng-mechanical",
          "beng-electrical",
          "beng-chemical",
        ],
      },
      {
        id: "health-sciences",
        name: "Faculty of Health Sciences",
        description: "Leading medical school in Africa",
        programIds: [
          "mbchb-medicine",
          "bsc-physiotherapy",
          "bsc-occupational-therapy",
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
        ],
      },
      {
        id: "science",
        name: "Faculty of Science",
        description: "Natural sciences and mathematics",
        programIds: [
          "bsc-computer-science",
          "bsc-mathematical-sciences",
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
        ],
      },
      {
        id: "engineering",
        name: "Faculty of Engineering and the Built Environment",
        description: "Leading engineering school",
        programIds: [
          "beng-civil",
          "beng-mechanical",
          "beng-electrical",
          "beng-chemical",
          "beng-industrial",
        ],
      },
      {
        id: "health-sciences",
        name: "Faculty of Health Sciences",
        description: "Medical excellence",
        programIds: [
          "mbchb-medicine",
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
          "bfa-fine-art",
        ],
      },
      {
        id: "science",
        name: "Faculty of Science",
        description: "Research-intensive science education",
        programIds: [
          "bsc-computer-science",
          "bsc-mathematical-sciences",
          "bsc-physics",
          "bsc-chemistry",
          "bsc-biological-sciences",
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
        programIds: ["ba-english", "ba-psychology", "ba-sociology"],
      },
      {
        id: "natural-agricultural-sciences",
        name: "Faculty of Natural and Agricultural Sciences",
        description: "Science with focus on sustainable development",
        programIds: [
          "bsc-computer-science",
          "bsc-environmental-science",
          "bsc-mathematical-sciences",
        ],
      },
      {
        id: "education",
        name: "Faculty of Education",
        description: "Teacher education and development",
        programIds: [
          "bed-foundation-phase",
          "bed-intermediate-phase",
          "bed-senior-fet-phase",
        ],
      },
      {
        id: "management",
        name: "Faculty of Management and Economic Sciences",
        description: "Business and economic education",
        programIds: [
          "bcom-accounting",
          "bcom-business-management",
          "bcom-economics",
        ],
      },
    ],
  },
  {
    universityId: "ump",
    availableFaculties: [
      {
        id: "agriculture",
        name: "Faculty of Agriculture and Natural Sciences",
        description: "Agricultural and environmental sciences",
        programIds: ["bsc-environmental-science"],
      },
      {
        id: "education",
        name: "Faculty of Education",
        description: "Teacher training and development",
        programIds: [
          "bed-foundation-phase",
          "bed-intermediate-phase",
          "bed-senior-fet-phase",
        ],
      },
      {
        id: "management",
        name: "Faculty of Economic and Management Sciences",
        description: "Business and management education",
        programIds: [
          "bcom-accounting",
          "bcom-business-management",
          "bcom-economics",
        ],
      },
      {
        id: "humanities",
        name: "Faculty of Humanities and Social Sciences",
        description: "Social sciences and humanities",
        programIds: [
          "ba-english",
          "ba-psychology",
          "ba-sociology",
          "bsw-social-work",
        ],
      },
    ],
  },
];
