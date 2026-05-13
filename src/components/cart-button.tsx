"use client";

import { ShoppingBag } from "lucide-react";
import { useCart, useCartTotals } from "@/modules/cart";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

export function CartButton({ className }: { className?: string }) {
  const open = useCart((s) => s.openCart);
  const { itemCount } = useCartTotals();

  return (
    <Button
      onClick={open}
      variant="outline"
      size="sm"
      className={cn(
        "relative h-10 gap-2 rounded-full border-platinum-200 bg-card pr-4 pl-3.5 shadow-sm hover:bg-accent",
        className,
      )}
    >
      <ShoppingBag className="h-4 w-4" />
      <span className="font-medium">Cart</span>
      {itemCount > 0 ? (
        <span className="ml-0.5 grid h-5 min-w-5 place-items-center rounded-full bg-primary px-1.5 text-[11px] font-semibold text-primary-foreground">
          {itemCount}
        </span>
      ) : null}
    </Button>
  );
}
