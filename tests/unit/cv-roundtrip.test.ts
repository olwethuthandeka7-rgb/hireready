import { describe, expect, it } from "vitest";
import { sampleCv } from "@/lib/cv/sample";
import { toAiCv, toCvData } from "@/services/ai/cv-draft";

// Ids are regenerated on every conversion, so compare everything except ids.
function withoutIds(value: unknown) {
  return JSON.parse(
    JSON.stringify(value, (key, field) => (key === "id" ? undefined : field)),
  );
}

describe("CV round trip", () => {
  it("converts a CV to the AI format and back without losing anything", () => {
    const { cv, notes } = toCvData(toAiCv(sampleCv), {
      fullName: "Fallback Name",
      email: "fallback@example.com",
    });

    expect(withoutIds(cv)).toEqual(withoutIds(sampleCv));
    expect(notes).toEqual([]);
  });

  it("keeps a current job current", () => {
    const aiCv = toAiCv(sampleCv);

    expect(aiCv.experience[0].isCurrent).toBe(true);
    expect(aiCv.experience[0].endDate).toBe("");
  });
});