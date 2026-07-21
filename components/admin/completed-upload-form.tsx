"use client";

import { useActionState } from "react";

import { FileDropZone } from "@/components/quote/file-drop-zone";
import {
  uploadCompletedFiles,
  type CompletedUploadState,
} from "@/lib/admin/actions";

const initialState: CompletedUploadState = {};

/**
 * Admin utility: saves finished documents into the client's private folder
 * ({client_id}/{project_id}/completed/…) as `completed` file records, which
 * makes them downloadable from the client portal.
 */
export function CompletedUploadForm({ projectId }: { projectId: string }) {
  const [state, formAction, pending] = useActionState(
    uploadCompletedFiles,
    initialState,
  );

  return (
    <form action={formAction} className="flex flex-col gap-3">
      <input type="hidden" name="projectId" value={projectId} />

      {/* Keyed on uploadedAt so a successful upload clears the file list. */}
      <FileDropZone key={state.uploadedAt ?? 0} label="Finished documents" />

      {state.error ? (
        <p
          role="alert"
          className="rounded-lg border border-danger/30 bg-danger/10 px-3.5 py-2.5 text-sm text-danger"
        >
          {state.error}
        </p>
      ) : null}
      {state.uploadedAt && !state.error ? (
        <p role="status" className="text-xs font-medium text-brand-700 dark:text-brand-300">
          Uploaded — the files are now available in the client&apos;s portal.
        </p>
      ) : null}

      <button
        type="submit"
        disabled={pending}
        className="inline-flex items-center justify-center rounded-full bg-brand-600 px-6 py-2.5 text-sm font-semibold text-white shadow-brand transition-transform duration-200 ease-spring hover:-translate-y-0.5 hover:bg-brand-700 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:translate-y-0 active:scale-[0.98] disabled:pointer-events-none disabled:opacity-60"
      >
        {pending ? "Uploading…" : "Upload completed files"}
      </button>
    </form>
  );
}
