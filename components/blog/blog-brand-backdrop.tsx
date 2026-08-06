import Image from "next/image";

/**
 * Decorative brand wash — two brand/accent radial blobs, a faint watermark
 * of the wordmark, and a grain layer — reused behind every top-of-page blog
 * surface (landing, category/tag archives, article, 404) so the brand reads
 * consistently without repeating a logo on every card. Purely `aria-hidden`;
 * never affects layout, since it's absolutely positioned behind `-z-10`.
 * Caller is responsible for a `relative isolate overflow-hidden` ancestor.
 */
const SIZES = {
  hero: {
    wrap: "h-[36rem]",
    brand: "-top-40 right-[-14%] h-[38rem] w-[38rem]",
    accent: "top-16 left-[-18%] h-[28rem] w-[28rem]",
    logo: "top-[-7rem] right-[-5rem] h-[32rem] w-[32rem]",
  },
  compact: {
    wrap: "h-[24rem]",
    brand: "-top-28 right-[-12%] h-[24rem] w-[24rem]",
    accent: "top-6 left-[-14%] h-[18rem] w-[18rem]",
    logo: "top-[-4rem] right-[-3rem] h-[18rem] w-[18rem]",
  },
} as const;

export function BlogBrandBackdrop({ size = "hero" }: { size?: keyof typeof SIZES }) {
  const s = SIZES[size];

  return (
    <div aria-hidden className={`pointer-events-none absolute inset-x-0 top-0 -z-10 ${s.wrap} overflow-hidden`}>
      <div
        className={`absolute rounded-full bg-[radial-gradient(closest-side,rgb(56_152_139/0.22),transparent_70%)] blur-2xl ${s.brand}`}
      />
      <div
        className={`absolute rounded-full bg-[radial-gradient(closest-side,rgb(208_145_62/0.14),transparent_70%)] blur-2xl ${s.accent}`}
      />
      <Image
        src="/images/brand/logo.png"
        alt=""
        width={1139}
        height={1062}
        className={`absolute object-contain opacity-[0.07] dark:opacity-[0.1] ${s.logo}`}
      />
      <div className="bg-noise absolute inset-0 opacity-[0.04]" />
    </div>
  );
}
