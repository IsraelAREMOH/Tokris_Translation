import Image from "next/image";

const SIZES = {
  md: { wrapper: "h-9 w-13", image: "h-9 w-13" },
  lg: { wrapper: "h-11 w-16", image: "h-11 w-16" },
} as const;

/**
 * Crisp national flag chip sourced from flagcdn.com (w80/w160 PNGs, so the
 * 2x density is sharp). Languages spanning two countries (English, Portuguese,
 * Swahili) render a second flag peeking out behind the first. Decorative:
 * the adjacent language name carries the meaning, so alt stays empty.
 */
export function FlagBadge({
  codes,
  size = "md",
}: {
  codes: string[];
  size?: keyof typeof SIZES;
}) {
  const [primary, secondary] = codes;
  const s = SIZES[size];

  return (
    <span className={`relative inline-block shrink-0 ${s.wrapper}`} aria-hidden>
      {secondary ? (
        <Image
          src={`https://flagcdn.com/w80/${secondary}.png`}
          alt=""
          width={80}
          height={60}
          className={`absolute -right-1.5 -bottom-1.5 rounded-md object-cover opacity-90 shadow-elevated ring-1 ring-black/10 dark:ring-white/10 ${s.image}`}
        />
      ) : null}
      <Image
        src={`https://flagcdn.com/w80/${primary}.png`}
        alt=""
        width={80}
        height={60}
        className={`relative rounded-md object-cover shadow-elevated ring-1 ring-black/10 dark:ring-white/10 ${s.image}`}
      />
    </span>
  );
}
