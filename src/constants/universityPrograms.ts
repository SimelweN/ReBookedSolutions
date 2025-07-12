// University Programs Data for APS Calculator
// This contains fallback data for university programs when dynamic data is not available

export interface UniversityProgram {
  university: string;
  abbreviation: string;
  location: string;
  program: string;
  faculty: string;
  aps: number;
  duration: string;
  description: string;
}

// Essential high-demand programs from major universities
export const FALLBACK_PROGRAMS: UniversityProgram[] = [
  // UCT - University of Cape Town
  {
    university: "University of Cape Town",
    abbreviation: "UCT",
    location: "Cape Town, Western Cape",
    program: "Medicine",
    faculty: "Health Sciences",
    aps: 42,
    duration: "6 years",
    description: "Comprehensive medical training to become a qualified doctor.",
  },
  {
    university: "University of Cape Town",
    abbreviation: "UCT",
    location: "Cape Town, Western Cape",
    program: "Civil Engineering",
    faculty: "Engineering",
    aps: 38,
    duration: "4 years",
    description: "Design, construct and maintain civil infrastructure.",
  },
  {
    university: "University of Cape Town",
    abbreviation: "UCT",
    location: "Cape Town, Western Cape",
    program: "Computer Science",
    faculty: "Science",
    aps: 34,
    duration: "3 years",
    description: "Programming, algorithms, and computational theory.",
  },
  {
    university: "University of Cape Town",
    abbreviation: "UCT",
    location: "Cape Town, Western Cape",
    program: "Law (LLB)",
    faculty: "Law",
    aps: 36,
    duration: "4 years",
    description: "Comprehensive legal education and jurisprudence.",
  },

  // Wits - University of the Witwatersrand
  {
    university: "University of the Witwatersrand",
    abbreviation: "Wits",
    location: "Johannesburg, Gauteng",
    program: "Medicine",
    faculty: "Health Sciences",
    aps: 40,
    duration: "6 years",
    description: "Medical education and training for healthcare professionals.",
  },
  {
    university: "University of the Witwatersrand",
    abbreviation: "Wits",
    location: "Johannesburg, Gauteng",
    program: "Engineering",
    faculty: "Engineering",
    aps: 36,
    duration: "4 years",
    description: "Various engineering disciplines.",
  },
  {
    university: "University of the Witwatersrand",
    abbreviation: "Wits",
    location: "Johannesburg, Gauteng",
    program: "BCom Accounting",
    faculty: "Commerce",
    aps: 32,
    duration: "3 years",
    description: "Professional accounting and business studies.",
  },

  // UP - University of Pretoria
  {
    university: "University of Pretoria",
    abbreviation: "UP",
    location: "Pretoria, Gauteng",
    program: "Veterinary Science",
    faculty: "Veterinary Science",
    aps: 38,
    duration: "6 years",
    description: "Animal health and veterinary medicine.",
  },
  {
    university: "University of Pretoria",
    abbreviation: "UP",
    location: "Pretoria, Gauteng",
    program: "Engineering",
    faculty: "Engineering",
    aps: 34,
    duration: "4 years",
    description: "Engineering disciplines and technology.",
  },
  {
    university: "University of Pretoria",
    abbreviation: "UP",
    location: "Pretoria, Gauteng",
    program: "Medicine",
    faculty: "Health Sciences",
    aps: 38,
    duration: "6 years",
    description: "Medical training and healthcare education.",
  },

  // Stellenbosch University
  {
    university: "Stellenbosch University",
    abbreviation: "SU",
    location: "Stellenbosch, Western Cape",
    program: "Medicine",
    faculty: "Medicine and Health Sciences",
    aps: 38,
    duration: "6 years",
    description: "Medical education and research.",
  },
  {
    university: "Stellenbosch University",
    abbreviation: "SU",
    location: "Stellenbosch, Western Cape",
    program: "Engineering",
    faculty: "Engineering",
    aps: 35,
    duration: "4 years",
    description: "Engineering and applied sciences.",
  },

  // UKZN - University of KwaZulu-Natal
  {
    university: "University of KwaZulu-Natal",
    abbreviation: "UKZN",
    location: "Durban, KwaZulu-Natal",
    program: "Medicine",
    faculty: "Health Sciences",
    aps: 36,
    duration: "6 years",
    description: "Medical training and healthcare education.",
  },
  {
    university: "University of KwaZulu-Natal",
    abbreviation: "UKZN",
    location: "Durban, KwaZulu-Natal",
    program: "Engineering",
    faculty: "Engineering",
    aps: 32,
    duration: "4 years",
    description: "Engineering and technology programs.",
  },

  // UJ - University of Johannesburg
  {
    university: "University of Johannesburg",
    abbreviation: "UJ",
    location: "Johannesburg, Gauteng",
    program: "Engineering",
    faculty: "Engineering and Built Environment",
    aps: 30,
    duration: "4 years",
    description: "Engineering technology and innovation.",
  },
  {
    university: "University of Johannesburg",
    abbreviation: "UJ",
    location: "Johannesburg, Gauteng",
    program: "Education",
    faculty: "Education",
    aps: 24,
    duration: "4 years",
    description: "Teacher education and development.",
  },

  // Rhodes University
  {
    university: "Rhodes University",
    abbreviation: "RU",
    location: "Grahamstown, Eastern Cape",
    program: "Law (LLB)",
    faculty: "Law",
    aps: 32,
    duration: "4 years",
    description: "Comprehensive legal education and jurisprudence.",
  },
  {
    university: "Rhodes University",
    abbreviation: "RU",
    location: "Grahamstown, Eastern Cape",
    program: "English Literature",
    faculty: "Humanities",
    aps: 27,
    duration: "3 years",
    description: "Study of English language, literature, and communication.",
  },

  // CPUT - Cape Peninsula University of Technology
  {
    university: "Cape Peninsula University of Technology",
    abbreviation: "CPUT",
    location: "Cape Town, Western Cape",
    program: "Engineering",
    faculty: "Engineering",
    aps: 26,
    duration: "3 years",
    description: "Applied engineering and technology.",
  },

  // TUT - Tshwane University of Technology
  {
    university: "Tshwane University of Technology",
    abbreviation: "TUT",
    location: "Pretoria, Gauteng",
    program: "Information Technology",
    faculty: "ICT",
    aps: 22,
    duration: "3 years",
    description: "Information and communication technology.",
  },

  // VUT - Vaal University of Technology
  {
    university: "Vaal University of Technology",
    abbreviation: "VUT",
    location: "Vanderbijlpark, Gauteng",
    program: "Engineering",
    faculty: "Engineering",
    aps: 22,
    duration: "3 years",
    description: "Engineering technology programs.",
  },

  // UWC - University of the Western Cape
  {
    university: "University of the Western Cape",
    abbreviation: "UWC",
    location: "Cape Town, Western Cape",
    program: "Law (LLB)",
    faculty: "Law",
    aps: 30,
    duration: "4 years",
    description: "Comprehensive legal education and jurisprudence.",
  },

  // NWU - North-West University
  {
    university: "North-West University",
    abbreviation: "NWU",
    location: "Potchefstroom, North West",
    program: "Engineering",
    faculty: "Engineering",
    aps: 30,
    duration: "4 years",
    description: "Engineering and applied sciences.",
  },

  // UFS - University of the Free State
  {
    university: "University of the Free State",
    abbreviation: "UFS",
    location: "Bloemfontein, Free State",
    program: "Medicine",
    faculty: "Health Sciences",
    aps: 34,
    duration: "6 years",
    description: "Medical education and healthcare training.",
  },
];

