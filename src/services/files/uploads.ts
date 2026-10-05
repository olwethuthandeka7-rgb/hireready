export const MAX_UPLOAD_BYTES = 5 * 1024 * 1024; // 5MB

export type FileKind = "pdf" | "docx" | "image";

export type UploadedFile = {
  kind: FileKind;
  mediaType: string;
  name: string;
  bytes: Uint8Array;
};

export type UploadResult =
  | { ok: true; file: UploadedFile }
  | { ok: false; error: string };

const DOCX_TYPE =
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document";

function startsWith(bytes: Uint8Array, signature: number[], offset = 0) {
  return signature.every((byte, index) => bytes[offset + index] === byte);
}

// Every file type begins with a few special bytes (its "signature").
// Checking those, instead of trusting the file name, means a renamed
// file can't pretend to be something it isn't.
export function detectFileKind(
  bytes: Uint8Array,
  fileName: string,
): { kind: FileKind; mediaType: string } | null {
  const name = fileName.toLowerCase();

  // "%PDF"
  if (startsWith(bytes, [0x25, 0x50, 0x44, 0x46])) {
    return { kind: "pdf", mediaType: "application/pdf" };
  }
  // Word files are zip files ("PK") with a .docx name.
  if (startsWith(bytes, [0x50, 0x4b, 0x03, 0x04]) && name.endsWith(".docx")) {
    return { kind: "docx", mediaType: DOCX_TYPE };
  }
  // PNG
  if (startsWith(bytes, [0x89, 0x50, 0x4e, 0x47])) {
    return { kind: "image", mediaType: "image/png" };
  }
  // JPEG
  if (startsWith(bytes, [0xff, 0xd8, 0xff])) {
    return { kind: "image", mediaType: "image/jpeg" };
  }
  // WebP: "RIFF" .... "WEBP"
  if (
    startsWith(bytes, [0x52, 0x49, 0x46, 0x46]) &&
    startsWith(bytes, [0x57, 0x45, 0x42, 0x50], 8)
  ) {
    return { kind: "image", mediaType: "image/webp" };
  }

  return null;
}

const KIND_LABELS: Record<FileKind, string> = {
  pdf: "a PDF",
  docx: "a Word (.docx) file",
  image: "an image (PNG, JPG or WebP)",
};

// "a PDF or a Word (.docx) file"
export function describeKinds(kinds: FileKind[]) {
  const labels = kinds.map((kind) => KIND_LABELS[kind]);
  if (labels.length <= 1) return labels.join("");
  return `${labels.slice(0, -1).join(", ")} or ${labels.at(-1)}`;
}

// Returns null when no file was chosen.
export async function readUpload(
  value: FormDataEntryValue | null,
  allowed: FileKind[],
): Promise<UploadResult | null> {
  if (!(value instanceof File) || value.size === 0) {
    return null;
  }

  if (value.size > MAX_UPLOAD_BYTES) {
    return {
      ok: false,
      error: "That file is bigger than 5MB. Try a smaller file or a screenshot.",
    };
  }

  const bytes = new Uint8Array(await value.arrayBuffer());
  const detected = detectFileKind(bytes, value.name);

  if (!detected || !allowed.includes(detected.kind)) {
    return {
      ok: false,
      error: `We can't read that type of file. Upload ${describeKinds(allowed)}.`,
    };
  }

  return { ok: true, file: { ...detected, name: value.name, bytes } };
}