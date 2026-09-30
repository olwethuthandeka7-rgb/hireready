import type { ReactNode } from "react";
import { displayUrl, formatDateRange, formatMonth } from "@/lib/cv/format";
import type { CvData } from "@/lib/cv/schema";

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="mt-7">
      <h2 className="border-b border-neutral-400 pb-1.5 text-[15px] font-bold text-neutral-900">
        {title}
      </h2>
      <div className="mt-3 space-y-5">{children}</div>
    </section>
  );
}

function Bullets({ items }: { items: string[] }) {
  if (items.length === 0) return null;

  return (
    <ul className="mt-2 list-disc space-y-1 pl-5">
      {items.map((item, index) => (
        <li key={index}>{item}</li>
      ))}
    </ul>
  );
}

function EntryHeading({ title, dates }: { title: string; dates: string }) {
  return (
    <div className="flex flex-wrap items-baseline justify-between gap-x-4">
      <h3 className="font-bold">{title}</h3>
      {dates && <p className="text-neutral-700">{dates}</p>}
    </div>
  );
}

function SubLine({ children }: { children: ReactNode }) {
  return <p className="mt-0.5 italic">{children}</p>;
}

// An ATS-friendly CV: one column, standard headings, plain text.
export function CvDocument({ cv }: { cv: CvData }) {
  const { contact } = cv;

  const contactDetails = [
    contact.location,
    contact.phone,
    contact.email,
    ...contact.links.map((link) => displayUrl(link.url)),
  ].filter(Boolean);

  return (
    <article
      className="bg-white px-[16mm] py-[14mm] text-[14px] leading-[1.45] text-neutral-900"
      style={{ fontFamily: "Arial, Helvetica, sans-serif" }}
    >
      <header className="text-center">
        <h1 className="text-[28px] leading-tight font-bold">
          {contact.fullName}
        </h1>
        {contact.headline && (
          <p className="mt-2.5 text-[16px]">{contact.headline}</p>
        )}
        {contactDetails.length > 0 && (
          <p className="mt-2.5 text-[13px] text-neutral-700">
            {contactDetails.join(" | ")}
          </p>
        )}
      </header>

      {cv.summary && (
        <Section title="Summary">
          <p>{cv.summary}</p>
        </Section>
      )}

      {cv.experience.length > 0 && (
        <Section title="Experience">
          {cv.experience.map((job) => (
            <div key={job.id}>
              <EntryHeading
                title={job.jobTitle}
                dates={formatDateRange(job.startDate, job.endDate)}
              />
              <SubLine>
                {[job.company, job.location].filter(Boolean).join(", ")}
              </SubLine>
              <Bullets items={job.bullets} />
            </div>
          ))}
        </Section>
      )}

      {cv.projects.length > 0 && (
        <Section title="Projects">
          {cv.projects.map((project) => (
            <div key={project.id}>
              <EntryHeading
                title={project.name}
                dates={project.link ? displayUrl(project.link) : ""}
              />
              {project.technologies.length > 0 && (
                <SubLine>Technologies: {project.technologies.join(", ")}</SubLine>
              )}
              <Bullets items={project.bullets} />
            </div>
          ))}
        </Section>
      )}

      {cv.education.length > 0 && (
        <Section title="Education">
          {cv.education.map((item) => (
            <div key={item.id}>
              <EntryHeading
                title={item.qualification}
                dates={formatDateRange(item.startDate, item.endDate)}
              />
              <SubLine>
                {[item.institution, item.location].filter(Boolean).join(", ")}
              </SubLine>
              <Bullets items={item.details} />
            </div>
          ))}
        </Section>
      )}

      {cv.skills.length > 0 && (
        <Section title="Skills">
          <div className="space-y-1.5">
            {cv.skills.map((group) => (
              <p key={group.id}>
                <strong>{group.category}:</strong> {group.skills.join(", ")}
              </p>
            ))}
          </div>
        </Section>
      )}

      {cv.certifications.length > 0 && (
        <Section title="Certifications">
          <div className="space-y-1.5">
            {cv.certifications.map((cert) => (
              <p key={cert.id}>
                <strong>{cert.name}</strong>
                {cert.issuer && `, ${cert.issuer}`}
                {cert.date && ` (${formatMonth(cert.date)})`}
              </p>
            ))}
          </div>
        </Section>
      )}

      {cv.languages.length > 0 && (
        <Section title="Languages">
          <p>
            {cv.languages
              .map((language) => `${language.name} (${language.proficiency})`)
              .join(", ")}
          </p>
        </Section>
      )}
    </article>
  );
}