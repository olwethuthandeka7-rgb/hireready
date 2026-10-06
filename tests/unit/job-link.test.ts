import { describe, expect, it } from "vitest";
import {
  htmlToText,
  isPrivateAddress,
  parseJobUrl,
} from "@/services/files/job-link";

describe("parseJobUrl", () => {
  it("accepts normal web links", () => {
    expect(parseJobUrl("https://jobs.example.com/123")?.hostname).toBe(
      "jobs.example.com",
    );
  });

  it("rejects links that aren't http or https", () => {
    expect(parseJobUrl("ftp://example.com/job")).toBeNull();
    expect(parseJobUrl("javascript:alert(1)")).toBeNull();
    expect(parseJobUrl("file:///etc/passwd")).toBeNull();
  });

  it("rejects links with a username or password inside", () => {
    expect(parseJobUrl("https://admin:secret@example.com")).toBeNull();
  });

  it("rejects text that isn't a link", () => {
    expect(parseJobUrl("not a link")).toBeNull();
  });
});

describe("isPrivateAddress", () => {
  it("blocks this computer and private networks", () => {
    expect(isPrivateAddress("127.0.0.1")).toBe(true);
    expect(isPrivateAddress("10.0.0.5")).toBe(true);
    expect(isPrivateAddress("192.168.1.1")).toBe(true);
    expect(isPrivateAddress("172.20.0.1")).toBe(true);
    expect(isPrivateAddress("169.254.169.254")).toBe(true); // cloud admin address
    expect(isPrivateAddress("::1")).toBe(true);
    expect(isPrivateAddress("::ffff:127.0.0.1")).toBe(true);
  });

  it("allows public internet addresses", () => {
    expect(isPrivateAddress("8.8.8.8")).toBe(false);
    expect(isPrivateAddress("172.32.0.1")).toBe(false);
  });
});

describe("htmlToText", () => {
  it("removes scripts, styles and tags but keeps the words", () => {
    const html =
      "<html><head><title>x</title></head><body><script>steal()</script>" +
      "<h1>Cashier</h1><p>Serve customers &amp; handle cash.</p></body></html>";

    const text = htmlToText(html);

    expect(text).toContain("Cashier");
    expect(text).toContain("Serve customers & handle cash.");
    expect(text).not.toContain("steal");
  });

  it("turns list items into dashes", () => {
    expect(htmlToText("<ul><li>Excel</li><li>Teamwork</li></ul>")).toBe(
      "- Excel\n- Teamwork",
    );
  });
});