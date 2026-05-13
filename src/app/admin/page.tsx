import Link from "next/link";
import Image from "next/image";
import {
  TrendingUp,
  ShoppingBag,
  Clock,
  Wallet,
  ArrowUpRight,
  ChefHat,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { orders } from "@/modules/orders";
import { items } from "@/modules/menu";
import { ROLE_LABEL, listStaff, can } from "@/modules/users";
import { auth } from "@/lib/auth";
import { formatNaira, formatRelative } from "@/lib/format";
import { cn } from "@/lib/utils";

export default async function AdminOverviewPage() {
  const session = await auth();
  const user = session!.user; // layout already redirected if missing

  const today = new Date();
  const todayKey = today.toDateString();
  const todays = orders.filter(
    (o) => new Date(o.createdAt).toDateString() === todayKey,
  );
  const revenue = todays
    .filter((o) => o.status !== "cancelled")
    .reduce((sum, o) => sum + o.total, 0);
  const active = orders.filter(
    (o) => !["delivered", "cancelled"].includes(o.status),
  );
  const popular = items
    .filter((i) => i.tags?.includes("chef's-pick"))
    .slice(0, 4);

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
          delta="+18%"
          deltaPositive
          Icon={Wallet}
        />
        <Stat
          label="Orders today"
          value={String(todays.length)}
          delta="+4"
          deltaPositive
          Icon={ShoppingBag}
        />
        <Stat
          label="In progress"
          value={String(active.length)}
          delta="now"
          Icon={ChefHat}
        />
        <Stat
          label="Avg prep time"
          value="22 min"
          delta="-3 min"
          deltaPositive
          Icon={Clock}
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
                  <Link href={`/order/${order.id}`}>Open</Link>
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
              <p className="text-xs text-muted-foreground">By order count</p>
            </div>
            <TrendingUp className="h-4 w-4 text-primary" />
          </header>
          <ul className="divide-y divide-platinum-200">
            {popular.map((item, i) => (
              <li key={item.id} className="flex items-center gap-3 px-6 py-3.5">
                <span className="w-5 text-center text-xs font-semibold tabular-nums text-muted-foreground">
                  {i + 1}
                </span>
                <div className="relative h-11 w-11 shrink-0 overflow-hidden rounded-lg bg-platinum-100">
                  <Image
                    src={item.imageUrl}
                    alt=""
                    fill
                    sizes="44px"
                    className="object-cover"
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm font-medium">{item.name}</p>
                  <p className="text-xs text-muted-foreground tabular-nums">
                    {formatNaira(item.price)}
                  </p>
                </div>
                <span className="font-display text-sm font-semibold tabular-nums">
                  {[42, 31, 28, 24][i] ?? 0}
                </span>
              </li>
            ))}
          </ul>
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
