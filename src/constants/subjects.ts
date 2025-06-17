// South African School Subjects for APS Calculation
export const SOUTH_AFRICAN_SUBJECTS = [
  // Core/Essential Subjects
  "English Home Language",
  "English First Additional Language",
  "Afrikaans Home Language",
  "Afrikaans First Additional Language",
  "Mathematics",
  "Mathematical Literacy",

  // Science Subjects
  "Physical Sciences",
  "Life Sciences",
  "Chemistry", // Some schools offer separate Chemistry
  "Physics", // Some schools offer separate Physics
  "Biology", // Alternative name for Life Sciences
  "Earth and Environmental Sciences",
  "Agricultural Sciences",
  "Agricultural Management Practices",
  "Agricultural Technology",

  // Commercial/Business Subjects
  "Accounting",
  "Business Studies",
  "Economics",
  "Consumer Studies",
  "Tourism",
  "Hospitality Studies",
  "Marketing",

  // Technical Subjects
  "Information Technology",
  "Computer Applications Technology",
  "Engineering Graphics and Design",
  "Technical Mathematics",
  "Technical Sciences",
  "Electrical Technology",
  "Mechanical Technology",
  "Civil Technology",
  "Design",
  "Textile Studies",

  // Humanities & Social Sciences
  "History",
  "Geography",
  "Religion Studies",
  "Philosophy",
  "Sociology", // Grade 12 level
  "Anthropology", // Grade 12 level
  "Psychology", // Grade 12 level
  "Political Studies", // Grade 12 level

  // Languages (Additional)
  "isiZulu Home Language",
  "isiZulu First Additional Language",
  "isiXhosa Home Language",
  "isiXhosa First Additional Language",
  "Sepedi Home Language",
  "Sepedi First Additional Language",
  "Setswana Home Language",
  "Setswana First Additional Language",
  "Sesotho Home Language",
  "Sesotho First Additional Language",
  "Xitsonga Home Language",
  "Xitsonga First Additional Language",
  "siSwati Home Language",
  "siSwati First Additional Language",
  "Tshivenda Home Language",
  "Tshivenda First Additional Language",
  "isiNdebele Home Language",
  "isiNdebele First Additional Language",
  "Portuguese",
  "German",
  "French",
  "Mandarin",
  "Hindi",
  "Tamil",
  "Telegu",
  "Urdu",
  "Arabic",
  "Hebrew",
  "Italian",
  "Spanish",
  "Latin",
  "Greek",
  "Sign Language",

  // Arts & Culture
  "Visual Arts",
  "Music",
  "Dramatic Arts",
  "Dance Studies",
  "Design Studies",

  // Sport & Fitness
  "Sport and Exercise Science", // Some schools
  "Physical Education", // Some schools

  // Specialized/Others
  "Marine Sciences",
  "Astronomy", // Some schools
  "Equine Studies",
  "Nature Conservation",
  "Forestry",
  "Nautical Science",
];

// For the "Others" option
export const SUBJECT_CATEGORIES = {
  CORE: "Core Subjects",
  SCIENCES: "Science Subjects",
  COMMERCIAL: "Commercial Subjects",
  TECHNICAL: "Technical Subjects",
  HUMANITIES: "Humanities & Social Sciences",
  LANGUAGES: "Languages",
  ARTS: "Arts & Culture",
  SPECIALIZED: "Specialized Subjects",
  OTHERS: "Others",
};

// Non-contributing subjects (mainly LO, but kept flexible)
export const NON_CONTRIBUTING_SUBJECTS = ["Life Orientation"];

// Subject requirements validation
export const REQUIRED_SUBJECTS = [
  "Mathematics",
  "Mathematical Literacy", // One of these is required
];

export const LANGUAGE_REQUIREMENTS = [
  "English Home Language",
  "English First Additional Language",
  "Afrikaans Home Language",
  "Afrikaans First Additional Language",
  // At least one language is required
];

// Helper functions
export const isNonContributing = (subjectName: string): boolean => {
  return NON_CONTRIBUTING_SUBJECTS.includes(subjectName);
};

export const isLanguageSubject = (subjectName: string): boolean => {
  return (
    subjectName.includes("Language") ||
    LANGUAGE_REQUIREMENTS.includes(subjectName)
  );
};

export const isMathSubject = (subjectName: string): boolean => {
  return (
    subjectName.includes("Mathematics") ||
    subjectName === "Mathematical Literacy"
  );
};

export const getSubjectCategory = (subjectName: string): string => {
  if (
    [
      "English Home Language",
      "English First Additional Language",
      "Afrikaans Home Language",
      "Afrikaans First Additional Language",
      "Mathematics",
      "Mathematical Literacy",
      "Life Orientation",
    ].includes(subjectName)
  ) {
    return SUBJECT_CATEGORIES.CORE;
  }

  if (
    [
      "Physical Sciences",
      "Life Sciences",
      "Chemistry",
      "Physics",
      "Biology",
      "Earth and Environmental Sciences",
      "Agricultural Sciences",
      "Agricultural Management Practices",
      "Agricultural Technology",
    ].includes(subjectName)
  ) {
    return SUBJECT_CATEGORIES.SCIENCES;
  }

  if (
    [
      "Accounting",
      "Business Studies",
      "Economics",
      "Consumer Studies",
      "Tourism",
      "Hospitality Studies",
      "Marketing",
    ].includes(subjectName)
  ) {
    return SUBJECT_CATEGORIES.COMMERCIAL;
  }

  if (
    [
      "Information Technology",
      "Computer Applications Technology",
      "Engineering Graphics and Design",
      "Technical Mathematics",
      "Technical Sciences",
      "Electrical Technology",
      "Mechanical Technology",
      "Civil Technology",
      "Design",
      "Textile Studies",
    ].includes(subjectName)
  ) {
    return SUBJECT_CATEGORIES.TECHNICAL;
  }

  if (
    [
      "History",
      "Geography",
      "Religion Studies",
      "Philosophy",
      "Sociology",
      "Anthropology",
      "Psychology",
      "Political Studies",
    ].includes(subjectName)
  ) {
    return SUBJECT_CATEGORIES.HUMANITIES;
  }

  if (isLanguageSubject(subjectName)) {
    return SUBJECT_CATEGORIES.LANGUAGES;
  }

  if (
    [
      "Visual Arts",
      "Music",
      "Dramatic Arts",
      "Dance Studies",
      "Design Studies",
    ].includes(subjectName)
  ) {
    return SUBJECT_CATEGORIES.ARTS;
  }

  return SUBJECT_CATEGORIES.SPECIALIZED;
};

// Export for backward compatibility
export const SUBJECTS_LIST = SOUTH_AFRICAN_SUBJECTS;
