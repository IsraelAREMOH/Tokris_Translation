"use client";

import type { CSSProperties, ElementType, ReactNode } from "react";

import { useInView } from "@/hooks/use-in-view";

/** Plays the existing `rise` entrance animation once an element scrolls into view. */
export function Reveal({
  as = "div",
  delay = 0,
  className = "",
  children,
}: {
  as?: ElementType;
  delay?: number;
  className?: string;
  children: ReactNode;
}) {
  // Dynamic tag: intrinsic element props vary per tag, so a plain union of
  // possible `as` values isn't worth modeling for a handful of call sites.
  const Component = as as "div";
  const { ref, inView } = useInView<HTMLElement>();
  const style: CSSProperties | undefined =
    inView && delay ? { animationDelay: `${delay}ms` } : undefined;

  return (
    <Component
      // The real node's tag varies by `as`; IntersectionObserver only needs
      // an Element, so the stricter per-tag ref type isn't worth matching.
      ref={ref as never}
      className={`${inView ? "animate-rise" : "opacity-0"} ${className}`.trim()}
      style={style}
    >
      {children}
    </Component>
  );
}
