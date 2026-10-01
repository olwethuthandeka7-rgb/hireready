"use client";

import { useState } from "react";
import { Check, Copy } from "lucide-react";
import { Button } from "./button";

export function CopyButton({ text }: { text: string }) {
  const [copied, setCopied] = useState(false);

  async function copy() {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      setCopied(false);
    }
  }

  return (
    <Button variant="secondary" onClick={copy}>
      {copied ? (
        <>
          <Check className="size-4" aria-hidden /> Copied
        </>
      ) : (
        <>
          <Copy className="size-4" aria-hidden /> Copy
        </>
      )}
    </Button>
  );
}