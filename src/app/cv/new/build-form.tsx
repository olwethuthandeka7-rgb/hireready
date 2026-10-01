"use client";

import { useActionState } from "react";
import { buildCvAction, type BuildCvState } from "./actions";
import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form-alert";
import { inputStyles } from "@/components/ui/input";
import { cn } from "@/lib/cn";

const thingsToMention = [
  "Your name, phone number, email and town or city",
  "The kind of job you want next",
  "Every job you've had: the job title, the company, roughly when, and what you did there",
  "What you studied, where, and when",
  "Your skills, including tools, software and languages you speak",
  "Projects, volunteering, certificates or awards",
  "Anything you're proud of, like numbers, results or praise you received",
];

export function BuildForm() {
  const [state, formAction, pending] = useActionState<BuildCvState, FormData>(
    buildCvAction,
    {},
  );

  return (
    <div className="mt-10 grid gap-10 lg:grid-cols-[1fr_20rem] lg:gap-14">
      <form action={formAction} className="space-y-5" noValidate>
        {state.error && <FormAlert>{state.error}</FormAlert>}

        <div className="space-y-2">
          <label htmlFor="about" className="block text-sm font-semibold">
            Everything about you
          </label>
          <textarea
            id="about"
            name="about"
            rows={18}
            defaultValue={state.about}
            placeholder="For example: My name is Thandi Mokoena, I live in Durban. I worked at Shoprite as a cashier from 2023 to 2024 where I served customers and trained two new staff members…"
            className={cn(inputStyles, "resize-y leading-relaxed")}
            aria-invalid={Boolean(state.fieldError)}
            aria-describedby={state.fieldError ? "about-error" : "about-hint"}
            required
          />
          {state.fieldError ? (
            <p id="about-error" role="alert" className="text-sm font-medium text-danger">
              {state.fieldError}
            </p>
          ) : (
            <p id="about-hint" className="text-sm text-graphite">
              Write in any order, as much or as little as you like. You can
              change anything afterwards.
            </p>
          )}
        </div>

        <Button
          type="submit"
          size="lg"
          pending={pending}
          pendingText="Writing your CV… this can take up to a minute"
        >
          Create my CV
        </Button>
      </form>

      <aside className="h-fit rounded-[1.75rem] border border-rule bg-surface p-6">
        <h2 className="font-semibold">Things worth mentioning</h2>
        <ul className="mt-4 space-y-3 text-sm leading-relaxed text-graphite">
          {thingsToMention.map((item) => (
            <li key={item} className="flex gap-3">
              <span
                className="mt-1.5 size-2.5 shrink-0 rounded-sm bg-highlight"
                aria-hidden
              />
              {item}
            </li>
          ))}
        </ul>
        <p className="mt-5 text-sm text-graphite">
          Missed something? HireReady will ask you about it.
        </p>
      </aside>
    </div>
  );
}