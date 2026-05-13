import Image from "next/image";
import { Clock, Bike, Store, Utensils, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { orders, type Order } from "@/modules/orders";
import { formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";

const COLUMNS: { title: string; statuses: Order["status"][]; tone: string }[] = [
  {
    title: "New",
    statuses: ["received"],
    tone: "border-blue-200 bg-blue-50/40",
  },
  {
    title: "Preparing",
    statuses: ["preparing"],
    tone: "border-amber-200 bg-amber-50/40",
  },
  {
    title: "Ready",
    statuses: ["ready", "out_for_delivery"],
    tone: "border-emerald-200 bg-emerald-50/40",
  },
];

export default function KitchenPage() {
  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-medium tracking-tight">Kitchen view</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Drag, tap, mark — keep the line moving.
          </p>
        </div>
        <div className="flex gap-2">
          <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-800">
            ● Live
          </span>
        </div>
      </header>

      <div className="grid gap-5 lg:grid-cols-3">
        {COLUMNS.map((col) => {
          const colOrders = orders.filter((o) => col.statuses.includes(o.status));
          return (
            <section
              key={col.title}
              className={cn("rounded-3xl border-2 bg-card p-4", col.tone)}
            >
              <header className="mb-4 flex items-center justify-between px-2">
                <h2 className="font-display text-lg font-medium">{col.title}</h2>
                <span className="rounded-full bg-card px-2.5 py-0.5 text-xs font-semibold tabular-nums">
                  {colOrders.length}
                </span>
              </header>

              <div className="space-y-3">
                {colOrders.length === 0 ? (
                  <p className="rounded-2xl border border-dashed border-platinum-300 bg-platinum-50 p-6 text-center text-xs text-muted-foreground">
                    Nothing here right now.
                  </p>
                ) : (
                  colOrders.map((order) => <KitchenCard key={order.id} order={order} />)
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}

function KitchenCard({ order }: { order: Order }) {
  const FulfilmentIcon =
    order.fulfilment === "delivery" ? Bike : order.fulfilment === "pickup" ? Store : Utensils;

  const nextLabel =
    order.status === "received"
      ? "Start preparing"
      : order.status === "preparing"
        ? "Mark ready"
        : order.status === "ready"
          ? order.fulfilment === "delivery"
            ? "Hand to rider"
            : "Mark delivered"
          : "Mark delivered";

  return (
    <article className="rounded-2xl border border-platinum-200 bg-card p-4 shadow-sm">
      <header className="flex items-start justify-between gap-3">
        <div>
          <p className="font-display text-base font-semibold tabular-nums">{order.number}</p>
          <p className="mt-0.5 flex items-center gap-1 text-xs text-muted-foreground">
            <Clock className="h-3 w-3" /> {formatRelative(order.createdAt)}
          </p>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-platinum-100 px-2 py-1 text-[10px] font-medium uppercase tracking-wider">
          <FulfilmentIcon className="h-3 w-3" /> {order.fulfilment.replace("_", " ")}
        </span>
      </header>

      <ul className="mt-4 space-y-2">
        {order.lines.map((line) => (
          <li key={line.id} className="flex items-start gap-3">
            <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-platinum-100">
              <Image src={line.imageUrl} alt="" fill sizes="48px" className="object-cover" />
              <span className="absolute right-0 top-0 grid h-5 w-5 -translate-y-1.5 translate-x-1.5 place-items-center rounded-full bg-foreground text-[10px] font-bold text-background">
                {line.quantity}
              </span>
            </div>
            <div className="min-w-0 flex-1 text-sm">
              <p className="font-medium leading-tight">{line.itemName}</p>
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
          </li>
        ))}
      </ul>

      <footer className="mt-4 flex items-center justify-between gap-2 border-t border-platinum-200 pt-3">
        <span className="text-xs text-muted-foreground">{order.customer.name.split(" ")[0]}</span>
        <Button size="sm" className="h-8 gap-1 rounded-full">
          {nextLabel} <ChevronRight className="h-3.5 w-3.5" />
        </Button>
      </footer>
    </article>
  );
}
