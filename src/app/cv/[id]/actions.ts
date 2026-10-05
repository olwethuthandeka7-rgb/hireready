"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getCvForUser, updateCvForUser } from "@/db/queries/cvs";
import { requireUser } from "@/lib/auth";
import { reviseCv } from "@/services/ai/cv-reviser";

// A safety cap only. Normal requests are a sentence or a few paragraphs.
const requestSchema = z
  .string()
  .trim()
  .min(3, "Tell us what you'd like to change.")
  .max(
    20_000,
    "That's a lot at once. Try splitting it into a few smaller changes.",
  );

export type ReviseCvState = {
  request?: string;
  error?: string;
  fieldError?: string;
  success?: string;
};

function text(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value : "";
}

export async function reviseCvAction(
  _previousState: ReviseCvState,
  formData: FormData,
): Promise<ReviseCvState> {
  const user = await requireUser();

  const cvId = text(formData.get("cvId"));
  const request = text(formData.get("request"));

  const parsed = requestSchema.safeParse(request);
  if (!parsed.success) {
    return { fieldError: parsed.error.issues[0]?.message, request };
  }

  // Only the owner's CV can be found here (the query checks the user id).
  const current = await getCvForUser(user.id, cvId);
  if (!current) {
    return {
      error:
        "We couldn't find this CV. Go back to your dashboard and open it again.",
      request,
    };
  }

  try {
    const { cv, notes } = await reviseCv({
      cv: current.data,
      notes: current.notes,
      request: parsed.data,
    });
    await updateCvForUser(user.id, cvId, { data: cv, notes });
  } catch (error) {
    console.error("reviseCv failed:", error);
    return {
      error:
        "We couldn't update your CV this time. Wait a moment and try again. Your request is still here.",
      request,
    };
  }

  // Tells Next.js to reload this page's data so the preview shows the new CV.
  revalidatePath(`/cv/${cvId}`);
  return { success: "Done. Your CV has been updated." };
}