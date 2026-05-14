import Link from "next/link";
import Image from "next/image";
import { notFound } from "next/navigation";
import {
  ArrowLeft,
  Bike,
  ExternalLink,
  MapPin,
  Phone,
  Store,
  Utensils,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { auth } from "@/lib/auth";
import {
  getOrderById,
  PAYMENT_METHOD_LABEL,
  type Order,
} from "@/modules/orders";
import { formatDateTime, formatNaira } from "@/lib/format";
import { cn } from "@/lib/utils";
import { StatusActions } from "./status-actions";

export const dynamic = "force-dynamic";
export const metadata = { title: "Order detail" };

const STATUS_STYLES: Record<string, string> = {
  received: "bg-blue-100 text-blue-800",
  preparing: "bg-amber-100 text-amber-800",
  ready: "bg-emerald-100 text-emerald-800",
  out_for_delivery: "bg-purple-100 text-purple-800",
  delivered: "bg-platinum-100 text-platinum-700",
  cancelled: "bg-red-50 text-red-700",
};

export default async function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  // listOrders enforces orders:read; we re-check by attempting to load.
  // getOrderById has no permission check on its own, so we gate at the page.
  if (!session?.user) notFound();
  const order = await getOrderById(id);
  if (!order) notFound();

  return (
    <div className="mx-auto max-w-4xl space-y-6 pb-12">
      <div className="space-y-2">
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" /> Back to orders
        </Link>
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <h1 className="font-display text-3xl font-medium tracking-tight sm:text-4xl">
              {order.number}
            </h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Placed {formatDateTime(order.createdAt)}
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span
              className={cn(
                "rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider",
                STATUS_STYLES[order.status] ?? "",
              )}
            >
              {order.status.replace("_", " ")}
            </span>
            <span
              className={cn(
                "rounded-full px-3 py-1 text-[10px] font-bold uppercase tracking-wider",
                order.paymentStatus === "paid"
                  ? "bg-emerald-100 text-emerald-800"
                  : order.paymentStatus === "refunded"
                    ? "bg-platinum-200 text-platinum-700"
                    : "bg-amber-100 text-amber-800",
              )}
            >
              {order.paymentStatus}
            </span>
          </div>
        </div>
      </div>

      <section className="rounded-3xl border border-platinum-200 bg-card p-5 sm:p-7">
        <header className="mb-4">
          <h2 className="font-display text-lg font-medium">Actions</h2>
          <p className="text-sm text-muted-foreground">
            Move the order through its stages or update payment.
          </p>
        </header>
        <StatusActions order={order} />
      </section>

      <Summary order={order} />
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
    <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_22rem]">
      <section className="rounded-3xl border border-platinum-200 bg-card p-5 sm:p-7">
        <header className="flex flex-wrap items-baseline justify-between gap-3">
          <h2 className="font-display text-lg font-medium">Items</h2>
          <span className="text-xs uppercase tracking-wider text-muted-foreground">
            {order.lines.reduce((s, l) => s + l.quantity, 0)} pieces
          </span>
        </header>

        <ul className="mt-4 divide-y divide-platinum-200">
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
                  <p className="mt-1 rounded-md bg-amber-50 px-2 py-1 text-xs text-amber-900">
                    ⚠ {line.notes}
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
      </section>

      <aside className="space-y-4">
        <Card title="Customer">
          <p className="font-medium">{order.customer.name}</p>
          <p className="mt-0.5 flex items-center gap-1.5 text-sm text-muted-foreground">
            <Phone className="h-3.5 w-3.5" />
            <a
              href={`tel:${order.customer.phone}`}
              className="hover:text-foreground"
            >
              {order.customer.phone}
            </a>
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
          <p className="font-medium">
            {PAYMENT_METHOD_LABEL[order.paymentMethod]}
          </p>
          {order.paystackReference ? (
            <p className="mt-1 truncate text-xs text-muted-foreground">
              Ref: <code>{order.paystackReference}</code>
            </p>
          ) : null}
        </Card>

        <Button
          asChild
          variant="outline"
          size="sm"
          className="h-9 w-full gap-1.5 rounded-full"
        >
          <Link href={`/order/${order.id}`} target="_blank" rel="noreferrer">
            <ExternalLink className="h-3.5 w-3.5" /> View customer page
          </Link>
        </Button>
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
