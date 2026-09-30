import { describe, expect, it } from "vitest";
import { cvFileName } from "@/services/cv-export/filename";

describe("cvFileName", () => {
  it("joins the name with hyphens and adds -CV", () => {
    expect(cvFileName("Thandi Mokoena", "pdf")).toBe("Thandi-Mokoena-CV.pdf");
  });

  it("removes accents and symbols", () => {
    expect(cvFileName("  Zoë O'Brien! ", "docx")).toBe("Zoe-O-Brien-CV.docx");
  });

  it("falls back to My-CV when the name has no usable letters", () => {
    expect(cvFileName("!!!", "pdf")).toBe("My-CV.pdf");
  });
});