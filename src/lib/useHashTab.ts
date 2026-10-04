"use client";

import { useCallback, useEffect, useState } from "react";

/** Tab state mirrored in the URL hash so every view has a deep link. */
export function useHashTab<T extends string>(tabs: readonly T[], fallback: T): [T, (tab: T) => void] {
  const [tab, setTabState] = useState<T>(fallback);

  useEffect(() => {
    const read = () => {
      const h = window.location.hash.slice(1) as T;
      if (tabs.includes(h)) setTabState(h);
    };
    read();
    window.addEventListener("hashchange", read);
    return () => window.removeEventListener("hashchange", read);
  }, [tabs]);

  // Keep the active tab visible in a horizontally scrolling tab bar (pocket interface).
  useEffect(() => {
    const el = document.getElementById(`tab-${tab}`);
    const bar = el?.parentElement;
    if (!el || !bar || bar.scrollWidth <= bar.clientWidth) return;
    bar.scrollLeft = Math.max(0, el.offsetLeft - bar.offsetLeft - 16);
  }, [tab]);

  const setTab = useCallback((next: T) => {
    setTabState(next);
    window.history.replaceState(window.history.state, "", `#${next}`);
  }, []);

  return [tab, setTab];
}
