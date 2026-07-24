"use client";

import { useActionState } from "react";

import { SelectField } from "@/components/ui/select-field";
import { updateProjectStatus, type AdminActionState } from "@/lib/admin/actions";
import { PROJECT_STATUSES } from "@/lib/projects/constants";

const initialState: AdminActionState = {};

/**
 * Manual lifecycle control. Deliberately a dropdown + explicit button (not an
 * auto-submitting select) so the operator can't misfire a status change.
 */
export function StatusSelect({
  projectId,
  currentStatus,
}: {
  projectId: string;
  currentStatus: string;
}) {
  const [state, formAction, pending] = useActionState(
    updateProjectStatus,
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="projectId" value={projectId} />

      {/* Remount when the status changes so the reset value tracks the server. */}
      <SelectField
        key={currentStatus}
        label="Move project to"
        id="status"
        name="status"
        defaultValue={currentStatus}
        required
      >
        {PROJECT_STATUSES.map((status) => (
          <option key={status} value={status}>
            {status}
          </option>
        ))}
      </SelectField>

      {state.error ? (
        <p
          role="alert"
          className="rounded-lg border border-danger/30 bg-danger/10 px-3.5 py-2.5 text-sm text-danger"
        >
          {state.error}
        </p>
      ) : null}
      {state.success && !state.error ? (
        <p role="status" className="text-xs font-medium text-brand-700 dark:text-brand-300">
          Status updated the client sees it in their portal immediately.
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center justify-center rounded-full bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white shadow-brand transition-transform duration-200 ease-spring hover:-translate-y-0.5 hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:translate-y-0 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60"
      >
        {pending ? "Updating…" : "Update status"}
      </button>
    </form>
  );
}
