"use client";

import { useActionState, useState, type ReactNode } from "react";
import {
  tailorCvAction,
  type DetailsMode,
  type JobSource,
  type TailorCvState,
} from "./actions";
import { Button } from "@/components/ui/button";
import { FormAlert } from "@/components/ui/form-alert";
import { inputStyles } from "@/components/ui/input";
import { cn } from "@/lib/cn";

type CvOption = { id: string; title: string; isPrimary: boolean };

const jobSources: { value: JobSource; label: string }[] = [
  { value: "text", label: "Paste the text" },
  { value: "link", label: "Share a link" },
  { value: "file", label: "Upload the poster" },
];

const detailsToInclude =
  "Include your full name, phone number, email, town or city, every job (title, company, dates, what you did), your studies, and your skills.";

// A row of options that look like a switch but are real radio buttons,
// so they work with the keyboard and screen readers.
function OptionSwitch<T extends string>({
  name,
  legend,
  options,
  value,
  onChange,
}: {
  name: string;
  legend: string;
  options: { value: T; label: string }[];
  value: T;
  onChange: (value: T) => void;
}) {
  return (
    <fieldset>
      <legend className="sr-only">{legend}</legend>
      <div className="inline-flex flex-wrap gap-1 rounded-full border border-rule bg-surface p-1">
        {options.map((option) => (
          <label
            key={option.value}
            className="cursor-pointer rounded-full px-4 py-2 text-sm font-semibold text-graphite transition-colors hover:text-ink has-checked:bg-ink has-checked:text-paper has-focus-visible:outline-2 has-focus-visible:outline-ink"
          >
            <input
              type="radio"
              name={name}
              value={option.value}
              checked={value === option.value}
              onChange={() => onChange(option.value)}
              className="sr-only"
            />
            {option.label}
          </label>
        ))}
      </div>
    </fieldset>
  );
}

function Step({
  number,
  title,
  children,
}: {
  number: number;
  title: string;
  children: ReactNode;
}) {
  return (
    <section className="border-t-2 border-ink pt-6">
      <h2 className="flex items-baseline gap-3 font-display text-xl font-extrabold tracking-tight">
        <span className="text-graphite/60" aria-hidden>
          {number}
        </span>
        {title}
      </h2>
      <div className="mt-5 space-y-4">{children}</div>
    </section>
  );
}

function ErrorText({ id, message }: { id: string; message?: string }) {
  if (!message) return null;
  return (
    <p id={id} role="alert" className="text-sm font-medium text-danger">
      {message}
    </p>
  );
}

