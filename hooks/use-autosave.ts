"use client";

import { useEffect, useRef } from "react";

/**
 * Generic debounced-interval autosave — snapshot/dirty check + save callback
 * are passed in, so this has no blog-specific knowledge and can power the
 * future Pages editor unchanged. Uses the "latest ref" pattern so the
 * interval itself never needs to be torn down/recreated as state changes.
 */
export function useAutosave({
  enabled,
  intervalMs,
  isDirty,
  onSave,
}: {
  enabled: boolean;
  intervalMs: number;
  isDirty: () => boolean;
  onSave: () => void | Promise<void>;
}) {
  const isDirtyRef = useRef(isDirty);
  const onSaveRef = useRef(onSave);

  useEffect(() => {
    isDirtyRef.current = isDirty;
    onSaveRef.current = onSave;
  });

  useEffect(() => {
    if (!enabled) return;
    const id = setInterval(() => {
      if (isDirtyRef.current()) void onSaveRef.current();
    }, intervalMs);
    return () => clearInterval(id);
  }, [enabled, intervalMs]);
}

/**
 * Native browser "leave site?" prompt — covers tab close/refresh/external
 * navigation. In-app Link clicks aren't intercepted (would require patching
 * next/link); the autosave interval keeps that gap small regardless.
 */
export function useUnsavedChangesWarning(isDirty: () => boolean) {
  const isDirtyRef = useRef(isDirty);

  useEffect(() => {
    isDirtyRef.current = isDirty;
  });

  useEffect(() => {
    function handleBeforeUnload(event: BeforeUnloadEvent) {
      if (isDirtyRef.current()) {
        event.preventDefault();
      }
    }
    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, []);
}
