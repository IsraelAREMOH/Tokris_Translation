"use client";

import { Search } from "lucide-react";
import { useSearchParams } from "next/navigation";
import { useRef } from "react";

import { usePathname, useRouter } from "@/i18n/navigation";

/**
 * Debounced, URL-param-driven search box — updates `?q=` (resetting `?page=`)
 * so search is shareable/back-button-friendly, matching the rest of the
 * console's search-param-driven filters (see /admin/projects?status=).
 * Uncontrolled + keyed on the current param value (like StatusSelect's
 * `key={currentStatus}`) instead of syncing via effect, so typing doesn't
 * fight an external state sync.
 */
export function SearchInput({
  paramName = "q",
  placeholder = "Search…",
}: {
  paramName?: string;
  placeholder?: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const currentValue = searchParams.get(paramName) ?? "";
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  function handleChange(next: string) {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);

    timeoutRef.current = setTimeout(() => {
      const query: Record<string, string> = {};
      searchParams.forEach((paramValue, key) => {
        if (key !== paramName && key !== "page") query[key] = paramValue;
      });
      if (next) query[paramName] = next;

      router.replace(
        Object.keys(query).length > 0 ? { pathname, query } : pathname,
        { scroll: false },
      );
    }, 350);
  }

  return (
    <div className="relative w-full max-w-xs">
      <Search className="pointer-events-none absolute top-1/2 left-3.5 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
      <input
        key={currentValue}
        type="search"
        defaultValue={currentValue}
        onChange={(event) => handleChange(event.target.value)}
        placeholder={placeholder}
        aria-label={placeholder}
        className="w-full rounded-full border border-border bg-background py-2.5 pr-4 pl-10 text-sm text-foreground placeholder:text-muted-foreground/70 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-500"
      />
    </div>
  );
}
