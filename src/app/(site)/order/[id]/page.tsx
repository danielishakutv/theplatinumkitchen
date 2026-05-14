import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  Check,
  MessageCircle,
  Receipt,
  MapPin,
  Phone,
  Bike,
  Store,
  Utensils,
  Landmark,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import {
  getOrderById,
  PAYMENT_METHOD_LABEL,
  type Order,
  type OrderStatus,
} from "@/modules/orders";
import { getSettings, type Settings } from "@/modules/settings";
import { formatNaira, formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";

export const dynamic = "force-dynamic";

export default async function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const [order, settings] = await Promise.all([getOrderById(id), getSettings()]);
  if (!order) notFound();

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <Hero order={order} />
      <Timeline status={order.status} fulfilment={order.fulfilment} />
      {order.paymentMethod === "bank_transfer" &&
      order.paymentStatus === "unpaid" ? (
        <BankTransferCallout order={order} settings={settings} />
      ) : null}
      <Summary order={order} />
      <Actions order={order} settings={settings} />
    </div>
  );
}

function Hero({ order }: { order: Order }) {
  return (
    <div className="rounded-3xl border border-platinum-200 bg-card p-8 text-center shadow-sm sm:p-12">
      <div className="mx-auto grid h-16 w-16 place-items-center rounded-full bg-emerald-100 text-emerald-700 ring-8 ring-emerald-50">
        <Check className="h-7 w-7" strokeWidth={3} />
      </div>
      <h1 className="mt-6 font-display text-4xl font-medium leading-tight tracking-tight sm:text-5xl">
        Thank you, {order.customer.name.split(" ")[0]}.
      </h1>
      <p className="mt-2 text-muted-foreground">
        Your order has been received. We&apos;ll send a confirmation by email shortly.
      </p>
      <div className="mt-6 inline-flex flex-wrap items-center justify-center gap-3 rounded-full bg-platinum-100 px-5 py-2.5">
        <span className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Order
        </span>
        <span className="font-display text-lg font-semibold tabular-nums">{order.number}</span>
        <span className="text-xs text-muted-foreground">· {formatDateTime(order.createdAt)}</span>
      </div>
    </div>
  );
}

const STAGES: { status: OrderStatus; label: string }[] = [
  { status: "received", label: "Received" },
  { status: "preparing", label: "Preparing" },
  { status: "ready", label: "Ready" },
  { status: "out_for_delivery", label: "On the way" },
  { status: "delivered", label: "Delivered" },
];

function Timeline({
  status,
  fulfilment,
}: {
  status: OrderStatus;
  fulfilment: Order["fulfilment"];
}) {
  const stages =
    fulfilment === "delivery"
      ? STAGES
      : STAGES.filter((s) => s.status !== "out_for_delivery");
  const idx = Math.max(
    0,
    stages.findIndex((s) => s.status === status),
  );
  const isCancelled = status === "cancelled";

  return (
    <div className="mt-8 rounded-3xl border border-platinum-200 bg-card p-6 sm:p-8">
      <div className="flex items-center justify-between gap-3">
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
            Order status
          </span>
          <p className="mt-1 font-display text-xl">
            {isCancelled ? "Cancelled" : stages[idx]?.label ?? "Pending"}
          </p>
        </div>
        <span className="rounded-full bg-accent px-3 py-1 text-xs font-medium text-primary">
          {fulfilment === "delivery"
            ? "Delivery"
            : fulfilment === "pickup"
              ? "Pickup"
              : "Dine in"}
        </span>
      </div>

      {!isCancelled ? (
        <ol className="mt-7 grid grid-cols-2 gap-y-6 sm:flex sm:items-start sm:justify-between sm:gap-2">
          {stages.map((s, i) => {
            const reached = i <= idx;
            const isCurrent = i === idx;
            return (
              <li key={s.status} className="relative flex flex-1 flex-col items-center text-center">
                {i < stages.length - 1 ? (
                  <span
                    className={cn(
                      "absolute left-[calc(50%+1.5rem)] right-[calc(-50%+1.5rem)] top-3 hidden h-0.5 sm:block",
                      i < idx ? "bg-primary" : "bg-platinum-200",
                    )}
                  />
                ) : null}
                <span
                  className={cn(
                    "relative z-10 grid h-7 w-7 place-items-center rounded-full",
                    reached
                      ? "bg-primary text-primary-foreground"
                      : "bg-platinum-100 text-muted-foreground",
                    isCurrent && "ring-4 ring-primary/15",
                  )}
                >
                  {reached ? <Check className="h-3.5 w-3.5" strokeWidth={3} /> : null}
                </span>
                <span
                  className={cn(
                    "mt-2.5 text-xs font-medium uppercase tracking-wider",
                    reached ? "text-foreground" : "text-muted-foreground",
                  )}
                >
                  {s.label}
                </span>
              </li>
            );
          })}
        </ol>
      ) : (
        <p className="mt-4 rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">
          This order was cancelled. If you weren&apos;t expecting that, give us a call.
        </p>
      )}
    </div>
  );
}

