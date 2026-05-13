import { auth } from "@/lib/auth";
import { listOrders } from "@/modules/orders";
import { OrdersTable } from "./orders-table";

export const dynamic = "force-dynamic";
export const metadata = { title: "Orders" };

export default async function OrdersPage() {
  const session = await auth();
  const user = session!.user;
  const orders = await listOrders(user, { limit: 200 });

  return (
    <div className="space-y-6">
      <header>
        <h1 className="font-display text-3xl font-medium tracking-tight sm:text-4xl">
          Orders
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {orders.length} order{orders.length === 1 ? "" : "s"} — most recent first.
        </p>
      </header>
      <OrdersTable orders={orders} />
    </div>
  );
}
