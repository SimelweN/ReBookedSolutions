import { University, Faculty, Degree, Subject } from "@/types/university";
import {
  COMPREHENSIVE_PROGRAMS,
  UNIVERSITY_ABBREVIATIONS,
  ID_TO_ABBREVIATION,
  ProgramDefinition,
  AssignmentRule,
} from "./comprehensive-program-rules";

// Final programs from Agriculture, IT, and Technical fields
const COMPREHENSIVE_PROGRAMS_PART3: ProgramDefinition[] = [
  // Faculty of Agriculture / Agricultural Sciences
  {
    name: "Bachelor of Agriculture in Animal Science",
    faculty: "Agriculture",
    description: "Animal husbandry, breeding, and livestock management.",
    duration: "4 years",
    defaultAps: 26,
    assignmentRule: { type: "all" },
  },
  {
    name: "Plant Production",
    faculty: "Agriculture",
    description: "Crop production, plant breeding, and agricultural botany.",
    duration: "4 years",
    defaultAps: 26,
    assignmentRule: { type: "all" },
  },
  {
    name: "Agricultural Economics",
    faculty: "Agriculture",
    description: "Economic principles applied to agricultural systems.",
    duration: "4 years",
    defaultAps: 28,
    assignmentRule: { type: "all" },
  },
  {
    name: "Agricultural Extension",
    faculty: "Agriculture",
    description: "Extension services and rural development programs.",
    duration: "4 years",
    defaultAps: 25,
    assignmentRule: { type: "all" },
  },
  {
    name: "Horticulture",
    faculty: "Agriculture",
    description: "Cultivation of fruits, vegetables, and ornamental plants.",
    duration: "4 years",
    defaultAps: 26,
    assignmentRule: { type: "all" },
  },
  {
    name: "Viticulture and Oenology",
    faculty: "Agriculture",
    description: "Grape growing and wine production.",
    duration: "4 years",
    defaultAps: 30,
    assignmentRule: {
      type: "include_only",
      universities: ["su", "uct"],
    },
  },
  {
    name: "Agricultural Management",
    faculty: "Agriculture",
    description: "Farm management and agricultural business operations.",
    duration: "4 years",
    defaultAps: 26,
    assignmentRule: { type: "all" },
  },
  {
    name: "Food Science and Technology",
    faculty: "Agriculture",
    description: "Food processing, safety, and nutrition science.",
    duration: "4 years",
    defaultAps: 30,
    assignmentRule: { type: "all" },
  },
  {
    name: "Forestry",
    faculty: "Agriculture",
    description: "Forest management and conservation.",
    duration: "4 years",
    defaultAps: 28,
    assignmentRule: {
      type: "include_only",
      universities: ["su", "uct"],
    },
  },
  {
    name: "Game Ranch Management",
    faculty: "Agriculture",
    description: "Wildlife management and eco-tourism.",
    duration: "4 years",
    defaultAps: 26,
    assignmentRule: {
      type: "include_only",
      universities: ["ufh", "ru"],
    },
  },
  {
    name: "Irrigation Management",
    faculty: "Agriculture",
    description: "Water management for agricultural production.",
    duration: "4 years",
    defaultAps: 26,
    assignmentRule: { type: "all" },
  },
  {
    name: "Organic Farming",
    faculty: "Agriculture",
    description: "Sustainable and organic agricultural practices.",
    duration: "4 years",
    defaultAps: 26,
    assignmentRule: {
      type: "include_only",
      universities: ["su"],
    },
  },
  {
    name: "Precision Agriculture",
    faculty: "Agriculture",
    description: "Technology-driven precision farming techniques.",
    duration: "4 years",
    defaultAps: 30,
    assignmentRule: {
      type: "include_only",
      universities: ["su", "uct"],
    },
  },
  {
    name: "Rural Development",
    faculty: "Agriculture",
    description: "Rural community development and sustainability.",
    duration: "4 years",
    defaultAps: 25,
    assignmentRule: { type: "all" },
  },

  // Faculty of Information Technology / Computer Science
  {
    name: "Bachelor of Information Technology (BIT)",
    faculty: "Information Technology",
    description:
      "Information systems, database management, and IT infrastructure.",
    duration: "3 years",
    defaultAps: 28,
    assignmentRule: { type: "all" },
  },
  {
    name: "Bachelor of Science in Computer Science (BSc Computer Science)",
    faculty: "Information Technology",
    description: "Programming, algorithms, and computational theory.",
    duration: "3 years",
    defaultAps: 32,
    assignmentRule: { type: "all" },
  },
  {
    name: "Bachelor of Software Engineering (BSc Software Engineering)",
    faculty: "Information Technology",
    description: "Software development, project management, and system design.",
    duration: "4 years",
    defaultAps: 32,
    assignmentRule: { type: "all" },
  },
  {
    name: "Bachelor of Information Systems (BIS)",
    faculty: "Information Technology",
    description: "Business information systems and enterprise solutions.",
    duration: "3 years",
    defaultAps: 28,
    assignmentRule: { type: "all" },
  },
  {
    name: "Bachelor of Cybersecurity",
    faculty: "Information Technology",
    description:
      "Information security, ethical hacking, and digital forensics.",
    duration: "3 years",
    defaultAps: 30,
    assignmentRule: { type: "all" },
  },
  {
    name: "Bachelor of Data Science",
    faculty: "Information Technology",
    description:
      "Big data analytics, machine learning, and statistical modeling.",
    duration: "3 years",
    defaultAps: 32,
    assignmentRule: { type: "all" },
  },
  {
    name: "Bachelor of Artificial Intelligence",
    faculty: "Information Technology",
    description: "AI systems, machine learning, and neural networks.",
    duration: "3 years",
    defaultAps: 34,
    assignmentRule: { type: "all" },
  },
  {
    name: "Bachelor of Game Development",
    faculty: "Information Technology",
    description: "Video game programming and interactive media development.",
    duration: "3 years",
    defaultAps: 30,
    assignmentRule: { type: "all" },
  },
  {
    name: "Bachelor of Web Development",
    faculty: "Information Technology",
    description: "Web programming, front-end and back-end development.",
    duration: "3 years",
    defaultAps: 28,
    assignmentRule: { type: "all" },
  },
  {
    name: "Bachelor of Mobile Application Development",
    faculty: "Information Technology",
    description: "Mobile app development for iOS and Android platforms.",
    duration: "3 years",
    defaultAps: 30,
    assignmentRule: { type: "all" },
  },
  {
    name: "Bachelor of Network Engineering",
    faculty: "Information Technology",
    description: "Computer networking, infrastructure, and telecommunications.",
    duration: "4 years",
    defaultAps: 30,
    assignmentRule: { type: "all" },
  },
  {
    name: "Bachelor of Cloud Computing",
    faculty: "Information Technology",
    description:
      "Cloud infrastructure, virtualization, and distributed systems.",
    duration: "3 years",
    defaultAps: 30,
    assignmentRule: { type: "all" },
  },
  {
    name: "Bachelor of Digital Media",
    faculty: "Information Technology",
    description: "Digital content creation and multimedia technologies.",
    duration: "3 years",
    defaultAps: 28,
    assignmentRule: { type: "all" },
  },

  // Technical and Vocational Programmes
  {
    name: "National Diploma in Engineering (various disciplines)",
    faculty: "Engineering Technology",
    description:
      "Practical engineering training in various technical disciplines.",
    duration: "3 years",
    defaultAps: 24,
    assignmentRule: {
      type: "include_only",
      universities: ["tut", "dut", "mut", "vut"],
    },
  },
  {
    name: "National Diploma in Information Technology",
    faculty: "Information Technology",
    description: "Technical IT skills and practical computer applications.",
    duration: "3 years",
    defaultAps: 24,
    assignmentRule: {
      type: "include_only",
      universities: ["tut", "dut", "mut", "vut"],
    },
  },
  {
    name: "National Diploma in Business Studies",
    faculty: "Commerce",
    description: "Practical business skills and commercial applications.",
    duration: "3 years",
    defaultAps: 22,
    assignmentRule: {
      type: "include_only",
      universities: ["tut", "dut", "mut", "vut"],
    },
  },
  {
    name: "National Diploma in Hospitality Management",
    faculty: "Commerce",
    description: "Hotel and restaurant management skills.",
    duration: "3 years",
    defaultAps: 22,
    assignmentRule: {
      type: "include_only",
      universities: ["tut", "dut", "mut", "vut"],
    },
  },
  {
    name: "National Diploma in Tourism Management",
    faculty: "Commerce",
    description: "Tourism industry operations and management.",
    duration: "3 years",
    defaultAps: 22,
    assignmentRule: {
      type: "include_only",
      universities: ["tut", "dut", "mut", "vut"],
    },
  },
  {
    name: "National Diploma in Public Management",
    faculty: "Commerce",
    description: "Public sector administration and governance.",
    duration: "3 years",
    defaultAps: 22,
    assignmentRule: {
      type: "include_only",
      universities: ["tut", "dut", "mut", "vut"],
    },
  },
  {
    name: "National Diploma in Graphic Design",
    faculty: "Arts and Design",
    description: "Visual communication and graphic design skills.",
    duration: "3 years",
    defaultAps: 24,
    assignmentRule: {
      type: "include_only",
      universities: ["tut", "dut", "mut", "vut"],
    },
  },
  {
    name: "National Diploma in Environmental Health",
    faculty: "Health Sciences",
    description:
      "Environmental health monitoring and public health protection.",
    duration: "3 years",
    defaultAps: 24,
    assignmentRule: {
      type: "include_only",
      universities: ["tut", "dut", "mut", "vut"],
    },
  },
  {
    name: "National Diploma in Food Technology",
    faculty: "Science",
    description: "Food processing, safety, and quality control.",
    duration: "3 years",
    defaultAps: 24,
    assignmentRule: {
      type: "include_only",
      universities: ["tut", "dut", "mut", "vut"],
    },
  },
];

