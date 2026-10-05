import { describe, expect, it } from "vitest";
import { describeKinds, detectFileKind } from "@/services/files/uploads";

// Builds fake file contents that start with the given bytes.
function bytes(...start: number[]) {
  const data = new Uint8Array(16);
  data.set(start);
  return data;
}

const PDF = [0x25, 0x50, 0x44, 0x46];
const ZIP = [0x50, 0x4b, 0x03, 0x04];
const PNG = [0x89, 0x50, 0x4e, 0x47];
const JPEG = [0xff, 0xd8, 0xff];

describe("detectFileKind", () => {
  it("recognises a PDF by its signature", () => {
    expect(detectFileKind(bytes(...PDF), "cv.pdf")?.kind).toBe("pdf");
  });

  it("recognises a Word file", () => {
    expect(detectFileKind(bytes(...ZIP), "My CV.DOCX")?.kind).toBe("docx");
  });

  it("does not treat any zip file as a Word file", () => {
    expect(detectFileKind(bytes(...ZIP), "photos.zip")).toBeNull();
  });

  it("recognises PNG and JPEG images", () => {
    expect(detectFileKind(bytes(...PNG), "poster.png")?.mediaType).toBe(
      "image/png",
    );
    expect(detectFileKind(bytes(...JPEG), "poster.jpg")?.mediaType).toBe(
      "image/jpeg",
    );
  });

  it("rejects a file that is only named like a PDF", () => {
    const textFile = new TextEncoder().encode("hello, I am not a PDF");
    expect(detectFileKind(textFile, "cv.pdf")).toBeNull();
  });
});

describe("describeKinds", () => {
  it("lists allowed file types in plain English", () => {
    expect(describeKinds(["pdf", "docx"])).toBe(
      "a PDF or a Word (.docx) file",
    );
  });
});