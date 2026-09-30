import type { CvData } from "./schema";

// Fictional example data, used for tests and template previews.
export const sampleCv: CvData = {
  contact: {
    fullName: "Thandi Mokoena",
    headline: "Junior Full-Stack Developer",
    email: "thandi.mokoena@example.com",
    phone: "+27 71 234 5678",
    location: "Johannesburg, South Africa",
    links: [
      { label: "GitHub", url: "https://github.com/thandi-example" },
      { label: "LinkedIn", url: "https://linkedin.com/in/thandi-example" },
    ],
  },
  summary:
    "Full-stack developer with hands-on experience building React and Node.js applications. Enjoys turning messy requirements into clean, tested features, and is currently focused on TypeScript and cloud deployment.",
  experience: [
    {
      id: "exp-1",
      jobTitle: "Software Development Intern",
      company: "Brightwave Labs",
      location: "Johannesburg",
      startDate: "2025-06",
      endDate: null,
      bullets: [
        "Built 6 reusable React components used across 3 client dashboards, cutting new page build time by about 30%.",
        "Wrote REST API endpoints in Node.js and Express for a booking system handling 2,000+ requests a day.",
        "Added unit tests with Jest, raising test coverage on the payments module from 40% to 75%.",
      ],
    },
  ],
  projects: [
    {
      id: "proj-1",
      name: "HireReady",
      link: "https://github.com/thandi-example/hireready",
      technologies: ["Next.js", "TypeScript", "Supabase", "Tailwind CSS"],
      bullets: [
        "AI job application assistant that scores CV-to-job matches and generates ATS-friendly CVs.",
        "Validates all AI output with Zod schemas, with automatic retries when a response is malformed.",
      ],
    },
  ],
  education: [
    {
      id: "edu-1",
      qualification: "Diploma in Information Technology",
      institution: "University of Johannesburg",
      location: "Johannesburg",
      startDate: "2022-02",
      endDate: "2024-11",
      details: ["Major project: inventory system built with Java and MySQL."],
    },
  ],
  skills: [
    {
      id: "skill-1",
      category: "Languages",
      skills: ["TypeScript", "JavaScript", "SQL", "Java"],
    },
    {
      id: "skill-2",
      category: "Frameworks and tools",
      skills: ["React", "Next.js", "Node.js", "Tailwind CSS", "Git"],
    },
  ],
  certifications: [
    {
      id: "cert-1",
      name: "AWS Certified Cloud Practitioner",
      issuer: "Amazon Web Services",
      date: "2025-03",
    },
  ],
  languages: [
    { id: "lang-1", name: "English", proficiency: "Fluent" },
    { id: "lang-2", name: "isiZulu", proficiency: "Native" },
  ],
};