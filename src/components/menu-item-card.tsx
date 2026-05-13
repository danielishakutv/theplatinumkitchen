"use client";

import Image from "next/image";
import { Plus, Flame, Sparkles, Leaf } from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { useCart } from "@/modules/cart";
import { ItemDetailDialog } from "@/components/item-detail-dialog";
import type { MenuItem } from "@/modules/menu";
import { formatNaira } from "@/lib/format";
import { cn } from "@/lib/utils";

const TAG_META: Record<string, { Icon: typeof Flame; label: string; className: string }> = {
  spicy: { Icon: Flame, label: "Spicy", className: "bg-red-50 text-red-700 ring-red-200" },
  "chef's-pick": {
    Icon: Sparkles,
    label: "Chef's pick",
    className: "bg-accent text-primary ring-emerald-300/60",
  },
  new: {
    Icon: Sparkles,
    label: "New",
    className: "bg-amber-50 text-amber-800 ring-amber-200",
  },
  vegan: { Icon: Leaf, label: "Vegan", className: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  vegetarian: { Icon: Leaf, label: "Veg", className: "bg-emerald-50 text-emerald-700 ring-emerald-200" },
  "gluten-free": {
    Icon: Leaf,
    label: "GF",
    className: "bg-platinum-100 text-platinum-700 ring-platinum-200",
  },
};

export function MenuItemCard({ item }: { item: MenuItem }) {
  const [open, setOpen] = useState(false);
  const addLine = useCart((s) => s.addLine);
  const openCart = useCart((s) => s.openCart);

  const hasAddons = (item.addonGroups?.length ?? 0) > 0;

  const handleQuickAdd = () => {
    if (hasAddons) {
      setOpen(true);
      return;
    }
    addLine({
      itemId: item.id,
      name: item.name,
      imageUrl: item.imageUrl,
      unitPrice: item.price,
      quantity: 1,
      addons: [],
    });
    toast.success(`${item.name} added`, {
      action: { label: "View cart", onClick: openCart },
    });
  };

  return (
    <>
      <article
        className={cn(
          "group relative flex flex-col overflow-hidden rounded-2xl border border-platinum-200 bg-card shadow-sm transition-all",
          "hover:-translate-y-0.5 hover:border-platinum-300 hover:shadow-lg hover:shadow-platinum-300/30",
          !item.available && "opacity-60",
        )}
      >
        <button
          type="button"
          onClick={() => setOpen(true)}
          className="relative aspect-[4/3] w-full overflow-hidden bg-platinum-100 text-left"
          aria-label={`View details for ${item.name}`}
        >
          <Image
            src={item.imageUrl}
            alt={item.name}
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
            className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
          />
          {item.tags && item.tags.length > 0 ? (
            <div className="absolute left-3 top-3 flex flex-wrap gap-1.5">
              {item.tags.slice(0, 2).map((tag) => {
                const meta = TAG_META[tag];
                if (!meta) return null;
                const { Icon, label, className } = meta;
                return (
                  <span
                    key={tag}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider ring-1 ring-inset",
                      className,
                    )}
                  >
                    <Icon className="h-2.5 w-2.5" />
                    {label}
                  </span>
                );
              })}
            </div>
          ) : null}
          {!item.available ? (
            <div className="absolute inset-0 grid place-items-center bg-background/80 backdrop-blur-sm">
              <span className="rounded-full bg-foreground px-4 py-1.5 text-xs font-semibold uppercase tracking-wider text-background">
                Sold out today
              </span>
            </div>
          ) : null}
        </button>

        <div className="flex flex-1 flex-col gap-3 p-5">
          <div className="space-y-1.5">
            <h3 className="font-display text-lg leading-tight">{item.name}</h3>
            <p className="text-sm leading-relaxed text-muted-foreground line-clamp-2">
              {item.description}
            </p>
          </div>

          <div className="mt-auto flex items-center justify-between gap-3 pt-2">
            <div className="flex flex-col">
              <span className="font-display text-xl font-semibold tabular-nums">
                {formatNaira(item.price)}
              </span>
              <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                ~ {item.prepMinutes} min
              </span>
            </div>
            <Button
              size="sm"
              onClick={handleQuickAdd}
              disabled={!item.available}
              className="h-10 gap-1.5 rounded-full px-4 shadow-sm"
            >
              <Plus className="h-4 w-4" />
              {hasAddons ? "Customise" : "Add"}
            </Button>
          </div>
        </div>
      </article>

      <ItemDetailDialog item={item} open={open} onOpenChange={setOpen} />
    </>
  );
}
