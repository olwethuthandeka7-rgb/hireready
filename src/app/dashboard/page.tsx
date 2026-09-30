import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { logOut } from "@/app/(auth)/actions";
import { Button } from "@/components/ui/button";
import { createClient } from "@/lib/supabase/server";

export const metadata: Metadata = { title: "Dashboard" };

export default async function DashboardPage() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  // The proxy already protects this page; this is a second safety check.
  if (!user) {
    redirect("/login");
  }

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
          Hi {firstName}, you&apos;re in.
        </h1>
        <p className="mt-4 max-w-xl text-lg leading-relaxed text-graphite">
          Start by adding your CV. Once it&apos;s here, HireReady can check it
          against any job post you find.
        </p>
      </main>
    </div>
  );
}