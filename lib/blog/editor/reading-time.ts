import { READING_SPEED_WPM } from "@/lib/blog/posts/constants";

/** Word count / reading speed, rounded up, minimum 1 minute. */
export function calculateReadingTime(plainText: string): number {
  const words = plainText.trim().split(/\s+/).filter(Boolean).length;
  return Math.max(1, Math.ceil(words / READING_SPEED_WPM));
}
