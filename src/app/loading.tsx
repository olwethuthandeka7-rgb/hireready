// Shown instantly while any page is loading, so every click
// gets an immediate response.
export default function Loading() {
  return (
    <div
      role="status"
      aria-live="polite"
      className="grid min-h-screen place-items-center bg-paper text-ink"
    >
      <div className="text-center">
        <p className="font-display text-2xl font-extrabold tracking-tight">
          Hire<span className="mark mark-match mark-still">Ready</span>
        </p>
        <div className="mx-auto mt-5 h-1.5 w-40 overflow-hidden rounded-full bg-rule">
          <div className="h-full w-full rounded-full bg-highlight motion-safe:animate-pulse" />
        </div>
        <span className="sr-only">Loading</span>
      </div>
    </div>
  );
}