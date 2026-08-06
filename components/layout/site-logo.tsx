import Image from "next/image";

import { Link } from "@/i18n/navigation";

const SIZES = {
  header: "h-9 w-9",
  footer: "h-11 w-11",
} as const;

const WORDMARK_SIZES = {
  header: "text-xl",
  footer: "text-2xl",
} as const;

export function SiteLogo({
  variant = "header",
  className = "",
}: {
  variant?: keyof typeof SIZES;
  className?: string;
}) {
  return (
    <Link
      href="/"
      className={`inline-flex items-center gap-2.5 rounded-sm transition-transform duration-200 ease-spring hover:-translate-y-0.5 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-brand-500 active:translate-y-0 ${className}`}
    >
      <span aria-hidden className={`relative ${SIZES[variant]} shrink-0`}>
        <Image
          src="/images/brand/logo.png"
          alt=""
          fill
          sizes="44px"
          priority={variant === "header"}
          className="object-contain drop-shadow-[0_1px_3px_rgba(10,39,36,0.22)]"
        />
      </span>
      <span
        className={`font-display ${WORDMARK_SIZES[variant]} font-semibold tracking-[-0.02em] text-foreground`}
      >
        TOKRIS
        <span className="text-brand-600 dark:text-brand-400">.</span>
      </span>
    </Link>
  );
}
