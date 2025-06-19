import { University } from "@/types/university";
import {
  applyAssignmentRules,
  ALL_COMPREHENSIVE_PROGRAMS,
  logAssignmentResults,
} from "./comprehensive-program-assignment";

/**
 * COMPLETE 26 SOUTH AFRICAN PUBLIC UNIVERSITIES
 *
 * This is the definitive list of all 26 public universities in South Africa
 * with comprehensive program allocation based on the complete course list.
 * Programs are assigned using the comprehensive course allocation system.
 *
 * Note: All faculties are populated via comprehensive assignment - no manual faculty generation.
 */

// Base universities without programs (will be populated by comprehensive assignment)
const BASE_UNIVERSITIES: University[] = [
  // TRADITIONAL UNIVERSITIES (11)
  {
    id: "uct",
    name: "UCT",
    abbreviation: "UCT",
    fullName: "University of Cape Town",
    location: "Cape Town",
    province: "Western Cape",
    logo: "https://cdn.builder.io/api/v1/assets/23257b8f40f04bad93cf61926ea750ad/uct-fff84c?format=webp&width=800",
    overview:
      "Africa's leading university, globally ranked for academic excellence and research innovation.",
    website: "https://www.uct.ac.za",
    studentPortal: "https://www.uct.ac.za/students",
    admissionsContact: "admissions@uct.ac.za",
    faculties: [], // Will be populated by comprehensive assignment
    establishedYear: 1829,
    studentPopulation: 29000,
    type: "Traditional University",
    applicationInfo: {
      isOpen: true,
      openingDate: "1 April 2025",
      closingDate: "31 July 2025",
      academicYear: "2026",
      applicationFee: "R100",
      applicationMethod: "Online via UCT Application Portal",
    },
  },
  {
    id: "wits",
    name: "Wits",
    abbreviation: "Wits",
    fullName: "University of the Witwatersrand",
    location: "Johannesburg",
    province: "Gauteng",
    logo: "https://cdn.builder.io/api/v1/assets/23257b8f40f04bad93cf61926ea750ad/wits-e516dc?format=webp&width=800",
    overview:
      "Leading African research university with a global reputation for academic excellence and innovation.",
    website: "https://www.wits.ac.za",
    studentPortal: "https://www.wits.ac.za/students",
    admissionsContact: "admissions@wits.ac.za",
    faculties: [], // Will be populated by comprehensive assignment
    establishedYear: 1922,
    studentPopulation: 40000,
    type: "Traditional University",
    applicationInfo: {
      isOpen: true,
      openingDate: "1 April 2025",
      closingDate: "30 September 2025",
      academicYear: "2026",
      applicationFee: "R100",
      applicationMethod: "Online via Wits Student Portal",
    },
  },
  {
    id: "su",
    name: "Stellenbosch",
    abbreviation: "SU",
    fullName: "Stellenbosch University",
    location: "Stellenbosch",
    province: "Western Cape",
    logo: "https://cdn.builder.io/api/v1/assets/34dfccd6d7ce41b8bf7ca3d8b60d0eeb/stellenbosh-a6e1ea?format=webp&width=800",
    overview:
      "Research-intensive university with a tradition of academic excellence and innovation in South Africa.",
    website: "https://www.sun.ac.za",
    studentPortal: "https://www.sun.ac.za/students",
    admissionsContact: "admissions@sun.ac.za",
    faculties: [], // Will be populated by comprehensive assignment
    establishedYear: 1918,
    studentPopulation: 32000,
    type: "Traditional University",
    applicationInfo: {
      isOpen: true,
      openingDate: "1 March 2025",
      closingDate: "31 August 2025",
      academicYear: "2026",
      applicationFee: "R100",
      applicationMethod: "Online via SU Student Portal",
    },
  },
  {
    id: "up",
    name: "UP",
    abbreviation: "UP",
    fullName: "University of Pretoria",
    location: "Pretoria",
    province: "Gauteng",
    logo: "https://cdn.builder.io/api/v1/assets/23257b8f40f04bad93cf61926ea750ad/up-d5c0a5?format=webp&width=800",
    overview:
      "Top research university in South Africa with comprehensive academic programs and research excellence.",
    website: "https://www.up.ac.za",
    studentPortal: "https://www.up.ac.za/students",
    admissionsContact: "admissions@up.ac.za",
    faculties: [], // Will be populated by comprehensive assignment
    establishedYear: 1908,
    studentPopulation: 56000,
    type: "Traditional University",
    applicationInfo: {
      isOpen: true,
      openingDate: "1 April 2025",
      closingDate: "30 September 2025",
      academicYear: "2026",
      applicationFee: "R100",
      applicationMethod: "Online via UP Student Portal",
    },
  },
  {
    id: "ukzn",
    name: "UKZN",
    abbreviation: "UKZN",
    fullName: "University of KwaZulu-Natal",
    location: "Durban",
    province: "KwaZulu-Natal",
    logo: "https://cdn.builder.io/api/v1/assets/23257b8f40f04bad93cf61926ea750ad/ukzn-6666c2?format=webp&width=800",
    overview:
      "Leading research university with strong community engagement and academic excellence.",
    website: "https://www.ukzn.ac.za",
    studentPortal: "https://www.ukzn.ac.za/students",
    admissionsContact: "admissions@ukzn.ac.za",
    faculties: [], // Will be populated by comprehensive assignment
    establishedYear: 2004,
    studentPopulation: 47000,
    type: "Traditional University",
    applicationInfo: {
      isOpen: true,
      openingDate: "1 April 2025",
      closingDate: "30 September 2025",
      academicYear: "2026",
      applicationFee: "R100",
      applicationMethod: "Online via UKZN Application Portal",
    },
  },
  {
    id: "ufs",
    name: "UFS",
    abbreviation: "UFS",
    fullName: "University of the Free State",
    location: "Bloemfontein",
    province: "Free State",
    logo: "https://cdn.builder.io/api/v1/assets/23257b8f40f04bad93cf61926ea750ad/ufs-ace12a?format=webp&width=800",
    overview:
      "Multi-campus university with strong research focus and comprehensive academic programs.",
    website: "https://www.ufs.ac.za",
    studentPortal: "https://www.ufs.ac.za/students",
    admissionsContact: "admissions@ufs.ac.za",
    faculties: [], // Will be populated by comprehensive assignment
    establishedYear: 1904,
    studentPopulation: 38000,
    type: "Traditional University",
    applicationInfo: {
      isOpen: true,
      openingDate: "1 April 2025",
      closingDate: "30 September 2025",
      academicYear: "2026",
      applicationFee: "R100",
      applicationMethod: "Online via UFS Student Portal",
    },
  },
  {
    id: "ru",
    name: "Rhodes",
    abbreviation: "RU",
    fullName: "Rhodes University",
    location: "Makhanda",
    province: "Eastern Cape",
    logo: "https://cdn.builder.io/api/v1/assets/23257b8f40f04bad93cf61926ea750ad/rhodes-59a57e?format=webp&width=800",
    overview:
      "Prestigious small university known for academic excellence and high-quality research output.",
    website: "https://www.ru.ac.za",
    studentPortal: "https://www.ru.ac.za/students",
    admissionsContact: "admissions@ru.ac.za",
    faculties: [], // Will be populated by comprehensive assignment
    establishedYear: 1904,
    studentPopulation: 8500,
    type: "Traditional University",
    applicationInfo: {
      isOpen: true,
      openingDate: "1 April 2025",
      closingDate: "31 August 2025",
      academicYear: "2026",
      applicationFee: "R100",
      applicationMethod: "Online via Rhodes Student Portal",
    },
  },
  {
    id: "nwu",
    name: "NWU",
    abbreviation: "NWU",
    fullName: "North-West University",
    location: "Potchefstroom",
    province: "North West",
    logo: "https://cdn.builder.io/api/v1/assets/23257b8f40f04bad93cf61926ea750ad/nwu-071a25?format=webp&width=800",
    overview:
      "Multi-campus university offering diverse academic programs with strong research focus.",
    website: "https://www.nwu.ac.za",
    studentPortal: "https://www.nwu.ac.za/students",
    admissionsContact: "admissions@nwu.ac.za",
    faculties: [], // Will be populated by comprehensive assignment
    establishedYear: 2004,
    studentPopulation: 65000,
    type: "Traditional University",
    applicationInfo: {
      isOpen: true,
      openingDate: "1 April 2025",
      closingDate: "30 September 2025",
      academicYear: "2026",
      applicationFee: "R100",
      applicationMethod: "Online via NWU Student Portal",
    },
  },
  {
    id: "uwc",
    name: "UWC",
    abbreviation: "UWC",
    fullName: "University of the Western Cape",
    location: "Cape Town",
    province: "Western Cape",
    logo: "https://cdn.builder.io/api/v1/assets/23257b8f40f04bad93cf61926ea750ad/cape-peninusla-499c5e?format=webp&width=800",
    overview:
      "University with strong community focus and commitment to social justice and transformation.",
    website: "https://www.uwc.ac.za",
    studentPortal: "https://www.uwc.ac.za/students",
    admissionsContact: "admissions@uwc.ac.za",
    faculties: [], // Will be populated by comprehensive assignment
    establishedYear: 1960,
    studentPopulation: 24000,
    type: "Traditional University",
    applicationInfo: {
      isOpen: true,
      openingDate: "1 April 2025",
      closingDate: "30 September 2025",
      academicYear: "2026",
      applicationFee: "R100",
      applicationMethod: "Online via UWC Student Portal",
    },
  },
  {
    id: "ufh",
    name: "UFH",
    abbreviation: "UFH",
    fullName: "University of Fort Hare",
    location: "Alice",
    province: "Eastern Cape",
    logo: "https://cdn.builder.io/api/v1/assets/23257b8f40f04bad93cf61926ea750ad/fort-hare-cc3cf9?format=webp&width=800",
    overview:
      "Historic university with proud legacy of African leadership development and academic excellence.",
    website: "https://www.ufh.ac.za",
    studentPortal: "https://www.ufh.ac.za/students",
    admissionsContact: "admissions@ufh.ac.za",
    faculties: [], // Will be populated by comprehensive assignment
    establishedYear: 1916,
    studentPopulation: 12000,
    type: "Traditional University",
    applicationInfo: {
      isOpen: true,
      openingDate: "1 April 2025",
      closingDate: "30 September 2025",
      academicYear: "2026",
      applicationFee: "R100",
      applicationMethod: "Online via UFH Student Portal",
    },
  },
  {
    id: "ul",
    name: "UL",
    abbreviation: "UL",
    fullName: "University of Limpopo",
    location: "Polokwane",
    province: "Limpopo",
    logo: "https://cdn.builder.io/api/v1/assets/23257b8f40f04bad93cf61926ea750ad/limpopo-d4c90b?format=webp&width=800",
    overview:
      "University serving the Limpopo province with focus on rural development and community engagement.",
    website: "https://www.ul.ac.za",
    studentPortal: "https://www.ul.ac.za/students",
    admissionsContact: "admissions@ul.ac.za",
    faculties: [], // Will be populated by comprehensive assignment
    establishedYear: 2005,
    studentPopulation: 25000,
    type: "Traditional University",
    applicationInfo: {
      isOpen: true,
      openingDate: "1 April 2025",
      closingDate: "30 September 2025",
      academicYear: "2026",
      applicationFee: "R100",
      applicationMethod: "Online via UL Student Portal",
    },
  },

  // UNIVERSITIES OF TECHNOLOGY (6)
  {
    id: "tut",
    name: "TUT",
    abbreviation: "TUT",
    fullName: "Tshwane University of Technology",
    location: "Pretoria",
    province: "Gauteng",
    logo: "https://cdn.builder.io/api/v1/assets/23257b8f40f04bad93cf61926ea750ad/tut-502ab8?format=webp&width=800",
    overview:
      "Leading university of technology providing career-focused education and practical skills development.",
    website: "https://www.tut.ac.za",
    studentPortal: "https://www.tut.ac.za/students",
    admissionsContact: "admissions@tut.ac.za",
    faculties: [], // Will be populated by comprehensive assignment
    establishedYear: 2004,
    studentPopulation: 60000,
    type: "University of Technology",
    applicationInfo: {
      isOpen: true,
      openingDate: "1 April 2025",
      closingDate: "30 September 2025",
      academicYear: "2026",
      applicationFee: "R100",
      applicationMethod: "Online via TUT Student Portal",
    },
  },
  {
    id: "dut",
    name: "DUT",
    abbreviation: "DUT",
    fullName: "Durban University of Technology",
    location: "Durban",
    province: "KwaZulu-Natal",
    logo: "https://cdn.builder.io/api/v1/assets/23257b8f40f04bad93cf61926ea750ad/dut-30eb73?format=webp&width=800",
    overview:
      "Technology-focused university with strong industry partnerships and practical learning approach.",
    website: "https://www.dut.ac.za",
    studentPortal: "https://www.dut.ac.za/students",
    admissionsContact: "admissions@dut.ac.za",
    faculties: [], // Will be populated by comprehensive assignment
    establishedYear: 2002,
    studentPopulation: 33000,
    type: "University of Technology",
    applicationInfo: {
      isOpen: true,
      openingDate: "1 April 2025",
      closingDate: "30 September 2025",
      academicYear: "2026",
      applicationFee: "R100",
      applicationMethod: "Online via DUT Application Portal",
    },
  },
  {
    id: "cput",
    name: "CPUT",
    abbreviation: "CPUT",
    fullName: "Cape Peninsula University of Technology",
    location: "Cape Town",
    province: "Western Cape",
    logo: "https://cdn.builder.io/api/v1/assets/23257b8f40f04bad93cf61926ea750ad/cape-peninusla-499c5e?format=webp&width=800",
    overview:
      "Technology university known for practical, career-oriented programs and industry engagement.",
    website: "https://www.cput.ac.za",
    studentPortal: "https://www.cput.ac.za/students",
    admissionsContact: "admissions@cput.ac.za",
    faculties: [], // Will be populated by comprehensive assignment
    establishedYear: 2005,
    studentPopulation: 32000,
    type: "University of Technology",
    applicationInfo: {
      isOpen: true,
      openingDate: "1 April 2025",
      closingDate: "30 September 2025",
      academicYear: "2026",
      applicationFee: "R100",
      applicationMethod: "Online via CPUT Student Portal",
    },
  },
  {
    id: "cut",
    name: "CUT",
    abbreviation: "CUT",
    fullName: "Central University of Technology",
    location: "Bloemfontein",
    province: "Free State",
    logo: "https://cdn.builder.io/api/v1/assets/23257b8f40f04bad93cf61926ea750ad/cut-16c93d?format=webp&width=800",
    overview:
      "Technology university focusing on applied research and career-oriented education.",
    website: "https://www.cut.ac.za",
    studentPortal: "https://www.cut.ac.za/students",
    admissionsContact: "admissions@cut.ac.za",
    faculties: [], // Will be populated by comprehensive assignment
    establishedYear: 1981,
    studentPopulation: 15000,
    type: "University of Technology",
    applicationInfo: {
      isOpen: true,
      openingDate: "1 April 2025",
      closingDate: "30 September 2025",
      academicYear: "2026",
      applicationFee: "R100",
      applicationMethod: "Online via CUT Student Portal",
    },
  },
  {
    id: "vut",
    name: "VUT",
    abbreviation: "VUT",
    fullName: "Vaal University of Technology",
    location: "Vanderbijlpark",
    province: "Gauteng",
    logo: "https://cdn.builder.io/api/v1/assets/23257b8f40f04bad93cf61926ea750ad/val-c96fb0?format=webp&width=800",
    overview:
      "Technology university providing practical education and skills development for the Vaal region.",
    website: "https://www.vut.ac.za",
    studentPortal: "https://www.vut.ac.za/students",
    admissionsContact: "admissions@vut.ac.za",
    faculties: [], // Will be populated by comprehensive assignment
    establishedYear: 1966,
    studentPopulation: 20000,
    type: "University of Technology",
    applicationInfo: {
      isOpen: true,
      openingDate: "1 April 2025",
      closingDate: "30 September 2025",
      academicYear: "2026",
      applicationFee: "R100",
      applicationMethod: "Online via VUT Student Portal",
    },
  },
  {
    id: "mut",
    name: "MUT",
    abbreviation: "MUT",
    fullName: "Mangosuthu University of Technology",
    location: "Durban",
    province: "KwaZulu-Natal",
    logo: "https://cdn.builder.io/api/v1/assets/23257b8f40f04bad93cf61926ea750ad/mut-4a527e?format=webp&width=800",
    overview:
      "Technology university serving KwaZulu-Natal with focus on practical skills and community development.",
    website: "https://www.mut.ac.za",
    studentPortal: "https://www.mut.ac.za/students",
    admissionsContact: "admissions@mut.ac.za",
    faculties: [], // Will be populated by comprehensive assignment
    establishedYear: 1979,
    studentPopulation: 13000,
    type: "University of Technology",
    applicationInfo: {
      isOpen: true,
      openingDate: "1 April 2025",
      closingDate: "30 September 2025",
      academicYear: "2026",
      applicationFee: "R100",
      applicationMethod: "Online via MUT Student Portal",
    },
  },

  // COMPREHENSIVE UNIVERSITIES (6)
  {
    id: "uj",
    name: "UJ",
    abbreviation: "UJ",
    fullName: "University of Johannesburg",
    location: "Johannesburg",
    province: "Gauteng",
    logo: "https://cdn.builder.io/api/v1/assets/23257b8f40f04bad93cf61926ea750ad/uj-340834?format=webp&width=800",
    overview:
      "Large comprehensive university offering diverse academic and technological programs.",
    website: "https://www.uj.ac.za",
    studentPortal: "https://www.uj.ac.za/students",
    admissionsContact: "admissions@uj.ac.za",
    faculties: [], // Will be populated by comprehensive assignment
    establishedYear: 2005,
    studentPopulation: 50000,
    type: "Comprehensive University",
    applicationInfo: {
      isOpen: true,
      openingDate: "1 April 2025",
      closingDate: "30 September 2025",
      academicYear: "2026",
      applicationFee: "R100",
      applicationMethod: "Online via UJ Student Portal",
    },
  },
  {
    id: "unisa",
    name: "UNISA",
    abbreviation: "UNISA",
    fullName: "University of South Africa",
    location: "Pretoria",
    province: "Gauteng",
    logo: "https://cdn.builder.io/api/v1/assets/23257b8f40f04bad93cf61926ea750ad/unisa-617e53?format=webp&width=800",
    overview:
      "Africa's largest distance education university with comprehensive academic programs.",
    website: "https://www.unisa.ac.za",
    studentPortal: "https://www.unisa.ac.za/students",
    admissionsContact: "admissions@unisa.ac.za",
    faculties: [], // Will be populated by comprehensive assignment
    establishedYear: 1873,
    studentPopulation: 300000,
    type: "Comprehensive University",
    applicationInfo: {
      isOpen: true,
      openingDate: "1 August 2025",
      closingDate: "15 October 2025",
      academicYear: "2026",
      applicationFee: "R100",
      applicationMethod: "Online via myUnisa Student Portal",
    },
  },
  {
    id: "unizul",
    name: "UNIZUL",
    abbreviation: "UNIZUL",
    fullName: "University of Zululand",
    location: "Richards Bay",
    province: "KwaZulu-Natal",
    logo: "https://cdn.builder.io/api/v1/assets/34dfccd6d7ce41b8bf7ca3d8b60d0eeb/zululand-43783b?format=webp&width=800",
    overview:
      "Comprehensive university serving rural KwaZulu-Natal with focus on community development.",
    website: "https://www.unizulu.ac.za",
    studentPortal: "https://www.unizulu.ac.za/students",
    admissionsContact: "admissions@unizulu.ac.za",
    faculties: [], // Will be populated by comprehensive assignment
    establishedYear: 1960,
    studentPopulation: 16000,
    type: "Comprehensive University",
    applicationInfo: {
      isOpen: true,
      openingDate: "1 April 2025",
      closingDate: "30 September 2025",
      academicYear: "2026",
      applicationFee: "R100",
      applicationMethod: "Online via UNIZUL Student Portal",
    },
  },
  {
    id: "uv",
    name: "UV",
    abbreviation: "UV",
    fullName: "University of Venda",
    location: "Thohoyandou",
    province: "Limpopo",
    logo: "https://cdn.builder.io/api/v1/assets/34dfccd6d7ce41b8bf7ca3d8b60d0eeb/venda-1be0a7?format=webp&width=800",
    overview:
      "Comprehensive university serving the Venda region with focus on rural development.",
    website: "https://www.univen.ac.za",
    studentPortal: "https://www.univen.ac.za/students",
    admissionsContact: "admissions@univen.ac.za",
    faculties: [], // Will be populated by comprehensive assignment
    establishedYear: 1982,
    studentPopulation: 15000,
    type: "Comprehensive University",
    applicationInfo: {
      isOpen: true,
      openingDate: "1 April 2025",
      closingDate: "30 September 2025",
      academicYear: "2026",
      applicationFee: "R100",
      applicationMethod: "Online via UV Student Portal",
    },
  },
  {
    id: "nmu",
    name: "NMU",
    abbreviation: "NMU",
    fullName: "Nelson Mandela University",
    location: "Port Elizabeth",
    province: "Eastern Cape",
    logo: "https://cdn.builder.io/api/v1/assets/34dfccd6d7ce41b8bf7ca3d8b60d0eeb/nelson-a2ae62?format=webp&width=800",
    overview:
      "Comprehensive university known for academic excellence and community engagement in the Eastern Cape.",
    website: "https://www.mandela.ac.za",
    studentPortal: "https://www.mandela.ac.za/students",
    admissionsContact: "admissions@mandela.ac.za",
    faculties: [], // Will be populated by comprehensive assignment
    establishedYear: 2005,
    studentPopulation: 27000,
    type: "Comprehensive University",
    applicationInfo: {
      isOpen: true,
      openingDate: "1 April 2025",
      closingDate: "30 June (Health), 30 Sept (others)",
      academicYear: "2026",
      applicationFee: "Free SA",
      applicationMethod: "Online via NMU Student Portal",
    },
  },
  {
    id: "wsu",
    name: "WSU",
    abbreviation: "WSU",
    fullName: "Walter Sisulu University",
    location: "Mthatha",
    province: "Eastern Cape",
    logo: "https://cdn.builder.io/api/v1/assets/23257b8f40f04bad93cf61926ea750ad/wsu-a30990?format=webp&width=800",
    overview:
      "Comprehensive university serving the Eastern Cape with multiple campuses and diverse programs.",
    website: "https://www.wsu.ac.za",
    studentPortal: "https://www.wsu.ac.za/students",
    admissionsContact: "admissions@wsu.ac.za",
    faculties: [], // Will be populated by comprehensive assignment
    establishedYear: 2005,
    studentPopulation: 28000,
    type: "Comprehensive University",
    applicationInfo: {
      isOpen: true,
      openingDate: "1 April 2025",
      closingDate: "30 September 2025",
      academicYear: "2026",
      applicationFee: "R100",
      applicationMethod: "Online via WSU Student Portal",
    },
  },

  // SPECIALIZED UNIVERSITIES (3)
  {
    id: "smu",
    name: "SMU",
    abbreviation: "SMU",
    fullName: "Sefako Makgatho Health Sciences University",
    location: "Pretoria",
    province: "Gauteng",
    logo: "https://cdn.builder.io/api/v1/assets/23257b8f40f04bad93cf61926ea750ad/sefako-7760a4?format=webp&width=800",
    overview:
      "Specialized health sciences university focusing on medical and health-related programs.",
    website: "https://www.smu.ac.za",
    studentPortal: "https://www.smu.ac.za/students",
    admissionsContact: "admissions@smu.ac.za",
    faculties: [], // Will be populated by comprehensive assignment
    establishedYear: 2014,
    studentPopulation: 6000,
    type: "Traditional University",
    applicationInfo: {
      isOpen: true,
      openingDate: "1 April 2025",
      closingDate: "30 September 2025",
      academicYear: "2026",
      applicationFee: "R100",
      applicationMethod: "Online via SMU Student Portal",
    },
  },
  {
    id: "spu",
    name: "SPU",
    abbreviation: "SPU",
    fullName: "Sol Plaatje University",
    location: "Kimberley",
    province: "Northern Cape",
    logo: "https://cdn.builder.io/api/v1/assets/23257b8f40f04bad93cf61926ea750ad/sol-plaatje-28cea9?format=webp&width=800",
    overview:
      "New university established to serve the Northern Cape region with innovative programs.",
    website: "https://www.spu.ac.za",
    studentPortal: "https://www.spu.ac.za/students",
    admissionsContact: "admissions@spu.ac.za",
    faculties: [], // Will be populated by comprehensive assignment
    establishedYear: 2013,
    studentPopulation: 3000,
    type: "Traditional University",
    applicationInfo: {
      isOpen: true,
      openingDate: "1 April 2025",
      closingDate: "30 September 2025",
      academicYear: "2026",
      applicationFee: "R100",
      applicationMethod: "Online via SPU Student Portal",
    },
  },
  {
    id: "ump",
    name: "UMP",
    abbreviation: "UMP",
    fullName: "University of Mpumalanga",
    location: "Nelspruit",
    province: "Mpumalanga",
    logo: "https://cdn.builder.io/api/v1/assets/23257b8f40f04bad93cf61926ea750ad/mpumalanga-b87746?format=webp&width=800",
    overview:
      "New university serving Mpumalanga province with focus on regional development needs.",
    website: "https://www.ump.ac.za",
    studentPortal: "https://www.ump.ac.za/students",
    admissionsContact: "admissions@ump.ac.za",
    faculties: [], // Will be populated by comprehensive assignment
    establishedYear: 2013,
    studentPopulation: 4000,
    type: "Traditional University",
    applicationInfo: {
      isOpen: true,
      openingDate: "1 April 2025",
      closingDate: "30 September 2025",
      academicYear: "2026",
      applicationFee: "R100",
      applicationMethod: "Online via UMP Student Portal",
    },
  },
];

