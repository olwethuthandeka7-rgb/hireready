import { describe, expect, it } from "vitest";
import { displayUrl, formatDateRange, formatMonth } from "@/lib/cv/format";

describe("formatMonth", () => {
  it("turns YYYY-MM into a short month and year", () => {
    expect(formatMonth("2024-03")).toBe("Mar 2024");
    expect(formatMonth("2025-12")).toBe("Dec 2025");
  });
});

describe("formatDateRange", () => {
  it("shows a start and end date", () => {
    expect(formatDateRange("2022-02", "2024-11")).toBe("Feb 2022 - Nov 2024");
  });

  it("shows Present when there is no end date", () => {
    expect(formatDateRange("2025-06", null)).toBe("Jun 2025 - Present");
  });

  it("shows only the end date when there is no start date", () => {
    expect(formatDateRange(null, "2024-11")).toBe("Nov 2024");
  });

  it("returns an empty string when there are no dates", () => {
    expect(formatDateRange(null, null)).toBe("");
  });
});

describe("displayUrl", () => {
  it("removes https, www and a trailing slash", () => {
    expect(displayUrl("https://www.github.com/thandi/")).toBe(
      "github.com/thandi",
    );
  });

  it("leaves a plain address unchanged", () => {
    expect(displayUrl("linkedin.com/in/thandi")).toBe("linkedin.com/in/thandi");
  });
});