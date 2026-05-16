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
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";
import { useEffect, useState } from "react";
import { BrandMark } from "@/components/brand-mark";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { UserMenu } from "@/components/admin/user-menu";
import { NotificationBell } from "@/components/notification-bell";
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
  { href: "/admin/notifications", label: "Notifications", Icon: Bell },
  { href: "/admin/kitchen", label: "Kitchen", Icon: ChefHat, requires: "kitchen:advance" },
  { href: "/admin/menu", label: "Menu", Icon: UtensilsCrossed, requires: "menu:read" },
  { href: "/admin/invoices", label: "Invoices", Icon: Receipt, requires: "invoices:read" },
  { href: "/admin/users", label: "Users & roles", Icon: Users, requires: "users:read" },
];

// localStorage key for the user's expand/collapse choice. Stored as "1" / "0"
// so it survives reloads without needing a server round-trip.
const COLLAPSED_KEY = "pk-admin-sidebar-collapsed";

export function AdminShell({
  user,
  children,
}: {
  user: SessionUserLike;
  children: React.ReactNode;
}) {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);
  // Start expanded on every render so SSR and the first client paint match.
  // The user's saved choice is applied right after mount via the effect below,
  // which avoids a hydration mismatch on the sidebar/main padding classes.
  const [collapsed, setCollapsed] = useState(false);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      setCollapsed(window.localStorage.getItem(COLLAPSED_KEY) === "1");
    } catch {
      // localStorage can throw in private-mode Safari — fall back to expanded.
    }
    setHydrated(true);
  }, []);

  const toggleCollapsed = () => {
    setCollapsed((prev) => {
      const next = !prev;
      try {
        window.localStorage.setItem(COLLAPSED_KEY, next ? "1" : "0");
      } catch {
        /* ignore */
      }
      return next;
    });
  };

  const visibleNav = NAV.filter((n) => !n.requires || can(user, n.requires));

  return (
    <div className="min-h-screen bg-platinum-50">
      <aside
        className={cn(
          "fixed inset-y-0 left-0 z-50 w-72 transform border-r border-platinum-200 bg-card transition-[transform,width] duration-200 ease-out lg:translate-x-0",
          mobileOpen ? "translate-x-0" : "-translate-x-full",
          // Width only collapses on lg+ — the mobile drawer is always full
          // width so collapsed mode never affects touch users.
          collapsed ? "lg:w-16" : "lg:w-72",
        )}
      >
        <div
          className={cn(
            "flex h-16 items-center border-b border-platinum-200",
            collapsed ? "lg:justify-center lg:px-2 px-5 justify-between" : "justify-between px-5",
          )}
        >
          <Link
            href="/admin"
            onClick={() => setMobileOpen(false)}
            aria-label="Platinum Kitchen admin"
            className="shrink-0"
          >
            {/* When collapsed on desktop, show only the round monogram. The
                mobile drawer (lg:hidden width override) keeps the full mark. */}
            <span className={cn(collapsed ? "lg:hidden" : "")}>
              <BrandMark size="sm" />
            </span>
            {collapsed ? (
              <span className="hidden lg:inline">
                <BrandMark size="sm" monogram />
              </span>
            ) : null}
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

        <nav
          className={cn(
            "flex h-[calc(100%-4rem)] flex-col gap-1 overflow-y-auto",
            collapsed ? "lg:p-2 p-3" : "p-3",
          )}
        >
          <p
            className={cn(
              "pt-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-muted-foreground",
              collapsed ? "lg:hidden px-3" : "px-3",
            )}
          >
            Workspace
          </p>
          {visibleNav.map((item) => (
            <NavLink
              key={item.href}
              item={item}
              pathname={pathname}
              collapsed={collapsed}
              onNavigate={() => setMobileOpen(false)}
            />
          ))}

          <div className="mt-auto space-y-1">
            {can(user, "settings:read") ? (
              <NavLink
                item={{
                  href: "/admin/settings",
                  label: "Settings",
                  Icon: Settings,
                }}
                pathname={pathname}
                collapsed={collapsed}
                onNavigate={() => setMobileOpen(false)}
              />
            ) : null}
            <div className={cn("mt-3", collapsed ? "lg:hidden" : "")}>
              <UserMenu user={user} asPill />
            </div>
            {collapsed ? (
              <div className="mt-3 hidden lg:flex justify-center">
                <UserMenu user={user} />
              </div>
            ) : null}

            {/* Desktop-only collapse / expand toggle. Hidden until hydrated so
                we don't flash the wrong chevron on first paint. */}
            <button
              type="button"
              onClick={toggleCollapsed}
              aria-label={collapsed ? "Expand sidebar" : "Collapse sidebar"}
              aria-pressed={collapsed}
              className={cn(
                "mt-2 hidden lg:flex items-center gap-2 rounded-xl border border-platinum-200 bg-platinum-50 text-xs font-medium text-muted-foreground transition-colors hover:bg-card hover:text-foreground",
                collapsed ? "justify-center p-2" : "px-3 py-2",
                hydrated ? "" : "invisible",
              )}
            >
              {collapsed ? (
                <ChevronsRight className="h-4 w-4" />
              ) : (
                <>
                  <ChevronsLeft className="h-4 w-4" />
                  <span>Collapse</span>
                </>
              )}
            </button>
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

      <div
        className={cn(
          "transition-[padding] duration-200 ease-out",
          collapsed ? "lg:pl-16" : "lg:pl-72",
        )}
      >
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
          <NotificationBell
            notificationsHref="/admin/notifications"
            orderHrefBase="/admin/orders"
          />
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

// Single nav item. Renders icon + label when the sidebar is expanded, and an
// icon-only square with a hover tooltip when collapsed. The mobile drawer is
// always full width so it ignores `collapsed` and shows the full label.
function NavLink({
  item,
  pathname,
  collapsed,
  onNavigate,
}: {
  item: NavItem;
  pathname: string | null;
  collapsed: boolean;
  onNavigate: () => void;
}) {
  const { href, label, Icon, exact, badge } = item;
  const active = exact ? pathname === href : pathname?.startsWith(href);

  const fullLink = (
    <Link
      href={href}
      onClick={onNavigate}
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

  if (!collapsed) {
    return fullLink;
  }

  // Collapsed mode: full-label link on mobile (drawer width is still 72), and
  // icon-only with a right-side tooltip on lg+. Two separate elements so the
  // tooltip wiring doesn't bleed into the mobile drawer.
  return (
    <>
      <span className="lg:hidden">{fullLink}</span>
      <Tooltip>
        <TooltipTrigger
          render={
            <Link
              href={href}
              onClick={onNavigate}
              aria-label={label}
              className={cn(
                "hidden lg:grid relative h-10 w-10 mx-auto place-items-center rounded-xl transition-colors",
                active
                  ? "bg-foreground text-background"
                  : "text-foreground/80 hover:bg-accent hover:text-foreground",
              )}
            >
              <Icon className="h-4 w-4" />
              {badge ? (
                <span
                  className="absolute right-1 top-1 h-1.5 w-1.5 rounded-full bg-emerald-500"
                  aria-hidden
                />
              ) : null}
            </Link>
          }
        />
        <TooltipContent side="right" sideOffset={12}>
          {label}
          {badge ? (
            <span className="ml-1.5 rounded-full bg-emerald-500/20 px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-emerald-200">
              {badge}
            </span>
          ) : null}
        </TooltipContent>
      </Tooltip>
    </>
  );
}
