import type { Metadata } from "next";
import Link from "next/link";
import { listCvsForUser } from "@/db/queries/cvs";
import { requireUser } from "@/lib/auth";
import { TailorForm } from "./tailor-form";

export const metadata: Metadata = { title: "Match a job post" };

// Reading a job post and writing a CV can take a while.
export const maxDuration = 60;

export default async function TailorPage() {
  const user = await requireUser();
  const cvs = await listCvsForUser(user.id);

  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="mx-auto flex h-20 max-w-6xl items-center justify-between px-5 sm:px-8">
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

      <main className="mx-auto max-w-6xl px-5 pb-20 sm:px-8">
        <h1 className="max-w-2xl font-display text-3xl font-extrabold tracking-tight sm:text-5xl">
          Match a job post
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-graphite">
          Add a job post and your details. HireReady writes a CV that matches
          the job using the skills you really have, and tells you what&apos;s
          missing.
        </p>

        <TailorForm
          cvs={cvs.map(({ id, title, isPrimary }) => ({ id, title, isPrimary }))}
        />
      </main>
    </div>
  );
}