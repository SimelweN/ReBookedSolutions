import { University } from "@/types/university";

/**
 * UNIVERSITIES OF TECHNOLOGY - CLEARED FOR MANUAL DATA ENTRY
 *
 * All faculty and program data has been removed. Each university entry will be
 * populated manually with accurate faculty and program information.
 */

export const UNIVERSITIES_OF_TECHNOLOGY: University[] = [
  {
    id: "cput",
    name: "Cape Peninsula University of Technology",
    abbreviation: "CPUT",
    fullName: "Cape Peninsula University of Technology (CPUT)",
    location: "Cape Town",
    province: "Western Cape",
    logo: "/logos/universities/tshwane-university-of-technology.svg",
    overview:
      "A leading university of technology providing quality education and training in response to South Africa's skills needs.",
    website: "https://www.cput.ac.za",
    studentPortal: "https://students.cput.ac.za",
    admissionsContact: "admissions@cput.ac.za",
    faculties: [],
    establishedYear: 2005,
    studentPopulation: 32000,
    type: "University of Technology",
    applicationInfo: {
      isOpen: true,
      openingDate: "1 April 2025",
      closingDate: "30 September 2025",
      academicYear: "2026",
      applicationFee: "R220",
      applicationMethod: "Online via CPUT Portal",
    },
  },
];
