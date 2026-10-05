"use server";

import { redirect } from "next/navigation";
import { createCvForUser } from "@/db/queries/cvs";
import { requireUser } from "@/lib/auth";
import { importCv } from "@/services/ai/cv-importer";
import { UploadReadError } from "@/services/ai/file-content";
import { readUpload } from "@/services/files/uploads";

const MAX_WISHES_CHARACTERS = 20_000; // safety cap only

export type ImportCvState = {
  wishes?: string;
  error?: string;
  fileError?: string;
};

export async function importCvAction(
  _previousState: ImportCvState,
  formData: FormData,
): Promise<ImportCvState> {
  const user = await requireUser();

  const rawWishes = formData.get("wishes");
  const wishes = typeof rawWishes === "string" ? rawWishes : "";

  const upload = await readUpload(formData.get("cv"), ["pdf", "docx"]);
  if (!upload) {
    return { fileError: "Choose your CV file to upload.", wishes };
  }
  if (!upload.ok) {
    return { fileError: upload.error, wishes };
  }
  if (wishes.length > MAX_WISHES_CHARACTERS) {
    return {
      error:
        "That's a lot to read at once. Shorten what you'd like changed and try again.",
      wishes,
    };
  }

  let cvId: string;

  try {
    const { cv, notes } = await importCv({
      file: upload.file,
      wishes: wishes.trim(),
      fallback: { fullName: user.fullName, email: user.email },
    });

    const row = await createCvForUser(user.id, {
      title: cv.contact.headline ? `${cv.contact.headline} CV` : "My CV",
      source: "uploaded",
      data: cv,
      notes,
    });

    cvId = row.id;
  } catch (error) {
    if (error instanceof UploadReadError) {
      return { fileError: error.message, wishes };
    }
    console.error("importCv failed:", error);
    return {
      error:
        "We couldn't read your CV this time. Wait a moment, choose the file again and try once more.",
      wishes,
    };
  }

  redirect(`/cv/${cvId}`);
}