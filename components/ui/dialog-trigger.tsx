"use client";

import type { ReactNode } from "react";

/**
 * Wraps arbitrary trigger content (usually a <button>) with a click handler
 * that opens a dialog. Deliberately a JSX prop assignment, not a function
 * call passing the ref-touching callback as an argument — the latter trips
 * the react-hooks/refs rule, which flags "ref.current read reachable from a
 * call expression evaluated during render" but allows the same closure
 * passed as a JSX attribute (event-handler position).
 */
export function DialogTrigger({
  onOpen,
  children,
}: {
  onOpen: () => void;
  children: ReactNode;
}) {
  return (
    <span onClick={onOpen} className="contents">
      {children}
    </span>
  );
}
