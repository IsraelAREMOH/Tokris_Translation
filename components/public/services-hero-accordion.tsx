"use client";

import Image from "next/image";
import { useState } from "react";

export type ServiceHeroPanel = {
  key: string;
  title: string;
  image: string;
};

/**
 * Hero image accordion: one panel is always expanded; hover, focus, or tap
 * moves the selection. Collapsed panels show a vertical label. Panels animate
 * flex-grow — the same deliberate exception to the transform/opacity-only
 * motion rule as the industry gallery, for the same reason: an expanding
 * panel cannot be expressed with transforms without distorting the imagery.
 * On screens below lg it falls back to an equal-width snap carousel.
 */
export function ServicesHeroAccordion({
  panels,
}: {
  panels: ServiceHeroPanel[];
}) {
  const [active, setActive] = useState(0);

  return (
    <ul className="flex w-full snap-x snap-mandatory gap-2 overflow-x-auto overscroll-x-contain pb-4 lg:h-104 lg:snap-none lg:overflow-visible lg:pb-0">
      {panels.map((panel, index) => {
        const isActive = index === active;

        return (
          <li
            key={panel.key}
            className={`relative h-64 w-32 shrink-0 snap-center overflow-hidden rounded-2xl shadow-elevated sm:h-80 sm:w-40 lg:h-auto lg:w-auto lg:min-w-14 lg:shrink lg:basis-0 lg:transition-[flex-grow] lg:duration-500 lg:ease-spring ${
              isActive ? "lg:grow-[5]" : "lg:grow"
            }`}
          >
            <button
              type="button"
              aria-pressed={isActive}
              onMouseEnter={() => setActive(index)}
              onFocus={() => setActive(index)}
              onClick={() => setActive(index)}
              className="group absolute inset-0 cursor-pointer text-left focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-white"
            >
              <Image
                src={panel.image}
                alt={panel.title}
                fill
                sizes="(min-width: 1024px) 24rem, 9rem"
                className="object-cover"
              />
              <span
                aria-hidden
                className="absolute inset-0 bg-brand-800/40 mix-blend-multiply"
              />
              <span
                aria-hidden
                className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent"
              />

              {/* Horizontal caption: always on mobile, active panel on lg */}
              <span
                className={`absolute inset-x-0 bottom-0 p-4 font-display text-base font-semibold tracking-[-0.01em] text-white transition-opacity duration-300 lg:p-5 lg:text-xl ${
                  isActive ? "lg:opacity-100" : "lg:opacity-0"
                }`}
              >
                {panel.title}
              </span>

              {/* Vertical label for collapsed panels, desktop only */}
              <span
                aria-hidden
                className={`absolute bottom-5 left-1/2 hidden -translate-x-1/2 rotate-180 font-display text-sm font-semibold tracking-[0.02em] whitespace-nowrap text-white/90 transition-opacity duration-300 [writing-mode:vertical-rl] lg:block ${
                  isActive ? "opacity-0" : "opacity-100"
                }`}
              >
                {panel.title}
              </span>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
