// The manual V1 lifecycle. Order matters — the admin console renders it as a
// stepper, and every transition is a deliberate manual step by the operator.
// Keep in sync with the `status` check constraint in migration 0001.
export const PROJECT_STATUSES = [
  "Request Submitted",
  "Under Review",
  "Translating",
  "Quality Check",
  "Completed",
  "Delivered",
] as const;

export type ProjectStatus = (typeof PROJECT_STATUSES)[number];

export function isProjectStatus(value: string): value is ProjectStatus {
  return (PROJECT_STATUSES as readonly string[]).includes(value);
}

/** Deadlines only stop mattering once the work is finished. */
export function isOverdue(deadline: string | null, status: string) {
  if (!deadline) return false;
  if (status === "Completed" || status === "Delivered") return false;
  return new Date(deadline).getTime() < Date.now();
}
