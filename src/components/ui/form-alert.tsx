import type { ReactNode } from "react";
import { cn } from "@/lib/cn";

type Tone = "error" | "info";

export function FormAlert({
  tone = "error",
  children,
}: {
  tone?: Tone;
  children: ReactNode;
}) {
  return (
    <div
      role={tone === "error" ? "alert" : "status"}
      className={cn(
        "mt-6 rounded-xl border-l-4 bg-surface px-4 py-3 text-sm leading-relaxed text-ink",
        tone === "error" ? "border-danger" : "border-highlight",
      )}
    >
      {children}
    </div>
  );
}