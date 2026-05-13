import { cn } from "@/lib/utils";

export function BrandMark({
  className,
  size = "md",
  monogram = false,
}: {
  className?: string;
  size?: "sm" | "md" | "lg" | "xl";
  monogram?: boolean;
}) {
  const sizes = {
    sm: { wrap: "gap-2", mark: "h-7 w-7 text-xs", text: "text-base", sub: "text-[9px]" },
    md: { wrap: "gap-2.5", mark: "h-9 w-9 text-sm", text: "text-lg", sub: "text-[10px]" },
    lg: { wrap: "gap-3", mark: "h-12 w-12 text-base", text: "text-2xl", sub: "text-[11px]" },
    xl: { wrap: "gap-4", mark: "h-16 w-16 text-lg", text: "text-3xl", sub: "text-xs" },
  } as const;
  const s = sizes[size];

  return (
    <div className={cn("flex items-center", s.wrap, className)}>
      <div
        className={cn(
          "relative grid place-items-center rounded-full brand-gradient ring-1 ring-platinum-300/60 shadow-[0_2px_8px_-2px_rgb(15_23_42_/_0.15)]",
          s.mark,
        )}
      >
        <span className="font-display font-semibold text-platinum-800/90">PK</span>
        <span className="absolute inset-0 rounded-full ring-1 ring-inset ring-white/40" />
      </div>
      {!monogram ? (
        <div className="flex flex-col leading-none">
          <span className={cn("font-display font-semibold tracking-tight", s.text)}>
            Platinum Kitchen
          </span>
          <span
            className={cn(
              "uppercase tracking-[0.22em] text-muted-foreground/80 mt-1",
              s.sub,
            )}
          >
            Abuja · est. 2026
          </span>
        </div>
      ) : null}
    </div>
  );
}
