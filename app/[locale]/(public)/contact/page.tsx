import { ChevronDown, Mail, MessageCircle, Phone } from "lucide-react";
import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";

import { ContactForm } from "@/components/contact/contact-form";
import { ClientReviews } from "@/components/public/client-reviews";
import { CtaBand } from "@/components/public/cta-band";
import { getContactDetails, telHref } from "@/lib/contact/details";

export const metadata: Metadata = { title: "Contact Us" };

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("contact");
  const { phones, email, whatsappNumber } = await getContactDetails();

  const channels = [
    {
      icon: Phone,
      title: t("phoneTitle"),
      body: t("phoneBody"),
      links: phones.map((phone) => ({
        label: phone,
        href: telHref(phone),
        external: false,
      })),
    },
    {
      icon: Mail,
      title: t("emailTitle"),
      body: t("emailBody"),
      links: [{ label: email, href: `mailto:${email}`, external: false }],
    },
    {
      icon: MessageCircle,
      title: t("whatsappTitle"),
      body: t("whatsappBody"),
      links: [
        {
          label: t("whatsappCta"),
          href: whatsappNumber ? `https://wa.me/${whatsappNumber}` : "https://wa.me/",
          external: true,
        },
      ],
    },
  ];

  return (
    <>
      <section className="relative isolate overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 -z-10 bg-[radial-gradient(48rem_30rem_at_85%_-15%,rgb(56_152_139/0.14),transparent_62%),radial-gradient(38rem_24rem_at_-8%_110%,rgb(208_145_62/0.1),transparent_62%)]"
        />
        <div aria-hidden className="bg-noise absolute inset-0 -z-10 opacity-[0.04]" />

        <div className="mx-auto w-full max-w-6xl px-4 pt-20 pb-6 sm:px-6 sm:pt-28">
          <p className="animate-rise text-xs font-semibold tracking-[0.22em] uppercase text-brand-600 dark:text-brand-400">
            {t("eyebrow")}
          </p>
          <h1 className="animate-rise mt-4 max-w-3xl font-display text-4xl font-semibold tracking-[-0.03em] text-foreground [animation-delay:100ms] sm:text-5xl">
            {t("title")}
          </h1>
          <p className="animate-rise mt-5 max-w-2xl text-base text-muted-foreground [animation-delay:200ms]">
            {t("description")}
          </p>
        </div>

        <div className="mx-auto grid w-full max-w-6xl items-start gap-8 px-4 py-14 sm:px-6 lg:grid-cols-[minmax(0,0.85fr)_minmax(0,1.15fr)] lg:gap-12">
          <ul className="animate-rise flex flex-col gap-4 [animation-delay:300ms]">
            {channels.map((channel) => (
              <li
                key={channel.title}
                className="group rounded-2xl border border-border/60 bg-surface/40 p-6 shadow-elevated backdrop-blur-md transition-transform duration-300 ease-spring hover:-translate-y-1"
              >
                <span className="inline-flex h-11 w-11 items-center justify-center rounded-xl bg-brand-600/10 text-brand-700 transition-transform duration-300 ease-spring group-hover:scale-110 dark:bg-brand-400/10 dark:text-brand-300">
                  <channel.icon className="h-5 w-5" />
                </span>
                <h2 className="mt-4 font-display text-lg font-semibold tracking-[-0.01em] text-foreground">
                  {channel.title}
                </h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  {channel.body}
                </p>
                <div className="mt-4 flex flex-col items-start gap-1.5">
                  {channel.links.map((link) => (
                    <a
                      key={link.href}
                      href={link.href}
                      {...(link.external
                        ? { target: "_blank", rel: "noopener noreferrer" }
                        : {})}
                      className="rounded-sm text-sm font-semibold text-brand-700 underline-offset-4 hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500 active:opacity-80 dark:text-brand-300"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              </li>
            ))}
          </ul>

          <div className="animate-rise rounded-2xl border border-border/60 bg-surface/40 p-6 shadow-elevated backdrop-blur-md [animation-delay:350ms] sm:p-8">
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