// Combine all program definitions
export const ALL_COMPREHENSIVE_PROGRAMS: ProgramDefinition[] = [
  ...COMPREHENSIVE_PROGRAMS,
  ...COMPREHENSIVE_PROGRAMS_PART3,
];

/**
 * Apply assignment rules to determine which universities should offer each program
 */
export function applyAssignmentRules(
  universities: University[],
  programs: ProgramDefinition[],
): University[] {
  const updatedUniversities = universities.map((university) => ({
    ...university,
  }));

  // Clear existing faculties to start fresh
  updatedUniversities.forEach((uni) => {
    uni.faculties = [];
  });

  // Group programs by faculty
  const programsByFaculty = programs.reduce(
    (acc, program) => {
      if (!acc[program.faculty]) {
        acc[program.faculty] = [];
      }
      acc[program.faculty].push(program);
      return acc;
    },
    {} as Record<string, ProgramDefinition[]>,
  );

  // Apply assignment rules for each program
  programs.forEach((program) => {
    const eligibleUniversities = getEligibleUniversities(
      updatedUniversities,
      program.assignmentRule,
    );

    eligibleUniversities.forEach((university) => {
      // Find or create faculty
      let faculty = university.faculties.find(
        (f) => f.name === program.faculty,
      );
      if (!faculty) {
        faculty = {
          id: `${university.id}-${program.faculty.toLowerCase().replace(/\s+/g, "-")}`,
          name: program.faculty,
          description: getFacultyDescription(program.faculty),
          degrees: [],
        };
        university.faculties.push(faculty);
      }

      // Create degree with university-specific APS if available
      const apsRequirement =
        program.apsRequirements?.[university.id] || program.defaultAps;

      const degree: Degree = {
        id: `${university.id}-${program.name.toLowerCase().replace(/\s+/g, "-")}`,
        name: program.name,
        code: generateDegreeCode(program.name),
        description: program.description,
        duration: program.duration,
        apsRequirement,
        faculty: program.faculty,
        subjects: getDefaultSubjects(program.faculty),
        careerProspects: getCareerProspects(program.name, program.faculty),
      };

      faculty.degrees.push(degree);
    });
  });

  // Sort faculties and degrees
  updatedUniversities.forEach((university) => {
    university.faculties.sort((a, b) => a.name.localeCompare(b.name));
    university.faculties.forEach((faculty) => {
      faculty.degrees.sort((a, b) => a.name.localeCompare(b.name));
    });
  });

  return updatedUniversities;
}

