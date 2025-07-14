import { University } from "@/types/university";

/**
 * TRADITIONAL UNIVERSITIES - CLEARED FOR MANUAL DATA ENTRY
 *
 * All faculty and program data has been removed. Each university entry will be
 * populated manually with accurate faculty and program information.
 */

export const TRADITIONAL_UNIVERSITIES: University[] = [
  {
    id: "uct",
    name: "University of Cape Town",
    abbreviation: "UCT",
    fullName: "University of Cape Town (UCT)",
    location: "Cape Town",
    province: "Western Cape",
    logo: "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?w=80&h=80&fit=crop&crop=center",
    overview:
      "Africa's leading university, UCT is renowned for its research excellence and beautiful campus situated beneath Table Mountain. It consistently ranks as the top university in Africa.",
    website: "https://www.uct.ac.za",
    studentPortal: "https://students.uct.ac.za",
    admissionsContact: "admissions@uct.ac.za",
    faculties: [],
    establishedYear: 1829,
    studentPopulation: 29000,
    type: "Traditional University",
    scoringSystem: "uct-fps",
    applicationInfo: {
      isOpen: true,
      openingDate: "1 April 2025",
      closingDate: "31 July 2025",
      academicYear: "2026",
      applicationFee: "R100",
      applicationMethod: "Online via UCT Application Portal",
    },
  },
];
