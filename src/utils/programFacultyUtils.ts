import { University, Faculty, Degree } from "@/types/university";

/**
 * Faculty-program alignment mapping to ensure programs are correctly categorized
 */
const FACULTY_PROGRAM_MAPPING: Record<string, string[]> = {
  "Health Sciences": [
    "medicine",
    "nursing",
    "pharmacy",
    "dentistry",
    "physiotherapy",
    "occupational therapy",
    "radiography",
    "optometry",
    "speech therapy",
    "audiology",
    "biomedical",
    "medical",
    "health",
    "clinical",
  ],
  Engineering: [
    "engineering",
    "mechanical",
    "electrical",
    "civil",
    "chemical",
    "industrial",
    "mining",
    "metallurgical",
    "aerospace",
    "automotive",
    "robotics",
    "mechatronics",
    "computer engineering",
  ],
  Commerce: [
    "commerce",
    "business",
    "accounting",
    "finance",
    "economics",
    "marketing",
    "management",
    "entrepreneurship",
    "supply chain",
    "human resources",
    "investment",
    "banking",
    "insurance",
  ],
  Law: [
    "law",
    "legal",
    "jurisprudence",
    "constitutional",
    "criminal",
    "commercial law",
    "international law",
    "human rights",
  ],
  Humanities: [
    "humanities",
    "history",
    "philosophy",
    "english",
    "literature",
    "linguistics",
    "anthropology",
    "archaeology",
    "geography",
    "political science",
    "international relations",
    "sociology",
    "psychology",
    "languages",
    "cultural studies",
    "media studies",
  ],
  Science: [
    "science",
    "mathematics",
    "physics",
    "chemistry",
    "biology",
    "botany",
    "zoology",
    "microbiology",
    "biochemistry",
    "genetics",
    "statistics",
    "computer science",
    "information technology",
    "data science",
    "astronomy",
    "geology",
    "environmental science",
  ],
  Education: [
    "education",
    "teaching",
    "pedagogy",
    "educational psychology",
    "curriculum",
    "early childhood",
    "primary education",
    "secondary education",
    "higher education",
    "special education",
  ],
  Agriculture: [
    "agriculture",
    "agricultural",
    "farming",
    "horticulture",
    "animal science",
    "crop science",
    "soil science",
    "forestry",
    "agribusiness",
    "food science",
    "veterinary",
  ],
  Arts: [
    "fine arts",
    "visual arts",
    "music",
    "drama",
    "theatre",
    "dance",
    "creative writing",
    "design",
    "fashion",
    "photography",
  ],
  "Information Technology": [
    "information technology",
    "computer science",
    "software",
    "programming",
    "cybersecurity",
    "network",
    "database",
    "web development",
    "artificial intelligence",
    "machine learning",
  ],
};

/**
 * Determines the correct faculty for a program based on its name and content
 */
export const determineCorrectFaculty = (
  programName: string,
  programDescription?: string,
): string => {
  const searchText = `${programName} ${programDescription || ""}`.toLowerCase();

  for (const [faculty, keywords] of Object.entries(FACULTY_PROGRAM_MAPPING)) {
    if (keywords.some((keyword) => searchText.includes(keyword))) {
      return faculty;
    }
  }

  // Default fallback based on common patterns
  if (searchText.includes("b.tech") || searchText.includes("btech")) {
    return "Engineering";
  }
  if (searchText.includes("b.com") || searchText.includes("bcom")) {
    return "Commerce";
  }
  if (searchText.includes("ba ") || searchText.includes("bachelor of arts")) {
    return "Humanities";
  }
  if (
    searchText.includes("bsc") ||
    searchText.includes("bachelor of science")
  ) {
    return "Science";
  }
  if (
    searchText.includes("bed") ||
    searchText.includes("bachelor of education")
  ) {
    return "Education";
  }

  return "General Studies"; // Default fallback
};

/**
 * Validates and corrects faculty assignments for a university
 */
export const validateAndCorrectFacultyAssignments = (
  university: University,
): University => {
  const correctedFaculties: Faculty[] = [];
  const facultyMap = new Map<string, Faculty>();

  // Initialize faculty map with existing faculties
  university.faculties.forEach((faculty) => {
    facultyMap.set(faculty.name, {
      ...faculty,
      degrees: [],
    });
  });

  // Process each degree and assign to correct faculty
  university.faculties.forEach((faculty) => {
    faculty.degrees.forEach((degree) => {
      const correctFacultyName = determineCorrectFaculty(
        degree.name,
        degree.description,
      );

      // Create faculty if it doesn't exist
      if (!facultyMap.has(correctFacultyName)) {
        facultyMap.set(correctFacultyName, {
          id: correctFacultyName.toLowerCase().replace(/\s+/g, "-"),
          name: correctFacultyName,
          description: getFacultyDescription(correctFacultyName),
          degrees: [],
        });
      }

      // Update degree's faculty field to match actual assignment
      const correctedDegree: Degree = {
        ...degree,
        faculty: correctFacultyName,
      };

      facultyMap.get(correctFacultyName)!.degrees.push(correctedDegree);
    });
  });

  // Convert map back to array and sort by faculty name
  correctedFaculties.push(
    ...Array.from(facultyMap.values()).sort((a, b) =>
      a.name.localeCompare(b.name),
    ),
  );

  return {
    ...university,
    faculties: correctedFaculties.filter(
      (faculty) => faculty.degrees.length > 0,
    ),
  };
};

/**
 * Provides default descriptions for faculty types
 */
const getFacultyDescription = (facultyName: string): string => {
  const descriptions: Record<string, string> = {
    "Health Sciences":
      "Medical and health-related programs focusing on healthcare, medicine, and allied health professions.",
    Engineering:
      "Technical and engineering programs covering various engineering disciplines and applied sciences.",
    Commerce:
      "Business, finance, and commercial programs preparing students for careers in business and industry.",
    Law: "Legal studies and jurisprudence programs for aspiring lawyers and legal professionals.",
    Humanities:
      "Liberal arts, social sciences, and humanities programs exploring human culture and society.",
    Science: "Natural sciences, mathematics, and scientific research programs.",
    Education:
      "Teacher training and educational studies programs for aspiring educators.",
    Agriculture:
      "Agricultural sciences, farming, and food production programs.",
    Arts: "Creative and performing arts programs including visual arts, music, and drama.",
    "Information Technology":
      "Computer science, software development, and information technology programs.",
    "General Studies": "Interdisciplinary and general academic programs.",
  };

  return (
    descriptions[facultyName] ||
    "Academic programs and courses offered by this faculty."
  );
};

/**
 * Sorts programs within each faculty by APS requirement (ascending) and then by name
 */
export const sortProgramsWithinFaculties = (
  university: University,
): University => {
  return {
    ...university,
    faculties: university.faculties.map((faculty) => ({
      ...faculty,
      degrees: [...faculty.degrees].sort((a, b) => {
        // First sort by APS requirement (ascending)
        if (a.apsRequirement !== b.apsRequirement) {
          return a.apsRequirement - b.apsRequirement;
        }
        // Then sort by name (alphabetical)
        return a.name.localeCompare(b.name);
      }),
    })),
  };
};

/**
 * Main function to fix all program-faculty assignments for a university
 */
export const fixProgramFacultyAssignments = (
  university: University,
): University => {
  // Step 1: Validate and correct faculty assignments
  const correctedUniversity = validateAndCorrectFacultyAssignments(university);

  // Step 2: Sort programs within faculties
  const sortedUniversity = sortProgramsWithinFaculties(correctedUniversity);

  return sortedUniversity;
};
