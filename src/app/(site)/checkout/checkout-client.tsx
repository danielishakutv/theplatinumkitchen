"use client";

import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useState } from "react";
import {
  CreditCard,
  Banknote,
  Landmark,
  Bike,
  Store,
  Utensils,
  ShieldCheck,
  Loader2,
  ArrowLeft,
  Copy,
  Check,
  UserCircle2,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Separator } from "@/components/ui/separator";
import { useCart, useCartTotals, lineUnitTotal, type FulfilmentMethod } from "@/modules/cart";
import type { PaymentMethod, PlaceOrderInput } from "@/modules/orders";
import { placeOrderAction } from "./actions";
import { formatNaira } from "@/lib/format";
import { cn } from "@/lib/utils";
import { toast } from "sonner";

const FULFILMENTS: { value: FulfilmentMethod; label: string; helper: string; Icon: typeof Bike }[] = [
  { value: "delivery", label: "Delivery", helper: "Across Abuja", Icon: Bike },
  { value: "pickup", label: "Pickup", helper: "From Wuse 2", Icon: Store },
  { value: "dine_in", label: "Dine in", helper: "At our table", Icon: Utensils },
];

export interface BankDetails {
  name: string;
  accountName: string;
  accountNumber: string;
  note: string;
}

export interface CheckoutAccount {
  name: string;
  email: string;
}

