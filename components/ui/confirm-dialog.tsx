"use client";

import {
  createContext,
  useCallback,
  useContext,
  useRef,
  useState,
  type ReactNode,
} from "react";

type ConfirmOptions = {
  title: string;
  description?: string;
  confirmLabel?: string;
  cancelLabel?: string;
  /** Styles the confirm button red — use for destructive actions. */
  danger?: boolean;
};

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | null>(null);

/**
 * Imperative confirmation dialogs for destructive actions (delete category,
 * bulk-delete posts, etc.) — `await confirm({ title, danger: true })` resolves
 * true/false instead of every call site managing its own open state.
 */
export function useConfirm() {
  const ctx = useContext(ConfirmContext);
  if (!ctx) {
    throw new Error("useConfirm must be used within ConfirmDialogProvider");
  }
  return ctx;
}

/** Mounted once in ConsoleShell — a single native <dialog> instance shared app-wide. */
export function ConfirmDialogProvider({ children }: { children: ReactNode }) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const resolveRef = useRef<((value: boolean) => void) | null>(null);
  const [options, setOptions] = useState<ConfirmOptions | null>(null);

  const confirm = useCallback<ConfirmFn>((opts) => {
    setOptions(opts);
    dialogRef.current?.showModal();
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve;
    });
  }, []);

  function close(result: boolean) {
    dialogRef.current?.close();
    resolveRef.current?.(result);
    resolveRef.current = null;
  }

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <dialog
        ref={dialogRef}
        onCancel={(event) => {
          event.preventDefault();
          close(false);
        }}
        onClick={(event) => {
          if (event.target === dialogRef.current) close(false);
        }}
        className="m-auto w-[calc(100%-2rem)] max-w-sm rounded-xl border border-border bg-floating p-0 text-foreground shadow-floating backdrop:bg-foreground/40 backdrop:backdrop-blur-sm"
      >
        {options ? (
          <div className="flex flex-col gap-5 p-6">
            <div>
              <h2 className="font-display text-lg font-semibold tracking-[-0.01em] text-foreground">
                {options.title}
              </h2>
              {options.description ? (
                <p className="mt-1.5 text-sm text-muted-foreground">
                  {options.description}
                </p>
              ) : null}
            </div>
            <div className="flex justify-end gap-2.5">
              <button
                type="button"
                onClick={() => close(false)}
                className="rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground transition-transform duration-200 ease-spring hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:translate-y-0 active:scale-[0.98]"
              >
                {options.cancelLabel ?? "Cancel"}
              </button>
              <button
                type="button"
                onClick={() => close(true)}
                className={`rounded-full px-4 py-2 text-sm font-semibold text-white shadow-brand transition-transform duration-200 ease-spring hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:translate-y-0 active:scale-[0.98] ${
                  options.danger
                    ? "bg-danger hover:bg-danger/90"
                    : "bg-brand-600 hover:bg-brand-700"
                }`}
              >
                {options.confirmLabel ?? "Confirm"}
              </button>
            </div>
          </div>
        ) : null}
      </dialog>
    </ConfirmContext.Provider>
  );
}