/**
 * Get eligible universities based on assignment rule
 */
function getEligibleUniversities(
  universities: University[],
  rule: AssignmentRule,
): University[] {
  switch (rule.type) {
    case "all":
      return universities;

    case "exclude":
      if (!rule.universities) return universities;
      return universities.filter((uni) => !rule.universities!.includes(uni.id));

    case "include_only":
      if (!rule.universities) return [];
      return universities.filter((uni) => rule.universities!.includes(uni.id));

    default:
      return universities;
  }
}

/**
 * Get statistics about program assignment
 */
export function getAssignmentStats(universities: University[]) {
  const totalPrograms = universities.reduce((total, uni) => {
    return (
      total +
      uni.faculties.reduce((facTotal, fac) => {
        return facTotal + fac.degrees.length;
      }, 0)
    );
  }, 0);

  const facultyStats = universities.reduce(
    (stats, uni) => {
      uni.faculties.forEach((faculty) => {
        if (!stats[faculty.name]) {
          stats[faculty.name] = 0;
        }
        stats[faculty.name] += faculty.degrees.length;
      });
      return stats;
    },
    {} as Record<string, number>,
  );

  return {
    totalPrograms,
    totalUniversities: universities.length,
    facultyStats,
    averageProgramsPerUniversity: Math.round(
      totalPrograms / universities.length,
    ),
  };
}

