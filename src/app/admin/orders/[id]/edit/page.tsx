import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/lib/auth";
import { can } from "@/modules/users";
import { getOrderById } from "@/modules/orders";
import { listItems } from "@/modules/menu";
import { Button } from "@/components/ui/button";
import { OrderForm } from "../../order-form";

export const dynamic = "force-dynamic";
export const metadata = { title: "Edit order" };

export default async function EditOrderPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await auth();
  if (!session?.user || !can(session.user, "orders:write")) notFound();
  const [order, menu] = await Promise.all([getOrderById(id), listItems()]);
  if (!order) notFound();

  // Finished orders are frozen — the service rejects edits to them anyway.
  const isClosed =
    order.status === "delivered" || order.status === "cancelled";

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="space-y-2">
        <Link
          href={`/admin/orders/${order.id}`}
          className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" /> Back to order
        </Link>
        <h1 className="font-display text-3xl font-medium tracking-tight sm:text-4xl">
          Edit {order.number}
        </h1>
        <p className="text-sm text-muted-foreground">
          Change items, customer details, fulfilment or payment method. Totals
          re-calculate on save.
        </p>
      </div>

      {isClosed ? (
        <div className="rounded-3xl border border-platinum-200 bg-card p-8 text-center">
          <p className="text-sm text-muted-foreground">
            This order is {order.status} and can no longer be edited.
          </p>
          <Button
            asChild
            variant="outline"
            className="mt-4 rounded-full"
          >
            <Link href={`/admin/orders/${order.id}`}>Back to order</Link>
          </Button>
        </div>
      ) : (
        <OrderForm menu={menu} order={order} />
      )}
    </div>
  );
}
