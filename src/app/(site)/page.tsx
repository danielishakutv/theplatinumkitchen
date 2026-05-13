import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Bike, ChefHat, Receipt, MessageCircle, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MenuItemCard } from "@/components/menu-item-card";
import { items } from "@/modules/menu";

const HERO_IMAGE =
  "https://images.unsplash.com/photo-1574484284002-952d92456975?w=1600&q=85&auto=format&fit=crop";

export default function HomePage() {
  const featured = items
    .filter((i) => i.tags?.includes("chef's-pick") && i.available)
    .slice(0, 4);

  return (
    <>
      <Hero />
      <Featured items={featured} />
      <HowItWorks />
      <Story />
      <VisitUs />
      <CTAStrip />
    </>
  );
}

function Hero() {
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        <Image
          src={HERO_IMAGE}
          alt=""
          fill
          priority
          className="object-cover opacity-90"
          sizes="100vw"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/85 to-background" />
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-20 pt-14 sm:px-6 sm:pt-20 lg:px-8 lg:pb-32 lg:pt-28">
        <div className="max-w-2xl">
          <span className="inline-flex items-center gap-2 rounded-full border border-platinum-200 bg-card/70 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-primary" />
            Now serving across Abuja
          </span>

          <h1 className="text-balance mt-6 font-display text-5xl font-medium leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
            A quiet revolution
            <br />
            <span className="italic text-primary">of Nigerian flavour.</span>
          </h1>

          <p className="text-balance mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
            Heritage recipes prepared with patience, plated with care, and
            delivered to your door — six days a week.
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Button asChild size="lg" className="h-12 rounded-full px-7 text-base shadow-lg shadow-primary/20">
              <Link href="/menu">
                Browse the menu <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
            <Button
              asChild
              variant="outline"
              size="lg"
              className="h-12 rounded-full border-platinum-300 bg-card/70 px-6 text-base backdrop-blur"
            >
              <a
                href="https://wa.me/2348000000000?text=Hello%20Platinum%20Kitchen%2C%20I%27d%20like%20to%20place%20an%20order"
                target="_blank"
                rel="noopener noreferrer"
              >
                <MessageCircle className="mr-1.5 h-4 w-4" /> Order on WhatsApp
              </a>
            </Button>
          </div>

          <dl className="mt-12 grid grid-cols-3 gap-x-6 gap-y-2 max-w-md">
            <Stat label="Years of tradition" value="12+" />
            <Stat label="Avg delivery" value="35 min" />
            <Stat label="On the menu" value="40+ dishes" />
          </dl>
        </div>
      </div>
    </section>
  );
}

function Stat({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-col gap-0.5 border-l border-platinum-300/70 pl-3 first:border-l-0 first:pl-0">
      <dd className="font-display text-2xl font-semibold tabular-nums">{value}</dd>
      <dt className="text-[11px] uppercase tracking-[0.16em] text-muted-foreground">{label}</dt>
    </div>
  );
}

function Featured({ items }: { items: typeof import("@/modules/menu").items }) {
  return (
    <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6 sm:py-24 lg:px-8">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <div className="max-w-xl space-y-3">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            From the chef
          </span>
          <h2 className="text-balance font-display text-4xl font-medium leading-tight tracking-tight sm:text-5xl">
            The dishes we built our name on
          </h2>
          <p className="text-muted-foreground">
            A curated handful from our kitchen — always available, always made the long way.
          </p>
        </div>
        <Button
          asChild
          variant="outline"
          className="h-11 rounded-full border-platinum-300"
        >
          <Link href="/menu">View full menu</Link>
        </Button>
      </div>

      <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item) => (
          <MenuItemCard key={item.id} item={item} />
        ))}
      </div>
    </section>
  );
}

