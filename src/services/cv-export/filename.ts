// "Thandi Mokoena" + "pdf" → "Thandi-Mokoena-CV.pdf"
export function cvFileName(fullName: string, extension: "pdf" | "docx") {
  const safeName = fullName
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "") // removes accents: é → e
    .replace(/[^a-zA-Z0-9]+/g, "-") // spaces and symbols → hyphens
    .replace(/^-+|-+$/g, ""); // no hyphens at the start or end

  return `${safeName || "My"}-CV.${extension}`;
}