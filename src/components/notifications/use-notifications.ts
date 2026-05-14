"use client";

import { useEffect } from "react";
import { create } from "zustand";
import type { AppNotification } from "@/modules/notifications/types";
import {
  markNotificationReadAction,
  markAllNotificationsReadAction,
} from "@/components/notifications/actions";

const POLL_MS = 25_000;

interface NotificationsStore {
  items: AppNotification[] | null;
  refresh: () => Promise<void>;
  markRead: (id: string) => void;
  markAllRead: () => void;
}

// A single module-level store shared by every consumer — the header bell
// dropdown and the full-page list read the same state, so marking something
// read in one place updates the unread badge everywhere instantly. (Before,
// each component had its own useState, which is why reading on the
// notifications page never cleared the bell count.)
const useStore = create<NotificationsStore>((set, get) => ({
  items: null,
  refresh: async () => {
    try {
      const res = await fetch("/api/notifications", { cache: "no-store" });
      if (!res.ok) {
        // 401 (signed out) or a transient error — show a calm empty state.
        set({ items: [] });
        return;
      }
      const data = (await res.json()) as { items: AppNotification[] };
      set({ items: data.items ?? [] });
    } catch {
      // Network blip — keep whatever we had rather than flashing empty.
      if (get().items === null) set({ items: [] });
    }
  },
  // Optimistic: flip the row locally so the badge updates immediately, then
  // persist. A failed server write is corrected on the next poll.
  markRead: (id) => {
    set((s) => ({
      items:
        s.items?.map((n) => (n.id === id ? { ...n, read: true } : n)) ??
        s.items,
    }));
    void markNotificationReadAction(id);
  },
  markAllRead: () => {
    set((s) => ({
      items: s.items?.map((n) => ({ ...n, read: true })) ?? s.items,
    }));
    void markAllNotificationsReadAction();
  },
}));

// Polling is started once, by the first mounted consumer, and torn down when
// the last one unmounts — so we never run two intervals against the endpoint.
let subscribers = 0;
let intervalId: number | undefined;
let onVisible: (() => void) | undefined;

function startPolling(): () => void {
  subscribers += 1;
  if (subscribers === 1) {
    const poll = () => {
      void useStore.getState().refresh();
    };
    poll();
    intervalId = window.setInterval(() => {
      if (document.visibilityState === "visible") poll();
    }, POLL_MS);
    onVisible = () => {
      if (document.visibilityState === "visible") poll();
    };
    document.addEventListener("visibilitychange", onVisible);
  }
  return () => {
    subscribers -= 1;
    if (subscribers === 0) {
      if (intervalId !== undefined) window.clearInterval(intervalId);
      if (onVisible) document.removeEventListener("visibilitychange", onVisible);
      intervalId = undefined;
      onVisible = undefined;
    }
  };
}

interface NotificationsState {
  items: AppNotification[] | null;
  unreadCount: number;
  markRead: (id: string) => void;
  markAllRead: () => void;
}

// Polls /api/notifications on an interval (pausing while the tab is hidden)
// and exposes the shared notification state. Used by the header bell dropdown
// and the /notifications list pages.
export function useNotifications(): NotificationsState {
  const items = useStore((s) => s.items);
  const markRead = useStore((s) => s.markRead);
  const markAllRead = useStore((s) => s.markAllRead);

  useEffect(() => startPolling(), []);

  const unreadCount =
    items === null ? 0 : items.filter((n) => !n.read).length;

  return { items, unreadCount, markRead, markAllRead };
}