function HowItWorks() {
  const steps = [
    {
      Icon: ChefHat,
      title: "Choose with care",
      body:
        "Browse our menu, customise each dish exactly how you want it, and add it to your basket.",
    },
    {
      Icon: Receipt,
      title: "Pay your way",
      body:
        "Cash on Delivery is our default — or pay securely online with Paystack. You're in control.",
    },
    {
      Icon: Bike,
      title: "We bring it warm",
      body:
        "Our riders cover Abuja in roughly 35 minutes, with insulated bags so it lands the way it left.",
    },
  ];

  return (
    <section className="bg-platinum-50/60 py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-xl">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            How it works
          </span>
          <h2 className="mt-3 font-display text-4xl font-medium leading-tight tracking-tight sm:text-5xl">
            Beautifully simple, start to finish.
          </h2>
        </div>

        <ol className="mt-12 grid gap-6 md:grid-cols-3">
          {steps.map(({ Icon, title, body }, i) => (
            <li
              key={title}
              className="relative rounded-2xl border border-platinum-200 bg-card p-7 shadow-sm"
            >
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-accent text-primary">
                <Icon className="h-5 w-5" />
              </div>
              <span className="absolute right-6 top-6 font-display text-3xl font-semibold text-platinum-300">
                0{i + 1}
              </span>
              <h3 className="mt-5 font-display text-xl font-medium">{title}</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{body}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function Story() {
  return (
    <section id="about" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
        <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-platinum-100">
          <Image
            src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=1000&q=85&auto=format&fit=crop"
            alt="Inside the Platinum Kitchen"
            fill
            sizes="(max-width: 1024px) 100vw, 50vw"
            className="object-cover"
          />
        </div>

        <div className="space-y-5">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Our story
          </span>
          <h2 className="text-balance font-display text-4xl font-medium leading-tight tracking-tight sm:text-5xl">
            We took our time, and you'll taste it.
          </h2>
          <p className="text-lg leading-relaxed text-muted-foreground">
            Platinum Kitchen began as a Sunday tradition in a small Abuja flat —
            a single pot of jollof, a few aunties, and the kind of arguments
            only the right pepper can settle.
          </p>
          <p className="leading-relaxed text-muted-foreground">
            Today we serve across the city, but the rules haven't changed: the
            stock is made from scratch, the chicken is grilled over real
            charcoal, and nothing leaves the kitchen if it doesn't taste like
            home.
          </p>
          <div className="grid grid-cols-3 gap-6 pt-4">
            <Stat label="Dishes daily" value="200+" />
            <Stat label="Repeat customers" value="68%" />
            <Stat label="Stars on Google" value="4.9" />
          </div>
        </div>
      </div>
    </section>
  );
}

function VisitUs() {
  return (
    <section id="hours" className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
      <div className="grid gap-6 md:grid-cols-2">
        <Card
          Icon={Clock}
          eyebrow="Open today"
          title="11:00 — 22:00"
          body="Mon–Thu · 11:00 — 22:00 · Fri–Sat 11:00 — 23:00 · Sun 13:00 — 22:00"
        />
        <Card
          Icon={MapPin}
          eyebrow="Find us"
          title="Wuse 2, Abuja"
          body="12 Aminu Kano Crescent · Beside Sahad Stores · Free parking after 6pm"
        />
      </div>
    </section>
  );
}

function Card({
  Icon,
  eyebrow,
  title,
  body,
}: {
  Icon: typeof Clock;
  eyebrow: string;
  title: string;
  body: string;
}) {
  return (
    <div className="relative overflow-hidden rounded-3xl border border-platinum-200 bg-card p-8">
      <div className="absolute -right-8 -top-8 h-32 w-32 rounded-full bg-accent/40 blur-2xl" />
      <div className="relative">
        <div className="grid h-11 w-11 place-items-center rounded-xl bg-accent text-primary">
          <Icon className="h-5 w-5" />
        </div>
        <p className="mt-5 text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {eyebrow}
        </p>
        <h3 className="mt-1 font-display text-3xl font-medium">{title}</h3>
        <p className="mt-3 text-sm leading-relaxed text-muted-foreground">{body}</p>
      </div>
    </div>
  );
}

function CTAStrip() {
  return (
    <section id="contact" className="mx-auto mb-4 max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-emerald-700 via-emerald-800 to-emerald-900 px-8 py-14 text-white sm:px-14 sm:py-20">
        <div className="absolute -bottom-20 -right-20 h-72 w-72 rounded-full bg-emerald-400/20 blur-3xl" />
        <div className="absolute -top-32 -left-10 h-72 w-72 rounded-full bg-emerald-300/10 blur-3xl" />
        <div className="relative flex flex-wrap items-center justify-between gap-8">
          <div className="max-w-xl space-y-3">
            <span className="text-xs font-semibold uppercase tracking-[0.2em] text-emerald-100">
              Ready when you are
            </span>
            <h2 className="text-balance font-display text-4xl font-medium leading-tight tracking-tight sm:text-5xl">
              Build your order in under two minutes.
            </h2>
            <p className="text-emerald-100/85">
              Cash on Delivery available, or pay securely with Paystack.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              asChild
              size="lg"
              className="h-12 rounded-full bg-white px-7 text-base font-medium text-emerald-900 hover:bg-emerald-50"
            >
              <Link href="/menu">Browse the menu</Link>
            </Button>
            <Button
              asChild
              size="lg"
              variant="outline"
              className="h-12 rounded-full border-white/30 bg-white/5 px-7 text-base text-white backdrop-blur hover:bg-white/10 hover:text-white"
            >
              <a href="tel:+2348000000000">Call us</a>
            </Button>
          </div>
        </div>
      </div>
    </section>
  );
}
