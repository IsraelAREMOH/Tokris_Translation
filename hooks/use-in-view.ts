"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Fires once when the element first enters the viewport, so scroll-triggered
 * reveals only play forward (no re-trigger on scroll-back). Reduced-motion
 * users and browsers without IntersectionObserver get inView=true immediately
 * — the `rise` keyframe itself is already neutralized for them in globals.css.
 */
export function useInView<T extends Element = HTMLElement>(
  rootMargin = "0px 0px -10% 0px",
) {
  const ref = useRef<T | null>(null);
  const [inView, setInView] = useState(false);

  useEffect(() => {
    const node = ref.current;
    if (!node) return;

    const reduceMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (typeof IntersectionObserver === "undefined" || reduceMotion) {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.disconnect();
        }
      },
      { rootMargin, threshold: 0.15 },
    );

    observer.observe(node);
    return () => observer.disconnect();
  }, [rootMargin]);

  return { ref, inView };
}
