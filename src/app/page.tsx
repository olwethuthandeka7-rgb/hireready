import Link from "next/link";
import type { ReactNode } from "react";

type MarkKind = "match" | "gap";

// A highlighted keyword. `order` controls when its highlight
// sweeps in, so the keywords get marked one after another.
function Mark({
  kind,
  order,
  children,
}: {
  kind: MarkKind;
  order: number;
  children: ReactNode;
}) {
  return (
    <mark
      className={`mark ${kind === "match" ? "mark-match" : "mark-gap"}`}
      style={{ animationDelay: `${0.6 + order * 0.3}s` }}
    >
      {children}
      {/* Screen readers can't see colours, so we say it in words */}
      <span className="sr-only">
        {kind === "match" ? " (on your CV)" : " (missing from your CV)"}
      </span>
    </mark>
  );
}

const steps = [
  {
    title: "Bring your CV",
    description:
      "Upload the one you have, or build a new one by answering a few questions from the AI assistant.",
  },
  {
    title: "Paste a job post",
    description:
      "HireReady marks every requirement you already meet, and every one you don't.",
  },
  {
    title: "Close the gaps",
    description:
      "Get a CV and cover letter tailored to that job, formatted so hiring software can read every line.",
  },
  {
    title: "Track your applications",
    description:
      "See where each application stands, from sent to interview to offer.",
  },
];

export default function Home() {
  return (
    <div className="min-h-screen bg-paper text-ink">
      {/* Navigation */}
      <header className="mx-auto flex h-20 max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link
          href="/"
          className="font-display text-xl font-extrabold tracking-tight"
        >
          Hire<span className="mark mark-match mark-still">Ready</span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-3">
          <Link
            href="/login"
            className="rounded-full px-4 py-2 text-sm font-medium text-graphite transition-colors hover:text-ink"
          >
            Log in
          </Link>
          <Link
            href="/signup"
            className="rounded-full bg-ink px-5 py-2.5 text-sm font-semibold text-paper transition-colors hover:bg-highlight hover:text-on-mark"
          >
            Start free
          </Link>
        </nav>
      </header>

      <main>
        {/* Hero */}
        <section className="mx-auto grid max-w-6xl gap-14 px-5 pt-10 pb-20 sm:px-8 lg:grid-cols-[1.05fr_1fr] lg:items-center lg:pt-16 lg:pb-28">
          <div>
            <h1 className="font-display text-5xl leading-[0.95] font-extrabold tracking-tight text-balance sm:text-6xl lg:text-7xl">
              Read the job the way hiring software does.
            </h1>
            <p className="mt-7 max-w-lg text-lg leading-relaxed text-graphite">
              HireReady checks every job post against your CV, marks what you
              already have and what&apos;s missing, then helps you close the
              gaps before you apply.
            </p>
            <div className="mt-9 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/signup"
                className="inline-flex items-center justify-center rounded-full bg-ink px-7 py-3.5 font-semibold text-paper transition-colors hover:bg-highlight hover:text-on-mark"
              >
                Build my CV with AI
              </Link>
              <Link
                href="/signup"
                className="inline-flex items-center justify-center rounded-full border-2 border-ink px-7 py-3 font-semibold transition-colors hover:bg-surface"
              >
                Upload my CV
              </Link>
            </div>
            <p className="mt-5 text-sm text-graphite">
              Free to start. Every CV is formatted to pass applicant tracking
              systems.
            </p>
          </div>

          {/* The signature moment: a job post being highlighted */}
          <figure className="rounded-[1.75rem] border border-rule bg-surface p-7 shadow-[0_30px_80px_-30px_rgba(28,24,56,0.35)] sm:p-9">
            <figcaption className="text-sm text-graphite">
              A job post, checked against a sample CV
            </figcaption>
            <h2 className="mt-4 font-display text-2xl font-bold tracking-tight">
              Junior Full-Stack Developer
            </h2>
            <p className="text-sm text-graphite">
              Brightwave Labs, hybrid, full-time
            </p>

            <p className="mt-6 text-[1.05rem] leading-[1.9]">
              We&apos;re looking for someone comfortable with{" "}
              <Mark kind="match" order={0}>
                React
              </Mark>{" "}
              and{" "}
              <Mark kind="match" order={1}>
                TypeScript
              </Mark>
              , who can build APIs in{" "}
              <Mark kind="match" order={2}>
                Node.js
              </Mark>{" "}
              and has worked with{" "}
              <Mark kind="match" order={3}>
                PostgreSQL
              </Mark>
              . Experience with{" "}
              <Mark kind="gap" order={4}>
                Docker
              </Mark>{" "}
              and{" "}
              <Mark kind="gap" order={5}>
                automated testing
              </Mark>{" "}
              is a plus. You&apos;ll ship features every week using{" "}
              <Mark kind="match" order={6}>
                Git
              </Mark>{" "}
              and code reviews.
            </p>

            <div className="mt-7 flex flex-wrap items-center justify-between gap-4 border-t border-rule pt-6">
              <div className="flex flex-wrap gap-4 text-sm">
                <span className="inline-flex items-center gap-2">
                  <span className="size-3 rounded-sm bg-highlight" aria-hidden />
                  On your CV
                </span>
                <span className="inline-flex items-center gap-2">
                  <span className="size-3 rounded-sm bg-gap" aria-hidden />
                  Missing
                </span>
              </div>
              <p className="font-display text-lg font-bold">
                5 of 7 requirements met
              </p>
            </div>
          </figure>
        </section>

        {/* How it works (a real sequence, so numbered) */}
        <section className="border-t border-rule">
          <div className="mx-auto max-w-6xl px-5 py-20 sm:px-8 lg:py-24">
            <h2 className="max-w-xl font-display text-3xl font-extrabold tracking-tight sm:text-4xl">
              From blank page to sent application in four steps
            </h2>
            <ol className="mt-12 grid gap-10 sm:grid-cols-2 lg:grid-cols-4 lg:gap-8">
              {steps.map((step, index) => (
                <li key={step.title} className="border-t-2 border-ink pt-5">
                  <span
                    className="font-display text-4xl font-extrabold text-graphite/50"
                    aria-hidden
                  >
                    {index + 1}
                  </span>
                  <h3 className="mt-3 text-lg font-semibold">{step.title}</h3>
                  <p className="mt-2 leading-relaxed text-graphite">
                    {step.description}
                  </p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* Closing call to action */}
        <section className="bg-band text-on-band">
          <div className="mx-auto flex max-w-6xl flex-col gap-8 px-5 py-20 sm:px-8 lg:flex-row lg:items-end lg:justify-between">
            <h2 className="max-w-2xl font-display text-4xl leading-tight font-extrabold tracking-tight sm:text-5xl">
              Your next application can be your strongest one.
            </h2>
            <Link
              href="/signup"
              className="inline-flex shrink-0 items-center justify-center rounded-full bg-highlight px-8 py-4 font-semibold text-on-mark transition-transform hover:-translate-y-0.5 focus-visible:outline-on-band"
            >
              Start free
            </Link>
          </div>
        </section>
      </main>

      <footer className="mx-auto max-w-6xl px-5 py-8 text-sm text-graphite sm:px-8">
        © {new Date().getFullYear()} HireReady. Designed and built by Olwethu
        Zondi.
      </footer>
    </div>
  );
}