"use client";

import { create } from "zustand";
import { persist, createJSONStorage } from "zustand/middleware";
import type { CartLine, CartLineAddon, FulfilmentMethod } from "./types";

const SERVICE_RATE = 0.05;
const DELIVERY_FEES: Record<FulfilmentMethod, number> = {
  delivery: 1500,
  pickup: 0,
  dine_in: 0,
};

export function lineUnitTotal(line: Pick<CartLine, "unitPrice" | "addons">): number {
  return line.unitPrice + line.addons.reduce((sum, a) => sum + a.priceDelta, 0);
}

interface CartState {
  lines: CartLine[];
  fulfilment: FulfilmentMethod;
  open: boolean;

  addLine: (line: Omit<CartLine, "id">) => void;
  removeLine: (id: string) => void;
  setQuantity: (id: string, q: number) => void;
  setNotes: (id: string, notes: string) => void;
  setFulfilment: (f: FulfilmentMethod) => void;
  clear: () => void;

  setOpen: (open: boolean) => void;
  openCart: () => void;
  closeCart: () => void;
}

const sameLine = (a: CartLine, b: Omit<CartLine, "id">) => {
  if (a.itemId !== b.itemId) return false;
  if (a.notes !== b.notes) return false;
  if (a.addons.length !== b.addons.length) return false;
  const key = (x: CartLineAddon) => `${x.groupId}:${x.optionId}`;
  const sa = a.addons.map(key).sort().join("|");
  const sb = b.addons.map(key).sort().join("|");
  return sa === sb;
};

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      lines: [],
      fulfilment: "delivery",
      open: false,

      addLine: (line) =>
        set((state) => {
          const existing = state.lines.find((l) => sameLine(l, line));
          if (existing) {
            return {
              lines: state.lines.map((l) =>
                l.id === existing.id ? { ...l, quantity: l.quantity + line.quantity } : l,
              ),
            };
          }
          const id = `cl-${Math.random().toString(36).slice(2, 10)}`;
          return { lines: [...state.lines, { ...line, id }] };
        }),

      removeLine: (id) =>
        set((state) => ({ lines: state.lines.filter((l) => l.id !== id) })),

      setQuantity: (id, q) =>
        set((state) => ({
          lines:
            q <= 0
              ? state.lines.filter((l) => l.id !== id)
              : state.lines.map((l) => (l.id === id ? { ...l, quantity: q } : l)),
        })),

      setNotes: (id, notes) =>
        set((state) => ({
          lines: state.lines.map((l) => (l.id === id ? { ...l, notes } : l)),
        })),

      setFulfilment: (f) => set({ fulfilment: f }),
      clear: () => set({ lines: [] }),

      setOpen: (open) => set({ open }),
      openCart: () => set({ open: true }),
      closeCart: () => set({ open: false }),
    }),
    {
      name: "pk-cart",
      storage: createJSONStorage(() => localStorage),
      partialize: (s) => ({ lines: s.lines, fulfilment: s.fulfilment }),
    },
  ),
);

export function useCartTotals() {
  const lines = useCart((s) => s.lines);
  const fulfilment = useCart((s) => s.fulfilment);

  const subtotal = lines.reduce((sum, l) => sum + lineUnitTotal(l) * l.quantity, 0);
  const serviceCharge = Math.round(subtotal * SERVICE_RATE);
  const deliveryFee = subtotal > 0 ? DELIVERY_FEES[fulfilment] : 0;
  const total = subtotal + serviceCharge + deliveryFee;
  const itemCount = lines.reduce((sum, l) => sum + l.quantity, 0);

  return { subtotal, serviceCharge, deliveryFee, total, itemCount };
}
