import type { Metadata } from "next";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CvDocument } from "@/components/cv/cv-document";
import { buttonStyles } from "@/components/ui/button";
import { getCvForUser } from "@/db/queries/cvs";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Your CV" };

type CvPageProps = {
  params: Promise<{ id: string }>;
};

export default async function CvPage({ params }: CvPageProps) {
  const user = await requireUser();
  const { id } = await params;

  const cv = await getCvForUser(user.id, id);
  if (!cv) {
    notFound();
  }

  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="mx-auto flex h-20 max-w-7xl items-center justify-between px-5 sm:px-8">
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

      <main className="mx-auto max-w-7xl px-5 pb-20 sm:px-8">
        <div className="flex flex-col gap-6 sm:flex-row sm:items-end sm:justify-between">
          <h1 className="font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
            {cv.title}
          </h1>
          <div className="flex shrink-0 flex-wrap gap-3">
            <a
              href={`/api/cvs/${cv.id}/export?format=pdf`}
              className={buttonStyles({ variant: "primary" })}
            >
              Download PDF
            </a>
            <a
              href={`/api/cvs/${cv.id}/export?format=docx`}
              className={buttonStyles({ variant: "secondary" })}
            >
              Download Word
            </a>
          </div>
        </div>

        <div className="mt-8 grid gap-8 xl:grid-cols-[minmax(0,1fr)_22rem]">
          {/* A4 sheet. Scrolls sideways on small screens. */}
          <div className="overflow-x-auto rounded-lg">
            <div className="mx-auto min-h-[297mm] w-[210mm] bg-white shadow-[0_30px_80px_-30px_rgba(28,24,56,0.35)]">
              <CvDocument cv={cv.data} />
            </div>
          </div>

          <aside className="order-first h-fit rounded-[1.75rem] border border-rule bg-surface p-6 xl:order-none">
            <h2 className="font-semibold">Make it stronger</h2>
            {cv.notes.length > 0 ? (
              <>
                <p className="mt-1 text-sm text-graphite">
                  Answering these will improve your CV.
                </p>
                <ul className="mt-4 space-y-3 text-sm leading-relaxed">
                  {cv.notes.map((note) => (
                    <li key={note} className="flex gap-3">
                      <span
                        className="mt-1.5 size-2.5 shrink-0 rounded-sm bg-gap"
                        aria-hidden
                      />
                      {note}
                    </li>
                  ))}
                </ul>
              </>
            ) : (
              <p className="mt-2 text-sm text-graphite">
                Nothing important is missing. Nice work.
              </p>
            )}
          </aside>
        </div>
      </main>
    </div>
  );
}