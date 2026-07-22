import {
  ArrowRight,
  ChevronDown,
  Mail,
  MapPin,
  MessageCircle,
  Phone,
} from "lucide-react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { ContactForm } from "@/components/contact/contact-form";
import { ClientReviews } from "@/components/public/client-reviews";
import { ContactHero } from "@/components/public/contact-hero";
import { CtaBand } from "@/components/public/cta-band";
import { getContactDetails, mapsHref, telHref } from "@/lib/contact/details";

export const metadata: Metadata = { title: "Contact Us" };

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("contact");
  const { phones, email, whatsappNumber, address } = await getContactDetails();
  const whatsappHref = whatsappNumber
    ? `https://wa.me/${whatsappNumber}`
    : "https://wa.me/";

  // Quick reference details, ordered for scanning — where to find us, then
  // how to reach us directly. WhatsApp gets its own prominent CTA below
  // since it's the fastest channel, so it isn't repeated in this list.
  const details = [
    {
      icon: MapPin,
      title: t("addressTitle"),
      links: [{ label: address, href: mapsHref(address), external: true }],
    },
    {
      icon: Phone,
      title: t("phoneTitle"),
      links: phones.map((phone) => ({
        label: phone,
        href: telHref(phone),
        external: false,
      })),
    },
    {
      icon: Mail,
      title: t("emailTitle"),
      links: [{ label: email, href: `mailto:${email}`, external: false }],
    },
  ];

  return (
    <>
      <ContactHero whatsappNumber={whatsappNumber} />

      <section className="relative isolate overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[radial-gradient(48rem_30rem_at_85%_-15%,rgb(56_152_139/0.14),transparent_62%),radial-gradient(38rem_24rem_at_-8%_110%,rgb(208_145_62/0.1),transparent_62%)]"
        />
        <div aria-hidden className="bg-noise absolute inset-0 -z-10 opacity-[0.04]" />

        <div className="mx-auto grid w-full max-w-6xl items-start gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-12">
          <div className="animate-rise flex flex-col gap-5 [animation-delay:300ms]">
            {/* Primary channel — visually leads, since it's the fastest reply */}
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-4 rounded-2xl bg-brand-600 p-6 shadow-brand transition-transform duration-300 ease-spring hover:-translate-y-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white active:translate-y-0 dark:bg-brand-500"
            >
              <span className="inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-white/15 transition-transform duration-300 ease-spring group-hover:scale-110">
                <MessageCircle className="h-6 w-6 text-white" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-display text-lg font-semibold tracking-[-0.01em] text-white">
                  {t("whatsappTitle")}
                </p>
                <p className="mt-0.5 text-sm text-white/80">
                  {t("whatsappBody")}
                </p>
              </div>
              <ArrowRight className="h-5 w-5 shrink-0 text-white/80 transition-transform duration-300 ease-spring group-hover:translate-x-1" />
            </a>

            {/* Quick reference details — one consolidated, scannable block
                instead of a repeated card per channel. */}
            <div className="rounded-2xl border border-border/60 bg-surface/40 shadow-elevated backdrop-blur-md">
              <ul className="divide-y divide-border/60">
                {details.map((detail) => (
                  <li key={detail.title} className="flex items-start gap-4 p-5">
                    <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-600/10 text-brand-700 dark:bg-brand-400/10 dark:text-brand-300">
                      <detail.icon className="h-4 w-4" />
                    </span>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs font-semibold tracking-[0.1em] text-muted-foreground uppercase">
                        {detail.title}
                      </p>
                      <div className="mt-1 flex flex-col items-start gap-0.5">
                        {detail.links.map((link) => (
                          <a
                            key={link.href}
                            href={link.href}
                            {...(link.external
                              ? { target: "_blank", rel: "noopener noreferrer" }
                              : {})}
                            className="rounded-sm text-sm font-medium text-foreground underline-offset-4 hover:text-brand-700 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:opacity-80 dark:hover:text-brand-300"
                          >
                            {link.label}
                          </a>
                        ))}
                      </div>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div
            id="contact-form"
            className="animate-rise scroll-mt-24 rounded-2xl border border-border/60 bg-surface/40 p-6 shadow-elevated backdrop-blur-md [animation-delay:350ms] sm:p-8"
          >
            <h2 className="font-display text-2xl font-semibold tracking-[-0.02em] text-foreground">
              {t("form.title")}
            </h2>
            <p className="mt-2 text-sm text-muted-foreground">
              {t("form.subtitle")}
            </p>
            <div className="mt-6">
              <ContactForm />
            </div>
          </div>
        </div>
      </section>

      {/* ---- FAQ ---- */}
      <section className="mx-auto w-full max-w-3xl px-4 py-20 sm:px-6 sm:py-24">
        <div className="text-center">
          <p className="text-xs font-semibold tracking-[0.22em] uppercase text-brand-600 dark:text-brand-400">
            {t("faq.eyebrow")}
          </p>
          <h2 className="mt-3 font-display text-3xl font-semibold tracking-[-0.03em] text-foreground sm:text-4xl">
            {t("faq.title")}
          </h2>
        </div>

        <div className="mt-10 flex flex-col gap-3">
          {[1, 2, 3, 4, 5].map((n) => (
            <details
              key={n}
              className="group rounded-2xl border border-border/60 bg-surface/40 shadow-elevated backdrop-blur-md"
            >
              <summary className="flex cursor-pointer list-none items-center justify-between gap-4 rounded-2xl px-6 py-5 font-display text-base font-semibold tracking-[-0.01em] text-foreground focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-500 [&::-webkit-details-marker]:hidden">
                {t(`faq.q${n}`)}
                <ChevronDown
                  aria-hidden
                  className="h-5 w-5 shrink-0 text-brand-600 transition-transform duration-300 ease-spring group-open:rotate-180 dark:text-brand-400"
                />
              </summary>
              <p className="px-6 pb-5 text-sm text-muted-foreground">
                {t(`faq.a${n}`)}
              </p>
            </details>
          ))}
        </div>
      </section>

      {/* ---- Client reviews ---- */}
      <div className="border-t border-border/70 bg-surface/60">
        <ClientReviews />
      </div>

      <CtaBand />
    </>
  );
}