// Program categories for filtering
export const PROGRAM_CATEGORIES = [
  "Medicine",
  "Engineering",
  "Law",
  "Computer Science",
  "Business/Commerce",
  "Education",
  "Science",
  "Humanities",
  "Technology",
  "Health Sciences",
] as const;

// University types
export const UNIVERSITY_TYPES = [
  "Traditional University",
  "University of Technology",
  "Comprehensive University",
] as const;

// Function to get programs by category
export function getProgramsByCategory(category: string): UniversityProgram[] {
  return FALLBACK_PROGRAMS.filter(
    (program) =>
      program.program.toLowerCase().includes(category.toLowerCase()) ||
      program.faculty.toLowerCase().includes(category.toLowerCase()),
  );
}

// Function to get programs by APS range
export function getProgramsByAPSRange(
  minAPS: number,
  maxAPS: number,
): UniversityProgram[] {
  return FALLBACK_PROGRAMS.filter(
    (program) => program.aps >= minAPS && program.aps <= maxAPS,
  );
}

// Function to get programs by university
export function getProgramsByUniversity(
  university: string,
): UniversityProgram[] {
  return FALLBACK_PROGRAMS.filter(
    (program) =>
      program.university.toLowerCase().includes(university.toLowerCase()) ||
      program.abbreviation.toLowerCase().includes(university.toLowerCase()),
  );
}
