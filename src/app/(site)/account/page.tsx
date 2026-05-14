import Link from "next/link";
import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { LogOut, Receipt, ShoppingBag, UtensilsCrossed } from "lucide-react";
import { auth } from "@/lib/auth";
import { listOrdersForUser, type Order, type OrderStatus } from "@/modules/orders";
import { Button } from "@/components/ui/button";
import { formatNaira, formatDateTime } from "@/lib/format";
import { cn } from "@/lib/utils";
import { signOutAction } from "./actions";
import { ReorderButton } from "./reorder-button";

export const metadata: Metadata = {
  title: "My account",
  description: "Your Platinum Kitchen orders.",
};

export const dynamic = "force-dynamic";

const STATUS_LABEL: Record<OrderStatus, string> = {
  received: "Received",
  preparing: "Preparing",
  ready: "Ready",
  out_for_delivery: "On the way",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

const STATUS_TONE: Record<OrderStatus, string> = {
  received: "bg-platinum-100 text-foreground",
  preparing: "bg-amber-100 text-amber-800",
  ready: "bg-sky-100 text-sky-800",
  out_for_delivery: "bg-sky-100 text-sky-800",
  delivered: "bg-emerald-100 text-emerald-800",
  cancelled: "bg-red-100 text-red-700",
};

export default async function AccountPage() {
  const session = await auth();
  if (!session?.user?.id) redirect("/sign-in?from=/account");

  const orders = await listOrdersForUser(session.user.id);
  const firstName = (session.user.name ?? "there").split(" ")[0];

  return (
    <div className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            My account
          </span>
          <h1 className="mt-2 font-display text-4xl font-medium leading-tight tracking-tight sm:text-5xl">
            Hello, {firstName}.
          </h1>
          <p className="mt-1 text-muted-foreground">{session.user.email}</p>
        </div>
        <form action={signOutAction}>
          <Button
            type="submit"
            variant="outline"
            size="sm"
            className="h-10 gap-1.5 rounded-full border-platinum-300"
          >
            <LogOut className="h-3.5 w-3.5" /> Sign out
          </Button>
        </form>
      </header>

      <section className="mt-9">
        <h2 className="font-display text-2xl">Order history</h2>
        {orders.length === 0 ? (
          <EmptyState />
        ) : (
          <ul className="mt-5 space-y-4">
            {orders.map((order) => (
              <OrderCard key={order.id} order={order} />
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function EmptyState() {
  return (
    <div className="mt-5 rounded-3xl border border-dashed border-platinum-300 bg-platinum-50/60 p-10 text-center">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-accent text-primary">
        <ShoppingBag className="h-6 w-6" />
      </div>
      <p className="mt-4 font-display text-xl">No orders yet</p>
      <p className="mt-1 text-sm text-muted-foreground">
        Once you place an order it&apos;ll show up here for easy tracking and reordering.
      </p>
      <Button asChild className="mt-5 h-11 rounded-full px-6">
        <Link href="/menu">
          <UtensilsCrossed className="mr-1.5 h-4 w-4" /> Browse the menu
        </Link>
      </Button>
    </div>
  );
}

function OrderCard({ order }: { order: Order }) {
  const itemCount = order.lines.reduce((s, l) => s + l.quantity, 0);
  const reorderLines = order.lines.map((l) => ({
    itemId: l.itemId,
    name: l.itemName,
    imageUrl: l.imageUrl,
    unitPrice: l.unitPrice,
    quantity: l.quantity,
    addons: l.addons,
    notes: l.notes,
  }));

  return (
    <li className="rounded-3xl border border-platinum-200 bg-card p-5 shadow-sm sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="font-display text-lg font-semibold tabular-nums">
              {order.number}
            </span>
            <span
              className={cn(
                "rounded-full px-2.5 py-0.5 text-[10px] font-bold uppercase tracking-wider",
                STATUS_TONE[order.status],
              )}
            >
              {STATUS_LABEL[order.status]}
            </span>
          </div>
          <p className="mt-1 text-sm text-muted-foreground">
            {formatDateTime(order.createdAt)} · {itemCount}{" "}
            {itemCount === 1 ? "item" : "items"}
          </p>
        </div>
        <span className="font-display text-xl font-semibold tabular-nums">
          {formatNaira(order.total)}
        </span>
      </div>

      <p className="mt-3 truncate text-sm text-foreground/80">
        {order.lines.map((l) => `${l.quantity}× ${l.itemName}`).join(", ")}
      </p>

      <div className="mt-4 flex flex-wrap gap-2">
        <Button
          asChild
          size="sm"
          className="h-9 gap-1.5 rounded-full"
        >
          <Link href={`/order/${order.id}`}>Track order</Link>
        </Button>
        <Button
          asChild
          variant="outline"
          size="sm"
          className="h-9 gap-1.5 rounded-full border-platinum-300"
        >
          <Link href={`/invoice/${order.id}`}>
            <Receipt className="h-3.5 w-3.5" /> Invoice
          </Link>
        </Button>
        <ReorderButton lines={reorderLines} />
      </div>
    </li>
  );
}
