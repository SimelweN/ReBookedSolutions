import { University } from "@/types/university";

/**
 * COMPREHENSIVE UNIVERSITIES - CLEARED FOR MANUAL DATA ENTRY
 *
 * All faculty and program data has been removed. Each university entry will be
 * populated manually with accurate faculty and program information.
 */

export const COMPREHENSIVE_UNIVERSITIES: University[] = [
  // University of Zululand
  {
    id: "unizulu",
    name: "University of Zululand",
    abbreviation: "UniZulu",
    fullName: "University of Zululand (UniZulu)",
    location: "Richards Bay",
    province: "KwaZulu-Natal",
    logo: "/logos/universities/university-of-zululand.svg",
    overview:
      "A comprehensive university rooted in African values and committed to academic excellence and community engagement.",
    website: "https://www.unizulu.ac.za",
    studentPortal: "https://students.unizulu.ac.za",
    admissionsContact: "admissions@unizulu.ac.za",
    establishedYear: 1960,
    studentPopulation: 16000,
    campuses: ["Richards Bay", "KwaDlangezwa"],
    applicationInfo: {
      isOpen: true,
      openingDate: "1 April 2024",
      closingDate: "30 September 2024",
      academicYear: "2025",
      applicationFee: "R220",
      applicationMethod: "Online via university website",
      lateApplications: {
        available: true,
        deadline: "31 October 2024",
        additionalFee: "R300",
      },
    },
    faculties: [],
  },

  // University of Johannesburg
  {
    id: "uj",
    name: "University of Johannesburg",
    abbreviation: "UJ",
    fullName: "University of Johannesburg (UJ)",
    location: "Johannesburg",
    province: "Gauteng",
    logo: "/logos/universities/university-of-johannesburg.svg",
    overview:
      "A vibrant, multicultural comprehensive university that combines academic excellence with innovation and sustainability.",
    website: "https://www.uj.ac.za",
    studentPortal: "https://student.uj.ac.za",
    admissionsContact: "admissions@uj.ac.za",
    establishedYear: 2005,
    studentPopulation: 50000,
    campuses: ["Auckland Park", "Bunting Road", "Doornfontein", "Soweto"],
    applicationInfo: {
      isOpen: true,
      openingDate: "1 April 2024",
      closingDate: "30 September 2024",
      academicYear: "2025",
      applicationFee: "R220",
      applicationMethod: "Online via UJ website",
      lateApplications: {
        available: true,
        deadline: "31 October 2024",
        additionalFee: "R300",
      },
    },
    faculties: [],
  },

  // University of Mpumalanga
  {
    id: "ump",
    name: "University of Mpumalanga",
    abbreviation: "UMP",
    fullName: "University of Mpumalanga (UMP)",
    location: "Nelspruit",
    province: "Mpumalanga",
    logo: "/logos/universities/university-of-mpumalanga.svg",
    overview:
      "A comprehensive university focusing on agricultural development, education, and economic growth in the Mpumalanga province.",
    website: "https://www.ump.ac.za",
    studentPortal: "https://student.ump.ac.za",
    admissionsContact: "admissions@ump.ac.za",
    establishedYear: 2014,
    studentPopulation: 5000,
    campuses: ["Nelspruit", "Mbombela"],
    applicationInfo: {
      isOpen: true,
      openingDate: "1 April 2024",
      closingDate: "30 September 2024",
      academicYear: "2025",
      applicationFee: "R200",
      applicationMethod: "Online via UMP application portal",
      lateApplications: {
        available: true,
        deadline: "31 October 2024",
        additionalFee: "R150",
      },
    },
    faculties: [],
  },
];
