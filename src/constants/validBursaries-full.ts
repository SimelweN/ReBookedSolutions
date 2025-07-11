import { Bursary } from "@/types/university";

// Check if we're in a Workers/SSR environment where we should avoid loading large data
// Use conservative detection to prevent memory issues in serverless/edge environments
const isWorkersEnvironment = typeof window === "undefined";

export const ADDITIONAL_VALID_BURSARIES: Bursary[] = isWorkersEnvironment
  ? []
  : [
      // Recent Government Initiatives & Provincial Bursaries (2024-2025)
      {
        id: "gauteng-province-2024",
        name: "Gauteng Provincial Government Bursary",
        provider: "Gauteng Provincial Government",
        description:
          "Bursary for Gauteng residents pursuing careers in priority skills areas.",
        amount: "Full tuition + accommodation + living allowance + textbooks",
        eligibilityCriteria: [
          "South African citizen",
          "Gauteng resident for at least 3 years",
          "Studying in priority skills areas (Health, Education, Engineering, ICT)",
          "Academic merit (minimum 60% average)",
          "Financial need (household income below R600,000)",
          "Agree to work in Gauteng for 2 years after graduation",
        ],
        applicationDeadline: "31 October 2024",
        applicationProcess: "Apply online at www.gauteng.gov.za/bursaries",
        contactInfo: "011 355 7911 | bursaries@gauteng.gov.za",
        website: "https://www.gauteng.gov.za/education/bursaries",
        fieldsOfStudy: [
          "Health Sciences",
          "Education",
          "Engineering",
          "Information Technology",
          "Social Work",
        ],
        provinces: ["Gauteng"],
        requirements: {
          academicRequirement: "Minimum 60% average",
          financialNeed: true,
        },
        isActive: true,
        priority: "high",
      },
      {
        id: "western-cape-2024",
        name: "Western Cape Government Bursary",
        provider: "Western Cape Government",
        description:
          "Comprehensive bursary for Western Cape residents in scarce skills.",
        amount:
          "Full tuition + accommodation + stipend + textbooks + transport",
        eligibilityCriteria: [
          "South African citizen",
          "Western Cape resident",
          "Studying in scarce skills areas",
          "Academic excellence (minimum 65%)",
          "Financial need",
          "Commitment to work in Western Cape after graduation",
        ],
        applicationDeadline: "30 September 2024",
        applicationProcess: "Apply online at www.westerncape.gov.za/bursaries",
        contactInfo: "021 483 9000 | bursaries@westerncape.gov.za",
        website: "https://www.westerncape.gov.za/education/bursaries",
        fieldsOfStudy: [
          "Health Sciences",
          "Education",
          "Engineering",
          "Agriculture",
          "Social Work",
          "Teaching",
        ],
        provinces: ["Western Cape"],
        requirements: {
          academicRequirement: "Minimum 65% average",
          financialNeed: true,
        },
        isActive: true,
        priority: "high",
      },
      {
        id: "kwazulu-natal-2024",
        name: "KwaZulu-Natal Provincial Bursary",
        provider: "KwaZulu-Natal Provincial Government",
        description: "Bursary for KZN residents in critical skills areas.",
        amount: "Full tuition + accommodation + allowances",
        eligibilityCriteria: [
          "South African citizen",
          "KwaZulu-Natal resident",
          "Studying critical skills areas",
          "Academic merit (minimum 60%)",
          "Financial need",
          "Rural students given preference",
        ],
        applicationDeadline: "31 August 2024",
        applicationProcess: "Apply through district offices or online",
        contactInfo: "033 392 1004 | bursaries@kzneducation.gov.za",
        website: "https://www.kzneducation.gov.za/bursaries",
        fieldsOfStudy: [
          "Education",
          "Health Sciences",
          "Engineering",
          "Agriculture",
          "Nursing",
        ],
        provinces: ["KwaZulu-Natal"],
        requirements: {
          academicRequirement: "Minimum 60% average",
          financialNeed: true,
        },
        isActive: true,
        priority: "medium",
      },

      // New Technology & Digital Skills Bursaries
      {
        id: "microsoft-skills-2024",
        name: "Microsoft Digital Skills Bursary",
        provider: "Microsoft South Africa",
        description:
          "Bursary for students in technology and digital skills programs.",
        amount:
          "Full tuition + accommodation + technology allowance + certification",
        eligibilityCriteria: [
          "South African citizen",
          "Studying computer science, software development, data science, AI",
          "Academic excellence (minimum 70%)",
          "Passion for technology and innovation",
          "Previously disadvantaged background preferred",
        ],
        applicationDeadline: "30 June 2024",
        applicationProcess: "Apply online at www.microsoft.com/za/bursaries",
        contactInfo: "bursaries@microsoft.com",
        website:
          "https://www.microsoft.com/en-za/corporate-responsibility/skills-employability",
        fieldsOfStudy: [
          "Computer Science",
          "Software Development",
          "Data Science",
          "Artificial Intelligence",
          "Information Technology",
        ],
        provinces: ["All provinces"],
        requirements: {
          academicRequirement: "Minimum 70% average",
          financialNeed: false,
        },
        isActive: true,
        priority: "high",
      },
      {
        id: "amazon-aws-2024",
        name: "Amazon Web Services (AWS) Bursary",
        provider: "Amazon Web Services",
        description: "Bursary for cloud computing and technology students.",
        amount: "Full tuition + accommodation + AWS certification + internship",
        eligibilityCriteria: [
          "South African citizen",
          "Studying computer science, cloud computing, cybersecurity",
          "Strong academic performance (minimum 65%)",
          "Interest in cloud technologies",
          "Financial need",
        ],
        applicationDeadline: "31 July 2024",
        applicationProcess: "Apply through university partnerships",
        contactInfo: "bursaries-za@amazon.com",
        website: "https://aws.amazon.com/education/",
        fieldsOfStudy: [
          "Computer Science",
          "Cloud Computing",
          "Cybersecurity",
          "Information Technology",
        ],
        provinces: ["All provinces"],
        requirements: {
          academicRequirement: "Minimum 65% average",
          financialNeed: true,
        },
        isActive: true,
        priority: "high",
      },
      {
        id: "google-developer-2024",
        name: "Google Developer Scholarship",
        provider: "Google South Africa",
        description:
          "Scholarship for aspiring developers and tech entrepreneurs.",
        amount:
          "Full tuition + mentorship + Google certification + internship opportunities",
        eligibilityCriteria: [
          "South African citizen",
          "Studying computer science, software engineering, mobile development",
          "Academic excellence (minimum 70%)",
          "Strong coding skills",
          "Underrepresented groups in tech preferred",
        ],
        applicationDeadline: "30 April 2024",
        applicationProcess:
          "Apply online at developers.google.com/scholarships",
        contactInfo: "scholarships@google.com",
        website: "https://developers.google.com/scholarships",
        fieldsOfStudy: [
          "Computer Science",
          "Software Engineering",
          "Mobile Development",
          "Web Development",
        ],
        provinces: ["All provinces"],
        requirements: {
          academicRequirement: "Minimum 70% average",
          financialNeed: false,
        },
        isActive: true,
        priority: "high",
      },

      // New Financial Services & Fintech Bursaries
      {
        id: "capitec-fintech-2024",
        name: "Capitec Bank Technology Bursary",
        provider: "Capitec Bank",
        description: "Bursary for technology and banking students.",
        amount: "Full tuition + accommodation + stipend + internship",
        eligibilityCriteria: [
          "South African citizen",
          "Studying computer science, software engineering, fintech, commerce",
          "Academic excellence (minimum 65%)",
          "Interest in banking and financial technology",
          "Financial need",
        ],
        applicationDeadline: "31 May 2024",
        applicationProcess:
          "Apply online at www.capitecbank.co.za/careers/bursaries",
        contactInfo: "bursaries@capitecbank.co.za",
        website: "https://www.capitecbank.co.za/careers/bursaries",
        fieldsOfStudy: [
          "Computer Science",
          "Software Engineering",
          "Finance",
          "Commerce",
          "Information Technology",
        ],
        provinces: ["All provinces"],
        requirements: {
          academicRequirement: "Minimum 65% average",
          financialNeed: true,
        },
        isActive: true,
        priority: "high",
      },
      {
        id: "discovery-actuarial-2024",
        name: "Discovery Actuarial Sciences Bursary",
        provider: "Discovery Limited",
        description: "Comprehensive bursary for actuarial science students.",
        amount:
          "Full tuition + accommodation + stipend + mentorship + employment guarantee",
        eligibilityCriteria: [
          "South African citizen",
          "Studying actuarial science, statistics, mathematics",
          "Academic excellence (minimum 75%)",
          "Strong mathematical aptitude",
          "Agree to work for Discovery after graduation",
        ],
        applicationDeadline: "31 March 2024",
        applicationProcess:
          "Apply online at www.discovery.co.za/careers/bursaries",
        contactInfo: "bursaries@discovery.co.za",
        website: "https://www.discovery.co.za/careers/bursaries",
        fieldsOfStudy: [
          "Actuarial Science",
          "Statistics",
          "Mathematics",
          "Data Science",
        ],
        provinces: ["All provinces"],
        requirements: {
          academicRequirement: "Minimum 75% average",
          financialNeed: false,
        },
        isActive: true,
        priority: "high",
      },

      // New Healthcare & Medical Bursaries
      {
        id: "netcare-nursing-2024",
        name: "Netcare Nursing Education Bursary",
        provider: "Netcare Limited",
        description: "Bursary for nursing and healthcare students.",
        amount:
          "Full tuition + accommodation + uniform allowance + guaranteed employment",
        eligibilityCriteria: [
          "South African citizen",
          "Studying nursing, healthcare, medical technology",
          "Academic merit (minimum 60%)",
          "Passion for healthcare",
          "Agree to work for Netcare after graduation",
        ],
        applicationDeadline: "31 July 2024",
        applicationProcess:
          "Apply online at www.netcare.co.za/careers/bursaries",
        contactInfo: "bursaries@netcare.co.za",
        website: "https://www.netcare.co.za/careers/bursaries",
        fieldsOfStudy: [
          "Nursing",
          "Healthcare",
          "Medical Technology",
          "Radiography",
        ],
        provinces: ["All provinces"],
        requirements: {
          academicRequirement: "Minimum 60% average",
          financialNeed: true,
        },
        isActive: true,
        priority: "high",
      },
      {
        id: "mediclinic-healthcare-2024",
        name: "Mediclinic Healthcare Bursary",
        provider: "Mediclinic Southern Africa",
        description: "Bursary for healthcare professionals.",
        amount:
          "Full tuition + accommodation + allowances + employment pathway",
        eligibilityCriteria: [
          "South African citizen",
          "Studying medicine, nursing, physiotherapy, pharmacy",
          "Academic excellence (minimum 65%)",
          "Financial need",
          "Commitment to healthcare profession",
        ],
        applicationDeadline: "30 June 2024",
        applicationProcess:
          "Apply online at www.mediclinic.co.za/careers/bursaries",
        contactInfo: "bursaries@mediclinic.co.za",
        website: "https://www.mediclinic.co.za/careers/bursaries",
        fieldsOfStudy: [
          "Medicine",
          "Nursing",
          "Physiotherapy",
          "Pharmacy",
          "Medical Technology",
        ],
        provinces: ["All provinces"],
        requirements: {
          academicRequirement: "Minimum 65% average",
          financialNeed: true,
        },
        isActive: true,
        priority: "high",
      },

      // New Retail & Consumer Bursaries
      {
        id: "pick-n-pay-2024",
        name: "Pick n Pay Foundation Bursary",
        provider: "Pick n Pay",
        description: "Bursary for retail, supply chain, and business students.",
        amount: "Full tuition + accommodation + stipend + internship",
        eligibilityCriteria: [
          "South African citizen",
          "Studying retail management, supply chain, business, marketing",
          "Academic merit (minimum 60%)",
          "Financial need",
          "Interest in retail industry",
        ],
        applicationDeadline: "31 August 2024",
        applicationProcess: "Apply online at www.picknpay.co.za/foundation",
        contactInfo: "foundation@pnp.co.za",
        website: "https://www.picknpay.co.za/sustainability/foundation",
        fieldsOfStudy: [
          "Retail Management",
          "Supply Chain Management",
          "Business",
          "Marketing",
          "Commerce",
        ],
        provinces: ["All provinces"],
        requirements: {
          academicRequirement: "Minimum 60% average",
          financialNeed: true,
        },
        isActive: true,
        priority: "medium",
      },
      {
        id: "massmart-walmart-2024",
        name: "Massmart (Walmart) Bursary Programme",
        provider: "Massmart Holdings",
        description: "Bursary for retail, logistics, and technology students.",
        amount: "Full tuition + accommodation + allowances + work experience",
        eligibilityCriteria: [
          "South African citizen",
          "Studying retail, logistics, supply chain, IT, commerce",
          "Academic performance (minimum 65%)",
          "Leadership potential",
          "Financial need",
        ],
        applicationDeadline: "30 September 2024",
        applicationProcess:
          "Apply online at www.massmart.co.za/careers/bursaries",
        contactInfo: "bursaries@massmart.co.za",
        website: "https://www.massmart.co.za/careers/bursaries",
        fieldsOfStudy: [
          "Retail Management",
          "Logistics",
          "Supply Chain",
          "Information Technology",
          "Commerce",
        ],
        provinces: ["All provinces"],
        requirements: {
          academicRequirement: "Minimum 65% average",
          financialNeed: true,
        },
        isActive: true,
        priority: "medium",
      },

      // New Energy & Utilities Bursaries
      {
        id: "engen-petroleum-2024",
        name: "Engen Petroleum Bursary",
        provider: "Engen Petroleum Limited",
        description: "Bursary for engineering and petroleum studies.",
        amount: "Full tuition + accommodation + stipend + vacation work",
        eligibilityCriteria: [
          "South African citizen",
          "Studying chemical, mechanical, electrical engineering, petroleum studies",
          "Academic excellence (minimum 65%)",
          "Interest in petroleum industry",
          "Agree to work for Engen after graduation",
        ],
        applicationDeadline: "31 March 2024",
        applicationProcess: "Apply online at www.engen.co.za/careers/bursaries",
        contactInfo: "bursaries@engen.co.za",
        website: "https://www.engen.co.za/careers/bursaries",
        fieldsOfStudy: [
          "Chemical Engineering",
          "Mechanical Engineering",
          "Electrical Engineering",
          "Petroleum Engineering",
        ],
        provinces: ["All provinces"],
        requirements: {
          academicRequirement: "Minimum 65% average",
          financialNeed: false,
        },
        isActive: true,
        priority: "medium",
      },
      {
        id: "shell-energy-2024",
        name: "Shell South Africa Energy Bursary",
        provider: "Shell South Africa",
        description: "Bursary for energy and engineering students.",
        amount: "Full tuition + accommodation + allowances + global exposure",
        eligibilityCriteria: [
          "South African citizen",
          "Studying chemical, mechanical, electrical engineering, renewable energy",
          "Academic excellence (minimum 70%)",
          "Passion for energy sector",
          "Leadership qualities",
        ],
        applicationDeadline: "30 April 2024",
        applicationProcess: "Apply online at www.shell.co.za/careers/bursaries",
        contactInfo: "bursaries@shell.com",
        website: "https://www.shell.co.za/careers/bursaries",
        fieldsOfStudy: [
          "Chemical Engineering",
          "Mechanical Engineering",
          "Electrical Engineering",
          "Renewable Energy",
        ],
        provinces: ["All provinces"],
        requirements: {
          academicRequirement: "Minimum 70% average",
          financialNeed: false,
        },
        isActive: true,
        priority: "high",
      },

      // New Manufacturing & Industrial Bursaries
      {
        id: "tiger-brands-2024",
        name: "Tiger Brands Manufacturing Bursary",
        provider: "Tiger Brands Limited",
        description: "Bursary for food technology and manufacturing students.",
        amount: "Full tuition + accommodation + stipend + practical training",
        eligibilityCriteria: [
          "South African citizen",
          "Studying food technology, chemical engineering, industrial engineering",
          "Academic merit (minimum 65%)",
          "Interest in food manufacturing",
          "Financial need",
        ],
        applicationDeadline: "31 May 2024",
        applicationProcess:
          "Apply online at www.tigerbrands.com/careers/bursaries",
        contactInfo: "bursaries@tigerbrands.com",
        website: "https://www.tigerbrands.com/careers/bursaries",
        fieldsOfStudy: [
          "Food Technology",
          "Chemical Engineering",
          "Industrial Engineering",
          "Food Science",
        ],
        provinces: ["All provinces"],
        requirements: {
          academicRequirement: "Minimum 65% average",
          financialNeed: true,
        },
        isActive: true,
        priority: "medium",
      },
      {
        id: "bidvest-logistics-2024",
        name: "Bidvest Group Logistics Bursary",
        provider: "Bidvest Group Limited",
        description:
          "Bursary for logistics, supply chain, and business students.",
        amount:
          "Full tuition + accommodation + allowances + experiential learning",
        eligibilityCriteria: [
          "South African citizen",
          "Studying logistics, supply chain, industrial engineering, business",
          "Academic performance (minimum 60%)",
          "Interest in logistics industry",
          "Financial need",
        ],
        applicationDeadline: "31 July 2024",
        applicationProcess:
          "Apply online at www.bidvest.co.za/careers/bursaries",
        contactInfo: "bursaries@bidvest.co.za",
        website: "https://www.bidvest.co.za/careers/bursaries",
        fieldsOfStudy: [
          "Logistics",
          "Supply Chain Management",
          "Industrial Engineering",
          "Business Management",
        ],
        provinces: ["All provinces"],
        requirements: {
          academicRequirement: "Minimum 60% average",
          financialNeed: true,
        },
        isActive: true,
        priority: "medium",
      },

      // New Professional Services Bursaries
      {
        id: "deloitte-professional-2024",
        name: "Deloitte Professional Services Bursary",
        provider: "Deloitte & Touche",
        description:
          "Bursary for accounting, auditing, and consulting students.",
        amount:
          "Full tuition + accommodation + stipend + vacation work + mentorship",
        eligibilityCriteria: [
          "South African citizen",
          "Studying accounting, auditing, finance, business, economics",
          "Academic excellence (minimum 70%)",
          "Leadership potential",
          "Interest in professional services",
        ],
        applicationDeadline: "31 August 2024",
        applicationProcess:
          "Apply online at www.deloitte.com/za/careers/bursaries",
        contactInfo: "bursaries@deloitte.co.za",
        website: "https://www.deloitte.com/za/en/careers/bursaries.html",
        fieldsOfStudy: [
          "Accounting",
          "Auditing",
          "Finance",
          "Business",
          "Economics",
        ],
        provinces: ["All provinces"],
        requirements: {
          academicRequirement: "Minimum 70% average",
          financialNeed: false,
        },
        isActive: true,
        priority: "high",
      },
      {
        id: "pwc-ca-bursary-2024",
        name: "PwC Chartered Accountancy Bursary",
        provider: "PricewaterhouseCoopers",
        description: "Comprehensive CA(SA) bursary programme.",
        amount:
          "Full tuition + accommodation + allowances + articles training + employment",
        eligibilityCriteria: [
          "South African citizen",
          "Studying towards CA(SA) qualification",
          "Academic excellence (minimum 70%)",
          "Strong analytical skills",
          "Leadership qualities",
        ],
        applicationDeadline: "31 July 2024",
        applicationProcess: "Apply online at www.pwc.co.za/careers/bursaries",
        contactInfo: "bursaries@pwc.com",
        website: "https://www.pwc.co.za/careers/bursaries",
        fieldsOfStudy: [
          "Accounting",
          "Chartered Accountancy",
          "Finance",
          "Auditing",
        ],
        provinces: ["All provinces"],
        requirements: {
          academicRequirement: "Minimum 70% average",
          financialNeed: false,
        },
        isActive: true,
        priority: "high",
      },
      {
        id: "kpmg-audit-2024",
        name: "KPMG Audit & Advisory Bursary",
        provider: "KPMG South Africa",
        description: "Bursary for audit, tax, and advisory services students.",
        amount:
          "Full tuition + accommodation + stipend + professional development",
        eligibilityCriteria: [
          "South African citizen",
          "Studying accounting, finance, economics, law",
          "Academic excellence (minimum 65%)",
          "Interest in professional services",
          "Financial need",
        ],
        applicationDeadline: "30 June 2024",
        applicationProcess: "Apply online at www.kpmg.co.za/careers/bursaries",
        contactInfo: "bursaries@kpmg.co.za",
        website: "https://www.kpmg.co.za/careers/bursaries",
        fieldsOfStudy: ["Accounting", "Finance", "Economics", "Law", "Tax"],
        provinces: ["All provinces"],
        requirements: {
          academicRequirement: "Minimum 65% average",
          financialNeed: true,
        },
        isActive: true,
        priority: "high",
      },

      // New Agricultural & Environmental Bursaries
      {
        id: "tongaat-hulett-agriculture-2024",
        name: "Tongaat Hulett Agriculture Bursary",
        provider: "Tongaat Hulett",
        description: "Bursary for agriculture and food security students.",
        amount:
          "Full tuition + accommodation + allowances + practical training",
        eligibilityCriteria: [
          "South African citizen",
          "Studying agriculture, agronomy, food science, environmental science",
          "Academic merit (minimum 60%)",
          "Rural background preferred",
          "Interest in sustainable agriculture",
        ],
        applicationDeadline: "31 May 2024",
        applicationProcess:
          "Apply online at www.tongaat.co.za/careers/bursaries",
        contactInfo: "bursaries@tongaat.co.za",
        website: "https://www.tongaat.co.za/careers/bursaries",
        fieldsOfStudy: [
          "Agriculture",
          "Agronomy",
          "Food Science",
          "Environmental Science",
        ],
        provinces: ["KwaZulu-Natal", "Mpumalanga"],
        requirements: {
          academicRequirement: "Minimum 60% average",
          financialNeed: true,
        },
        isActive: true,
        priority: "medium",
      },
      {
        id: "sappi-forestry-2024",
        name: "Sappi Forestry & Pulp Bursary",
        provider: "Sappi Limited",
        description:
          "Bursary for forestry, chemical engineering, and environmental students.",
        amount: "Full tuition + accommodation + stipend + vacation work",
        eligibilityCriteria: [
          "South African citizen",
          "Studying forestry, chemical engineering, environmental science, paper technology",
          "Academic excellence (minimum 65%)",
          "Interest in forestry industry",
          "Agree to work for Sappi after graduation",
        ],
        applicationDeadline: "31 March 2024",
        applicationProcess: "Apply online at www.sappi.com/careers/bursaries",
        contactInfo: "bursaries@sappi.com",
        website: "https://www.sappi.com/careers/bursaries",
        fieldsOfStudy: [
          "Forestry",
          "Chemical Engineering",
          "Environmental Science",
          "Paper Technology",
        ],
        provinces: ["KwaZulu-Natal", "Mpumalanga", "Limpopo"],
        requirements: {
          academicRequirement: "Minimum 65% average",
          financialNeed: false,
        },
        isActive: true,
        priority: "medium",
      },

      // New Transport & Logistics Bursaries
      {
        id: "air-traffic-navigation-2024",
        name: "Air Traffic & Navigation Services Bursary",
        provider: "Air Traffic & Navigation Services (ATNS)",
        description:
          "Bursary for aviation and air traffic management students.",
        amount:
          "Full tuition + accommodation + allowances + guaranteed employment",
        eligibilityCriteria: [
          "South African citizen",
          "Studying aviation, air traffic management, electronic engineering",
          "Academic excellence (minimum 70%)",
          "Strong technical aptitude",
          "Agree to work for ATNS after graduation",
        ],
        applicationDeadline: "30 April 2024",
        applicationProcess: "Apply online at www.atns.co.za/careers/bursaries",
        contactInfo: "bursaries@atns.co.za",
        website: "https://www.atns.co.za/careers/bursaries",
        fieldsOfStudy: [
          "Aviation",
          "Air Traffic Management",
          "Electronic Engineering",
          "Telecommunications",
        ],
        provinces: ["All provinces"],
        requirements: {
          academicRequirement: "Minimum 70% average",
          financialNeed: false,
        },
        isActive: true,
        priority: "medium",
      },
      {
        id: "acsa-airports-2024",
        name: "Airports Company South Africa Bursary",
        provider: "Airports Company South Africa (ACSA)",
        description:
          "Bursary for aviation, engineering, and business students.",
        amount: "Full tuition + accommodation + allowances + internship",
        eligibilityCriteria: [
          "South African citizen",
          "Studying aviation management, engineering, business, IT",
          "Academic merit (minimum 65%)",
          "Interest in aviation industry",
          "Financial need",
        ],
        applicationDeadline: "31 July 2024",
        applicationProcess:
          "Apply online at www.airports.co.za/careers/bursaries",
        contactInfo: "bursaries@airports.co.za",
        website: "https://www.airports.co.za/careers/bursaries",
        fieldsOfStudy: [
          "Aviation Management",
          "Engineering",
          "Business Management",
          "Information Technology",
        ],
        provinces: ["All provinces"],
        requirements: {
          academicRequirement: "Minimum 65% average",
          financialNeed: true,
        },
        isActive: true,
        priority: "medium",
      },

      // International & Scholarship Organizations
      {
        id: "chevening-scholarship-2024",
        name: "Chevening Scholarship (UK Government)",
        provider: "UK Government",
        description:
          "Prestigious scholarship for postgraduate studies in the UK.",
        amount:
          "Full tuition + accommodation + living allowance + travel costs",
        eligibilityCriteria: [
          "South African citizen",
          "Hold a bachelor's degree",
          "2+ years work experience",
          "Leadership potential",
          "Return to South Africa for 2 years after studies",
        ],
        applicationDeadline: "7 November 2024",
        applicationProcess: "Apply online at www.chevening.org",
        contactInfo: "chevening@fco.gov.uk",
        website: "https://www.chevening.org/",
        fieldsOfStudy: ["All postgraduate fields"],
        provinces: ["All provinces"],
        requirements: {
          academicRequirement: "Bachelor's degree with good performance",
          financialNeed: false,
        },
        isActive: true,
        priority: "high",
      },
      {
        id: "fulbright-scholarship-2024",
        name: "Fulbright Program (USA)",
        provider: "United States Government",
        description: "Scholarship for graduate studies in the United States.",
        amount:
          "Full tuition + accommodation + living stipend + health insurance",
        eligibilityCriteria: [
          "South African citizen",
          "Bachelor's degree",
          "Strong academic record",
          "English proficiency",
          "Leadership and community involvement",
        ],
        applicationDeadline: "31 March 2024",
        applicationProcess: "Apply through www.fulbright.org.za",
        contactInfo: "info@fulbright.org.za",
        website: "https://www.fulbright.org.za/",
        fieldsOfStudy: ["All graduate fields"],
        provinces: ["All provinces"],
        requirements: {
          academicRequirement: "Strong academic record",
          financialNeed: false,
        },
        isActive: true,
        priority: "high",
      },

      // TVET and Skills Development
      {
        id: "seta-skills-development-2024",
        name: "SETA Skills Development Bursary",
        provider: "Various Sector Education and Training Authorities",
        description: "Bursaries for technical and vocational education.",
        amount: "Full tuition + allowances + workplace training",
        eligibilityCriteria: [
          "South African citizen",
          "Studying at TVET colleges or universities of technology",
          "In sectors covered by SETAs",
          "Academic merit",
          "Financial need",
        ],
        applicationDeadline: "Various (SETA-specific)",
        applicationProcess: "Apply through relevant SETA offices",
        contactInfo: "Various SETA contact details",
        website: "https://www.dhet.gov.za/SitePages/SETAs.aspx",
        fieldsOfStudy: [
          "Technical and Vocational fields",
          "Artisan trades",
          "Engineering",
        ],
        provinces: ["All provinces"],
        requirements: {
          academicRequirement: "Varies by SETA",
          financialNeed: true,
        },
        isActive: true,
        priority: "medium",
      },
    ];

