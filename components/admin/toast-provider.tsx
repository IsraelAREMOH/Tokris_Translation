"use client";

import { Toaster } from "sonner";

/** Mounted once in ConsoleShell — styled to the brand system, not sonner's defaults. */
export function ToastProvider() {
  return (
    <Toaster
      position="bottom-right"
      gap={10}
      toastOptions={{
        unstyled: true,
        classNames: {
          toast:
            "flex w-full items-start gap-3 rounded-xl border border-border bg-floating px-4 py-3.5 text-sm text-foreground shadow-floating font-sans",
          title: "font-medium leading-tight",
          description: "mt-0.5 text-muted-foreground",
          success: "border-brand-600/30",
          error: "border-danger/30",
          closeButton:
            "!left-auto !right-1.5 !top-1.5 !border-none !bg-transparent !text-muted-foreground",
        },
      }}
    />
  );
}
