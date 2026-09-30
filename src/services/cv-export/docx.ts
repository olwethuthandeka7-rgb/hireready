import {
  AlignmentType,
  BorderStyle,
  Document,
  Packer,
  Paragraph,
  Tab,
  TabStopType,
  TextRun,
} from "docx";
import { displayUrl, formatDateRange, formatMonth } from "@/lib/cv/format";
import type { CvData } from "@/lib/cv/schema";

const FONT = "Arial";
const BODY_SIZE = 20; // half-points: 20 = 10pt
const PAGE_WIDTH = 11906; // A4 width in twips (1/20 of a point)
const PAGE_HEIGHT = 16838; // A4 height in twips
const MARGIN = 1134; // 2 cm
const CONTENT_WIDTH = PAGE_WIDTH - MARGIN * 2;

type RunOptions = { bold?: boolean; italics?: boolean; size?: number };

function run(text: string, options: RunOptions = {}) {
  return new TextRun({
    text,
    font: FONT,
    size: options.size ?? BODY_SIZE,
    bold: options.bold,
    italics: options.italics,
  });
}

function sectionHeading(title: string) {
  return new Paragraph({
    children: [run(title, { bold: true, size: 23 })],
    spacing: { before: 320, after: 140 },
    border: {
      bottom: { style: BorderStyle.SINGLE, size: 6, color: "888888", space: 3 },
    },
    keepNext: true,
  });
}

// Title on the left, dates (or a link) pushed to the right edge.
function entryHeading(title: string, right: string, isFirst: boolean) {
  return new Paragraph({
    tabStops: [{ type: TabStopType.RIGHT, position: CONTENT_WIDTH }],
    spacing: { before: isFirst ? 0 : 220 },
    keepNext: true,
    children: [
      run(title, { bold: true }),
      ...(right
        ? [new TextRun({ children: [new Tab(), right], font: FONT, size: BODY_SIZE })]
        : []),
    ],
  });
}

function subLine(text: string) {
  return new Paragraph({
    children: [run(text, { italics: true })],
    spacing: { before: 40, after: 60 },
    keepNext: true,
  });
}

function bullet(text: string) {
  return new Paragraph({
    bullet: { level: 0 },
    spacing: { before: 40 },
    children: [run(text)],
  });
}

function line(children: TextRun[]) {
  return new Paragraph({ children, spacing: { after: 80 } });
}

export async function renderCvDocx(cv: CvData) {
  const { contact } = cv;
  const contactDetails = [
    contact.location,
    contact.phone,
    contact.email,
    ...contact.links.map((link) => displayUrl(link.url)),
  ].filter(Boolean);

  const children: Paragraph[] = [
    new Paragraph({
      alignment: AlignmentType.CENTER,
      children: [run(contact.fullName, { bold: true, size: 44 })],
    }),
  ];

  if (contact.headline) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 120 },
        children: [run(contact.headline, { size: 24 })],
      }),
    );
  }

  if (contactDetails.length > 0) {
    children.push(
      new Paragraph({
        alignment: AlignmentType.CENTER,
        spacing: { before: 120, after: 80 },
        children: [run(contactDetails.join(" | "), { size: 18 })],
      }),
    );
  }

  if (cv.summary) {
    children.push(sectionHeading("Summary"), line([run(cv.summary)]));
  }

  if (cv.experience.length > 0) {
    children.push(sectionHeading("Experience"));
    cv.experience.forEach((job, index) => {
      children.push(
        entryHeading(
          job.jobTitle,
          formatDateRange(job.startDate, job.endDate),
          index === 0,
        ),
        subLine([job.company, job.location].filter(Boolean).join(", ")),
        ...job.bullets.map(bullet),
      );
    });
  }

  if (cv.projects.length > 0) {
    children.push(sectionHeading("Projects"));
    cv.projects.forEach((project, index) => {
      children.push(
        entryHeading(
          project.name,
          project.link ? displayUrl(project.link) : "",
          index === 0,
        ),
      );
      if (project.technologies.length > 0) {
        children.push(subLine(`Technologies: ${project.technologies.join(", ")}`));
      }
      children.push(...project.bullets.map(bullet));
    });
  }

  if (cv.education.length > 0) {
    children.push(sectionHeading("Education"));
    cv.education.forEach((item, index) => {
      children.push(
        entryHeading(
          item.qualification,
          formatDateRange(item.startDate, item.endDate),
          index === 0,
        ),
        subLine([item.institution, item.location].filter(Boolean).join(", ")),
        ...item.details.map(bullet),
      );
    });
  }

  if (cv.skills.length > 0) {
    children.push(sectionHeading("Skills"));
    for (const group of cv.skills) {
      children.push(
        line([
          run(`${group.category}: `, { bold: true }),
          run(group.skills.join(", ")),
        ]),
      );
    }
  }

  if (cv.certifications.length > 0) {
    children.push(sectionHeading("Certifications"));
    for (const cert of cv.certifications) {
      const details =
        (cert.issuer ? `, ${cert.issuer}` : "") +
        (cert.date ? ` (${formatMonth(cert.date)})` : "");
      children.push(line([run(cert.name, { bold: true }), run(details)]));
    }
  }

  if (cv.languages.length > 0) {
    children.push(
      sectionHeading("Languages"),
      line([
        run(
          cv.languages
            .map((language) => `${language.name} (${language.proficiency})`)
            .join(", "),
        ),
      ]),
    );
  }

  const document = new Document({
    creator: "HireReady",
    title: `${contact.fullName} CV`,
    styles: {
      default: { document: { run: { font: FONT, size: BODY_SIZE } } },
    },
    sections: [
      {
        properties: {
          page: {
            size: { width: PAGE_WIDTH, height: PAGE_HEIGHT },
            margin: { top: MARGIN, bottom: MARGIN, left: MARGIN, right: MARGIN },
          },
        },
        children,
      },
    ],
  });

  const buffer = await Packer.toBuffer(document);
  return new Uint8Array(buffer);
}