/**
 * Validate program assignments
 */
export function validateAssignments(universities: University[]): string[] {
  const issues: string[] = [];

  universities.forEach((uni) => {
    if (uni.faculties.length === 0) {
      issues.push(`University ${uni.name} has no faculties assigned`);
    }

    uni.faculties.forEach((faculty) => {
      if (faculty.degrees.length === 0) {
        issues.push(`Faculty ${faculty.name} at ${uni.name} has no degrees`);
      }

      faculty.degrees.forEach((degree) => {
        if (!degree.apsRequirement || degree.apsRequirement < 0) {
          issues.push(
            `Degree ${degree.name} at ${uni.name} has invalid APS requirement`,
          );
        }
      });
    });
  });

  return issues;
}

/**
 * Get faculty description based on faculty name
 */
function getFacultyDescription(facultyName: string): string {
  const descriptions: Record<string, string> = {
    Engineering:
      "Develop technical solutions to real-world problems through engineering design and innovation.",
    "Built Environment":
      "Shape the spaces where people live, work, and play through design and planning.",
    "Health Sciences":
      "Advance human health through medical practice, research, and healthcare innovation.",
    Humanities:
      "Explore human culture, language, arts, and social sciences for a deeper understanding of society.",
    Commerce:
      "Master business principles, economics, and management for organizational success.",
    Law: "Study legal systems, rights, and justice to advocate for individuals and society.",
    Science:
      "Investigate natural phenomena and develop scientific knowledge to benefit humanity.",
    Education:
      "Prepare educators and educational leaders to inspire learning and development.",
    Agriculture:
      "Apply scientific principles to food production, environmental sustainability, and rural development.",
    "Information Technology":
      "Design and develop technological solutions for the digital age.",
    "Arts and Design":
      "Express creativity and innovation through visual arts, design, and multimedia.",
    "Engineering Technology":
      "Apply engineering principles to practical technical challenges and solutions.",
  };

  return (
    descriptions[facultyName] ||
    `Explore diverse academic programs in ${facultyName}.`
  );
}

/**
 * Generate degree code based on program name
 */
function generateDegreeCode(programName: string): string {
  // Common degree code mappings
  const codeMappings: Record<string, string> = {
    "Bachelor of Medicine and Bachelor of Surgery (MBChB)": "MBChB",
    "Bachelor of Dental Surgery (BDS)": "BDS",
    "Bachelor of Pharmacy (BPharm)": "BPharm",
    "Bachelor of Laws (LLB)": "LLB",
    "Bachelor of Education (BEd)": "BEd",
    "Bachelor of Commerce (BCom)": "BCom",
    "Bachelor of Science (BSc)": "BSc",
    "Bachelor of Arts (BA)": "BA",
  };

  // Check for exact matches first
  if (codeMappings[programName]) {
    return codeMappings[programName];
  }

  // For bachelor's degrees
  if (programName.includes("Bachelor of")) {
    if (programName.includes("Engineering")) return "BEng";
    if (programName.includes("Architecture")) return "BArch";
    if (programName.includes("Technology")) return "BTech";
    if (programName.includes("Information")) return "BIT";
    if (programName.includes("Agriculture")) return "BAgric";
  }

  // For diplomas
  if (programName.includes("National Diploma")) {
    return "NDip";
  }

  // Generate from first letters of significant words
  const words = programName
    .replace(/\(.*?\)/g, "") // Remove parentheses content
    .split(" ")
    .filter(
      (word) =>
        word.length > 2 &&
        !["and", "in", "of", "the"].includes(word.toLowerCase()),
    );

  return words
    .slice(0, 3)
    .map((word) => word[0].toUpperCase())
    .join("");
}

/**
 * Get default subjects for a faculty (simplified)
 */
function getDefaultSubjects(facultyName: string) {
  return [
    { name: "English Home Language", level: 4, isRequired: true },
    { name: "Mathematics", level: 4, isRequired: true },
  ];
}

/**
 * Get career prospects (simplified)
 */
function getCareerProspects(
  programName: string,
  facultyName: string,
): string[] {
  return ["Professional", "Specialist", "Researcher", "Manager"];
}

// Debug logging function
export function logAssignmentResults(universities: University[]) {
  if (import.meta.env.DEV) {
    const stats = getAssignmentStats(universities);
    console.log("🎓 Program Assignment Results:", stats);

    const issues = validateAssignments(universities);
    if (issues.length > 0) {
      console.warn("⚠️ Assignment Issues:", issues);
    } else {
      console.log("✅ All program assignments validated successfully");
    }
  }
}