export function CheckoutClient({
  bank,
  account,
}: {
  bank: BankDetails;
  account: CheckoutAccount | null;
}) {
  const router = useRouter();
  const lines = useCart((s) => s.lines);
  const fulfilment = useCart((s) => s.fulfilment);
  const setFulfilment = useCart((s) => s.setFulfilment);
  const clearCart = useCart((s) => s.clear);
  const totals = useCartTotals();

  const [payment, setPayment] = useState<PaymentMethod>("cod");
  const [submitting, setSubmitting] = useState(false);

  const isEmpty = lines.length === 0;
  const bankAvailable = bank.accountNumber.trim().length > 0;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setSubmitting(true);

    const fd = new FormData(e.currentTarget);
    const name = String(fd.get("name") ?? "").trim();
    const phone = String(fd.get("phone") ?? "").trim();
    const email = String(fd.get("email") ?? "").trim();

    const payload: PlaceOrderInput = {
      lines: lines.map((l) => ({
        itemId: l.itemId,
        quantity: l.quantity,
        addons: l.addons.map((a) => ({ groupId: a.groupId, optionId: a.optionId })),
        notes: l.notes,
      })),
      customer: { name, phone, email: email || undefined },
      fulfilment,
      paymentMethod: payment,
      ...(fulfilment === "delivery"
        ? {
            address: {
              street: String(fd.get("street") ?? "").trim(),
              area: String(fd.get("area") ?? "").trim(),
              city: String(fd.get("city") ?? "Abuja").trim() || "Abuja",
              state: "FCT",
              landmark: String(fd.get("landmark") ?? "").trim() || undefined,
              instructions: String(fd.get("instructions") ?? "").trim() || undefined,
            },
          }
        : {}),
    };

    const result = await placeOrderAction(payload);
    if (!result.ok) {
      setSubmitting(false);
      toast.error("Couldn't place your order", { description: result.error });
      return;
    }
    toast.success(`Order ${result.orderNumber} received`, {
      description: "We'll send a confirmation by email shortly.",
    });
    clearCart();
    router.push(`/order/${result.orderId}`);
  };

  if (isEmpty && !submitting) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center sm:px-6 lg:px-8">
        <h1 className="font-display text-4xl">Your basket is empty</h1>
        <p className="mt-3 text-muted-foreground">
          Add a dish or two from the menu to start a checkout.
        </p>
        <Button asChild size="lg" className="mt-7 h-12 rounded-full px-7">
          <Link href="/menu">Browse the menu</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-10 sm:px-6 lg:px-8">
      <div className="flex items-center gap-3 text-sm text-muted-foreground">
        <Button asChild variant="ghost" size="sm" className="-ml-3 h-8 gap-1.5">
          <Link href="/menu">
            <ArrowLeft className="h-3.5 w-3.5" /> Back to menu
          </Link>
        </Button>
      </div>

      <h1 className="text-balance mt-2 font-display text-4xl font-medium leading-tight tracking-tight sm:text-5xl">
        Almost there.
      </h1>
      <p className="mt-2 text-muted-foreground">
        A few details and we&apos;ll fire up the kitchen.
      </p>

      <form
        onSubmit={handleSubmit}
        className="mt-10 grid gap-10 lg:grid-cols-[minmax(0,1fr)_24rem] lg:items-start"
      >
        <div className="space-y-9">
          {account ? (
            <div className="flex items-center gap-3 rounded-2xl border border-platinum-200 bg-card p-4">
              <div className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-accent text-primary">
                <UserCircle2 className="h-5 w-5" />
              </div>
              <div className="min-w-0 flex-1 text-sm">
                <p className="font-medium">Signed in as {account.name || account.email}</p>
                <p className="truncate text-xs text-muted-foreground">
                  {account.email}
                </p>
              </div>
              <Button asChild variant="ghost" size="sm" className="h-8 rounded-full">
                <Link href="/account">Account</Link>
              </Button>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground">
              Have an account?{" "}
              <Link
                href="/sign-in?from=/checkout"
                className="font-medium text-primary hover:underline"
              >
                Sign in
              </Link>{" "}
              to skip retyping your details — or just fill in the form below.
            </p>
          )}

          <Section title="Your details">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                id="name"
                label="Full name"
                required
                placeholder="e.g. Tobi Adeleke"
                defaultValue={account?.name ?? ""}
              />
              <Field
                id="phone"
                label="Phone number"
                required
                placeholder="e.g. +234 803 000 0000"
                inputMode="tel"
              />
              <Field
                id="email"
                label="Email"
                type="email"
                placeholder="optional"
                className="sm:col-span-2"
                defaultValue={account?.email ?? ""}
              />
            </div>
          </Section>

          <Section title="Fulfilment">
            <div className="grid grid-cols-3 gap-2">
              {FULFILMENTS.map(({ value, label, helper, Icon }) => {
                const active = fulfilment === value;
                return (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setFulfilment(value)}
                    className={cn(
                      "flex flex-col items-center gap-1.5 rounded-2xl border bg-card p-5 text-center transition-all",
                      active
                        ? "border-primary bg-accent/40 ring-2 ring-primary/15"
                        : "border-platinum-200 hover:border-platinum-300",
                    )}
                  >
                    <Icon
                      className={cn(
                        "h-5 w-5",
                        active ? "text-primary" : "text-muted-foreground",
                      )}
                    />
                    <span className="font-medium">{label}</span>
                    <span className="text-[11px] uppercase tracking-wider text-muted-foreground">
                      {helper}
                    </span>
                  </button>
                );
              })}
            </div>
          </Section>

          {fulfilment === "delivery" ? (
            <Section
              title="Delivery address"
              hint="We deliver across the FCT"
            >
              <div className="grid gap-4 sm:grid-cols-2">
                <Field
                  id="street"
                  label="Street address"
                  required
                  className="sm:col-span-2"
                  placeholder="House number and street"
                />
                <Field
                  id="area"
                  label="Area"
                  required
                  placeholder="e.g. Wuse 2, Maitama, Gwarinpa"
                />
                <Field id="city" label="City" placeholder="Abuja" />
                <Field
                  id="landmark"
                  label="Landmark (optional)"
                  className="sm:col-span-2"
                  placeholder="e.g. Beside Sahad Stores"
                />
                <div className="sm:col-span-2 space-y-2">
                  <Label htmlFor="instructions" className="text-sm font-medium">
                    Delivery instructions
                  </Label>
                  <Textarea
                    id="instructions"
                    placeholder="Gate code, building colour, who to call..."
                    rows={2}
                    className="resize-none border-platinum-200"
                  />
                </div>
              </div>
            </Section>
          ) : null}

          <Section title="Payment">
            <div className="grid gap-3">
              <PaymentOption
                active={payment === "cod"}
                onSelect={() => setPayment("cod")}
                Icon={Banknote}
                title="Cash on Delivery"
                helper="Pay our rider in cash on arrival"
                badge="Default"
              />
              {bankAvailable ? (
                <PaymentOption
                  active={payment === "bank_transfer"}
                  onSelect={() => setPayment("bank_transfer")}
                  Icon={Landmark}
                  title="Bank Transfer"
                  helper="Transfer to our account, then send proof"
                />
              ) : null}
              <PaymentOption
                active={false}
                disabled
                onSelect={() =>
                  toast("Online payment is coming soon", {
                    description:
                      "Card, USSD and transfer-via-Paystack land in a future update. Use Cash on Delivery or Bank Transfer for now.",
                  })
                }
                Icon={CreditCard}
                title="Pay Online — Card, USSD…"
                helper="Coming soon"
                badge="Coming soon"
              />
            </div>

            {payment === "bank_transfer" && bankAvailable ? (
              <BankDetailsPanel bank={bank} />
            ) : null}

            <p className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
              <ShieldCheck className="h-3.5 w-3.5" />
              {payment === "bank_transfer"
                ? "We'll confirm your order once the transfer lands."
                : "No payment is taken now — settle with the rider on arrival."}
            </p>
          </Section>
        </div>

        {/* Summary */}
        <aside className="lg:sticky lg:top-24">
          <div className="rounded-3xl border border-platinum-200 bg-card shadow-sm">
            <header className="border-b border-platinum-200 px-6 py-5">
              <h2 className="font-display text-2xl">Your order</h2>
              <p className="mt-0.5 text-sm text-muted-foreground">
                {totals.itemCount} {totals.itemCount === 1 ? "item" : "items"}
              </p>
            </header>

            <ul className="max-h-[28rem] divide-y divide-platinum-200 overflow-y-auto">
              {lines.map((line) => (
                <li key={line.id} className="flex gap-3 px-6 py-4">
                  <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-lg bg-platinum-100">
                    <Image
                      src={line.imageUrl}
                      alt=""
                      fill
                      sizes="56px"
                      className="object-cover"
                    />
                    <span className="absolute right-0 top-0 grid h-5 w-5 -translate-y-1.5 translate-x-1.5 place-items-center rounded-full bg-foreground text-[10px] font-semibold text-background">
                      {line.quantity}
                    </span>
                  </div>
                  <div className="flex-1 text-sm">
                    <p className="font-medium leading-tight">{line.name}</p>
                    {line.addons.length > 0 ? (
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {line.addons.map((a) => a.name).join(" · ")}
                      </p>
                    ) : null}
                  </div>
                  <span className="self-start text-sm font-medium tabular-nums">
                    {formatNaira(lineUnitTotal(line) * line.quantity)}
                  </span>
                </li>
              ))}
            </ul>

            <div className="space-y-2 border-t border-platinum-200 px-6 py-5 text-sm">
              <Row label="Subtotal" value={formatNaira(totals.subtotal)} />
              <Row label="Service (5%)" value={formatNaira(totals.serviceCharge)} />
              {fulfilment === "delivery" ? (
                <Row label="Delivery" value={formatNaira(totals.deliveryFee)} />
              ) : null}
              <Separator className="my-3" />
              <Row label="Total" value={formatNaira(totals.total)} emphasised />
            </div>

            <div className="border-t border-platinum-200 bg-platinum-50/60 p-5">
              <Button
                type="submit"
                size="lg"
                disabled={submitting}
                className="h-12 w-full rounded-full text-base font-medium shadow-lg shadow-primary/15"
              >
                {submitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Placing order…
                  </>
                ) : (
                  <>Place order · {formatNaira(totals.total)}</>
                )}
              </Button>
              <p className="mt-3 text-center text-xs text-muted-foreground">
                By placing this order you agree to our terms.
              </p>
            </div>
          </div>
        </aside>
      </form>
    </div>
  );
}

