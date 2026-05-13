"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  ScrollText,
  ChefHat,
  Receipt,
  UtensilsCrossed,
  Users,
  Settings,
  Search,
  Bell,
  Menu as MenuIcon,
  X,
} from "lucide-react";
import { useState } from "react";
import { BrandMark } from "@/components/brand-mark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { UserMenu } from "@/components/admin/user-menu";
import { can, type Permission } from "@/modules/users/permissions";
import type { UserRole } from "@/modules/users/types";
import { cn } from "@/lib/utils";

interface SessionUserLike {
  id: string;
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role: UserRole;
}

interface NavItem {
  href: string;
  label: string;
  Icon: typeof LayoutDashboard;
  exact?: boolean;
  badge?: string;
  requires?: Permission;
}

const NAV: NavItem[] = [
  { href: "/admin", label: "Overview", Icon: LayoutDashboard, exact: true },
  { href: "/admin/orders", label: "Orders", Icon: ScrollText, badge: "live", requires: "orders:read" },
  { href: "/admin/kitchen", label: "Kitchen", Icon: ChefHat, requires: "kitchen:advance" },
  { href: "/admin/menu", label: "Menu", Icon: UtensilsCrossed, requires: "menu:read" },
  { href: "/admin/invoices", label: "Invoices", Icon: Receipt, requires: "invoices:read" },
  { href: "/admin/users", label: "Users & roles", Icon: Users, requires: "users:read" },
];

export function AdminShell({
  user,
  children,
}: {
  user: SessionUserLike;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const visibleNav = NAV.filter((n) => !n.requires || can(user, n.requires));

  return (
    <div className="min-h-screen bg-platinum-50">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 transform border-r border-platinum-200 bg-card transition-transform lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
        )}
      >
        <div className="flex h-16 items-center justify-between border-b border-platinum-200 px-5">
          <Link href="/admin" onClick={() => setMobileOpen(false)}>
            <BrandMark size="sm" />
          </Link>
          <button
            type="button"
            onClick={() => setMobileOpen(false)}
            className="grid h-9 w-9 place-items-center rounded-full text-muted-foreground hover:bg-accent lg:hidden"
            aria-label="Close menu"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <nav className="flex h-[calc(100%-4rem)] flex-col gap-1 overflow-y-auto p-3">
          <p className="px-3 pt-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground">
            Workspace
          </p>
          {visibleNav.map(({ href, label, Icon, exact, badge }) => {
            const active = exact ? pathname === href : pathname?.startsWith(href);
            return (
              <Link
                key={href}
                href={href}
                onClick={() => setMobileOpen(false)}
                className={cn(
                  "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors",
                  active
                    ? "bg-foreground text-background"
                    : "text-foreground/80 hover:bg-accent hover:text-foreground",
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <span className="flex-1">{label}</span>
                {badge ? (
                  <span
                    className={cn(
                      "rounded-full px-2 py-0.5 text-[9px] font-bold uppercase tracking-wider",
                      active
                        ? "bg-background/20 text-background"
                        : "bg-emerald-100 text-emerald-800",
                    )}
                  >
                    {badge}
                  </span>
                ) : null}
              </Link>
            );
          })}

          <div className="mt-auto space-y-1">
            {can(user, "settings:read") ? (
              <Link
                href="/admin/settings"
                className="flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium text-foreground/80 hover:bg-accent"
              >
                <Settings className="h-4 w-4" />
                Settings
              </Link>
            ) : null}
            <div className="mt-3">
              <UserMenu user={user} asPill />
            </div>
          </div>
        </nav>
      </aside>

      {mobileOpen ? (
        <div
          className="fixed inset-0 z-40 bg-foreground/40 backdrop-blur-sm lg:hidden"
          onClick={() => setMobileOpen(false)}
          aria-hidden
        />
      ) : null}

      <div className="lg:pl-72">
        <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-platinum-200 bg-card/85 px-4 backdrop-blur sm:px-6 lg:px-8">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setMobileOpen(true)}
            className="lg:hidden"
          >
            <MenuIcon className="h-5 w-5" />
          </Button>
          <div className="relative flex-1 max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search orders, dishes, customers…"
              className="h-10 rounded-full border-platinum-200 bg-platinum-50 pl-9"
            />
          </div>
          <Button variant="ghost" size="icon" className="relative">
            <Bell className="h-4 w-4" />
            <span className="absolute right-2.5 top-2.5 h-1.5 w-1.5 rounded-full bg-primary" />
          </Button>
          <Button asChild variant="outline" size="sm" className="hidden h-9 rounded-full sm:inline-flex">
            <Link href="/menu">View site</Link>
          </Button>
          <UserMenu user={user} />
        </header>

        <main className="p-4 sm:p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
