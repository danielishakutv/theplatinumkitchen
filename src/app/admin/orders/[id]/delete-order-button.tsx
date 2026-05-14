"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteOrderAction } from "../actions";

// Hard-delete control for the order detail page. Confirms first, then — on
// success — leaves for the orders list, since this order's page is now gone.
export function DeleteOrderButton({
  orderId,
  orderNumber,
}: {
  orderId: string;
  orderNumber: string;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleDelete = () => {
    setError(null);
    if (
      !confirm(
        `Permanently delete order ${orderNumber}? This can't be undone. ` +
          `To keep the record, cancel the order instead.`,
      )
    )
      return;
    start(async () => {
      const r = await deleteOrderAction(orderId);
      if (!r.ok) {
        setError(r.error ?? "Delete failed.");
        return;
      }
      router.push("/admin/orders");
      router.refresh();
    });
  };

  return (
    <div className="space-y-3">
      <Button
        onClick={handleDelete}
        disabled={pending}
        variant="outline"
        size="sm"
        className="h-9 rounded-full border-destructive/40 text-destructive hover:bg-destructive/5 hover:text-destructive"
      >
        {pending ? (
          <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
        ) : (
          <Trash2 className="mr-1.5 h-3.5 w-3.5" />
        )}
        Delete order
      </Button>
      {error ? (
        <div
          role="alert"
          className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </div>
      ) : null}
    </div>
  );
}
