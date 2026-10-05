import mammoth from "mammoth";
import type { UploadedFile } from "@/services/files/uploads";

// An error whose message is safe and helpful to show the user.
export class UploadReadError extends Error {}

export async function toAiContent(file: UploadedFile) {
  if (file.kind === "docx") {
    const { value } = await mammoth.extractRawText({
      buffer: Buffer.from(file.bytes),
    });

    if (!value.trim()) {
      throw new UploadReadError(
        "We couldn't find any text in that Word file. Try uploading it as a PDF instead.",
      );
    }

    return {
      type: "text" as const,
      text: `Contents of the uploaded Word file "${file.name}":\n"""\n${value}\n"""`,
    };
  }

  // Gemini reads PDFs and images directly, including scanned pages.
  return {
    type: "file" as const,
    data: file.bytes,
    mediaType: file.mediaType,
    filename: file.name,
  };
}