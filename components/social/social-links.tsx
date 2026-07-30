import { SOCIAL_LINKS } from "@/lib/social/links";

// Facebook/Instagram/YouTube carry their own fixed brand color regardless of
// this text color (see components/icons/social-icons.tsx); X and TikTok
// inherit it via currentColor, since their brand guidelines call for
// black-on-light / white-on-dark rather than a fixed hue. `text-foreground`
// tracks the site's theme correctly for the footer and contact card; the
// homepage CTA band is always a dark panel regardless of site theme, so it
// forces white instead.
const VARIANT_LINK_CLASSES = {
  // Footer, newsletter card — sits on the default surface/background.
  subtle:
    "inline-flex h-9 w-9 items-center justify-center rounded-full text-foreground transition-transform duration-200 ease-spring hover:-translate-y-0.5 hover:bg-brand-600/10 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:translate-y-0 active:scale-95 dark:hover:bg-brand-400/10",
  // Contact page — larger, brand-tinted chips that invite a click.
  prominent:
    "inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600/10 text-foreground shadow-elevated transition-transform duration-300 ease-spring hover:-translate-y-1 hover:bg-brand-600/15 hover:shadow-brand focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:translate-y-0 active:scale-[0.98] dark:bg-brand-400/10 dark:hover:bg-brand-400/15",
  // Dark brand panels (e.g. the homepage CtaBand) — always dark, so X/TikTok
  // are forced to white independent of the site's own light/dark theme.
  inverted:
    "inline-flex h-9 w-9 items-center justify-center rounded-full text-white transition-transform duration-200 ease-spring hover:-translate-y-0.5 hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-white active:translate-y-0 active:scale-95",
} as const;

const VARIANT_ICON_CLASSES = {
  subtle: "h-4 w-4",
  prominent: "h-5 w-5",
  inverted: "h-4 w-4",
} as const;

type SocialLinksVariant = keyof typeof VARIANT_LINK_CLASSES;

/**
 * Renders the company's official social links. One source of truth
 * (lib/social/links.ts) feeds every placement across the site, so updating a
 * URL here never requires hunting through individual pages.
 */
export function SocialLinks({
  label,
  variant = "subtle",
  className = "",
}: {
  /** Accessible name for the wrapping group, e.g. "Follow us on social media". */
  label: string;
  variant?: SocialLinksVariant;
  className?: string;
}) {
  return (
    <ul
      aria-label={label}
      className={`flex items-center gap-2 ${className}`}
    >
      {SOCIAL_LINKS.map(({ name, href, icon: Icon }) => (
        <li key={name}>
          <a
            href={href}
            target="_blank"
            rel="noopener noreferrer"
            aria-label={`Follow us on ${name}`}
            className={VARIANT_LINK_CLASSES[variant]}
          >
            <Icon className={VARIANT_ICON_CLASSES[variant]} />
          </a>
        </li>
      ))}
    </ul>
  );
}