function Section({
  title,
  hint,
  children,
}: {
  title: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <section>
      <header className="mb-3 flex items-baseline justify-between">
        <h2 className="font-display text-xl font-medium">{title}</h2>
        {hint ? (
          <span className="text-xs uppercase tracking-wider text-muted-foreground">
            {hint}
          </span>
        ) : null}
      </header>
      {children}
    </section>
  );
}

function Field({
  id,
  label,
  required,
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement> & { label: string }) {
  return (
    <div className={cn("space-y-1.5", className)}>
      <Label htmlFor={id} className="text-sm font-medium">
        {label}
        {required ? <span className="ml-0.5 text-primary">*</span> : null}
      </Label>
      <Input
        id={id}
        name={id}
        required={required}
        className="h-11 border-platinum-200 bg-card"
        {...props}
      />
    </div>
  );
}

function PaymentOption({
  active,
  onSelect,
  Icon,
  title,
  helper,
  badge,
  disabled = false,
}: {
  active: boolean;
  onSelect: () => void;
  Icon: typeof CreditCard;
  title: string;
  helper: string;
  badge?: string;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      aria-disabled={disabled}
      className={cn(
        "relative flex items-start gap-3 rounded-2xl border bg-card p-5 text-left transition-all",
        active
          ? "border-primary bg-accent/40 ring-2 ring-primary/15"
          : "border-platinum-200 hover:border-platinum-300",
        disabled && "opacity-55",
      )}
    >
      <div
        className={cn(
          "grid h-10 w-10 shrink-0 place-items-center rounded-xl",
          active
            ? "bg-primary text-primary-foreground"
            : "bg-platinum-100 text-foreground/70",
        )}
      >
        <Icon className="h-5 w-5" />
      </div>
      <div className="flex-1">
        <div className="flex items-center gap-2">
          <span className="font-medium">{title}</span>
          {badge ? (
            <span
              className={cn(
                "rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider",
                disabled
                  ? "bg-platinum-200 text-muted-foreground"
                  : "bg-accent text-primary",
              )}
            >
              {badge}
            </span>
          ) : null}
        </div>
        <p className="mt-0.5 text-sm text-muted-foreground">{helper}</p>
      </div>
    </button>
  );
}

function BankDetailsPanel({ bank }: { bank: BankDetails }) {
  const [copied, setCopied] = useState(false);

  const copyAccount = async () => {
    try {
      await navigator.clipboard.writeText(bank.accountNumber.replace(/\s/g, ""));
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast.error("Couldn't copy — long-press the number instead.");
    }
  };

  return (
    <div className="mt-3 rounded-2xl border border-primary/30 bg-accent/30 p-5">
      <p className="text-xs font-semibold uppercase tracking-[0.16em] text-primary">
        Transfer to
      </p>
      <dl className="mt-3 space-y-2 text-sm">
        <div className="flex items-center justify-between gap-3">
          <dt className="text-muted-foreground">Bank</dt>
          <dd className="font-medium">{bank.name || "—"}</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-muted-foreground">Account name</dt>
          <dd className="font-medium text-right">{bank.accountName || "—"}</dd>
        </div>
        <div className="flex items-center justify-between gap-3">
          <dt className="text-muted-foreground">Account number</dt>
          <dd className="flex items-center gap-2">
            <span className="font-display text-base font-semibold tabular-nums">
              {bank.accountNumber}
            </span>
            <button
              type="button"
              onClick={copyAccount}
              className="grid h-7 w-7 place-items-center rounded-full text-muted-foreground transition-colors hover:bg-card hover:text-foreground"
              aria-label="Copy account number"
            >
              {copied ? (
                <Check className="h-3.5 w-3.5 text-primary" />
              ) : (
                <Copy className="h-3.5 w-3.5" />
              )}
            </button>
          </dd>
        </div>
      </dl>
      {bank.note ? (
        <p className="mt-3 border-t border-primary/15 pt-3 text-xs leading-relaxed text-foreground/80">
          {bank.note}
        </p>
      ) : null}
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
      <span
        className={cn(
          emphasised ? "font-display text-base text-foreground" : "text-muted-foreground",
        )}
      >
        {label}
      </span>
      <span
        className={cn(
          "tabular-nums",
          emphasised ? "font-display text-lg text-foreground" : "font-medium text-foreground",
        )}
      >
        {value}
      </span>
    </div>
  );
}
