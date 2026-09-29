// Joins class names together, ignoring empty or false values.
// Example: cn("px-4", isActive && "bg-ink") → "px-4 bg-ink" or "px-4"
export function cn(...classes: Array<string | false | null | undefined>) {
  return classes.filter(Boolean).join(" ");
}