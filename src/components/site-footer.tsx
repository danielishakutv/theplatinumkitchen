import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
// Lucide v1 doesn't ship brand-mark icons (Facebook, X, etc.); we reuse
// generic glyphs and rely on aria-label + the URL for context.
import { Phone, Mail, MapPin, Camera, MessageCircle, Globe } from "lucide-react";
import { getSettings } from "@/modules/settings";

export async function SiteFooter() {
  const settings = await getSettings();
  const waNumber = settings.whatsappPhone.replace(/[^0-9]/g, "");
  const addressLine2 = [
    settings.addressArea,
    settings.addressCity,
    settings.addressState,
  ]
    .filter(Boolean)
    .join(", ");

  return (
    <footer className="mt-24 border-t border-platinum-200/70 bg-platinum-50">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 md:grid-cols-4 lg:px-8">
        <div className="md:col-span-2">
          <BrandMark size="lg" />
          {settings.tagline ? (
            <p className="mt-6 max-w-md text-sm leading-relaxed text-muted-foreground">
              {settings.tagline}
            </p>
          ) : null}
          <div className="mt-6 flex items-center gap-2">
            {waNumber ? (
              <SocialPill href={`https://wa.me/${waNumber}`} label="WhatsApp">
                <MessageCircle className="h-4 w-4" />
              </SocialPill>
            ) : null}
            {settings.instagramUrl ? (
              <SocialPill href={settings.instagramUrl} label="Instagram">
                <Camera className="h-4 w-4" />
              </SocialPill>
            ) : null}
            {settings.facebookUrl ? (
              <SocialPill href={settings.facebookUrl} label="Facebook">
                <Globe className="h-4 w-4" />
              </SocialPill>
            ) : null}
            {settings.twitterUrl ? (
              <SocialPill href={settings.twitterUrl} label="Twitter / X">
                <Globe className="h-4 w-4" />
              </SocialPill>
            ) : null}
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-foreground/80">
            Visit
          </h4>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            {settings.addressStreet || addressLine2 ? (
              <li className="flex gap-2.5">
                <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <span>
                  {settings.addressStreet || ""}
                  {settings.addressStreet && addressLine2 ? <br /> : null}
                  {addressLine2}
                </span>
              </li>
            ) : null}
            {settings.phone ? (
              <li className="flex gap-2.5">
                <Phone className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <a
                  href={`tel:${settings.phone.replace(/[^0-9+]/g, "")}`}
                  className="hover:text-foreground"
                >
                  {settings.phone}
                </a>
              </li>
            ) : null}
            {settings.email ? (
              <li className="flex gap-2.5">
                <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                <a
                  href={`mailto:${settings.email}`}
                  className="hover:text-foreground"
                >
                  {settings.email}
                </a>
              </li>
            ) : null}
          </ul>
        </div>

        <div>
          {settings.hoursSummary ? (
            <>
              <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-foreground/80">
                Hours
              </h4>
              <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                {settings.hoursSummary}
              </p>
            </>
          ) : null}
          <div className={settings.hoursSummary ? "mt-6" : ""}>
            <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-foreground/80">
              Useful
            </h4>
            <ul className="mt-3 space-y-2 text-sm text-muted-foreground">
              <li>
                <Link href="/menu" className="hover:text-foreground">
                  Full menu
                </Link>
              </li>
              <li>
                <Link href="/admin" className="hover:text-foreground">
                  Staff sign-in
                </Link>
              </li>
            </ul>
          </div>
        </div>
      </div>

      <div className="border-t border-platinum-200/60">
        <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-3 px-4 py-6 text-xs text-muted-foreground sm:flex-row sm:px-6 lg:px-8">
          <p>
            © {new Date().getFullYear()} {settings.restaurantName || "Platinum Kitchen"}.
            All rights reserved.
          </p>
          <p className="tracking-wide">Made with care.</p>
        </div>
      </div>
    </footer>
  );
}

function SocialPill({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="grid h-9 w-9 place-items-center rounded-full border border-platinum-300 bg-card text-foreground/80 transition-colors hover:border-primary hover:bg-accent hover:text-primary"
    >
      {children}
    </a>
  );
}