function BankTransferCallout({
  order,
  settings,
}: {
  order: Order;
  settings: Settings;
}) {
  if (!settings.bankAccountNumber) return null;
  return (
    <div className="mt-8 rounded-3xl border-2 border-primary/30 bg-accent/30 p-6 sm:p-8">
      <div className="flex items-start gap-3">
        <div className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-primary text-primary-foreground">
          <Landmark className="h-5 w-5" />
        </div>
        <div className="min-w-0 flex-1">
          <h2 className="font-display text-xl">Complete your bank transfer</h2>
          <p className="mt-1 text-sm text-muted-foreground">
            Your order is reserved. Transfer{" "}
            <span className="font-semibold text-foreground">
              {formatNaira(order.total)}
            </span>{" "}
            to the account below, using{" "}
            <span className="font-semibold text-foreground">{order.number}</span>{" "}
            as the reference.
          </p>

          <dl className="mt-4 grid gap-2 rounded-2xl bg-card p-4 text-sm sm:grid-cols-3">
            <div>
              <dt className="text-xs uppercase tracking-wider text-muted-foreground">
                Bank
              </dt>
              <dd className="mt-0.5 font-medium">{settings.bankName || "—"}</dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-muted-foreground">
                Account name
              </dt>
              <dd className="mt-0.5 font-medium">
                {settings.bankAccountName || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-xs uppercase tracking-wider text-muted-foreground">
                Account number
              </dt>
              <dd className="mt-0.5 font-display text-base font-semibold tabular-nums">
                {settings.bankAccountNumber}
              </dd>
            </div>
          </dl>

          {settings.bankTransferNote ? (
            <p className="mt-3 text-xs leading-relaxed text-foreground/80">
              {settings.bankTransferNote}
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
}

function Summary({ order }: { order: Order }) {
  const FulfilmentIcon =
    order.fulfilment === "delivery"
      ? Bike
      : order.fulfilment === "pickup"
        ? Store
        : Utensils;

  return (
    <div className="mt-8 grid gap-8 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <div className="rounded-3xl border border-platinum-200 bg-card p-6 sm:p-8">
        <header className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="font-display text-2xl">Order details</h2>
          <span className="text-xs uppercase tracking-wider text-muted-foreground">
            {order.lines.reduce((s, l) => s + l.quantity, 0)} items
          </span>
        </header>

        <ul className="mt-5 divide-y divide-platinum-200">
          {order.lines.map((line) => (
            <li key={line.id} className="flex gap-4 py-4">
              <div className="relative h-16 w-16 shrink-0 overflow-hidden rounded-lg bg-platinum-100">
                {line.imageUrl ? (
                  <Image
                    src={line.imageUrl}
                    alt=""
                    fill
                    sizes="64px"
                    className="object-cover"
                  />
                ) : null}
                <span className="absolute right-0 top-0 grid h-5 w-5 -translate-y-1.5 translate-x-1.5 place-items-center rounded-full bg-foreground text-[10px] font-semibold text-background">
                  {line.quantity}
                </span>
              </div>
              <div className="flex-1 text-sm">
                <p className="font-medium">{line.itemName}</p>
                {line.addons.length > 0 ? (
                  <p className="mt-0.5 text-xs text-muted-foreground">
                    {line.addons.map((a) => a.name).join(" · ")}
                  </p>
                ) : null}
                {line.notes ? (
                  <p className="mt-1 rounded-md bg-platinum-50 px-2 py-1 text-xs text-foreground/70">
                    Note: {line.notes}
                  </p>
                ) : null}
              </div>
              <span className="self-start text-sm font-medium tabular-nums">
                {formatNaira(
                  (line.unitPrice + line.addons.reduce((s, a) => s + a.priceDelta, 0)) *
                    line.quantity,
                )}
              </span>
            </li>
          ))}
        </ul>

        <Separator className="my-5" />

        <dl className="space-y-2 text-sm">
          <Row label="Subtotal" value={formatNaira(order.subtotal)} />
          <Row label="Service charge" value={formatNaira(order.serviceCharge)} />
          {order.deliveryFee > 0 ? (
            <Row label="Delivery" value={formatNaira(order.deliveryFee)} />
          ) : null}
          <Separator className="my-3" />
          <Row label="Total" value={formatNaira(order.total)} emphasised />
        </dl>
      </div>

      <aside className="space-y-5">
        <Card title="Customer">
          <p className="font-medium">{order.customer.name}</p>
          <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
            <Phone className="h-3.5 w-3.5" />
            {order.customer.phone}
          </p>
          {order.customer.email ? (
            <p className="text-sm text-muted-foreground">{order.customer.email}</p>
          ) : null}
        </Card>

        <Card title="Fulfilment">
          <p className="flex items-center gap-2 font-medium">
            <FulfilmentIcon className="h-4 w-4 text-primary" />
            {order.fulfilment === "delivery"
              ? "Delivery"
              : order.fulfilment === "pickup"
                ? "Pickup"
                : "Dine in"}
          </p>
          {order.address ? (
            <div className="mt-2 flex gap-1.5 text-sm text-muted-foreground">
              <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-primary" />
              <span>
                {order.address.street}
                <br />
                {order.address.area}, {order.address.city}
                {order.address.landmark ? (
                  <>
                    <br />
                    <span className="text-xs">Landmark: {order.address.landmark}</span>
                  </>
                ) : null}
              </span>
            </div>
          ) : null}
          {order.address?.instructions ? (
            <p className="mt-3 rounded-lg bg-platinum-50 px-3 py-2 text-xs text-foreground/80">
              {order.address.instructions}
            </p>
          ) : null}
        </Card>

        <Card title="Payment">
          <div className="flex items-center justify-between">
            <span className="font-medium">
              {PAYMENT_METHOD_LABEL[order.paymentMethod]}
            </span>
            <span
              className={cn(
                "rounded-full px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider",
                order.paymentStatus === "paid"
                  ? "bg-emerald-100 text-emerald-800"
                  : "bg-amber-100 text-amber-800",
              )}
            >
              {order.paymentStatus}
            </span>
          </div>
        </Card>
      </aside>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-platinum-200 bg-card p-5">
      <h3 className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
        {title}
      </h3>
      <div className="mt-3 text-sm">{children}</div>
    </div>
  );
}

function Actions({ order, settings }: { order: Order; settings: Settings }) {
  const waNumber = settings.whatsappPhone.replace(/[^0-9]/g, "");
  const text = `Hi! I just placed order ${order.number} with ${settings.restaurantName || "Platinum Kitchen"}.`;
  return (
    <div className="mt-8 flex flex-wrap gap-3">
      <Button asChild size="lg" className="h-12 rounded-full px-6">
        <Link href={`/invoice/${order.id}`}>
          <Receipt className="mr-2 h-4 w-4" /> View invoice
        </Link>
      </Button>
      {waNumber ? (
        <Button
          asChild
          size="lg"
          variant="outline"
          className="h-12 rounded-full border-platinum-300 px-6"
        >
          <a
            href={`https://wa.me/${waNumber}?text=${encodeURIComponent(text)}`}
            target="_blank"
            rel="noopener noreferrer"
          >
            <MessageCircle className="mr-2 h-4 w-4" /> Chat on WhatsApp
          </a>
        </Button>
      ) : null}
      <Button asChild variant="ghost" size="lg" className="h-12 rounded-full px-6">
        <Link href="/menu">Order again</Link>
      </Button>
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
