import { describe, expect, it } from "vitest";
import { missingEssentials } from "@/lib/cv/checks";
import { createEmptyCv } from "@/lib/cv/schema";
import { sampleCv } from "@/lib/cv/sample";

describe("missingEssentials", () => {
  it("finds nothing missing in a complete CV", () => {
    expect(missingEssentials(sampleCv)).toEqual([]);
  });

  it("asks for phone, location, summary, experience and skills on a blank CV", () => {
    const missing = missingEssentials(
      createEmptyCv("Thandi Mokoena", "thandi@example.com"),
    );

    expect(missing).toHaveLength(5);
    expect(missing[0]).toContain("phone number");
  });
});