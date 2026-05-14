"use client";

import { useCallback, useEffect, useState } from "react";
import type { AppNotification } from "@/modules/notifications/types";

const POLL_MS = 25_000;

interface NotificationsState {
  items: AppNotification[] | null;
  unreadCount: number;
  refresh: () => Promise<void>;
  setItems: React.Dispatch<React.SetStateAction<AppNotification[] | null>>;
}

// Polls /api/notifications on an interval, pausing while the tab is hidden so
// a backgrounded tab isn't hammering the server. Shared by the bell (cares
// about the count) and the list pages (care about the items).
export function useNotifications(): NotificationsState {
  const [items, setItems] = useState<AppNotification[] | null>(null);
  const [unreadCount, setUnreadCount] = useState(0);

  const refresh = useCallback(async () => {
    try {
      const res = await fetch("/api/notifications", { cache: "no-store" });
      if (!res.ok) {
        // 401 (signed out) or a transient error — show an empty, calm state.
        setItems([]);
        setUnreadCount(0);
        return;
      }
      const data = (await res.json()) as {
        items: AppNotification[];
        unreadCount: number;
      };
      setItems(data.items ?? []);
      setUnreadCount(data.unreadCount ?? 0);
    } catch {
      setItems((prev) => prev ?? []);
    }
  }, []);

  useEffect(() => {
    // Intentional: fetch once on mount. refresh() only setState()s after an
    // awaited network round-trip, so it's not a synchronous effect update.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    refresh();
    const tick = () => {
      if (document.visibilityState === "visible") refresh();
    };
    const id = window.setInterval(tick, POLL_MS);
    document.addEventListener("visibilitychange", tick);
    return () => {
      window.clearInterval(id);
      document.removeEventListener("visibilitychange", tick);
    };
  }, [refresh]);

  // Keep the count in sync when the list is mutated locally (e.g. mark-read).
  const derivedUnread =
    items === null ? unreadCount : items.filter((n) => !n.read).length;

  return { items, unreadCount: derivedUnread, refresh, setItems };
}
