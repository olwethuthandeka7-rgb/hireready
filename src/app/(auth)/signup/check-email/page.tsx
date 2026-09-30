import type { Metadata } from "next";
import Link from "next/link";
import { MailCheck } from "lucide-react";

export const metadata: Metadata = { title: "Check your email" };

type CheckEmailPageProps = {
  searchParams: Promise<{ email?: string }>;
};

export default async function CheckEmailPage({
  searchParams,
}: CheckEmailPageProps) {
  const { email } = await searchParams;

  return (
    <div>
      <span className="grid size-14 place-items-center rounded-2xl bg-highlight text-on-mark">
        <MailCheck className="size-7" aria-hidden />
      </span>
      <h1 className="mt-6 font-display text-4xl font-extrabold tracking-tight">
        Check your email
      </h1>
      <p className="mt-4 text-lg leading-relaxed text-graphite">
        We sent a confirmation link to{" "}
        {email ? (
          <strong className="font-semibold text-ink">{email}</strong>
        ) : (
          "your email address"
        )}
        . Open it on this device, in this browser, to finish setting up your
        account.
      </p>
      <p className="mt-4 text-sm text-graphite">
        Can&apos;t find it? Check your spam or promotions folder.
      </p>
      <Link
        href="/login"
        className="mt-8 inline-block font-semibold text-ink underline decoration-highlight decoration-4 underline-offset-4 transition-colors hover:decoration-gap"
      >
        Back to log in
      </Link>
    </div>
  );
}