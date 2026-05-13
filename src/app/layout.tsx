import type { Metadata, Viewport } from "next";
import { Inter, Fraunces } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
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

export const metadata: Metadata = {
  title: {
    default: "Platinum Kitchen — Refined Nigerian Cuisine, Abuja",
    template: "%s · Platinum Kitchen",
  },
  description:
    "Order from Platinum Kitchen — refined Nigerian cuisine prepared with care, delivered across Abuja. Browse our menu, build your order, and we'll handle the rest.",
  applicationName: "Platinum Kitchen",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    title: "Platinum Kitchen",
    statusBarStyle: "default",
  },
  formatDetection: { telephone: false },
  openGraph: {
    title: "Platinum Kitchen — Refined Nigerian Cuisine",
    description:
      "Refined Nigerian cuisine prepared with care, delivered across Abuja.",
    siteName: "Platinum Kitchen",
    type: "website",
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
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <TooltipProvider delay={120}>
          {children}
        </TooltipProvider>
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
