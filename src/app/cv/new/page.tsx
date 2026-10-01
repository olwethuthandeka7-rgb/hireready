import type { Metadata } from "next";
import Link from "next/link";
import { requireUser } from "@/lib/auth";
import { BuildForm } from "./build-form";

export const metadata: Metadata = { title: "Build your CV with AI" };

// Writing a whole CV can take a while, so allow up to 60 seconds.
export const maxDuration = 60;

export default async function NewCvPage() {
  await requireUser();

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
          Tell us about yourself
        </h1>
        <p className="mt-4 max-w-2xl text-lg leading-relaxed text-graphite">
          Write everything you can think of about your work, studies and
          skills. HireReady turns it into a complete, ATS-friendly CV.
        </p>

        <BuildForm />
      </main>
    </div>
  );
}