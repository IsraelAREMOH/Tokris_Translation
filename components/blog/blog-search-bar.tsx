"use client";

import { Search } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useRef } from "react";

import { usePathname, useRouter } from "@/i18n/navigation";

/** Same debounced/URL-param/key-remount pattern as the admin SearchInput
 * (components/admin/search-input.tsx), styled for the public site. */
export function BlogSearchBar({ placeholder }: { placeholder: string }) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentValue = searchParams.get("q") ?? "";
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleChange(next: string) {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      const query: Record<string, string> = {};
      searchParams.forEach((value, key) => {
        if (key !== "q" && key !== "page") query[key] = value;
      });
      if (next) query.q = next;

      router.push(Object.keys(query).length > 0 ? { pathname, query } : pathname, {
        scroll: false,
      });
    }, 350);
  }

  return (
    <div className="relative w-full max-w-md">
      <Search className="pointer-events-none absolute top-1/2 left-4 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        key={currentValue}
        type="search"
        defaultValue={currentValue}
        onChange={(event) => handleChange(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full rounded-full border border-border bg-surface py-3 pr-4 pl-11 text-sm text-foreground shadow-elevated placeholder:text-muted-foreground/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
      />
    </div>
  );
}
