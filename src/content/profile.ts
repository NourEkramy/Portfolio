import type { EducationItem, ExperienceItem, Profile, SkillGroup } from "@/lib/types";

export const profile: Profile = {
  name: "NourEldin Ekramy Saad",
  title: "Flutter App Developer",
  tagline:
    "I build mobile applications that hold up under inspection — clean layers, real APIs, and interfaces that work in two languages and both directions.",
  bio: [
    "Computer Science graduate (GPA 3.7/4.0) with a strong foundation in algorithms and competitive programming, now building production-shaped Flutter applications end to end.",
    "My work leans on architecture that survives growth: MVVM with Cubit, Clean Architecture with clearly separated data, domain and presentation layers, repositories that own the network, and dependency injection that keeps everything testable.",
    "I care about the parts users never see — ICU plurals that are correct in Arabic, interceptors that redact passwords out of logs, secure token storage, and tests that render every screen at accessibility text scales before anyone else has to find the overflow.",
  ],
  email: "noureldin.ekramy.saad@gmail.com",
  phone: "+20 115 155 2330",
  location: "Cairo, Egypt",
  github: "https://github.com/NourEkramy",
  linkedin: "https://www.linkedin.com/in/noureldin-ekramy",
  leetcode: "https://leetcode.com/u/NourEkramy/",
  codeforces: "https://codeforces.com/profile/NourEkramy",
  cvUrl: "/cv/NourEldin-Ekramy-Saad-Flutter-Developer.pdf",
  portraitUrl: "/media/profile/portrait.webp",
  portraitWideUrl: "/media/profile/portrait-wide.webp",
  languages: [
    { name: "Arabic", level: "Native / Bilingual" },
    { name: "English", level: "Fluent" },
  ],
};

export const experience: ExperienceItem[] = [
  {
    role: "Technical Support Engineer",
    company: "dPhish",
    location: "El-Sheikh Zayed, 7th District",
    period: "05/2026 — Present",
    current: true,
    sortOrder: 1,
    bullets: [
      "Configure and support email add-on integrations across enterprise infrastructures, both Cloud and On-Premises Exchange.",
      "Troubleshoot LMS reporting discrepancies and analyse system logs to verify sender reliability and accurate simulation tracking.",
      "Manage user onboarding, administrative access control and portal configuration for internal teams and corporate clients.",
      "Assist regional enterprise clients with deploying localised phishing simulation campaigns and deliver technical training support.",
    ],
  },
  {
    role: "Technical Support (English) — Comcast Account",
    company: "Sutherland Global Services",
    location: "Cairo",
    period: "09/2025 — 02/2026",
    current: false,
    sortOrder: 2,
    bullets: [
      "Provided customer support for Comcast clients via inbound calls.",
      "Ranked among the top agents on the floor for sales performance and high NPS scores.",
      "Resolved billing, technical and account issues while meeting KPI targets.",
    ],
  },
  {
    role: "ERP & SAP SuccessFactors Tools Developer",
    company: "MindLabs",
    period: "02/2025 — 06/2025",
    current: false,
    sortOrder: 3,
    bullets: [
      "Developed automation tools in Python to streamline HR tasks within SAP SuccessFactors, significantly reducing manual effort.",
      "Implemented role management and permission replication via OData APIs.",
      "Automated complex reporting and Excel exports to enhance operational efficiency.",
    ],
  },
  {
    role: "Coding Instructor",
    company: "Ischool",
    location: "Remote, Egypt",
    period: "08/2023 — 09/2024",
    current: false,
    sortOrder: 4,
    bullets: [
      "Taught more than 50 students computer science and programming, covering web development and mobile app technologies.",
    ],
  },
  {
    role: "Competitive Programming Participant",
    company: "CPC Competition (3 editions)",
    location: "Alexandria, Egypt",
    period: "2022 — 2024",
    current: false,
    sortOrder: 5,
    bullets: [
      "Participated in CPC competitions three times, sharpening problem-solving, algorithmic thinking and coding efficiency under time pressure.",
    ],
  },
];

export const education: EducationItem[] = [
  {
    title: "Bachelor's in Computer Science",
    institution: "Misr University for Science and Technology",
    location: "6th October, Giza",
    period: "10/2021 — 06/2025",
    detail: "GPA 3.7 / 4.0",
    sortOrder: 1,
  },
  {
    title: "Cisco Certified Network Associate (CCNA) Modules 1 & 2",
    institution: "Cisco",
    location: "Remote",
    period: "Certification",
    detail:
      "Extensive hands-on lab work configuring Cisco networking hardware and optimising traffic flow. IPv4/IPv6 addressing, subnetting, VLANs, routing protocols (OSPF), DHCP and network security fundamentals.",
    sortOrder: 2,
  },
  {
    title: "Software Engineering Training",
    institution: "Africa to Silicon Valley",
    location: "Remote, Ethiopia",
    period: "01/2024 — 02/2025",
    detail:
      "Data structures, competitive programming and software engineering patterns to strengthen problem-solving and development skills using Python.",
    sortOrder: 3,
  },
  {
    title: "Competitive Programming",
    institution: "Coach Academy",
    location: "Remote, Egypt",
    period: "06/2021 — 09/2021",
    detail: "Competitive programming, data structures and algorithms.",
    sortOrder: 4,
  },
];

export const skillGroups: SkillGroup[] = [
  {
    name: "Mobile Development",
    sortOrder: 1,
    items: [
      "Flutter",
      "Dart",
      "Android Studio",
      "REST APIs",
      "Dio",
      "JSON Parsing & Model Mapping",
      "State Management (Cubit, Provider)",
      "MVVM",
      "Clean Architecture",
      "Dependency Injection (GetIt)",
      "Authentication",
      "Secure Storage",
      "Localization (English/Arabic)",
      "RTL Support",
      "Navigation & Routing",
      "Form Validation",
      "Error Handling & Loading States",
      "Git & GitHub",
    ],
  },
  {
    name: "Core Concepts",
    sortOrder: 2,
    items: [
      "Data Structures",
      "Algorithms",
      "OOP",
      "Database Management",
      "Problem Solving",
      "REST API",
      "Networking",
      "TCP/IP",
      "LAN/WAN",
      "Routing",
      "Switching",
    ],
  },
  {
    name: "Languages",
    sortOrder: 3,
    items: ["Dart", "C++", "Python", "SQL", "HTML", "CSS"],
  },
  {
    name: "Tools",
    sortOrder: 4,
    items: [
      "VS Code",
      "CLion",
      "Git",
      "GitHub",
      "Android Studio",
      "SAP SuccessFactors",
      "Swagger",
      "Word",
      "Excel",
      "PowerPoint",
    ],
  },
];