// Apply comprehensive program assignment to all universities
export const ALL_26_SA_UNIVERSITIES = applyAssignmentRules(
  BASE_UNIVERSITIES,
  ALL_COMPREHENSIVE_PROGRAMS,
);

// Log assignment results in development
logAssignmentResults(ALL_26_SA_UNIVERSITIES);

// Export for compatibility
export const ALL_SOUTH_AFRICAN_UNIVERSITIES = ALL_26_SA_UNIVERSITIES;

// University counts by type
export const UNIVERSITY_STATISTICS = {
  traditional: ALL_26_SA_UNIVERSITIES.filter(
    (u) => u.type === "Traditional University",
  ).length,
  technology: ALL_26_SA_UNIVERSITIES.filter(
    (u) => u.type === "University of Technology",
  ).length,
  comprehensive: ALL_26_SA_UNIVERSITIES.filter(
    (u) => u.type === "Comprehensive University",
  ).length,
  total: ALL_26_SA_UNIVERSITIES.length,
};

console.log(
  `✅ Complete database loaded: ${ALL_26_SA_UNIVERSITIES.length} South African universities`,
);
console.log(
  `📊 Statistics: ${UNIVERSITY_STATISTICS.traditional} Traditional, ${UNIVERSITY_STATISTICS.technology} Technology, ${UNIVERSITY_STATISTICS.comprehensive} Comprehensive`,
);
