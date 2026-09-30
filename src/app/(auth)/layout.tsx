import Link from "next/link";
import type { ReactNode } from "react";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="grid min-h-screen bg-paper text-ink lg:grid-cols-[1fr_1.1fr]">
      {/* Brand panel (large screens only) */}
      <aside className="hidden flex-col justify-between bg-band p-12 text-on-band lg:flex">
        <Link
          href="/"
          className="font-display text-xl font-extrabold tracking-tight focus-visible:outline-on-band"
        >
          Hire<span className="mark mark-match mark-still">Ready</span>
        </Link>

        <div className="max-w-md">
          <p className="font-display text-4xl leading-tight font-extrabold tracking-tight xl:text-5xl">
            Know where you stand before you apply.
          </p>
          <p className="mt-6 text-lg leading-relaxed opacity-80">
            Your CV, checked against every job post. Yellow for what you have,
            pink for what to work on.
          </p>
          <p className="mt-8 flex flex-wrap gap-2 text-sm" aria-hidden>
            <span className="mark mark-match mark-still">React</span>
            <span className="mark mark-match mark-still">SQL</span>
            <span className="mark mark-match mark-still">Teamwork</span>
            <span className="mark mark-gap mark-still">Docker</span>
          </p>
        </div>

        <p className="text-sm opacity-60">
          Every CV is formatted to pass applicant tracking systems.
        </p>
      </aside>

      {/* Form area */}
      <main className="flex flex-col px-5 py-8 sm:px-8">
        <Link
          href="/"
          className="font-display text-xl font-extrabold tracking-tight lg:hidden"
        >
          Hire<span className="mark mark-match mark-still">Ready</span>
        </Link>
        <div className="flex flex-1 items-center justify-center py-10">
          <div className="w-full max-w-md">{children}</div>
        </div>
      </main>
    </div>
  );
}