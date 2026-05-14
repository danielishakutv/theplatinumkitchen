"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { Minus, Plus, Trash2, ShoppingBag, Bike, Store, Utensils } from "lucide-react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Textarea } from "@/components/ui/textarea";
import { useCart, useCartTotals, lineUnitTotal, type FulfilmentMethod } from "@/modules/cart";
import { formatNaira } from "@/lib/format";
import { cn } from "@/lib/utils";

const FULFILMENTS: { value: FulfilmentMethod; label: string; helper: string; Icon: typeof Bike }[] = [
  { value: "delivery", label: "Delivery", helper: "Across Abuja", Icon: Bike },
  { value: "pickup", label: "Pickup", helper: "From Wuse 2", Icon: Store },
  { value: "dine_in", label: "Dine in", helper: "At our table", Icon: Utensils },
];

export function CartDrawer() {
  const open = useCart((s) => s.open);
  const setOpen = useCart((s) => s.setOpen);
  const lines = useCart((s) => s.lines);
  const setQuantity = useCart((s) => s.setQuantity);
  const removeLine = useCart((s) => s.removeLine);
  const setNotes = useCart((s) => s.setNotes);
  const fulfilment = useCart((s) => s.fulfilment);
  const setFulfilment = useCart((s) => s.setFulfilment);
  const totals = useCartTotals();
  const router = useRouter();

  return (
    <Sheet open={open} onOpenChange={setOpen}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 sm:max-w-md"
      >
        <SheetHeader className="border-b border-platinum-200 px-6 py-5">
          <SheetTitle className="font-display text-2xl">Your basket</SheetTitle>
          <SheetDescription>
            Review your items, choose how you want it, and we&apos;ll get cooking.
          </SheetDescription>
        </SheetHeader>

        {lines.length === 0 ? (
          <EmptyState onClose={() => setOpen(false)} />
        ) : (
          <>
            <div className="flex-1 overflow-y-auto px-6 py-5 space-y-5">
              <div className="space-y-2">
                <p className="text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                  How would you like it
                </p>
                <div className="grid grid-cols-3 gap-2">
                  {FULFILMENTS.map(({ value, label, helper, Icon }) => {
                    const active = fulfilment === value;
                    return (
                      <button
                        key={value}
                        type="button"
                        onClick={() => setFulfilment(value)}
                        className={cn(
                          "group flex flex-col items-center gap-1.5 rounded-xl border bg-card p-3 text-center transition-all",
                          active
                            ? "border-primary bg-accent/40 shadow-sm ring-2 ring-primary/15"
                            : "border-platinum-200 hover:border-platinum-300 hover:bg-platinum-50",
                        )}
                      >
                        <Icon
                          className={cn(
                            "h-4 w-4",
                            active ? "text-primary" : "text-muted-foreground",
                          )}
                        />
                        <span
                          className={cn(
                            "text-sm font-medium",
                            active ? "text-foreground" : "text-foreground/80",
                          )}
                        >
                          {label}
                        </span>
                        <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                          {helper}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              <Separator />

              <ul className="space-y-5">
                {lines.map((line) => {
                  const unit = lineUnitTotal(line);
                  return (
                    <li key={line.id} className="group flex gap-3.5">
                      <div className="relative h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-platinum-100">
                        <Image
                          src={line.imageUrl}
                          alt={line.name}
                          fill
                          sizes="80px"
                          className="object-cover"
                        />
                      </div>
                      <div className="flex flex-1 flex-col">
                        <div className="flex items-start justify-between gap-2">
                          <div>
                            <p className="font-medium leading-tight">{line.name}</p>
                            {line.addons.length > 0 ? (
                              <p className="mt-0.5 text-xs text-muted-foreground">
                                {line.addons.map((a) => a.name).join(" · ")}
                              </p>
                            ) : null}
                          </div>
                          <button
                            type="button"
                            onClick={() => removeLine(line.id)}
                            className="rounded-full p-1 text-muted-foreground opacity-0 transition-opacity hover:bg-destructive/10 hover:text-destructive group-hover:opacity-100"
                            aria-label="Remove item"
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </button>
                        </div>
                        <div className="mt-2 flex items-center justify-between">
                          <QuantityStepper
                            value={line.quantity}
                            onChange={(q) => setQuantity(line.id, q)}
                          />
                          <span className="text-sm font-semibold tabular-nums">
                            {formatNaira(unit * line.quantity)}
                          </span>
                        </div>
                        {line.notes !== undefined ? (
                          <Textarea
                            value={line.notes ?? ""}
                            onChange={(e) => setNotes(line.id, e.target.value)}
                            placeholder="Note for kitchen (e.g. no onions)"
                            rows={2}
                            className="mt-2 resize-none border-platinum-200 bg-platinum-50 text-xs"
                          />
                        ) : (
                          <button
                            type="button"
                            onClick={() => setNotes(line.id, "")}
                            className="mt-1.5 self-start text-xs text-primary hover:underline"
                          >
                            Add a note for the kitchen
                          </button>
                        )}
                      </div>
                    </li>
                  );
                })}
              </ul>
            </div>

            <div className="border-t border-platinum-200 bg-platinum-50/50 px-6 py-5">
              <dl className="space-y-2 text-sm">
                <Row label="Subtotal" value={formatNaira(totals.subtotal)} />
                <Row label="Service (5%)" value={formatNaira(totals.serviceCharge)} />
                {fulfilment === "delivery" ? (
                  <Row
                    label="Delivery (Abuja metro)"
                    value={formatNaira(totals.deliveryFee)}
                  />
                ) : null}
                <Separator className="my-3" />
                <Row
                  label="Total"
                  value={formatNaira(totals.total)}
                  emphasised
                />
              </dl>
              <Button
                size="lg"
                className="mt-5 h-12 w-full rounded-full text-base font-medium shadow-lg shadow-primary/20"
                onClick={() => {
                  setOpen(false);
                  router.push("/checkout");
                }}
              >
                Checkout · {formatNaira(totals.total)}
              </Button>
              <p className="mt-3 text-center text-xs text-muted-foreground">
                Cash on Delivery available · or pay securely with Paystack
              </p>
            </div>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}

function EmptyState({ onClose }: { onClose: () => void }) {
  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-5 px-8 text-center">
      <div className="grid h-20 w-20 place-items-center rounded-full bg-accent">
        <ShoppingBag className="h-8 w-8 text-primary" />
      </div>
      <div className="space-y-1.5">
        <p className="font-display text-xl">Your basket is empty</p>
        <p className="text-sm text-muted-foreground">
          Build it dish by dish — the kitchen is ready when you are.
        </p>
      </div>
      <Button asChild className="h-11 rounded-full px-6" onClick={onClose}>
        <Link href="/menu">Browse the menu</Link>
      </Button>
    </div>
  );
}

function QuantityStepper({
  value,
  onChange,
}: {
  value: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="inline-flex items-center rounded-full border border-platinum-200 bg-card">
      <button
        type="button"
        onClick={() => onChange(Math.max(0, value - 1))}
        className="grid h-8 w-8 place-items-center rounded-full text-foreground/70 transition-colors hover:bg-accent hover:text-foreground"
        aria-label="Decrease"
      >
        <Minus className="h-3.5 w-3.5" />
      </button>
      <span className="w-7 text-center text-sm font-medium tabular-nums">{value}</span>
      <button
        type="button"
        onClick={() => onChange(value + 1)}
        className="grid h-8 w-8 place-items-center rounded-full text-foreground/70 transition-colors hover:bg-accent hover:text-foreground"
        aria-label="Increase"
      >
        <Plus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function Row({
  label,
  value,
  emphasised,
}: {
  label: string;
  value: string;
  emphasised?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <dt
        className={cn(
          "text-sm",
          emphasised ? "font-display text-base text-foreground" : "text-muted-foreground",
        )}
      >
        {label}
      </dt>
      <dd
        className={cn(
          "tabular-nums",
          emphasised ? "font-display text-lg text-foreground" : "font-medium text-foreground",
        )}
      >
        {value}
      </dd>
    </div>
  );
}
