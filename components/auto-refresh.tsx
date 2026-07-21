"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";

/**
 * Re-fetches the surrounding server components on an interval so fresh data
 * (status changes, new messages, delivered files) appears without a manual
 * reload. Ticks are skipped while the tab is hidden, and one fires as soon as
 * the tab becomes visible again. router.refresh() preserves client state, so
 * a half-typed message survives every refresh.
 */
export function AutoRefresh({ intervalMs = 8000 }: { intervalMs?: number }) {
  const router = useRouter();

  useEffect(() => {
    const tick = () => {
      if (document.visibilityState === "visible") router.refresh();
    };

    const id = setInterval(tick, intervalMs);
    document.addEventListener("visibilitychange", tick);
    return () => {
      clearInterval(id);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [router, intervalMs]);

  return null;
}
