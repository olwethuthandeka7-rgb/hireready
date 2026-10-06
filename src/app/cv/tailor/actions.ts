"use server";

import { redirect } from "next/navigation";
import { createCvForUser, getCvForUser } from "@/db/queries/cvs";
import { requireUser } from "@/lib/auth";
import type { CvData } from "@/lib/cv/schema";
import { tailorCv, type TailorJob } from "@/services/ai/cv-tailor";
import { UploadReadError } from "@/services/ai/file-content";
import { fetchJobPostText, JobLinkError } from "@/services/files/job-link";
import { readUpload } from "@/services/files/uploads";

const MAX_TEXT = 30_000; // safety cap only

export type JobSource = "text" | "link" | "file";
export type DetailsMode = "cv" | "write";

export type TailorCvState = {
  jobSource?: JobSource;
  jobText?: string;
  jobLink?: string;
  detailsMode?: DetailsMode;
  cvId?: string;
  about?: string;
  extra?: string;
  error?: string;
  jobError?: string;
  detailsError?: string;
};

function text(value: FormDataEntryValue | null) {
  return typeof value === "string" ? value : "";
}

export async function tailorCvAction(
  _previousState: TailorCvState,
  formData: FormData,
): Promise<TailorCvState> {
  const user = await requireUser();

  const rawSource = text(formData.get("jobSource"));
  const jobSource: JobSource =
    rawSource === "link" || rawSource === "file" ? rawSource : "text";
  const detailsMode: DetailsMode =
    text(formData.get("detailsMode")) === "cv" ? "cv" : "write";

  // Everything the user typed, returned on errors so nothing is lost.
  const kept: TailorCvState = {
    jobSource,
    jobText: text(formData.get("jobText")),
    jobLink: text(formData.get("jobLink")),
    detailsMode,
    cvId: text(formData.get("cvId")),
    about: text(formData.get("about")),
    extra: text(formData.get("extra")),
  };

  const about = kept.about!.trim();
  const extra = kept.extra!.trim();
  if (about.length > MAX_TEXT || extra.length > MAX_TEXT) {
    return { ...kept, error: "That's a lot to read at once. Please shorten your text." };
  }

  /* 1. Your details */
  let baseCv: CvData | null = null;
  if (detailsMode === "cv") {
    const row = await getCvForUser(user.id, kept.cvId!);
    if (!row) {
      return { ...kept, detailsError: "Choose one of your CVs." };
    }
    baseCv = row.data;
  } else if (about.length < 30) {
    return {
      ...kept,
      detailsError:
        "Tell us about yourself: your name, contact details, work history, studies and skills.",
    };
  }

  /* 2. The job */
  let job: TailorJob;

  if (jobSource === "file") {
    const upload = await readUpload(formData.get("jobFile"), [
      "image",
      "pdf",
      "docx",
    ]);
    if (!upload) {
      return { ...kept, jobError: "Choose the job poster to upload." };
    }
    if (!upload.ok) {
      return { ...kept, jobError: upload.error };
    }
    job = { kind: "file", file: upload.file };
  } else if (jobSource === "link") {
    try {
      job = { kind: "text", text: await fetchJobPostText(kept.jobLink!) };
    } catch (error) {
      if (error instanceof JobLinkError) {
        return { ...kept, jobError: error.message };
      }
      console.error("fetchJobPostText failed:", error);
      return {
        ...kept,
        jobError: "We couldn't read that link. Paste the job post's text instead.",
      };
    }
  } else {
    const jobText = kept.jobText!.trim();
    if (jobText.length < 50) {
      return {
        ...kept,
        jobError: "Paste the full job post, including the duties and requirements.",
      };
    }
    if (jobText.length > MAX_TEXT) {
      return {
        ...kept,
        jobError: "That job post is very long. Paste just the description and requirements.",
      };
    }
    job = { kind: "text", text: jobText };
  }

  /* 3. Write the tailored CV */
  let cvId: string;

  try {
    const result = await tailorCv({
      job,
      baseCv,
      about: detailsMode === "write" ? about : "",
      extra,
      fallback: { fullName: user.fullName, email: user.email },
    });

    const row = await createCvForUser(user.id, {
      title: result.title,
      source: "ai_assistant",
      data: result.cv,
      notes: result.notes,
    });

    cvId = row.id;
  } catch (error) {
    if (error instanceof UploadReadError) {
      return { ...kept, jobError: error.message };
    }
    console.error("tailorCv failed:", error);
    return {
      ...kept,
      error:
        "We couldn't create your CV this time. Wait a moment and try again. Everything you typed is still here.",
    };
  }

  redirect(`/cv/${cvId}`);
}