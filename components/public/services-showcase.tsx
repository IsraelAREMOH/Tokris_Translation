"use client";

import Image from "next/image";
import { useRef, useState } from "react";

export type ServiceShowcaseItem = {
  title: string;
  body: string;
  image: string;
  alt: string;
};

/**
 * Auto-advancing services showcase: a vertical tab list beside an image panel.
 * Timing is driven entirely by the progress rail's CSS animation — its
 * animationend event advances the slide, so pausing the animation (hover,
 * focus) or disabling it (prefers-reduced-motion, via motion-safe) also
 * pauses or stops the rotation without any JS timers.
 */
export function ServicesShowcase({
  label,
  items,
}: {
  label: string;
  items: ServiceShowcaseItem[];
}) {
  const [active, setActive] = useState(0);
  const [paused, setPaused] = useState(false);
  const tabRefs = useRef<(HTMLButtonElement | null)[]>([]);

  const select = (index: number, focus = false) => {
    const next = (index + items.length) % items.length;
    setActive(next);
    if (focus) tabRefs.current[next]?.focus();
  };

  const onTablistKeyDown = (event: React.KeyboardEvent) => {
    const moves: Record<string, number> = {
      ArrowDown: active + 1,
      ArrowRight: active + 1,
      ArrowUp: active - 1,
      ArrowLeft: active - 1,
      Home: 0,
      End: items.length - 1,
    };
    const next = moves[event.key];
    if (next !== undefined) {
      event.preventDefault();
      select(next, true);
    }
  };

  return (
    <div
      className="grid items-center gap-8 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)] lg:gap-14"
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onFocusCapture={() => setPaused(true)}
      onBlurCapture={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget)) {
          setPaused(false);
        }
      }}
    >
      <div
        role="tablist"
        aria-label={label}
        aria-orientation="vertical"
        onKeyDown={onTablistKeyDown}
      >
        {items.map((item, index) => {
          const isActive = index === active;

          return (
            <button
              key={item.title}
              ref={(el) => {
                tabRefs.current[index] = el;
              }}
              type="button"
              role="tab"
              id={`service-tab-${index}`}
              aria-selected={isActive}
              aria-controls="service-panel"
              tabIndex={isActive ? 0 : -1}
              onClick={() => select(index)}
              className="group relative flex w-full items-baseline gap-4 border-b border-border/70 px-1 py-4 text-left transition-transform duration-200 ease-spring first:border-t focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-brand-500 active:scale-[0.99]"
            >
              <span
                className={`text-xs font-semibold tracking-[0.18em] ${
                  isActive
                    ? "text-brand-600 dark:text-brand-400"
                    : "text-muted-foreground"
                }`}
              >
                {`0${index + 1}`}
              </span>
              <span
                className={`font-display text-lg font-semibold tracking-[-0.01em] sm:text-xl ${
                  isActive
                    ? "text-brand-700 dark:text-brand-300"
                    : "text-muted-foreground group-hover:text-foreground"
                }`}
              >
                {item.title}
              </span>
              <span
                aria-hidden
                className="absolute inset-x-0 bottom-[-1px] h-0.5 overflow-hidden"
              >
                {isActive && (
                  <span
                    key={active}
                    onAnimationEnd={() => select(active + 1)}
                    className={`block h-full w-full origin-left scale-x-0 bg-gradient-to-r from-brand-500 to-brand-600 motion-safe:animate-[progress-x_6s_linear_both] dark:from-brand-400 dark:to-brand-300 ${
                      paused ? "[animation-play-state:paused]" : ""
                    }`}
                  />
                )}
              </span>
            </button>
          );
        })}
      </div>

      <div
        role="tabpanel"
        id="service-panel"
        aria-labelledby={`service-tab-${active}`}
        className="relative aspect-[4/3] overflow-hidden rounded-3xl shadow-floating"
      >
        {items.map((item, index) => (
          <Image
            key={item.title}
            src={item.image}
            alt={item.alt}
            aria-hidden={index !== active}
            fill
            sizes="(min-width: 1024px) 38rem, 92vw"
            className={`object-cover transition-opacity duration-500 ${
              index === active ? "opacity-100" : "opacity-0"
            }`}
          />
        ))}
        <div
          aria-hidden
          className="absolute inset-0 bg-brand-800/30 mix-blend-multiply"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent"
        />
        <div key={active} className="animate-rise absolute inset-x-0 bottom-0 p-6 sm:p-8">
          <p className="text-xs font-semibold tracking-[0.18em] text-white/70">
            {`0${active + 1}`}
          </p>
          <h3 className="mt-1.5 font-display text-2xl font-semibold tracking-[-0.02em] text-white">
            {items[active].title}
          </h3>
          <p className="mt-2 max-w-xl text-sm leading-relaxed text-white/85">
            {items[active].body}
          </p>
        </div>
      </div>
    </div>
  );
}
