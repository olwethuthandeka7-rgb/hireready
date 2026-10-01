import { z } from "zod";
import { cvSchema, LANGUAGE_LEVELS, type CvData } from "@/lib/cv/schema";

/* ===== What the AI returns =====
   Kept simple on purpose (no ids, plain strings for dates), because
   AI models follow simple schemas more reliably. Our own code then
   cleans it into a strict CvData.

   This file has no AI calls and no secrets, so it's easy to test. */

const aiDate = z
  .string()
  .describe(
    'Month and year as "YYYY-MM", for example "2024-03". Use "" if unknown.',
  );

const aiBullets = z
  .array(z.string())
  .describe(
    "Achievement-focused bullet points, each starting with a past-tense action verb.",
  );

export const aiCvSchema = z.object({
  contact: z.object({
    fullName: z.string(),
    headline: z
      .string()
      .describe("Short professional title, e.g. 'Junior Software Developer'."),
    email: z.string(),
    phone: z.string(),
    location: z
      .string()
      .describe("City and country, e.g. 'Durban, South Africa'."),
    links: z.array(z.object({ label: z.string(), url: z.string() })),
  }),
  summary: z
    .string()
    .describe(
      "2 to 3 sentence professional summary based only on the user's facts.",
    ),
  experience: z
    .array(
      z.object({
        jobTitle: z.string(),
        company: z.string(),
        location: z.string(),
        startDate: aiDate,
        endDate: aiDate,
        isCurrent: z.boolean().describe("True if the user still works here."),
        bullets: aiBullets,
      }),
    )
    .describe("Newest job first."),
  projects: z.array(
    z.object({
      name: z.string(),
      link: z.string(),
      technologies: z.array(z.string()),
      bullets: aiBullets,
    }),
  ),
  education: z
    .array(
      z.object({
        qualification: z.string(),
        institution: z.string(),
        location: z.string(),
        startDate: aiDate,
        endDate: aiDate,
        details: z.array(z.string()),
      }),
    )
    .describe("Newest first."),
  skills: z
    .array(z.object({ category: z.string(), skills: z.array(z.string()) }))
    .describe(
      "Skills grouped into clear categories, e.g. 'Technical skills', 'Tools'.",
    ),
  certifications: z.array(
    z.object({ name: z.string(), issuer: z.string(), date: aiDate }),
  ),
  languages: z.array(
    z.object({ name: z.string(), proficiency: z.enum(LANGUAGE_LEVELS) }),
  ),
});

export type AiCv = z.infer<typeof aiCvSchema>;

/* ===== Cleaning the AI's answer into a valid CV ===== */

const MONTH_PATTERN = /^\d{4}-(0[1-9]|1[0-2])$/;

function month(value: string) {
  const trimmed = value.trim();
  return MONTH_PATTERN.test(trimmed) ? trimmed : null;
}

function clean(value: string, maxLength: number) {
  return value.trim().slice(0, maxLength);
}

function cleanList(values: string[], maxItems: number, maxLength: number) {
  return values
    .map((value) => clean(value, maxLength))
    .filter(Boolean)
    .slice(0, maxItems);
}

// If the AI mixed up the dates, put them back in order.
function orderedDates(start: string | null, end: string | null) {
  if (start && end && end < start) {
    return { startDate: end, endDate: start };
  }
  return { startDate: start, endDate: end };
}

// "github.com/me" → "https://github.com/me". Returns null if it isn't a real address.
function cleanUrl(value: string) {
  const trimmed = value.trim();
  if (!trimmed) return null;
  const withProtocol = /^https?:\/\//i.test(trimmed)
    ? trimmed
    : `https://${trimmed}`;
  return z.url().safeParse(withProtocol).success ? withProtocol : null;
}

const newId = () => crypto.randomUUID();

export function toCvData(
  ai: AiCv,
  fallback: { fullName: string; email: string },
): { cv: CvData; notes: string[] } {
  const notes: string[] = [];

  const email = z.email().safeParse(ai.contact.email.trim()).success
    ? ai.contact.email.trim()
    : fallback.email;

  const links = ai.contact.links
    .map((link) => {
      const url = cleanUrl(link.url);
      return url ? { label: clean(link.label, 40) || "Website", url } : null;
    })
    .filter((link) => link !== null)
    .slice(0, 5);

  const experience = ai.experience
    .flatMap((job) => {
      const jobTitle = clean(job.jobTitle, 100);
      const company = clean(job.company, 100);
      if (!jobTitle || !company) {
        notes.push(
          `Add both the job title and the company name for ${jobTitle || company || "one of your jobs"}.`,
        );
        return [];
      }
      const start = month(job.startDate);
      const end = job.isCurrent ? null : month(job.endDate);
      if (!job.isCurrent && start && !end) {
        notes.push(
          `When did you finish at ${company}? Or do you still work there?`,
        );
      }
      return [
        {
          id: newId(),
          jobTitle,
          company,
          location: clean(job.location, 100),
          ...orderedDates(start, end),
          bullets: cleanList(job.bullets, 8, 300),
        },
      ];
    })
    .slice(0, 10);

  const projects = ai.projects
    .filter((project) => clean(project.name, 100))
    .map((project) => ({
      id: newId(),
      name: clean(project.name, 100),
      link: cleanUrl(project.link) ?? "",
      technologies: cleanList(project.technologies, 15, 40),
      bullets: cleanList(project.bullets, 8, 300),
    }))
    .slice(0, 8);

  const education = ai.education
    .flatMap((item) => {
      const qualification = clean(item.qualification, 120);
      const institution = clean(item.institution, 120);
      if (!qualification || !institution) {
        notes.push(
          `Add both the qualification and the school or institution for ${qualification || institution || "your studies"}.`,
        );
        return [];
      }
      return [
        {
          id: newId(),
          qualification,
          institution,
          location: clean(item.location, 100),
          ...orderedDates(month(item.startDate), month(item.endDate)),
          details: cleanList(item.details, 8, 300),
        },
      ];
    })
    .slice(0, 6);

  const skills = ai.skills
    .map((group) => ({
      id: newId(),
      category: clean(group.category, 50) || "Skills",
      skills: cleanList(group.skills, 20, 50),
    }))
    .filter((group) => group.skills.length > 0)
    .slice(0, 8);

  const certifications = ai.certifications
    .filter((cert) => clean(cert.name, 120))
    .map((cert) => ({
      id: newId(),
      name: clean(cert.name, 120),
      issuer: clean(cert.issuer, 100),
      date: month(cert.date),
    }))
    .slice(0, 10);

  const languages = ai.languages
    .filter((language) => clean(language.name, 50))
    .map((language) => ({
      id: newId(),
      name: clean(language.name, 50),
      proficiency: language.proficiency,
    }))
    .slice(0, 8);

  const cv = cvSchema.parse({
    contact: {
      fullName:
        clean(ai.contact.fullName, 100) || fallback.fullName || "Your name",
      headline: clean(ai.contact.headline, 120),
      email,
      phone: clean(ai.contact.phone, 30),
      location: clean(ai.contact.location, 100),
      links,
    },
    summary: clean(ai.summary, 800),
    experience,
    projects,
    education,
    skills,
    certifications,
    languages,
  });

  return { cv, notes };
}