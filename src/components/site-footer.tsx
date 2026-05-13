import Link from "next/link";
import { BrandMark } from "@/components/brand-mark";
import { Phone, Mail, MapPin, Camera, MessageCircle } from "lucide-react";

export function SiteFooter() {
  return (
    <footer className="mt-24 border-t border-platinum-200/70 bg-platinum-50">
      <div className="mx-auto grid max-w-7xl gap-12 px-4 py-16 sm:px-6 md:grid-cols-4 lg:px-8">
        <div className="md:col-span-2">
          <BrandMark size="lg" />
          <p className="mt-6 max-w-md text-sm leading-relaxed text-muted-foreground">
            Refined Nigerian cuisine, prepared with patience and the kind of pepper your
            grandmother would respect. Delivered across Abuja, six days a week.
          </p>
          <div className="mt-6 flex items-center gap-2">
            <SocialPill href="https://wa.me/2348000000000" label="WhatsApp">
              <MessageCircle className="h-4 w-4" />
            </SocialPill>
            <SocialPill href="https://instagram.com/" label="Instagram">
              <Camera className="h-4 w-4" />
            </SocialPill>
          </div>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-foreground/80">
            Visit
          </h4>
          <ul className="mt-4 space-y-3 text-sm text-muted-foreground">
            <li className="flex gap-2.5">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <span>
                12 Aminu Kano Crescent
                <br />
                Wuse 2, Abuja, FCT
              </span>
            </li>
            <li className="flex gap-2.5">
              <Phone className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <a href="tel:+2348000000000" className="hover:text-foreground">
                +234 800 000 0000
              </a>
            </li>
            <li className="flex gap-2.5">
              <Mail className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
              <a href="mailto:hello@theplatinumkitchen.com" className="hover:text-foreground">
                hello@theplatinumkitchen.com
              </a>
            </li>
          </ul>
        </div>

        <div>
          <h4 className="text-sm font-semibold uppercase tracking-[0.18em] text-foreground/80">
            Hours
          </h4>
          <ul className="mt-4 space-y-2 text-sm text-muted-foreground">
            <li className="flex justify-between gap-4">
              <span>Mon — Thu</span>
              <span className="tabular-nums">11:00 — 22:00</span>
            </li>
            <li className="flex justify-between gap-4">
              <span>Fri — Sat</span>
              <span className="tabular-nums">11:00 — 23:00</span>
            </li>
            <li className="flex justify-between gap-4">
              <span>Sunday</span>
              <span className="tabular-nums">13:00 — 22:00</span>
            </li>
          </ul>
          <div className="mt-6">
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
          <p>© {new Date().getFullYear()} Platinum Kitchen. All rights reserved.</p>
          <p className="tracking-wide">Made with care in Abuja.</p>
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
