import type { ComponentType, SVGProps } from "react";

import {
  FacebookIcon,
  InstagramIcon,
  TiktokIcon,
  XIcon,
  YoutubeIcon,
} from "@/components/icons/social-icons";

export type SocialLink = {
  /** Platform name — a proper noun, so it's the same in every locale (see
   * components/content/share-buttons.tsx for the same convention). */
  name: string;
  href: string;
  icon: ComponentType<SVGProps<SVGSVGElement>>;
};

// Single source of truth for the company's official profiles — update here
// and every placement (footer, contact page, homepage, blog) follows.
export const SOCIAL_LINKS: SocialLink[] = [
  { name: "Facebook", href: "https://facebook.com", icon: FacebookIcon },
  { name: "Instagram", href: "https://instagram.com", icon: InstagramIcon },
  { name: "YouTube", href: "https://youtube.com", icon: YoutubeIcon },
  { name: "X", href: "https://x.com/TokrisGlobal", icon: XIcon },
  { name: "TikTok", href: "https://tiktok.com/@TokrisGlobal", icon: TiktokIcon },
];
