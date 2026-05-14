"use client";

import { useState } from "react";
import { Check, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useCart, type CartLine } from "@/modules/cart";

// Order lines are snapshots — prices may have moved since. That's fine: the
// cart is just a draft, and createOrderFromCart re-prices everything against
// the live menu at checkout.
export function ReorderButton({ lines }: { lines: Omit<CartLine, "id">[] }) {
  const addLine = useCart((s) => s.addLine);
  const openCart = useCart((s) => s.openCart);
  const [done, setDone] = useState(false);

  const reorder = () => {
    for (const line of lines) addLine(line);
    openCart();
    setDone(true);
    setTimeout(() => setDone(false), 2000);
  };

  return (
    <Button
      variant="outline"
      size="sm"
      onClick={reorder}
      className="h-9 gap-1.5 rounded-full border-platinum-300"
    >
      {done ? (
        <>
          <Check className="h-3.5 w-3.5" /> Added to cart
        </>
      ) : (
        <>
          <RotateCcw className="h-3.5 w-3.5" /> Reorder
        </>
      )}
    </Button>
  );
}
