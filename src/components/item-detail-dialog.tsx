"use client";

import Image from "next/image";
import { useEffect, useMemo, useRef, useState } from "react";
import { Minus, Plus } from "lucide-react";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import type { AddonGroup, AddonOption, MenuItem } from "@/modules/menu";
import { useCart, type CartLineAddon } from "@/modules/cart";
import { formatNaira } from "@/lib/format";
import { cn } from "@/lib/utils";

interface SelectionState {
  // groupId -> Set of optionIds
  [groupId: string]: Set<string>;
}

function buildInitialSelection(groups: AddonGroup[]): SelectionState {
  const out: SelectionState = {};
  for (const g of groups) {
    if (g.kind === "single" && g.required && g.options.length > 0) {
      out[g.id] = new Set([g.options[0].id]);
    } else {
      out[g.id] = new Set();
    }
  }
  return out;
}

export function ItemDetailDialog({
  item,
  open,
  onOpenChange,
}: {
  item: MenuItem;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const groups = useMemo(() => item.addonGroups ?? [], [item.addonGroups]);
  const [selection, setSelection] = useState<SelectionState>(() => buildInitialSelection(groups));
  const [quantity, setQuantity] = useState(1);
  const [notes, setNotes] = useState("");

  const addLine = useCart((s) => s.addLine);
  const openCart = useCart((s) => s.openCart);

  // Reset state when opening for a fresh item. lastResetKey tracks the
  // (open, itemId) pair so the reset only fires on transitions, not on
  // every render — preventing the cascading-render concern the lint rule
  // is normally guarding against.
  const lastResetKey = useRef<string>("");
  useEffect(() => {
    const key = `${open ? "open" : "closed"}:${item.id}`;
    if (key === lastResetKey.current) return;
    lastResetKey.current = key;
    if (open) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setSelection(buildInitialSelection(groups));
      setQuantity(1);
      setNotes("");
    }
  }, [open, item.id, groups]);

  const selectedAddons = useMemo<CartLineAddon[]>(() => {
    const out: CartLineAddon[] = [];
    for (const g of groups) {
      const ids = selection[g.id];
      if (!ids) continue;
      for (const opt of g.options) {
        if (ids.has(opt.id)) {
          out.push({
            groupId: g.id,
            optionId: opt.id,
            name: opt.name,
            priceDelta: opt.priceDelta,
          });
        }
      }
    }
    return out;
  }, [selection, groups]);

  const addonTotal = selectedAddons.reduce((sum, a) => sum + a.priceDelta, 0);
  const lineTotal = (item.price + addonTotal) * quantity;

  const validationErrors = useMemo(() => {
    const errs: string[] = [];
    for (const g of groups) {
      const ids = selection[g.id];
      const count = ids?.size ?? 0;
      if (g.required && count < 1) {
        errs.push(`Select your ${g.label.toLowerCase()}`);
      }
      if (g.kind === "multiple" && g.max && count > g.max) {
        errs.push(`Choose up to ${g.max} ${g.label.toLowerCase()}`);
      }
    }
    return errs;
  }, [selection, groups]);

  const toggle = (group: AddonGroup, opt: AddonOption) => {
    setSelection((prev) => {
      const cur = new Set(prev[group.id]);
      if (group.kind === "single") {
        cur.clear();
        cur.add(opt.id);
      } else {
        if (cur.has(opt.id)) cur.delete(opt.id);
        else if (!group.max || cur.size < group.max) cur.add(opt.id);
      }
      return { ...prev, [group.id]: cur };
    });
  };

  const handleAdd = () => {
    if (validationErrors.length > 0) return;
    addLine({
      itemId: item.id,
      name: item.name,
      imageUrl: item.imageUrl,
      unitPrice: item.price,
      quantity,
      addons: selectedAddons,
      notes: notes.trim() || undefined,
    });
    toast.success(`${item.name} added`, {
      action: { label: "View cart", onClick: openCart },
    });
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[92vh] gap-0 overflow-hidden p-0 sm:max-w-2xl">
        <div className="grid max-h-[92vh] grid-rows-[auto_1fr_auto] sm:max-h-[88vh]">
          <div className="relative aspect-[16/9] w-full bg-platinum-100 sm:aspect-[2/1]">
            <Image
              src={item.imageUrl}
              alt={item.name}
              fill
              sizes="(max-width: 640px) 100vw, 640px"
              className="object-cover"
            />
            <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 via-black/10 to-transparent p-6 text-white">
              <DialogTitle className="font-display text-3xl leading-tight">
                {item.name}
              </DialogTitle>
              <p className="mt-1 text-sm text-white/85">
                ~ {item.prepMinutes} min · {formatNaira(item.price)}
              </p>
            </div>
          </div>

          <div className="overflow-y-auto px-6 py-5 sm:px-7">
            <DialogDescription className="text-base leading-relaxed text-foreground/80">
              {item.description}
            </DialogDescription>

            {groups.length > 0 ? (
              <div className="mt-6 space-y-7">
                {groups.map((g) => (
                  <AddonGroupSection
                    key={g.id}
                    group={g}
                    selectedIds={selection[g.id] ?? new Set()}
                    onToggle={toggle}
                  />
                ))}
              </div>
            ) : null}

            {item.notesEnabled !== false ? (
              <div className="mt-7 space-y-2">
                <Label htmlFor="notes" className="text-sm font-medium">
                  Notes for the kitchen
                </Label>
                <Textarea
                  id="notes"
                  placeholder={
                    item.notesPlaceholder?.trim() || "No onions, extra crispy, etc."
                  }
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  className="resize-none border-platinum-200 bg-platinum-50"
                  rows={2}
                />
              </div>
            ) : null}
          </div>

          <div className="border-t border-platinum-200 bg-platinum-50/60 px-6 py-4 sm:px-7">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <QtyStepper value={quantity} onChange={setQuantity} />
              <Button
                size="lg"
                className="h-12 flex-1 min-w-[14rem] rounded-full text-base font-medium shadow-lg shadow-primary/15"
                onClick={handleAdd}
                disabled={validationErrors.length > 0 || !item.available}
              >
                {validationErrors.length > 0
                  ? validationErrors[0]
                  : `Add to basket · ${formatNaira(lineTotal)}`}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

function AddonGroupSection({
  group,
  selectedIds,
  onToggle,
}: {
  group: AddonGroup;
  selectedIds: Set<string>;
  onToggle: (g: AddonGroup, o: AddonOption) => void;
}) {
  return (
    <section>
      <header className="flex items-center justify-between">
        <h4 className="font-display text-lg">{group.label}</h4>
        <span className="text-xs uppercase tracking-wider text-muted-foreground">
          {group.required
            ? "Required"
            : group.max
              ? `Up to ${group.max}`
              : "Optional"}
        </span>
      </header>

      <div className="mt-3 grid gap-2">
        {group.options.map((opt) => {
          const active = selectedIds.has(opt.id);
          return (
            <button
              key={opt.id}
              type="button"
              onClick={() => onToggle(group, opt)}
              className={cn(
                "flex items-center justify-between rounded-xl border bg-card px-4 py-3 text-left transition-all",
                active
                  ? "border-primary bg-accent/40 ring-2 ring-primary/15"
                  : "border-platinum-200 hover:border-platinum-300 hover:bg-platinum-50",
              )}
            >
              <div className="flex items-center gap-3">
                <span
                  className={cn(
                    "grid h-5 w-5 place-items-center transition-colors",
                    group.kind === "single" ? "rounded-full" : "rounded-md",
                    active
                      ? "border-2 border-primary bg-primary"
                      : "border border-platinum-300 bg-card",
                  )}
                >
                  {active ? (
                    group.kind === "single" ? (
                      <span className="h-1.5 w-1.5 rounded-full bg-primary-foreground" />
                    ) : (
                      <svg className="h-3 w-3 text-primary-foreground" viewBox="0 0 12 12" fill="none">
                        <path d="M2 6.5L4.5 9L10 3.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    )
                  ) : null}
                </span>
                <span className="font-medium">{opt.name}</span>
              </div>
              {opt.priceDelta > 0 ? (
                <span className="text-sm tabular-nums text-muted-foreground">
                  +{formatNaira(opt.priceDelta)}
                </span>
              ) : null}
            </button>
          );
        })}
      </div>
    </section>
  );
}

function QtyStepper({
  value,
  onChange,
}: {
  value: number;
  onChange: (n: number) => void;
}) {
  return (
    <div className="inline-flex items-center rounded-full border border-platinum-200 bg-card">
      <button
        type="button"
        onClick={() => onChange(Math.max(1, value - 1))}
        className="grid h-11 w-11 place-items-center rounded-full text-foreground/70 transition-colors hover:bg-accent hover:text-foreground"
        aria-label="Decrease quantity"
      >
        <Minus className="h-4 w-4" />
      </button>
      <span className="w-8 text-center font-medium tabular-nums">{value}</span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        className="grid h-11 w-11 place-items-center rounded-full text-foreground/70 transition-colors hover:bg-accent hover:text-foreground"
        aria-label="Increase quantity"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}
