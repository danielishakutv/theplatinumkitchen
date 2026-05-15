import Link from "next/link";
import Image from "next/image";
import {
  TrendingUp,
  ShoppingBag,
  Receipt,
  Wallet,
  ArrowUpRight,
  ChefHat,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { getPopularItems, listOrders } from "@/modules/orders";
import { ROLE_LABEL, listStaff, can } from "@/modules/users";

export const dynamic = "force-dynamic";
import { auth } from "@/lib/auth";
import { formatNaira, formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";

export default async function AdminOverviewPage() {
  const session = await auth();
  const user = session!.user; // layout already redirected if missing

  const today = new Date();
  const todayStart = new Date(today);
  todayStart.setHours(0, 0, 0, 0);
  const yesterdayStart = new Date(
    todayStart.getTime() - 24 * 60 * 60 * 1000,
  );

  const orders = can(user, "orders:read")
    ? await listOrders(user, { limit: 500 })
    : [];

  const todays = orders.filter(
    (o) => new Date(o.createdAt) >= todayStart,
  );
  const yesterdays = orders.filter((o) => {
    const t = new Date(o.createdAt);
    return t >= yesterdayStart && t < todayStart;
  });

  const sumRevenue = (xs: typeof orders) =>
    xs
      .filter((o) => o.status !== "cancelled")
      .reduce((s, o) => s + o.total, 0);
  const revenue = sumRevenue(todays);
  const yesterdayRevenue = sumRevenue(yesterdays);
  const aovToday =
    todays.length > 0 ? Math.round(revenue / todays.length) : 0;
  const aovYesterday =
    yesterdays.length > 0
      ? Math.round(yesterdayRevenue / yesterdays.length)
      : 0;

  const active = orders.filter(
    (o) => !["delivered", "cancelled"].includes(o.status),
  );

  const popular = can(user, "orders:read")
    ? await getPopularItems(user, { days: 7, limit: 4 })
    : [];

  // Day-over-day delta strings. Pct change for money; absolute diff for counts.
  // When there's no yesterday baseline we hide the delta rather than fabricate
  // one — same reason: keep the dashboard honest.
  const pctDelta = (now: number, prev: number) => {
    if (prev <= 0) return null;
    const pct = Math.round(((now - prev) / prev) * 100);
    return {
      text: `${pct >= 0 ? "+" : ""}${pct}% vs yesterday`,
      positive: pct >= 0,
    };
  };
  const diffDelta = (now: number, prev: number) => {
    const d = now - prev;
    return {
      text: `${d >= 0 ? "+" : ""}${d} vs yesterday`,
      positive: d >= 0,
    };
  };
  const revenueDelta = pctDelta(revenue, yesterdayRevenue);
  const ordersDelta = diffDelta(todays.length, yesterdays.length);
  const aovDelta = pctDelta(aovToday, aovYesterday);

  const onShift = can(user, "users:read") ? await listStaff(user) : [];
  const firstName = user.name?.split(" ")[0] ?? "there";

  return (
    <div className="space-y-8">
      <header className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            {today.toLocaleDateString("en-NG", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric",
            })}
          </p>
          <h1 className="mt-1 font-display text-4xl font-medium tracking-tight">
            Welcome back, {firstName}.
          </h1>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button asChild variant="outline" className="h-10 rounded-full">
            <Link href="/admin/orders">View live orders</Link>
          </Button>
          <Button asChild className="h-10 rounded-full">
            <Link href="/admin/menu">Manage menu</Link>
          </Button>
        </div>
      </header>

      {/* KPIs */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Stat
          label="Revenue today"
          value={formatNaira(revenue)}
          delta={revenueDelta?.text}
          deltaPositive={revenueDelta?.positive}
          Icon={Wallet}
        />
        <Stat
          label="Orders today"
          value={String(todays.length)}
          delta={ordersDelta.text}
          deltaPositive={ordersDelta.positive}
          Icon={ShoppingBag}
        />
        <Stat
          label="In progress"
          value={String(active.length)}
          delta="now"
          Icon={ChefHat}
        />
        <Stat
          label="Avg order value today"
          value={formatNaira(aovToday)}
          delta={aovDelta?.text}
          deltaPositive={aovDelta?.positive}
          Icon={Receipt}
        />
      </div>

      {/* Two columns */}
      <div className="grid gap-6 lg:grid-cols-3">
        {/* Active orders */}
        <section className="lg:col-span-2 rounded-3xl border border-platinum-200 bg-card">
          <header className="flex items-center justify-between border-b border-platinum-200 px-6 py-4">
            <div>
              <h2 className="font-display text-xl">Active orders</h2>
              <p className="text-xs text-muted-foreground">
                {active.length} orders need attention
              </p>
            </div>
            <Button asChild variant="ghost" size="sm" className="h-9 rounded-full">
              <Link href="/admin/orders">
                View all <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </header>
          <ul className="divide-y divide-platinum-200">
            {active.slice(0, 5).map((order) => (
              <li
                key={order.id}
                className="grid grid-cols-[1fr_auto] items-center gap-4 px-6 py-4 sm:grid-cols-[1fr_auto_auto_auto]"
              >
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="font-medium tabular-nums">{order.number}</p>
                    <StatusBadge status={order.status} />
                  </div>
                  <p className="mt-0.5 truncate text-xs text-muted-foreground">
                    {order.customer.name} ·{" "}
                    {order.lines.reduce((s, l) => s + l.quantity, 0)} items ·{" "}
                    {formatRelative(order.createdAt)}
                  </p>
                </div>
                <span className="hidden text-xs uppercase tracking-wider text-muted-foreground sm:inline">
                  {order.fulfilment.replace("_", " ")}
                </span>
                <span className="font-display text-base font-semibold tabular-nums">
                  {formatNaira(order.total)}
                </span>
                <Button asChild variant="ghost" size="sm" className="h-8 rounded-full">
                  <Link href={`/admin/orders/${order.id}`}>Open</Link>
                </Button>
              </li>
            ))}
          </ul>
        </section>

        {/* Popular items */}
        <section className="rounded-3xl border border-platinum-200 bg-card">
          <header className="flex items-center justify-between border-b border-platinum-200 px-6 py-4">
            <div>
              <h2 className="font-display text-xl">Popular this week</h2>
              <p className="text-xs text-muted-foreground">
                Last 7 days, by units sold
              </p>
            </div>
            <TrendingUp className="h-4 w-4 text-primary" />
          </header>
          {popular.length === 0 ? (
            <p className="px-6 py-8 text-center text-sm text-muted-foreground">
              No sales yet this week.
            </p>
          ) : (
            <ul className="divide-y divide-platinum-200">
              {popular.map((item, i) => (
                <li
                  key={item.itemId}
                  className="flex items-center gap-3 px-6 py-3.5"
                >
                  <span className="w-5 text-center text-xs font-semibold tabular-nums text-muted-foreground">
                    {i + 1}
                  </span>
                  <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-platinum-100">
                    {item.imageUrl ? (
                      <Image
                        src={item.imageUrl}
                        alt=""
                        fill
                        sizes="44px"
                        className="object-cover"
                      />
                    ) : null}
                  </div>
                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium">
                      {item.itemName}
                    </p>
                  </div>
                  <span className="font-display text-sm font-semibold tabular-nums">
                    {item.totalQuantity}
                    <span className="ml-1 text-xs font-medium text-muted-foreground">
                      sold
                    </span>
                  </span>
                </li>
              ))}
            </ul>
          )}
        </section>
      </div>

      {/* Roster */}
      {onShift.length > 0 ? (
        <section className="rounded-3xl border border-platinum-200 bg-card">
          <header className="flex items-center justify-between border-b border-platinum-200 px-6 py-4">
            <div>
              <h2 className="font-display text-xl">On shift</h2>
              <p className="text-xs text-muted-foreground">
                {onShift.filter((u) => u.active).length} active
              </p>
            </div>
            <Button asChild variant="ghost" size="sm" className="h-9 rounded-full">
              <Link href="/admin/users">
                Manage <ArrowUpRight className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </header>
          <div className="grid gap-3 p-6 sm:grid-cols-2 lg:grid-cols-3">
            {onShift
              .filter((u) => u.active)
              .map((u) => (
                <div
                  key={u.id}
                  className="flex items-center gap-3 rounded-2xl border border-platinum-200 bg-platinum-50 p-3"
                >
                  <Avatar className="h-10 w-10">
                    <AvatarImage src={u.avatarUrl} alt={u.name} />
                    <AvatarFallback>{u.name.charAt(0)}</AvatarFallback>
                  </Avatar>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium">{u.name}</p>
                    <p className="truncate text-xs text-muted-foreground">
                      {ROLE_LABEL[u.role]}
                    </p>
                  </div>
                </div>
              ))}
          </div>
        </section>
      ) : null}
    </div>
  );
}

function Stat({
  label,
  value,
  delta,
  deltaPositive,
  Icon,
}: {
  label: string;
  value: string;
  delta?: string;
  deltaPositive?: boolean;
  Icon: typeof Wallet;
}) {
  return (
    <div className="rounded-3xl border border-platinum-200 bg-card p-5">
      <div className="flex items-center justify-between">
        <p className="text-xs font-medium uppercase tracking-[0.16em] text-muted-foreground">
          {label}
        </p>
        <span className="grid h-9 w-9 place-items-center rounded-xl bg-accent text-primary">
          <Icon className="h-4 w-4" />
        </span>
      </div>
      <p className="mt-3 font-display text-3xl font-semibold tabular-nums">{value}</p>
      {delta ? (
        <p
          className={cn(
            "mt-1 text-xs",
            deltaPositive ? "text-emerald-700" : "text-muted-foreground",
          )}
        >
          {delta}
        </p>
      ) : null}
    </div>
  );
}

function StatusBadge({ status }: { status: string }) {
  const map: Record<string, string> = {
    received: "bg-blue-100 text-blue-800",
    preparing: "bg-amber-100 text-amber-800",
    ready: "bg-emerald-100 text-emerald-800",
    out_for_delivery: "bg-purple-100 text-purple-800",
    delivered: "bg-platinum-100 text-platinum-700",
    cancelled: "bg-red-50 text-red-700",
  };
  return (
    <span
      className={cn(
        "rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider",
        map[status] ?? "bg-platinum-100 text-platinum-700",
      )}
    >
      {status.replace("_", " ")}
    </span>
  );
}
