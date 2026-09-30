import { describe, expect, it } from "vitest";
import { createEmptyCv, cvSchema } from "@/lib/cv/schema";
import { sampleCv } from "@/lib/cv/sample";

// Makes a fresh copy so each test can change it
// without affecting the other tests.
function copyOfSampleCv() {
  return structuredClone(sampleCv);
}

describe("cvSchema", () => {
  it("accepts a complete, valid CV", () => {
    const result = cvSchema.safeParse(sampleCv);

    expect(result.success).toBe(true);
  });

  it("accepts a blank CV created from sign-up details", () => {
    const blankCv = createEmptyCv("Thandi Mokoena", "thandi@example.com");

    const result = cvSchema.safeParse(blankCv);

    expect(result.success).toBe(true);
  });

  it("accepts a job with no end date (a current job)", () => {
    const cv = copyOfSampleCv();
    cv.experience[0].endDate = null;

    const result = cvSchema.safeParse(cv);

    expect(result.success).toBe(true);
  });

  it("rejects a job whose end date is before its start date", () => {
    const cv = copyOfSampleCv();
    cv.experience[0].startDate = "2025-06";
    cv.experience[0].endDate = "2024-01";

    const result = cvSchema.safeParse(cv);

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toEqual([
      "experience",
      0,
      "endDate",
    ]);
  });

  it("rejects dates that are not in YYYY-MM format", () => {
    const cv = copyOfSampleCv();
    cv.experience[0].startDate = "March 2024";

    const result = cvSchema.safeParse(cv);

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].message).toBe(
      "Use the format YYYY-MM, for example 2024-03.",
    );
  });

  it("rejects an invalid email address", () => {
    const cv = copyOfSampleCv();
    cv.contact.email = "not-an-email";

    const result = cvSchema.safeParse(cv);

    expect(result.success).toBe(false);
    expect(result.error?.issues[0].path).toEqual(["contact", "email"]);
  });

  it("removes extra spaces from text fields", () => {
    const cv = copyOfSampleCv();
    cv.contact.fullName = "   Thandi Mokoena   ";

    const result = cvSchema.safeParse(cv);

    expect(result.success).toBe(true);
    expect(result.data?.contact.fullName).toBe("Thandi Mokoena");
  });

  it("rejects more than 8 bullet points for one job", () => {
    const cv = copyOfSampleCv();
    cv.experience[0].bullets = Array.from(
      { length: 9 },
      (_, index) => `Achievement number ${index + 1}`,
    );

    const result = cvSchema.safeParse(cv);

    expect(result.success).toBe(false);
  });
});