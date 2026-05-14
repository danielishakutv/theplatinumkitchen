import type { Metadata } from "next";
import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { auth } from "@/lib/auth";
import { NotificationList } from "@/components/notification-list";

export const metadata: Metadata = { title: "Notifications" };
export const dynamic = "force-dynamic";

export default async function AccountNotificationsPage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/sign-in?from=/account/notifications");
  }

  return (
    <div className="mx-auto max-w-2xl px-4 py-10 sm:px-6 lg:px-8">
      <Link
        href="/account"
        className="inline-flex items-center gap-1.5 text-sm font-medium text-muted-foreground transition-colors hover:text-foreground"
      >
        <ArrowLeft className="h-3.5 w-3.5" /> Back to account
      </Link>
      <header className="mt-3">
        <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
          My account
        </span>
        <h1 className="mt-2 font-display text-4xl font-medium leading-tight tracking-tight sm:text-5xl">
          Notifications
        </h1>
        <p className="mt-1 text-muted-foreground">
          Updates on your orders, as they happen.
        </p>
      </header>
      <div className="mt-8">
        <NotificationList orderHrefBase="/order" />
      </div>
    </div>
  );
}
