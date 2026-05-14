"use client";

import { useMemo, useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Minus, Plus, Search, Trash2, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { formatNaira } from "@/lib/format";
import { cn } from "@/lib/utils";
// Type-only imports from module leaves — never the server-only barrels.
import type { MenuItem } from "@/modules/menu/types";
import type {
  FulfilmentMethod,
  Order,
  PaymentMethod,
} from "@/modules/orders/types";
import { createOrderAction, updateOrderAction } from "./actions";

// Pricing preview only — the server re-prices the order authoritatively on
// submit. Kept in sync with SERVICE_RATE / DELIVERY_FEES in the orders
// service; if those change, update these too.
const SERVICE_RATE = 0.05;
const DELIVERY_FEE = 1500;

const FULFILMENTS: { value: FulfilmentMethod; label: string }[] = [
  { value: "delivery", label: "Delivery" },
  { value: "pickup", label: "Pickup" },
  { value: "dine_in", label: "Dine in" },
];

const PAYMENT_METHODS: { value: PaymentMethod; label: string }[] = [
  { value: "cod", label: "Cash on Delivery" },
  { value: "bank_transfer", label: "Bank Transfer" },
  { value: "paystack", label: "Pay Online" },
];

interface DraftAddon {
  groupId: string;
  optionId: string;
}

interface DraftLine {
  key: string;
  itemId: string;
  quantity: number;
  addons: DraftAddon[];
  notes: string;
}

// Builds and submits an order. With no `order` prop it's a create form
// (admin places a phone-in / walk-in order); with one it's an edit form,
// prefilled, that re-saves the order's contents.
export function OrderForm({ menu, order }: { menu: MenuItem[]; order?: Order }) {
  const router = useRouter();
  const isEdit = order !== undefined;
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const itemById = useMemo(() => new Map(menu.map((m) => [m.id, m])), [menu]);

  const [lines, setLines] = useState<DraftLine[]>(() =>
    order
      ? order.lines.map((l) => ({
          key: crypto.randomUUID(),
          itemId: l.itemId,
          quantity: l.quantity,
          addons: l.addons.map((a) => ({
            groupId: a.groupId,
            optionId: a.optionId,
          })),
          notes: l.notes ?? "",
        }))
      : [],
  );
  const [customer, setCustomer] = useState({
    name: order?.customer.name ?? "",
    phone: order?.customer.phone ?? "",
    email: order?.customer.email ?? "",
  });
  const [fulfilment, setFulfilment] = useState<FulfilmentMethod>(
    order?.fulfilment ?? "delivery",
  );
  const [address, setAddress] = useState({
    street: order?.address?.street ?? "",
    area: order?.address?.area ?? "",
    city: order?.address?.city ?? "Abuja",
    state: order?.address?.state ?? "FCT",
    landmark: order?.address?.landmark ?? "",
    instructions: order?.address?.instructions ?? "",
  });
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>(
    order?.paymentMethod ?? "cod",
  );
  const [notes, setNotes] = useState(order?.notes ?? "");
  const [search, setSearch] = useState("");

  // --- line helpers ---
  const addItem = (itemId: string) =>
    setLines((prev) => [
      ...prev,
      { key: crypto.randomUUID(), itemId, quantity: 1, addons: [], notes: "" },
    ]);
  const removeLine = (key: string) =>
    setLines((prev) => prev.filter((l) => l.key !== key));
  const setQuantity = (key: string, quantity: number) =>
    setLines((prev) =>
      prev.map((l) =>
        l.key === key
          ? { ...l, quantity: Math.min(99, Math.max(1, quantity)) }
          : l,
      ),
    );
  const setLineNotes = (key: string, value: string) =>
    setLines((prev) =>
      prev.map((l) => (l.key === key ? { ...l, notes: value } : l)),
    );
  const toggleAddon = (
    key: string,
    groupId: string,
    optionId: string,
    single: boolean,
  ) =>
    setLines((prev) =>
      prev.map((l) => {
        if (l.key !== key) return l;
        const has = l.addons.some(
          (a) => a.groupId === groupId && a.optionId === optionId,
        );
        let addons: DraftAddon[];
        if (has) {
          addons = l.addons.filter(
            (a) => !(a.groupId === groupId && a.optionId === optionId),
          );
        } else if (single) {
          // Single-choice group: the new pick replaces any other in the group.
          addons = [
            ...l.addons.filter((a) => a.groupId !== groupId),
            { groupId, optionId },
          ];
        } else {
          addons = [...l.addons, { groupId, optionId }];
        }
        return { ...l, addons };
      }),
    );

  // --- pricing preview ---
  const lineTotal = (l: DraftLine): number => {
    const item = itemById.get(l.itemId);
    if (!item) return 0;
    const addonDelta = l.addons.reduce((sum, a) => {
      const opt = item.addonGroups
        ?.find((g) => g.id === a.groupId)
        ?.options.find((o) => o.id === a.optionId);
      return sum + (opt?.priceDelta ?? 0);
    }, 0);
    return (item.price + addonDelta) * l.quantity;
  };
  const subtotal = lines.reduce((s, l) => s + lineTotal(l), 0);
  const serviceCharge = Math.round(subtotal * SERVICE_RATE);
  const deliveryFee =
    fulfilment === "delivery" && subtotal > 0 ? DELIVERY_FEE : 0;
  const total = subtotal + serviceCharge + deliveryFee;
  const itemCount = lines.reduce((s, l) => s + l.quantity, 0);

  const filteredMenu = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return menu;
    return menu.filter((m) => m.name.toLowerCase().includes(q));
  }, [menu, search]);

  // --- submit ---
  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);

    if (lines.length === 0) {
      setError("Add at least one item to the order.");
      return;
    }
    if (!customer.name.trim() || !customer.phone.trim()) {
      setError("Customer name and phone are required.");
      return;
    }
    if (
      fulfilment === "delivery" &&
      (!address.street.trim() || !address.area.trim())
    ) {
      setError("Delivery orders need at least a street and area.");
      return;
    }

    const payload = {
      lines: lines.map((l) => ({
        itemId: l.itemId,
        quantity: l.quantity,
        addons: l.addons,
        notes: l.notes.trim() || undefined,
      })),
      customer: {
        name: customer.name.trim(),
        phone: customer.phone.trim(),
        email: customer.email.trim() || undefined,
      },
      fulfilment,
      address:
        fulfilment === "delivery"
          ? {
              street: address.street.trim(),
              area: address.area.trim(),
              city: address.city.trim() || "Abuja",
              state: address.state.trim() || "FCT",
              landmark: address.landmark.trim() || undefined,
              instructions: address.instructions.trim() || undefined,
            }
          : undefined,
      paymentMethod,
      notes: notes.trim() || undefined,
    };

    start(async () => {
      if (isEdit && order) {
        const r = await updateOrderAction(order.id, payload);
        if (!r.ok) {
          setError(r.error ?? "Save failed.");
          return;
        }
        router.push(`/admin/orders/${order.id}`);
        router.refresh();
      } else {
        const r = await createOrderAction(payload);
        if (!r.ok || !r.orderId) {
          setError(r.error ?? "Could not create the order.");
          return;
        }
        router.push(`/admin/orders/${r.orderId}`);
        router.refresh();
      }
    });
  };

  return (
    <form onSubmit={submit} className="space-y-6 pb-32">
      {/* Items: menu picker + the draft cart */}
      <Section
        title="Items"
        description="Pick dishes from the menu, then set quantity and add-ons."
      >
        <div className="grid gap-5 lg:grid-cols-2">
          {/* Menu picker */}
          <div className="rounded-2xl border border-platinum-200 bg-platinum-50/50 p-3">
            <div className="relative">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="search"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                placeholder="Search the menu…"
                className="h-10 rounded-full border-platinum-200 bg-card pl-9"
                autoComplete="off"
              />
            </div>
            <div className="mt-3 max-h-80 space-y-1 overflow-y-auto pr-1">
              {filteredMenu.length === 0 ? (
                <p className="px-2 py-6 text-center text-sm text-muted-foreground">
                  No dishes match.
                </p>
              ) : (
                filteredMenu.map((m) => (
                  <button
                    key={m.id}
                    type="button"
                    onClick={() => addItem(m.id)}
                    className="flex w-full items-center gap-3 rounded-xl border border-transparent px-3 py-2 text-left transition-colors hover:border-platinum-200 hover:bg-card"
                  >
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">
                        {m.name}
                      </span>
                      <span className="text-xs text-muted-foreground">
                        {formatNaira(m.price)}
                        {m.available ? "" : " · sold out"}
                      </span>
                    </span>
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-full bg-primary text-primary-foreground">
                      <Plus className="h-4 w-4" />
                    </span>
                  </button>
                ))
              )}
            </div>
          </div>

          {/* Draft cart */}
          <div className="space-y-3">
            {lines.length === 0 ? (
              <div className="grid h-full min-h-32 place-items-center rounded-2xl border border-dashed border-platinum-300 p-6 text-center">
                <p className="text-sm text-muted-foreground">
                  No items yet. Add dishes from the menu on the left.
                </p>
              </div>
            ) : (
              lines.map((line) => (
                <LineCard
                  key={line.key}
                  line={line}
                  item={itemById.get(line.itemId)}
                  total={lineTotal(line)}
                  onRemove={() => removeLine(line.key)}
                  onQuantity={(q) => setQuantity(line.key, q)}
                  onNotes={(v) => setLineNotes(line.key, v)}
                  onToggleAddon={(g, o, single) =>
                    toggleAddon(line.key, g, o, single)
                  }
                />
              ))
            )}
          </div>
        </div>
      </Section>

      {/* Customer */}
      <Section title="Customer" description="Who the order is for.">
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Name" htmlFor="cust-name">
            <Input
              id="cust-name"
              value={customer.name}
              onChange={(e) =>
                setCustomer((c) => ({ ...c, name: e.target.value }))
              }
              className="h-11"
              maxLength={120}
            />
          </Field>
          <Field label="Phone" htmlFor="cust-phone">
            <Input
              id="cust-phone"
              value={customer.phone}
              onChange={(e) =>
                setCustomer((c) => ({ ...c, phone: e.target.value }))
              }
              className="h-11"
              inputMode="tel"
              maxLength={40}
            />
          </Field>
        </div>
        <Field
          label="Email"
          htmlFor="cust-email"
          hint="Optional. If set, the customer gets the order confirmation + tracking email."
        >
          <Input
            id="cust-email"
            type="email"
            value={customer.email}
            onChange={(e) =>
              setCustomer((c) => ({ ...c, email: e.target.value }))
            }
            className="h-11"
            maxLength={254}
          />
        </Field>
      </Section>

      {/* Fulfilment + address */}
      <Section title="Fulfilment" description="How the order gets to the customer.">
        <div className="flex flex-wrap gap-2">
          {FULFILMENTS.map((f) => (
            <Chip
              key={f.value}
              active={fulfilment === f.value}
              onClick={() => setFulfilment(f.value)}
            >
              {f.label}
            </Chip>
          ))}
        </div>

        {fulfilment === "delivery" ? (
          <div className="mt-4 space-y-4">
            <Field label="Street" htmlFor="addr-street">
              <Input
                id="addr-street"
                value={address.street}
                onChange={(e) =>
                  setAddress((a) => ({ ...a, street: e.target.value }))
                }
                className="h-11"
                maxLength={200}
              />
            </Field>
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Area" htmlFor="addr-area">
                <Input
                  id="addr-area"
                  value={address.area}
                  onChange={(e) =>
                    setAddress((a) => ({ ...a, area: e.target.value }))
                  }
                  className="h-11"
                  maxLength={120}
                />
              </Field>
              <Field label="City" htmlFor="addr-city">
                <Input
                  id="addr-city"
                  value={address.city}
                  onChange={(e) =>
                    setAddress((a) => ({ ...a, city: e.target.value }))
                  }
                  className="h-11"
                  maxLength={120}
                />
              </Field>
              <Field label="State" htmlFor="addr-state">
                <Input
                  id="addr-state"
                  value={address.state}
                  onChange={(e) =>
                    setAddress((a) => ({ ...a, state: e.target.value }))
                  }
                  className="h-11"
                  maxLength={120}
                />
              </Field>
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Landmark" htmlFor="addr-landmark">
                <Input
                  id="addr-landmark"
                  value={address.landmark}
                  onChange={(e) =>
                    setAddress((a) => ({ ...a, landmark: e.target.value }))
                  }
                  className="h-11"
                  maxLength={200}
                />
              </Field>
              <Field label="Delivery instructions" htmlFor="addr-instructions">
                <Input
                  id="addr-instructions"
                  value={address.instructions}
                  onChange={(e) =>
                    setAddress((a) => ({
                      ...a,
                      instructions: e.target.value,
                    }))
                  }
                  className="h-11"
                  maxLength={500}
                />
              </Field>
            </div>
          </div>
        ) : null}
      </Section>

      {/* Payment */}
      <Section
        title="Payment"
        description="How the customer is paying. Mark the order paid later from its detail page."
      >
        <div className="flex flex-wrap gap-2">
          {PAYMENT_METHODS.map((p) => (
            <Chip
              key={p.value}
              active={paymentMethod === p.value}
              onClick={() => setPaymentMethod(p.value)}
            >
              {p.label}
            </Chip>
          ))}
        </div>
      </Section>

      {/* Order notes */}
      <Section title="Order notes" description="Anything the kitchen should know.">
        <Textarea
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          rows={2}
          maxLength={1000}
          placeholder="e.g. customer will collect at 6pm"
        />
      </Section>

      {error ? (
        <div
          role="alert"
          className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </div>
      ) : null}

      {/* Sticky totals + submit */}
      <div className="fixed inset-x-0 bottom-0 z-20 border-t border-platinum-200 bg-background/95 backdrop-blur">
        <div className="mx-auto flex max-w-4xl flex-wrap items-center justify-between gap-3 px-4 py-3 sm:px-6">
          <dl className="flex items-center gap-4 text-sm">
            <div className="flex items-baseline gap-1.5">
              <dt className="text-muted-foreground">Items</dt>
              <dd className="font-medium tabular-nums">{itemCount}</dd>
            </div>
            <div className="hidden items-baseline gap-1.5 sm:flex">
              <dt className="text-muted-foreground">Subtotal</dt>
              <dd className="font-medium tabular-nums">
                {formatNaira(subtotal)}
              </dd>
            </div>
            <div className="hidden items-baseline gap-1.5 sm:flex">
              <dt className="text-muted-foreground">Service</dt>
              <dd className="font-medium tabular-nums">
                {formatNaira(serviceCharge)}
              </dd>
            </div>
            {deliveryFee > 0 ? (
              <div className="hidden items-baseline gap-1.5 sm:flex">
                <dt className="text-muted-foreground">Delivery</dt>
                <dd className="font-medium tabular-nums">
                  {formatNaira(deliveryFee)}
                </dd>
              </div>
            ) : null}
            <div className="flex items-baseline gap-1.5">
              <dt className="text-muted-foreground">Total</dt>
              <dd className="font-display text-lg font-semibold tabular-nums">
                {formatNaira(total)}
              </dd>
            </div>
          </dl>
          <Button
            type="submit"
            disabled={pending}
            className="h-11 rounded-full px-6"
          >
            {pending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEdit ? "Saving…" : "Placing…"}
              </>
            ) : isEdit ? (
              "Save changes"
            ) : (
              "Place order"
            )}
          </Button>
        </div>
      </div>
    </form>
  );
}

