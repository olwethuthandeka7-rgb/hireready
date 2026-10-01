import type { Metadata } from "next";
import Link from "next/link";
import { logOut } from "@/app/(auth)/actions";
import { Button, buttonStyles } from "@/components/ui/button";
import { listCvsForUser } from "@/db/queries/cvs";
import { requireUser } from "@/lib/auth";

export const metadata: Metadata = { title: "Dashboard" };

const dateFormat = new Intl.DateTimeFormat("en-ZA", {
  day: "numeric",
  month: "short",
  year: "numeric",
});

export default async function DashboardPage() {
  const user = await requireUser();
  const cvs = await listCvsForUser(user.id);

  const fullName =
    typeof user.user_metadata.full_name === "string"
      ? user.user_metadata.full_name
      : "";
  const firstName = fullName.split(" ")[0] || "there";

  return (
    <div className="min-h-screen bg-paper text-ink">
      <header className="mx-auto flex h-20 max-w-6xl items-center justify-between px-5 sm:px-8">
        <Link
          href="/dashboard"
          className="font-display text-xl font-extrabold tracking-tight"
        >
          Hire<span className="mark mark-match mark-still">Ready</span>
        </Link>
        <form action={logOut}>
          <Button type="submit" variant="ghost">
            Log out
          </Button>
        </form>
      </header>

      <main className="mx-auto max-w-6xl px-5 py-16 sm:px-8">
        <h1 className="font-display text-4xl font-extrabold tracking-tight sm:text-5xl">
          Hi {firstName}.
        </h1>
        <p className="mt-4 max-w-xl text-lg leading-relaxed text-graphite">
          {cvs.length === 0
            ? "Let's create your first CV. Tell HireReady about yourself and it writes the whole thing."
            : "Pick a CV to view, download or improve, or create a new one."}
        </p>

        <div className="mt-8">
          <Link href="/cv/new" className={buttonStyles({ size: "lg" })}>
            Build my CV with AI
          </Link>
        </div>

        <section className="mt-16">
          <h2 className="font-display text-2xl font-extrabold tracking-tight">
            Your CVs
          </h2>
          {cvs.length === 0 ? (
            <p className="mt-3 text-graphite">
              No CVs yet. Your first one takes about five minutes.
            </p>
          ) : (
            <ul className="mt-5 divide-y divide-rule border-y border-rule">
              {cvs.map((cv) => (
                <li key={cv.id}>
                  <Link
                    href={`/cv/${cv.id}`}
                    className="flex flex-wrap items-center justify-between gap-x-6 gap-y-1 py-5 transition-colors hover:bg-surface sm:px-3"
                  >
                    <span className="flex items-center gap-3 font-semibold">
                      {cv.title}
                      {cv.isPrimary && (
                        <span className="mark mark-match mark-still text-sm font-medium">
                          Main CV
                        </span>
                      )}
                    </span>
                    <span className="text-sm text-graphite">
                      Updated {dateFormat.format(cv.updatedAt)}
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>
      </main>
    </div>
  );
}