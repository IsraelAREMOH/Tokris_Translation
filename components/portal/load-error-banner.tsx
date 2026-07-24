/**
 * Distinguishes "the query failed" from "there's genuinely nothing here" —
 * several portal pages were defaulting a failed Supabase read to an empty
 * array/count, which showed the same empty state as a real zero-result
 * case (e.g. "No requests yet") even when a client's data actually failed
 * to load. Render this instead of (or above) the empty state when the
 * corresponding query's `error` is set.
 */
export function LoadErrorBanner({
  message = "Couldn't load this right now — please refresh the page.",
}: {
  message?: string;
}) {
  return (
    <div className="rounded-xl border border-danger/30 bg-danger/10 px-5 py-4">
      <p className="text-sm font-semibold text-danger">{message}</p>
    </div>
  );
}
