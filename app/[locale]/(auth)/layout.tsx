import type { ReactNode } from "react";
import Image from "next/image";

import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Link } from "@/i18n/navigation";

// Reuses one of the industry-gallery photos as a subdued full-bleed backdrop —
// distinct treatment (blurred ambience, not a sharp foreground panel).
const BACKDROP_IMAGE =
  "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1600&auto=format&fit=crop";

export default function AuthLayout({ children }: { children: ReactNode }) {
  return (
    <div className="relative isolate flex min-h-dvh flex-col overflow-hidden">
      <div aria-hidden className="absolute inset-0 -z-20">
        <Image
          src={BACKDROP_IMAGE}
          alt=""
          fill
          sizes="100vw"
          className="object-cover opacity-[0.14] dark:opacity-[0.1]"
        />
        <div className="absolute inset-0 bg-brand-800/20 mix-blend-multiply" />
        <div className="absolute inset-0 bg-gradient-to-b from-background/20 via-background/80 to-background" />
      </div>
      <div aria-hidden className="absolute inset-0 -z-10">
        <div className="animate-ambient-a absolute -top-40 right-[-12%] h-[32rem] w-[32rem] rounded-full bg-[radial-gradient(closest-side,rgb(56_152_139/0.24),transparent_70%)] blur-2xl" />
        <div className="animate-ambient-b absolute bottom-[-30%] left-[-10%] h-[28rem] w-[28rem] rounded-full bg-[radial-gradient(closest-side,rgb(208_145_62/0.18),transparent_70%)] blur-2xl" />
        <div className="bg-noise absolute inset-0 opacity-[0.04]" />
      </div>
      <header className="flex items-center justify-between px-4 py-4 sm:px-6">
        <Link
          href="/"
          className="font-display text-xl font-semibold tracking-[-0.02em] text-foreground transition-transform duration-200 ease-spring hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-500 active:translate-y-0"
        >
          TOKRIS
          <span className="text-brand-600 dark:text-brand-400">.</span>
        </Link>
        <ThemeToggle />
      </header>
      <main className="flex flex-1 items-center justify-center px-4 pb-16">
        <div className="w-full max-w-md rounded-2xl border border-border bg-floating p-8 shadow-floating">
          {children}
        </div>
      </main>
    </div>
  );
}