// Updated comprehensive fields of study
export const COMPREHENSIVE_FIELDS_OF_STUDY = isWorkersEnvironment
  ? []
  : [
      "All fields",
      "Accounting",
      "Actuarial Science",
      "Agriculture",
      "Agronomy",
      "Air Traffic Management",
      "Artificial Intelligence",
      "Auditing",
      "Aviation",
      "Aviation Management",
      "Business",
      "Business Management",
      "Chemical Engineering",
      "Chemistry",
      "Civil Engineering",
      "Cloud Computing",
      "Commerce",
      "Computer Science",
      "Counselling",
      "Cybersecurity",
      "Data Science",
      "Dentistry",
      "Development Studies",
      "Economics",
      "Education",
      "Electrical Engineering",
      "Electronic Engineering",
      "Engineering",
      "Environmental Science",
      "Environmental Engineering",
      "Entrepreneurship",
      "Fashion Design",
      "Finance",
      "Fintech",
      "Food Science",
      "Food Technology",
      "Forestry",
      "Forestry Engineering",
      "Gaming Technology",
      "Geology",
      "Health Sciences",
      "Healthcare",
      "Human Resources",
      "Industrial Engineering",
      "Information Technology",
      "Innovation",
      "Insurance",
      "Investment Management",
      "Land Surveying",
      "Law",
      "Logistics",
      "Machine Learning",
      "Management",
      "Manufacturing Engineering",
      "Marketing",
      "Mathematical Sciences",
      "Mathematics",
      "Mechanical Engineering",
      "Medical Sciences",
      "Medical Technology",
      "Medicine",
      "Metallurgy",
      "Mining Engineering",
      "Mobile Development",
      "Nursing",
      "Paper Technology",
      "Petroleum Engineering",
      "Pharmacy",
      "Physiotherapy",
      "Psychology",
      "Public Administration",
      "Public Management",
      "Quantity Surveying",
      "Radiography",
      "Renewable Energy",
      "Research",
      "Retail Management",
      "Risk Management",
      "Rural Development",
      "Science",
      "Social Sciences",
      "Social Work",
      "Software Development",
      "Software Engineering",
      "Statistics",
      "Structural Engineering",
      "Supply Chain Management",
      "Teacher Training",
      "Teaching",
      "Technology",
      "Telecommunications",
      "Telecommunications Engineering",
      "Tax",
      "Veterinary Science",
      "Web Development",
    ];

export const BURSARY_PROVIDERS = isWorkersEnvironment
  ? []
  : [
      "Government Departments",
      "Provincial Governments",
      "Banking & Financial Services",
      "Mining Companies",
      "Technology Companies",
      "Healthcare Organizations",
      "Retail Companies",
      "Energy Companies",
      "Manufacturing Companies",
      "Professional Services",
      "Agricultural Companies",
      "Transport & Logistics",
      "International Organizations",
      "Professional Associations",
      "SETA Organizations",
    ];
