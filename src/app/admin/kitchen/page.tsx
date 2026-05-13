import { auth } from "@/lib/auth";
import { listOrders, type Order } from "@/modules/orders";
import { cn } from "@/lib/utils";
import { KitchenCard } from "./kitchen-card";

export const dynamic = "force-dynamic";
export const metadata = { title: "Kitchen view" };

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

export default async function KitchenPage() {
  const session = await auth();
  const user = session!.user;
  const orders = await listOrders(user, {
    status: ["received", "preparing", "ready", "out_for_delivery"],
    limit: 200,
  });

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-medium tracking-tight sm:text-4xl">
            Kitchen view
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Tap a card&apos;s action to advance the order through the line.
          </p>
        </div>
        <span className="rounded-full bg-emerald-100 px-3 py-1 text-xs font-bold uppercase tracking-wider text-emerald-800">
          ● Live
        </span>
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
                  colOrders.map((order) => (
                    <KitchenCard key={order.id} order={order} />
                  ))
                )}
              </div>
            </section>
          );
        })}
      </div>
    </div>
  );
}
