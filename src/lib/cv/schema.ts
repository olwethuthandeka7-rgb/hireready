import { z } from "zod";

/* ===== Reusable building blocks ===== */

// Dates are stored as "YYYY-MM" (e.g. "2024-03") so every CV
// formats them the same way, which ATS systems like.
const month = z
  .string()
  .regex(
    /^\d{4}-(0[1-9]|1[0-2])$/,
    "Use the format YYYY-MM, for example 2024-03.",
  );

const id = z.string().min(1);

function requiredText(label: string, max: number) {
  return z
    .string()
    .trim()
    .min(1, `Enter ${label}.`)
    .max(max, `Keep ${label} under ${max} characters.`);
}

function optionalText(max: number) {
  return z.string().trim().max(max, `Keep this under ${max} characters.`);
}

const bulletPoints = z
  .array(requiredText("a bullet point", 300))
  .max(8, "Keep it to 8 bullet points or fewer.");

// An end date can't be before the start date.
function endDateIsAfterStart(item: {
  startDate: string | null;
  endDate: string | null;
}) {
  return !item.startDate || !item.endDate || item.endDate >= item.startDate;
}

const endDateError = {
  message: "The end date can't be before the start date.",
  path: ["endDate"],
};

/* ===== CV sections ===== */

export const contactSchema = z.object({
  fullName: requiredText("your full name", 100),
  headline: optionalText(120), // e.g. "Junior Full-Stack Developer"
  email: z.email("Enter a valid email address."),
  phone: optionalText(30),
  location: optionalText(100), // e.g. "Johannesburg, South Africa"
  links: z
    .array(
      z.object({
        label: requiredText("a link label", 40), // e.g. "GitHub"
        url: z.url("Enter a full web address, starting with https://"),
      }),
    )
    .max(5, "Add up to 5 links."),
});

export const experienceSchema = z
  .object({
    id,
    jobTitle: requiredText("a job title", 100),
    company: requiredText("the company name", 100),
    location: optionalText(100),
    startDate: month.nullable(), // null when the start date isn't known
    endDate: month.nullable(), // null means "Present"
    bullets: bulletPoints,
  })
  .refine(endDateIsAfterStart, endDateError);

export const educationSchema = z
  .object({
    id,
    qualification: requiredText("the qualification", 120), // e.g. "BSc Computer Science"
    institution: requiredText("the institution", 120),
    location: optionalText(100),
    startDate: month.nullable(),
    endDate: month.nullable(),
    details: bulletPoints,
  })
  .refine(endDateIsAfterStart, endDateError);

export const projectSchema = z.object({
  id,
  name: requiredText("the project name", 100),
  link: z
    .url("Enter a full web address, starting with https://")
    .or(z.literal("")),
  technologies: z
    .array(requiredText("a technology", 40))
    .max(15, "List up to 15 technologies."),
  bullets: bulletPoints,
});

export const skillGroupSchema = z.object({
  id,
  category: requiredText("a category name", 50), // e.g. "Frameworks"
  skills: z
    .array(requiredText("a skill", 50))
    .min(1, "Add at least one skill.")
    .max(20, "Add up to 20 skills per category."),
});

export const certificationSchema = z.object({
  id,
  name: requiredText("the certification name", 120),
  issuer: optionalText(100),
  date: month.nullable(),
});

export const LANGUAGE_LEVELS = [
  "Native",
  "Fluent",
  "Professional",
  "Conversational",
  "Basic",
] as const;

export const languageSchema = z.object({
  id,
  name: requiredText("the language", 50),
  proficiency: z.enum(LANGUAGE_LEVELS),
});

/* ===== The full CV ===== */

export const cvSchema = z.object({
  contact: contactSchema,
  summary: optionalText(800),
  experience: z.array(experienceSchema).max(10),
  projects: z.array(projectSchema).max(8),
  education: z.array(educationSchema).max(6),
  skills: z.array(skillGroupSchema).max(8),
  certifications: z.array(certificationSchema).max(10),
  languages: z.array(languageSchema).max(8),
});

/* ===== TypeScript types, generated from the schemas ===== */

export type CvData = z.infer<typeof cvSchema>;
export type CvContact = z.infer<typeof contactSchema>;
export type CvExperience = z.infer<typeof experienceSchema>;
export type CvEducation = z.infer<typeof educationSchema>;
export type CvProject = z.infer<typeof projectSchema>;
export type CvSkillGroup = z.infer<typeof skillGroupSchema>;
export type CvCertification = z.infer<typeof certificationSchema>;
export type CvLanguage = z.infer<typeof languageSchema>;

/* ===== Helpers ===== */

// A blank CV, pre-filled with the user's name and email from sign-up.
export function createEmptyCv(fullName: string, email: string): CvData {
  return {
    contact: {
      fullName,
      headline: "",
      email,
      phone: "",
      location: "",
      links: [],
    },
    summary: "",
    experience: [],
    projects: [],
    education: [],
    skills: [],
    certifications: [],
    languages: [],
  };
}