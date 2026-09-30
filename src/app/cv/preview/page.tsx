import type { Metadata } from "next";
import Link from "next/link";
import { CvDocument } from "@/components/cv/cv-document";
import { buttonStyles } from "@/components/ui/button";
import { requireUser } from "@/lib/auth";
import { sampleCv } from "@/lib/cv/sample";

export const metadata: Metadata = { title: "Sample CV" };

export default async function CvPreviewPage() {
  await requireUser();

  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="mx-auto flex h-20 max-w-5xl items-center justify-between px-5 sm:px-8">
        <Link
          href="/dashboard"
          className="font-display text-xl font-extrabold tracking-tight"
        >
          Hire<span className="mark mark-match mark-still">Ready</span>
        </Link>
        <Link
          href="/dashboard"
          className="text-sm font-medium text-graphite transition-colors hover:text-ink"
        >
          Back to dashboard
        </Link>
      </header>

      <main className="mx-auto max-w-5xl px-5 pb-20 sm:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
              Sample CV
            </h1>
            <p className="mt-3 max-w-xl leading-relaxed text-graphite">
              This is how HireReady formats every CV: one column, standard
              section headings and plain text, so applicant tracking systems
              can read every line.
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-3">
            <a
              href="/api/cv/sample/export?format=pdf"
              className={buttonStyles({ variant: "primary" })}
            >
              Download PDF
            </a>
            <a
              href="/api/cv/sample/export?format=docx"
              className={buttonStyles({ variant: "secondary" })}
            >
              Download Word
            </a>
          </div>
        </div>

        {/* A4 sheet. Scrolls sideways on small screens. */}
        <div className="mt-8 overflow-x-auto rounded-lg">
          <div className="mx-auto min-h-[297mm] w-[210mm] bg-white shadow-[0_30px_80px_-30px_rgba(28,24,56,0.35)]">
            <CvDocument cv={sampleCv} />
          </div>
        </div>
      </main>
    </div>
  );
}