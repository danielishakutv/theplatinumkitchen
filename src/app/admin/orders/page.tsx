import Link from "next/link";
import { Plus } from "lucide-react";
import { auth } from "@/lib/auth";
import { listOrders } from "@/modules/orders";
import { can } from "@/modules/users";
import { Button } from "@/components/ui/button";
import { OrdersList } from "./orders-list";

export const dynamic = "force-dynamic";
export const metadata = { title: "Orders" };

export default async function OrdersPage() {
  const session = await auth();
  const user = session!.user;
  const orders = await listOrders(user, { limit: 200 });

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-medium tracking-tight sm:text-4xl">
            Orders
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {orders.length} order{orders.length === 1 ? "" : "s"} — most recent first.
          </p>
        </div>
        {can(user, "orders:write") ? (
          <Button asChild className="h-11 rounded-full px-5">
            <Link href="/admin/orders/new">
              <Plus className="mr-1.5 h-4 w-4" /> New order
            </Link>
          </Button>
        ) : null}
      </header>
      <OrdersList orders={orders} />
    </div>
  );
}
