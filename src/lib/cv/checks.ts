import type { CvData } from "./schema";

// Things every CV needs. Checked by code, so they're never forgotten.
export function missingEssentials(cv: CvData): string[] {
  const missing: string[] = [];

  if (!cv.contact.phone) {
    missing.push("Add your phone number so employers can call you.");
  }
  if (!cv.contact.location) {
    missing.push(
      "Add your town or city. Many employers look for people near them.",
    );
  }
  if (!cv.summary) {
    missing.push("Add a short summary about yourself and the job you want.");
  }
  if (cv.experience.length === 0 && cv.projects.length === 0) {
    missing.push(
      "Add any work experience, volunteering or projects, even informal ones.",
    );
  }
  if (cv.skills.length === 0) {
    missing.push("List your skills, such as tools, software or languages.");
  }

  return missing;
}