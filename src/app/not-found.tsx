import Link from "next/link";
import { Button } from "@/components/ui/button";
import { BrandMark } from "@/components/brand-mark";

export default function NotFound() {
  return (
    <div className="flex min-h-[80vh] flex-col items-center justify-center gap-7 px-6 text-center">
      <BrandMark size="lg" />
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          404 — page not found
        </p>
        <h1 className="font-display text-5xl">Looks like the dish is off the menu.</h1>
        <p className="max-w-md text-muted-foreground">
          The page you were looking for couldn't be found. Head back to the menu
          and we'll start fresh.
        </p>
      </div>
      <Button asChild size="lg" className="h-12 rounded-full px-7">
        <Link href="/">Back to home</Link>
      </Button>
    </div>
  );
}
