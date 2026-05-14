import type { Metadata } from "next";
import { WifiOff } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";

export const metadata: Metadata = {
  title: "You're offline",
  description: "Platinum Kitchen — offline.",
};

// Static by design: the service worker caches this page at install time and
// serves it when a navigation fails with no connection. It must not depend on
// the database or any request-time data.
export default function OfflinePage() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 text-center">
      <BrandMark size="lg" />
      <div className="mt-10 grid h-16 w-16 place-items-center rounded-2xl bg-accent text-primary">
        <WifiOff className="h-7 w-7" />
      </div>
      <h1 className="mt-6 font-display text-3xl font-medium tracking-tight sm:text-4xl">
        You&apos;re offline
      </h1>
      <p className="mt-2 max-w-sm text-muted-foreground">
        We couldn&apos;t reach the kitchen. Check your connection and try again —
        your cart is saved on this device.
      </p>
      {/* eslint-disable-next-line @next/next/no-html-link-for-pages -- a full reload is intentional: it re-attempts the network connection */}
      <a href="/" className="mt-7 inline-flex h-11 items-center rounded-full bg-primary px-6 text-sm font-medium text-primary-foreground shadow-lg shadow-primary/20 transition-colors hover:bg-primary/90">
        Try again
      </a>
    </div>
  );
}
