const MONTHS = [
  "Jan",
  "Feb",
  "Mar",
  "Apr",
  "May",
  "Jun",
  "Jul",
  "Aug",
  "Sep",
  "Oct",
  "Nov",
  "Dec",
];

// "2024-03" → "Mar 2024"
export function formatMonth(value: string) {
  const [year, month] = value.split("-");
  const name = MONTHS[Number(month) - 1];
  return name ? `${name} ${year}` : value;
}

// Uses a plain hyphen, which every ATS reads correctly.
// ("2025-06", null) → "Jun 2025 - Present"
export function formatDateRange(start: string | null, end: string | null) {
  if (start && end) return `${formatMonth(start)} - ${formatMonth(end)}`;
  if (start) return `${formatMonth(start)} - Present`;
  if (end) return formatMonth(end);
  return "";
}

// "https://www.github.com/thandi/" → "github.com/thandi"
export function displayUrl(url: string) {
  return url
    .replace(/^https?:\/\//, "")
    .replace(/^www\./, "")
    .replace(/\/$/, "");
}