export function TailorForm({ cvs }: { cvs: CvOption[] }) {
  const [state, formAction, pending] = useActionState<TailorCvState, FormData>(
    tailorCvAction,
    {},
  );

  const [jobSource, setJobSource] = useState<JobSource>(
    state.jobSource ?? "text",
  );
  const [detailsMode, setDetailsMode] = useState<DetailsMode>(
    state.detailsMode ?? (cvs.length > 0 ? "cv" : "write"),
  );

  const primaryCv = cvs.find((cv) => cv.isPrimary) ?? cvs[0];

  return (
    <form action={formAction} className="mt-10 max-w-3xl space-y-12" noValidate>
      {state.error && <FormAlert>{state.error}</FormAlert>}

      <Step number={1} title="The job">
        <OptionSwitch
          name="jobSource"
          legend="How would you like to add the job post?"
          options={jobSources}
          value={jobSource}
          onChange={setJobSource}
        />

        <div hidden={jobSource !== "text"} className="space-y-2">
          <label htmlFor="jobText" className="block text-sm font-semibold">
            Job post
          </label>
          <textarea
            id="jobText"
            name="jobText"
            rows={10}
            defaultValue={state.jobText}
            placeholder="Paste the whole job post here: the title, duties and requirements."
            className={cn(inputStyles, "resize-y leading-relaxed")}
            aria-invalid={jobSource === "text" && Boolean(state.jobError)}
            aria-describedby="job-error"
          />
        </div>

        <div hidden={jobSource !== "link"} className="space-y-2">
          <label htmlFor="jobLink" className="block text-sm font-semibold">
            Link to the job post
          </label>
          <input
            id="jobLink"
            name="jobLink"
            type="url"
            inputMode="url"
            defaultValue={state.jobLink}
            placeholder="https://"
            className={inputStyles}
            aria-invalid={jobSource === "link" && Boolean(state.jobError)}
            aria-describedby="job-link-hint job-error"
          />
          <p id="job-link-hint" className="text-sm text-graphite">
            Some sites, like LinkedIn, hide posts from anyone not logged in. If
            a link doesn&apos;t work, paste the text instead.
          </p>
        </div>

        <div hidden={jobSource !== "file"} className="space-y-2">
          <label htmlFor="jobFile" className="block text-sm font-semibold">
            Job poster
          </label>
          <div
            className={cn(
              "rounded-[1.75rem] border-2 border-dashed bg-surface p-6 text-center",
              jobSource === "file" && state.jobError
                ? "border-danger"
                : "border-rule",
            )}
          >
            <p className="text-sm text-graphite">
              A screenshot or photo (PNG, JPG, WebP), a PDF or a Word file, up
              to 5MB
            </p>
            <input
              id="jobFile"
              name="jobFile"
              type="file"
              accept=".png,.jpg,.jpeg,.webp,.pdf,.docx,image/png,image/jpeg,image/webp,application/pdf"
              aria-describedby="job-error"
              className="mx-auto mt-4 block max-w-full text-sm text-graphite file:mr-4 file:cursor-pointer file:rounded-full file:border-0 file:bg-ink file:px-5 file:py-2.5 file:text-sm file:font-semibold file:text-paper hover:file:bg-highlight hover:file:text-on-mark"
            />
          </div>
        </div>

        <ErrorText id="job-error" message={state.jobError} />
      </Step>

      <Step number={2} title="Your details">
        {cvs.length > 0 && (
          <OptionSwitch
            name="detailsMode"
            legend="Where should your details come from?"
            options={[
              { value: "cv" as const, label: "Use one of my CVs" },
              { value: "write" as const, label: "Write my details" },
            ]}
            value={detailsMode}
            onChange={setDetailsMode}
          />
        )}
        {cvs.length === 0 && (
          <input type="hidden" name="detailsMode" value="write" />
        )}

        {cvs.length > 0 && (
          <div hidden={detailsMode !== "cv"} className="space-y-2">
            <label htmlFor="cvId" className="block text-sm font-semibold">
              Which CV?
            </label>
            <select
              id="cvId"
              name="cvId"
              defaultValue={state.cvId || primaryCv?.id}
              className={inputStyles}
            >
              {cvs.map((cv) => (
                <option key={cv.id} value={cv.id}>
                  {cv.title}
                  {cv.isPrimary ? " (main CV)" : ""}
                </option>
              ))}
            </select>
          </div>
        )}

        <div hidden={detailsMode !== "write"} className="space-y-2">
          <label htmlFor="about" className="block text-sm font-semibold">
            Everything about you
          </label>
          <p id="about-hint" className="text-sm text-graphite">
            {detailsToInclude}
          </p>
          <textarea
            id="about"
            name="about"
            rows={10}
            defaultValue={state.about}
            className={cn(inputStyles, "resize-y leading-relaxed")}
            aria-invalid={detailsMode === "write" && Boolean(state.detailsError)}
            aria-describedby="about-hint details-error"
          />
        </div>

        <ErrorText id="details-error" message={state.detailsError} />
      </Step>

      <Step number={3} title="Anything else to add?">
        <p id="extra-hint" className="-mt-2 text-sm text-graphite">
          Optional. For example: a new certificate, a recent project, or
          something from the job post you do have experience with.
        </p>
        <textarea
          id="extra"
          name="extra"
          rows={4}
          defaultValue={state.extra}
          aria-label="Anything else to add"
          aria-describedby="extra-hint"
          className={cn(inputStyles, "resize-y leading-relaxed")}
        />
      </Step>

      <Button
        type="submit"
        size="lg"
        pending={pending}
        pendingText="Reading the job and writing your CV… this can take up to a minute"
      >
        Create my matching CV
      </Button>
    </form>
  );
}