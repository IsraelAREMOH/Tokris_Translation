import Image from "next/image";
import { getTranslations } from "next-intl/server";

import { Link } from "@/i18n/navigation";

const PANELS = [
  {
    key: "1",
    image:
      "https://images.unsplash.com/photo-1589829545856-d10d557cf95f?q=80&w=1200&auto=format&fit=crop",
  },
  {
    key: "2",
    image:
      "https://images.unsplash.com/photo-1576091160399-112ba8d25d1d?q=80&w=1200&auto=format&fit=crop",
  },
  {
    key: "3",
    image:
      "https://images.unsplash.com/photo-1541339907198-e08756dedf3f?q=80&w=1200&auto=format&fit=crop",
  },
  {
    key: "4",
    image:
      "https://images.unsplash.com/photo-1529107386315-e1a2ed48a620?q=80&w=1200&auto=format&fit=crop",
  },
  {
    key: "5",
    image:
      "https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?q=80&w=1200&auto=format&fit=crop",
  },
  {
    key: "6",
    image:
      "https://images.unsplash.com/photo-1518770660439-4636190af475?q=80&w=1200&auto=format&fit=crop",
  },
] as const;

/**
 * Industry gallery — a snap-scroll carousel on touch screens that becomes a
 * hover-expanding panel row on desktop. Panels animate flex-grow, the one
 * deliberate exception to the transform/opacity-only motion rule: the
 * expand-on-hover layout cannot be expressed with transforms without
 * distorting the imagery.
 */
export async function IndustryGallery() {
  const t = await getTranslations("home.industriesSection");

  return (
    <ul className="flex snap-x snap-mandatory gap-3 overflow-x-auto pb-4 lg:h-96 lg:snap-none lg:overflow-visible lg:pb-0">
      {PANELS.map((panel) => (
        <li
          key={panel.key}
          className="group relative h-80 w-64 shrink-0 snap-center overflow-hidden rounded-2xl shadow-elevated lg:h-auto lg:w-auto lg:min-w-0 lg:shrink lg:grow lg:basis-0 lg:transition-[flex-grow] lg:duration-500 lg:ease-spring lg:hover:grow-[2.8] lg:focus-within:grow-[2.8]"
        >
          <Image
            src={panel.image}
            alt={t(`i${panel.key}Alt`)}
            fill
            sizes="(min-width: 1024px) 26rem, 16rem"
            className="object-cover transition-transform duration-700 ease-out group-hover:scale-105"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-brand-800/40 mix-blend-multiply"
          />
          <div
            aria-hidden
            className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/15 to-transparent"
          />
          <Link
            href="/services"
            className="absolute inset-0 z-10 flex flex-col justify-end p-5 focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-white active:opacity-90"
          >
            <h3 className="font-display text-xl font-semibold tracking-[-0.01em] text-white">
              {t(`i${panel.key}Name`)}
            </h3>
            <p className="mt-1 max-w-xs text-sm text-white/85 lg:translate-y-2 lg:opacity-0 lg:transition-[transform,opacity] lg:duration-300 lg:ease-spring lg:group-focus-within:translate-y-0 lg:group-focus-within:opacity-100 lg:group-hover:translate-y-0 lg:group-hover:opacity-100">
              {t(`i${panel.key}Body`)}
            </p>
          </Link>
        </li>
      ))}
    </ul>
  );
}
