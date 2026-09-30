import type { ReactNode } from "react";
import {
  Document,
  Page,
  StyleSheet,
  Text,
  View,
  renderToBuffer,
} from "@react-pdf/renderer";
import { displayUrl, formatDateRange, formatMonth } from "@/lib/cv/format";
import type { CvData } from "@/lib/cv/schema";

// Helvetica is built into every PDF reader, so nothing needs downloading
// and every ATS can read the text.
const styles = StyleSheet.create({
  page: {
    paddingVertical: 40,
    paddingHorizontal: 46,
    fontFamily: "Helvetica",
    fontSize: 10,
    lineHeight: 1.4,
    color: "#111111",
  },
  header: { marginBottom: 6 },
  name: {
    fontSize: 22,
    fontFamily: "Helvetica-Bold",
    textAlign: "center",
    lineHeight: 1.2,
  },
  headline: { fontSize: 12, textAlign: "center", marginTop: 8 },
  contact: { fontSize: 9, textAlign: "center", marginTop: 8, color: "#333333" },
  section: { marginTop: 16 },
  sectionTitle: {
    fontSize: 11,
    fontFamily: "Helvetica-Bold",
    borderBottomWidth: 0.75,
    borderBottomColor: "#888888",
    paddingBottom: 3,
    marginBottom: 8,
  },
  entry: { marginBottom: 11 },
  entryHeader: { flexDirection: "row", justifyContent: "space-between" },
  subLine: { fontFamily: "Helvetica-Oblique", marginTop: 2, marginBottom: 3 },
  bold: { fontFamily: "Helvetica-Bold" },
  muted: { color: "#333333" },
  bulletRow: { flexDirection: "row", marginTop: 3, paddingLeft: 8 },
  bulletMark: { width: 10 },
  bulletText: { flex: 1 },
  line: { marginBottom: 4 },
});

function PdfSection({ title, children }: { title: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <Text style={styles.sectionTitle} minPresenceAhead={30}>
        {title}
      </Text>
      {children}
    </View>
  );
}

function PdfBullets({ items }: { items: string[] }) {
  return (
    <>
      {items.map((item, index) => (
        <View key={index} style={styles.bulletRow}>
          <Text style={styles.bulletMark}>•</Text>
          <Text style={styles.bulletText}>{item}</Text>
        </View>
      ))}
    </>
  );
}

function PdfEntryHeader({ title, right }: { title: string; right: string }) {
  return (
    <View style={styles.entryHeader}>
      <Text style={styles.bold}>{title}</Text>
      {right ? <Text style={styles.muted}>{right}</Text> : null}
    </View>
  );
}

function CvPdfDocument({ cv }: { cv: CvData }) {
  const { contact } = cv;
  const contactDetails = [
    contact.location,
    contact.phone,
    contact.email,
    ...contact.links.map((link) => displayUrl(link.url)),
  ].filter(Boolean);

  return (
    <Document
      title={`${contact.fullName} CV`}
      author={contact.fullName}
      creator="HireReady"
    >
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.name}>{contact.fullName}</Text>
          {contact.headline ? (
            <Text style={styles.headline}>{contact.headline}</Text>
          ) : null}
          {contactDetails.length > 0 ? (
            <Text style={styles.contact}>{contactDetails.join(" | ")}</Text>
          ) : null}
        </View>

        {cv.summary ? (
          <PdfSection title="Summary">
            <Text>{cv.summary}</Text>
          </PdfSection>
        ) : null}

        {cv.experience.length > 0 ? (
          <PdfSection title="Experience">
            {cv.experience.map((job) => (
              <View key={job.id} style={styles.entry}>
                <PdfEntryHeader
                  title={job.jobTitle}
                  right={formatDateRange(job.startDate, job.endDate)}
                />
                <Text style={styles.subLine}>
                  {[job.company, job.location].filter(Boolean).join(", ")}
                </Text>
                <PdfBullets items={job.bullets} />
              </View>
            ))}
          </PdfSection>
        ) : null}

        {cv.projects.length > 0 ? (
          <PdfSection title="Projects">
            {cv.projects.map((project) => (
              <View key={project.id} style={styles.entry}>
                <PdfEntryHeader
                  title={project.name}
                  right={project.link ? displayUrl(project.link) : ""}
                />
                {project.technologies.length > 0 ? (
                  <Text style={styles.subLine}>
                    Technologies: {project.technologies.join(", ")}
                  </Text>
                ) : null}
                <PdfBullets items={project.bullets} />
              </View>
            ))}
          </PdfSection>
        ) : null}

        {cv.education.length > 0 ? (
          <PdfSection title="Education">
            {cv.education.map((item) => (
              <View key={item.id} style={styles.entry}>
                <PdfEntryHeader
                  title={item.qualification}
                  right={formatDateRange(item.startDate, item.endDate)}
                />
                <Text style={styles.subLine}>
                  {[item.institution, item.location].filter(Boolean).join(", ")}
                </Text>
                <PdfBullets items={item.details} />
              </View>
            ))}
          </PdfSection>
        ) : null}

        {cv.skills.length > 0 ? (
          <PdfSection title="Skills">
            {cv.skills.map((group) => (
              <Text key={group.id} style={styles.line}>
                <Text style={styles.bold}>{group.category}: </Text>
                {group.skills.join(", ")}
              </Text>
            ))}
          </PdfSection>
        ) : null}

        {cv.certifications.length > 0 ? (
          <PdfSection title="Certifications">
            {cv.certifications.map((cert) => (
              <Text key={cert.id} style={styles.line}>
                <Text style={styles.bold}>{cert.name}</Text>
                {cert.issuer ? `, ${cert.issuer}` : ""}
                {cert.date ? ` (${formatMonth(cert.date)})` : ""}
              </Text>
            ))}
          </PdfSection>
        ) : null}

        {cv.languages.length > 0 ? (
          <PdfSection title="Languages">
            <Text>
              {cv.languages
                .map((language) => `${language.name} (${language.proficiency})`)
                .join(", ")}
            </Text>
          </PdfSection>
        ) : null}
      </Page>
    </Document>
  );
}

export async function renderCvPdf(cv: CvData) {
  const buffer = await renderToBuffer(<CvPdfDocument cv={cv} />);
  return new Uint8Array(buffer);
}