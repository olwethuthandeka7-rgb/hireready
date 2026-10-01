"use server";

import { redirect } from "next/navigation";
import { z } from "zod";
import { createCvForUser } from "@/db/queries/cvs";
import { requireUser } from "@/lib/auth";
import { writeCvFromText } from "@/services/ai/cv-writer";

// A safety cap only (about 20 pages of text). Nobody writing about
// themselves will reach it, but it protects the free AI quota.
const MAX_CHARACTERS = 50_000;

const aboutSchema = z
  .string()
  .trim()
  .min(30, "Tell us a bit more: your jobs, studies and skills.")
  .max(
    MAX_CHARACTERS,
    "That's more than we can read at once. Remove anything that isn't about your work, studies or skills.",
  );

export type BuildCvState = {
  about?: string;
  error?: string;
  fieldError?: string;
};

export async function buildCvAction(
  _previousState: BuildCvState,
  formData: FormData,
): Promise<BuildCvState> {
  const user = await requireUser();

  const rawAbout = formData.get("about");
  const about = typeof rawAbout === "string" ? rawAbout : "";

  const parsed = aboutSchema.safeParse(about);
  if (!parsed.success) {
    return { fieldError: parsed.error.issues[0]?.message, about };
  }

  const fullName =
    typeof user.user_metadata.full_name === "string"
      ? user.user_metadata.full_name
      : "";

  let cvId: string;

  try {
    const { cv, notes } = await writeCvFromText({
      text: parsed.data,
      fallback: { fullName, email: user.email ?? "" },
    });

    const row = await createCvForUser(user.id, {
      title: cv.contact.headline ? `${cv.contact.headline} CV` : "My CV",
      source: "ai_assistant",
      data: cv,
      notes,
    });

    cvId = row.id;
  } catch (error) {
    console.error("buildCv failed:", error);
    return {
      error:
        "We couldn't create your CV this time. Wait a moment and try again. Your text is still here.",
      about,
    };
  }

  // Redirect happens outside try/catch, because Next.js uses a
  // special error internally to perform redirects.
  redirect(`/cv/${cvId}`);
}