import Link from "next/link";
import { CircleUserRound } from "lucide-react";
import { auth } from "@/lib/auth";
import { BrandMark } from "@/components/brand-mark";
import { CartButton } from "@/components/cart-button";
import { Button } from "@/components/ui/button";

export async function SiteHeader() {
  const session = await auth();
  const isStaff = Boolean(session && session.user?.role !== "customer");

  // Signed-in staff get a shortcut to the console; everyone else (signed-in
  // customers or guests) lands in the customer account area / sign-in.
  const account = session
    ? isStaff
      ? { href: "/admin", label: "Dashboard" }
      : { href: "/account", label: "Account" }
    : { href: "/sign-in?from=/account", label: "Sign in" };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-platinum-200/70 bg-background/85 backdrop-blur-md supports-[backdrop-filter]:bg-background/70">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <Link href="/" className="shrink-0">
          <BrandMark size="md" />
        </Link>

        <nav className="hidden items-center gap-1 md:flex">
          <NavLink href="/menu">Menu</NavLink>
          <NavLink href="/#about">Our story</NavLink>
          <NavLink href="/#hours">Hours</NavLink>
          <NavLink href="/#contact">Contact</NavLink>
        </nav>

        <div className="flex items-center gap-2">
          <Button
            asChild
            variant="ghost"
            size="sm"
            className="hidden h-10 rounded-full px-4 sm:inline-flex"
          >
            <Link href={account.href}>
              <CircleUserRound className="mr-1.5 h-4 w-4" />
              {account.label}
            </Link>
          </Button>
          <CartButton />
        </div>
      </div>
    </header>
  );
}

function NavLink({ href, children }: { href: string; children: React.ReactNode }) {
  return (
    <Link
      href={href}
      className="rounded-full px-4 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-accent-foreground"
    >
      {children}
    </Link>
  );
}
