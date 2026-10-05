"use client";

import { useActionState } from "react";
import { FileUp } from "lucide-react";
import { importCvAction, type ImportCvState } from "./actions";
import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form-alert";
import { inputStyles } from "@/components/ui/input";
import { cn } from "@/lib/cn";

export function UploadForm() {
  const [state, formAction, pending] = useActionState<ImportCvState, FormData>(
    importCvAction,
    {},
  );

  return (
    <form action={formAction} className="mt-10 max-w-3xl space-y-8" noValidate>
      {state.error && <FormAlert>{state.error}</FormAlert>}

      <div className="space-y-2">
        <label htmlFor="cv" className="block font-semibold">
          Your current CV
        </label>
        <div
          className={cn(
            "rounded-[1.75rem] border-2 border-dashed bg-surface p-8 text-center",
            state.fileError ? "border-danger" : "border-rule",
          )}
        >
          <FileUp className="mx-auto size-9 text-graphite" aria-hidden />
          <p className="mt-3 text-sm text-graphite">
            PDF or Word (.docx), up to 5MB
          </p>
          <input
            id="cv"
            name="cv"
            type="file"
            accept=".pdf,.docx,application/pdf,application/vnd.openxmlformats-officedocument.wordprocessingml.document"
            aria-invalid={Boolean(state.fileError)}
            aria-describedby={state.fileError ? "cv-error" : undefined}
            className="mx-auto mt-5 block max-w-full text-sm text-graphite file:mr-4 file:cursor-pointer file:rounded-full file:border-0 file:bg-ink file:px-5 file:py-2.5 file:text-sm file:font-semibold file:text-paper hover:file:bg-highlight hover:file:text-on-mark"
          />
        </div>
        {state.fileError && (
          <p id="cv-error" role="alert" className="text-sm font-medium text-danger">
            {state.fileError}
          </p>
        )}
      </div>

      <div className="space-y-2">
        <label htmlFor="wishes" className="block font-semibold">
          What would you like your new CV to be like?{" "}
          <span className="font-normal text-graphite">(optional)</span>
        </label>
        <p id="wishes-hint" className="text-sm text-graphite">
          For example: aim it at office admin jobs, keep it to one page, add my
          new certificate, or remove my oldest job.
        </p>
        <textarea
          id="wishes"
          name="wishes"
          rows={6}
          defaultValue={state.wishes}
          aria-describedby="wishes-hint"
          className={cn(inputStyles, "resize-y leading-relaxed")}
        />
      </div>

      <Button
        type="submit"
        size="lg"
        pending={pending}
        pendingText="Reading your CV… this can take up to a minute"
      >
        Improve my CV
      </Button>
    </form>
  );
}