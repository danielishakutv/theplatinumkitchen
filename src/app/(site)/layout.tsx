import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { CartDrawer } from "@/components/cart-drawer";

// SiteFooter reads from the DB (settings module), and the layout wraps every
// (site) page. Without this, Next would try to statically prerender pages
// like /checkout at build time — inside the Docker build where the DB
// container doesn't exist yet — and crash with "DATABASE_URL is not set".
// Forcing dynamic at the layout level is the right place because everything
// under it depends on live settings.
export const dynamic = "force-dynamic";

export default function SiteLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <SiteHeader />
      <main className="flex-1">{children}</main>
      <SiteFooter />
      <CartDrawer />
    </>
  );
}