function LineCard({
  line,
  item,
  total,
  onRemove,
  onQuantity,
  onNotes,
  onToggleAddon,
}: {
  line: DraftLine;
  item: MenuItem | undefined;
  total: number;
  onRemove: () => void;
  onQuantity: (q: number) => void;
  onNotes: (v: string) => void;
  onToggleAddon: (groupId: string, optionId: string, single: boolean) => void;
}) {
  if (!item) {
    return (
      <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4">
        <div className="flex items-start justify-between gap-3">
          <p className="text-sm text-amber-900">
            This dish is no longer on the menu and can&apos;t be re-priced.
            Remove it to save the order.
          </p>
          <button
            type="button"
            onClick={onRemove}
            className="shrink-0 rounded-full p-1 text-amber-900 hover:bg-amber-100"
            aria-label="Remove item"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="rounded-2xl border border-platinum-200 bg-card p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <p className="font-medium">{item.name}</p>
          <p className="text-xs text-muted-foreground">
            {formatNaira(item.price)} each
          </p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="text-sm font-semibold tabular-nums">
            {formatNaira(total)}
          </span>
          <button
            type="button"
            onClick={onRemove}
            className="rounded-full p-1 text-muted-foreground hover:bg-accent hover:text-foreground"
            aria-label="Remove item"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Quantity stepper */}
      <div className="mt-3 flex items-center gap-2">
        <button
          type="button"
          onClick={() => onQuantity(line.quantity - 1)}
          className="grid h-8 w-8 place-items-center rounded-full border border-platinum-200 text-foreground hover:bg-accent disabled:opacity-40"
          disabled={line.quantity <= 1}
          aria-label="Decrease quantity"
        >
          <Minus className="h-3.5 w-3.5" />
        </button>
        <span className="w-8 text-center text-sm font-semibold tabular-nums">
          {line.quantity}
        </span>
        <button
          type="button"
          onClick={() => onQuantity(line.quantity + 1)}
          className="grid h-8 w-8 place-items-center rounded-full border border-platinum-200 text-foreground hover:bg-accent disabled:opacity-40"
          disabled={line.quantity >= 99}
          aria-label="Increase quantity"
        >
          <Plus className="h-3.5 w-3.5" />
        </button>
      </div>

      {/* Add-on groups */}
      {item.addonGroups && item.addonGroups.length > 0 ? (
        <div className="mt-3 space-y-2.5">
          {item.addonGroups.map((g) => {
            const single = g.kind === "single";
            return (
              <div key={g.id}>
                <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                  {g.label}
                  {g.required ? (
                    <span className="ml-1 text-destructive">*</span>
                  ) : null}
                </p>
                <div className="mt-1.5 flex flex-wrap gap-1.5">
                  {g.options.map((o) => {
                    const selected = line.addons.some(
                      (a) => a.groupId === g.id && a.optionId === o.id,
                    );
                    return (
                      <button
                        key={o.id}
                        type="button"
                        onClick={() => onToggleAddon(g.id, o.id, single)}
                        className={cn(
                          "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
                          selected
                            ? "border-primary bg-primary text-primary-foreground"
                            : "border-platinum-200 bg-card text-foreground/80 hover:bg-accent",
                        )}
                      >
                        {o.name}
                        {o.priceDelta > 0
                          ? ` +${formatNaira(o.priceDelta)}`
                          : ""}
                      </button>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : null}

      {/* Line notes */}
      <Input
        value={line.notes}
        onChange={(e) => onNotes(e.target.value)}
        placeholder="Line note (optional) — e.g. no onions"
        maxLength={500}
        className="mt-3 h-9 text-sm"
      />
    </div>
  );
}

function Chip({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "rounded-full border px-4 py-1.5 text-sm font-medium transition-colors",
        active
          ? "border-foreground bg-foreground text-background"
          : "border-platinum-200 bg-card text-foreground/80 hover:bg-accent",
      )}
    >
      {children}
    </button>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-platinum-200 bg-card p-5 sm:p-7">
      <header className="mb-5 space-y-1">
        <h2 className="font-display text-lg font-medium tracking-tight">
          {title}
        </h2>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </header>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor} className="text-sm font-medium">
        {label}
      </Label>
      {children}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
