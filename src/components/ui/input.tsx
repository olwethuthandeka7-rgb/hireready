import type { InputHTMLAttributes } from "react";
import { cn } from "@/lib/cn";

export const inputStyles =
  "w-full rounded-xl border-2 border-rule bg-surface px-4 py-3 text-base text-ink placeholder:text-graphite/70 transition-colors hover:border-graphite/40 focus:border-ink focus:outline-none aria-[invalid=true]:border-danger";

export function Input({
  className,
  ...props
}: InputHTMLAttributes<HTMLInputElement>) {
  return <input className={cn(inputStyles, className)} {...props} />;
}