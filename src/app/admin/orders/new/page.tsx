import Link from "next/link";
import { notFound } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/lib/auth";
import { can } from "@/modules/users";
import { listItems } from "@/modules/menu";
import { OrderForm } from "../order-form";

export const dynamic = "force-dynamic";
export const metadata = { title: "New order" };

export default async function NewOrderPage() {
  const session = await auth();
  if (!session?.user || !can(session.user, "orders:write")) notFound();
  const menu = await listItems();

  return (
    <div className="mx-auto max-w-4xl space-y-6">
      <div className="space-y-2">
        <Link
          href="/admin/orders"
          className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" /> Back to orders
        </Link>
        <h1 className="font-display text-3xl font-medium tracking-tight sm:text-4xl">
          New order
        </h1>
        <p className="text-sm text-muted-foreground">
          Place an order on behalf of a customer — phone-in or walk-in. It
          enters the kitchen queue like any other order.
        </p>
      </div>
      <OrderForm menu={menu} />
    </div>
  );
}
