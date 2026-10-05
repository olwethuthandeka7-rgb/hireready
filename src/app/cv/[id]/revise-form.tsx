"use client";

import { useActionState, useRef } from "react";
import { reviseCvAction, type ReviseCvState } from "./actions";
import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form-alert";
import { inputStyles } from "@/components/ui/input";
import { cn } from "@/lib/cn";

const suggestions = [
  "Make my summary shorter",
  "Make it sound more professional",
  "Put my most relevant skills first",
  "Here are my answers to the questions: ",
];

export function ReviseForm({ cvId }: { cvId: string }) {
  const [state, formAction, pending] = useActionState<ReviseCvState, FormData>(
    reviseCvAction,
    {},
  );
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Puts a suggestion in the box so the user can send it or add to it.
  function applySuggestion(suggestion: string) {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.value = suggestion;
    textarea.focus();
    textarea.setSelectionRange(suggestion.length, suggestion.length);
  }

  return (
    <form action={formAction} className="space-y-4" noValidate>
      <input type="hidden" name="cvId" value={cvId} />

      <div>
        <label htmlFor="request" className="block font-semibold">
          Change anything
        </label>
        <p id="request-hint" className="mt-1 text-sm leading-relaxed text-graphite">
          Tell HireReady what to change, add or remove, or answer the questions
          above. It rewrites your CV for you.
        </p>
      </div>

      <div className="flex flex-wrap gap-2">
        {suggestions.map((suggestion) => (
          <button
            key={suggestion}
            type="button"
            onClick={() => applySuggestion(suggestion)}
            className="rounded-full border border-rule px-3 py-1.5 text-xs font-medium text-graphite transition-colors hover:border-ink hover:text-ink"
          >
            {suggestion.replace(": ", "")}
          </button>
        ))}
      </div>

      <textarea
        ref={textareaRef}
        id="request"
        name="request"
        rows={6}
        defaultValue={state.request}
        placeholder="For example: I also have a driver's licence. And make my Takealot job sound more impressive."
        className={cn(inputStyles, "resize-y leading-relaxed")}
        aria-invalid={Boolean(state.fieldError)}
        aria-describedby={state.fieldError ? "request-error" : "request-hint"}
      />

      {state.fieldError && (
        <p id="request-error" role="alert" className="text-sm font-medium text-danger">
          {state.fieldError}
        </p>
      )}
      {state.error && <FormAlert>{state.error}</FormAlert>}
      {state.success && !pending && (
        <FormAlert tone="info">{state.success}</FormAlert>
      )}

      <Button
        type="submit"
        fullWidth
        pending={pending}
        pendingText="Updating your CV…"
      >
        Update my CV
      </Button>
    </form>
  );
}