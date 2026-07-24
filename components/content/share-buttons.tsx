"use client";

import { Check, Link2 } from "lucide-react";
import { useState } from "react";

// Text labels rather than brand-logo icons — lucide-react's brand icon set
// was removed from the core package, and hand-drawing X/LinkedIn/Facebook
// glyphs isn't worth the maintenance for three small buttons.
export function ShareButtons({
  url,
  title,
  label,
  copyLabel,
  copiedLabel,
}: {
  url: string;
  title: string;
  label: string;
  copyLabel: string;
  copiedLabel: string;
}) {
  const [copied, setCopied] = useState(false);

  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  const targets = [
    { name: "X", href: `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}` },
    { name: "LinkedIn", href: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}` },
    { name: "Facebook", href: `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}` },
    { name: "WhatsApp", href: `https://wa.me/?text=${encodedTitle}%20${encodedUrl}` },
    { name: "Email", href: `mailto:?subject=${encodedTitle}&body=${encodedUrl}` },
  ];

  async function handleCopy() {
    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Clipboard API unavailable (e.g. insecure context) — silently no-op,
      // the share links above still work.
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2" role="group" aria-label={label}>
      {targets.map((target) => (
        <a
          key={target.name}
          href={target.href}
          target="_blank"
          rel="noopener noreferrer"
          className="rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground shadow-elevated transition-transform duration-200 ease-spring hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:translate-y-0 active:scale-[0.98]"
        >
          {target.name}
        </a>
      ))}
      <button
        type="button"
        onClick={handleCopy}
        className="inline-flex items-center gap-1.5 rounded-full border border-border bg-surface px-4 py-2 text-sm font-medium text-foreground shadow-elevated transition-transform duration-200 ease-spring hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:translate-y-0 active:scale-[0.98]"
      >
        {copied ? <Check className="h-4 w-4 text-brand-600" /> : <Link2 className="h-4 w-4" />}
        {copied ? copiedLabel : copyLabel}
      </button>
    </div>
  );
}
