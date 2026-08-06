import { Mail, MapPin, Phone } from "lucide-react";
import { getTranslations } from "next-intl/server";

import { SocialLinks } from "@/components/social/social-links";
import { Link } from "@/i18n/navigation";
import { getContactDetails, mapsHref, telHref } from "@/lib/contact/details";

import { SiteLogo } from "./site-logo";

export async function SiteFooter() {
  const t = await getTranslations("footer");
  const nav = await getTranslations("nav");
  const year = new Date().getFullYear();
  const { phones, email, address } = await getContactDetails();

  const links = [
    { href: "/services", label: nav("services") },
    { href: "/about", label: nav("about") },
    { href: "/contact", label: nav("contact") },
    { href: "/quote", label: nav("quote") },
  ];

  return (
    <footer className="border-t border-border bg-surface">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-10 px-4 py-14 sm:px-6 lg:flex-row lg:items-start lg:justify-between">
        <div className="max-w-sm">
          <SiteLogo variant="footer" />
          <p className="mt-3 text-sm text-muted-foreground">{t("tagline")}</p>
          <SocialLinks label={t("followLabel")} className="mt-5 -ml-2" />
        </div>
        <nav
          aria-label="Footer"
          className="grid grid-cols-2 gap-x-12 gap-y-2.5"
        >
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-sm text-sm text-muted-foreground transition-transform duration-200 ease-spring hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:scale-[0.98]"
            >
              {link.label}
            </Link>
          ))}
        </nav>

        <address className="flex max-w-56 flex-col items-start gap-2.5 not-italic">
          <a
            href={mapsHref(address)}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-start gap-2.5 rounded-sm text-sm text-muted-foreground transition-transform duration-200 ease-spring hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:scale-[0.98]"
          >
            <MapPin
              aria-hidden
              className="mt-0.5 h-3.5 w-3.5 shrink-0 text-brand-600 dark:text-brand-400"
            />
            {address}
          </a>
          {phones.map((phone) => (
            <a
              key={phone}
              href={telHref(phone)}
              className="inline-flex items-center gap-2.5 rounded-sm text-sm text-muted-foreground transition-transform duration-200 ease-spring hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:scale-[0.98]"
            >
              <Phone
                aria-hidden
                className="h-3.5 w-3.5 shrink-0 text-brand-600 dark:text-brand-400"
              />
              {phone}
            </a>
          ))}
          <a
            href={`mailto:${email}`}
            className="inline-flex items-center gap-2.5 rounded-sm text-sm text-muted-foreground transition-transform duration-200 ease-spring hover:text-foreground focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:scale-[0.98]"
          >
            <Mail
              aria-hidden
              className="h-3.5 w-3.5 shrink-0 text-brand-600 dark:text-brand-400"
            />
            {email}
          </a>
        </address>
      </div>
      <div className="border-t border-border/60">
        <p className="mx-auto w-full max-w-6xl px-4 py-5 text-xs text-muted-foreground sm:px-6">
          {t("legal", { year })}
        </p>
      </div>
    </footer>
  );
}
