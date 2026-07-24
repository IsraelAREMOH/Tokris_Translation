"use client";

import { useEffect, useRef, useState, type ReactNode } from "react";

/**
 * Small hand-rolled anchored menu (no dependency) — used for row-action
 * menus, sort menus, callout/color pickers. Closes on outside click or Escape.
 */
export function DropdownMenu({
  trigger,
  children,
  align = "end",
  className = "",
}: {
  trigger: (props: { open: boolean; toggle: () => void }) => ReactNode;
  children: (close: () => void) => ReactNode;
  align?: "start" | "end";
  className?: string;
}) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!open) return;

    function handlePointerDown(event: PointerEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setOpen(false);
      }
    }
    function handleKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setOpen(false);
    }

    document.addEventListener("pointerdown", handlePointerDown);
    document.addEventListener("keydown", handleKeyDown);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDown);
      document.removeEventListener("keydown", handleKeyDown);
    };
  }, [open]);

  return (
    <div ref={containerRef} className="relative inline-block">
      {trigger({ open, toggle: () => setOpen((value) => !value) })}
      {open ? (
        <div
          className={`absolute top-full z-20 mt-2 min-w-[10rem] rounded-xl border border-border bg-floating p-1.5 shadow-floating ${
            align === "end" ? "right-0" : "left-0"
          } ${className}`}
        >
          {children(() => setOpen(false))}
        </div>
      ) : null}
    </div>
  );
}

export function DropdownMenuItem({
  onSelect,
  children,
  danger = false,
}: {
  onSelect: () => void;
  children: ReactNode;
  danger?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`flex w-full items-center gap-2.5 rounded-lg px-3 py-2 text-left text-sm font-medium transition-transform duration-200 ease-spring hover:bg-background active:scale-[0.98] ${
        danger ? "text-danger hover:bg-danger/10" : "text-foreground"
      }`}
    >
      {children}
    </button>
  );
}
