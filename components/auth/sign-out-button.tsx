"use client";

import { LogOut } from "lucide-react";
import { useTransition } from "react";

import { signOut } from "@/lib/auth/actions";

export function SignOutButton() {
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => startTransition(async () => signOut())}
      className="inline-flex h-9 items-center gap-2 rounded-full border border-border bg-surface px-4 text-sm font-medium text-muted-foreground shadow-elevated transition-transform duration-200 ease-spring hover:-translate-y-0.5 hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:translate-y-0 active:scale-95 disabled:pointer-events-none disabled:opacity-60"
    >
      <LogOut className="h-4 w-4" />
      Sign out
    </button>
  );
}
