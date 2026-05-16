import type { Metadata, Viewport } from "next";
import { Inter, Fraunces } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { PwaRegister } from "@/components/pwa-register";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
  weight: ["400", "500", "600", "700"],
});

// Public origin used for absolute URLs in OG/Twitter/canonical tags. Most
// crawlers ignore relative URLs in og:image and og:url, which is why link
// previews were showing without a thumbnail or description before this was
// set. Override via NEXT_PUBLIC_SITE_URL if the canonical host changes.
const SITE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ?? "https://theplatinumkitchen.com";

const SITE_DESCRIPTION =
  "Order from Platinum Kitchen — refined Nigerian cuisine prepared with care, delivered across Abuja. Browse our menu, build your order, and we'll handle the rest.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Platinum Kitchen — Refined Nigerian Cuisine, Abuja",
    template: "%s · Platinum Kitchen",
  },
  description: SITE_DESCRIPTION,
  applicationName: "Platinum Kitchen",
  manifest: "/manifest.webmanifest",
  alternates: { canonical: "/" },
  keywords: [
    "Nigerian restaurant Abuja",
    "jollof rice Abuja",
    "food delivery Abuja",
    "Platinum Kitchen",
    "order Nigerian food online",
    "Abuja restaurants",
    "suya Abuja",
    "small chops Abuja",
  ],
  category: "food",
  appleWebApp: {
    capable: true,
    title: "Platinum Kitchen",
    statusBarStyle: "default",
  },
  formatDetection: { telephone: false },
  openGraph: {
    title: "Platinum Kitchen — Refined Nigerian Cuisine, Abuja",
    description: SITE_DESCRIPTION,
    url: SITE_URL,
    siteName: "Platinum Kitchen",
    locale: "en_NG",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Platinum Kitchen — Refined Nigerian Cuisine, Abuja",
    description: SITE_DESCRIPTION,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fafaf7" },
    { media: "(prefers-color-scheme: dark)", color: "#0f1419" },
  ],
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${inter.variable} ${fraunces.variable} h-full`}
    >
      <head>
        {/* Image CDNs we serve from. Preconnect cuts the first-image latency
            by ~100–300ms on cold mobile loads (DNS + TLS handshake happens
            in parallel with HTML parsing). */}
        <link rel="preconnect" href="https://res.cloudinary.com" crossOrigin="anonymous" />
        <link rel="preconnect" href="https://images.unsplash.com" crossOrigin="anonymous" />
        <link rel="dns-prefetch" href="https://res.cloudinary.com" />
        <link rel="dns-prefetch" href="https://images.unsplash.com" />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <TooltipProvider delay={120}>
          {children}
        </TooltipProvider>
        <PwaRegister />
        <Toaster
          position="top-center"
          richColors
          closeButton
          toastOptions={{
            classNames: {
              toast:
                "border border-border shadow-lg shadow-platinum-300/20",
            },
          }}
        />
      </body>
    </html>
  );
}
