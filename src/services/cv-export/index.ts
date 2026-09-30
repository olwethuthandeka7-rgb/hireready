import type { CvData } from "@/lib/cv/schema";
import { renderCvDocx } from "./docx";
import { cvFileName } from "./filename";
import { renderCvPdf } from "./pdf";

export type ExportFormat = "pdf" | "docx";

const CONTENT_TYPES: Record<ExportFormat, string> = {
  pdf: "application/pdf",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
};

// Builds the file and wraps it in a response the browser will download.
export async function exportCvFile(cv: CvData, format: ExportFormat) {
  const body =
    format === "pdf" ? await renderCvPdf(cv) : await renderCvDocx(cv);

  return new Response(body, {
    headers: {
      "Content-Type": CONTENT_TYPES[format],
      "Content-Disposition": `attachment; filename="${cvFileName(cv.contact.fullName, format)}"`,
      "Cache-Control": "no-store",
    },
  });
}