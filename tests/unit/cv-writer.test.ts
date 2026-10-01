import { describe, expect, it } from "vitest";
import { toCvData, type AiCv } from "@/services/ai/cv-draft";
const fallback = { fullName: "Thandi Mokoena", email: "thandi@example.com" };

function aiCv(overrides: Partial<AiCv> = {}): AiCv {
  return {
    contact: {
      fullName: "Thandi Mokoena",
      headline: "Retail Assistant",
      email: "thandi@example.com",
      phone: "",
      location: "Durban, South Africa",
      links: [],
    },
    summary: "Friendly retail assistant.",
    experience: [],
    projects: [],
    education: [],
    skills: [],
    certifications: [],
    languages: [],
    ...overrides,
  };
}

function job(overrides: Partial<AiCv["experience"][number]> = {}) {
  return {
    jobTitle: "Cashier",
    company: "Shoprite",
    location: "Durban",
    startDate: "2023-01",
    endDate: "2024-06",
    isCurrent: false,
    bullets: ["Served customers at the till."],
    ...overrides,
  };
}

describe("toCvData", () => {
  it("turns a valid AI draft into a valid CV with ids", () => {
    const { cv } = toCvData(aiCv({ experience: [job()] }), fallback);

    expect(cv.experience).toHaveLength(1);
    expect(cv.experience[0].id).toBeTruthy();
  });

  it("uses the account name and email when the AI left them empty or broken", () => {
    const draft = aiCv();
    draft.contact.fullName = "";
    draft.contact.email = "not an email";

    const { cv } = toCvData(draft, fallback);

    expect(cv.contact.fullName).toBe("Thandi Mokoena");
    expect(cv.contact.email).toBe("thandi@example.com");
  });

  it("turns dates in the wrong format into unknown dates", () => {
    const { cv } = toCvData(
      aiCv({ experience: [job({ startDate: "January 2023", endDate: "" })] }),
      fallback,
    );

    expect(cv.experience[0].startDate).toBeNull();
    expect(cv.experience[0].endDate).toBeNull();
  });

  it("puts reversed dates back in order", () => {
    const { cv } = toCvData(
      aiCv({ experience: [job({ startDate: "2024-06", endDate: "2023-01" })] }),
      fallback,
    );

    expect(cv.experience[0].startDate).toBe("2023-01");
    expect(cv.experience[0].endDate).toBe("2024-06");
  });

  it("treats a current job as having no end date", () => {
    const { cv } = toCvData(
      aiCv({ experience: [job({ isCurrent: true, endDate: "2024-06" })] }),
      fallback,
    );

    expect(cv.experience[0].endDate).toBeNull();
  });

  it("skips a job with no company and asks about it", () => {
    const { cv, notes } = toCvData(
      aiCv({ experience: [job({ company: "" })] }),
      fallback,
    );

    expect(cv.experience).toHaveLength(0);
    expect(notes[0]).toContain("Cashier");
  });

  it("adds https to links and drops ones that aren't web addresses", () => {
    const draft = aiCv();
    draft.contact.links = [
      { label: "GitHub", url: "github.com/thandi" },
      { label: "Broken", url: "not a link" },
    ];

    const { cv } = toCvData(draft, fallback);

    expect(cv.contact.links).toEqual([
      { label: "GitHub", url: "https://github.com/thandi" },
    ]);
  });

  it("keeps at most 8 bullet points per job", () => {
    const manyBullets = Array.from({ length: 12 }, (_, i) => `Task ${i + 1}`);

    const { cv } = toCvData(
      aiCv({ experience: [job({ bullets: manyBullets })] }),
      fallback,
    );

    expect(cv.experience[0].bullets).toHaveLength(8);
  });
});