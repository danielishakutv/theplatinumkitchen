import Link from "next/link";
import Image from "next/image";
import { ArrowRight, Bike, ChefHat, Receipt, MessageCircle, MapPin, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { MenuItemCard } from "@/components/menu-item-card";
import { listItems, type MenuItem } from "@/modules/menu";
import { getSettings, type Settings } from "@/modules/settings";

// Reads from the database (featured section + site settings), so we render on
// demand instead of at build time (when DATABASE_URL isn't available inside the
// Docker build).
export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [items, settings] = await Promise.all([listItems(), getSettings()]);
  const featured = items
    .filter((i) => i.tags?.includes("chef's-pick") && i.available)
    .slice(0, 4);

  return (
    <>
      <Hero settings={settings} />
      <Featured items={featured} />
      <HowItWorks />
      <Story settings={settings} />
      <VisitUs settings={settings} />
      <CTAStrip />
    </>
  );
}

function whatsappOrderLink(settings: Settings): string | null {
  const num = settings.whatsappPhone.replace(/[^0-9]/g, "");
  if (!num) return null;
  const text = `Hello ${settings.restaurantName || "team"}, I'd like to place an order`;
  return `https://wa.me/${num}?text=${encodeURIComponent(text)}`;
}

function Hero({ settings }: { settings: Settings }) {
  const heroImage = settings.heroImageUrl;
  const waLink = whatsappOrderLink(settings);
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0 -z-10">
        {heroImage ? (
          <Image
            src={heroImage}
            alt=""
            fill
            priority
            className="object-cover opacity-90"
            sizes="100vw"
          />
        ) : null}
        <div className="absolute inset-0 bg-gradient-to-b from-background/60 via-background/85 to-background" />
      </div>

      <div className="mx-auto max-w-7xl px-4 pb-20 pt-14 sm:px-6 sm:pt-20 lg:px-8 lg:pb-32 lg:pt-28">
        <div className="max-w-2xl">
          {settings.heroBadge ? (
            <span className="inline-flex items-center gap-2 rounded-full border border-platinum-200 bg-card/70 px-3 py-1 text-xs font-medium uppercase tracking-[0.18em] text-muted-foreground backdrop-blur">
              <span className="h-1.5 w-1.5 rounded-full bg-primary" />
              {settings.heroBadge}
            </span>
          ) : null}

          <h1 className="text-balance mt-6 font-display text-5xl font-medium leading-[1.05] tracking-tight sm:text-6xl lg:text-7xl">
            {settings.heroHeadline}
            {settings.heroHeadlineAccent ? (
              <>
                <br />
                <span className="italic text-primary">
                  {settings.heroHeadlineAccent}
                </span>
              </>
            ) : null}
          </h1>

          {settings.heroSubheadline ? (
            <p className="text-balance mt-6 max-w-xl text-lg leading-relaxed text-muted-foreground sm:text-xl">
              {settings.heroSubheadline}
            </p>
          ) : null}

          <div className="mt-9 flex flex-wrap items-center gap-3">
            <Button asChild size="lg" className="h-12 rounded-full px-7 text-base shadow-lg shadow-primary/20">
              <Link href="/menu">
                Browse the menu <ArrowRight className="ml-1.5 h-4 w-4" />
              </Link>
            </Button>
            {waLink ? (
              <Button
                asChild
                variant="outline"
                size="lg"
                className="h-12 rounded-full border-platinum-300 bg-card/70 px-6 text-base backdrop-blur"
              >
                <a href={waLink} target="_blank" rel="noopener noreferrer">
                  <MessageCircle className="mr-1.5 h-4 w-4" /> Order on WhatsApp
                </a>
              </Button>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}

function Featured({ items }: { items: MenuItem[] }) {
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
        "Cash on Delivery or a quick bank transfer — settle however suits you. Card and USSD payments are on the way.",
    },
    {
      Icon: Bike,
      title: "We bring it warm",
      body:
        "Our riders cover the city in roughly 35 minutes, with insulated bags so it lands the way it left.",
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

function Story({ settings }: { settings: Settings }) {
  const paragraphs = settings.storyBody
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter(Boolean);
  return (
    <section id="about" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="grid gap-12 lg:grid-cols-2 lg:items-center">
        <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-platinum-100">
          {settings.storyImageUrl ? (
            <Image
              src={settings.storyImageUrl}
              alt={`Inside ${settings.restaurantName}`}
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          ) : null}
        </div>

        <div className="space-y-5">
          <span className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
            Our story
          </span>
          <h2 className="text-balance font-display text-4xl font-medium leading-tight tracking-tight sm:text-5xl">
            {settings.storyHeading}
          </h2>
          {paragraphs.map((p, idx) => (
            <p
              key={idx}
              className={
                idx === 0
                  ? "text-lg leading-relaxed text-muted-foreground"
                  : "leading-relaxed text-muted-foreground"
              }
            >
              {p}
            </p>
          ))}
        </div>
      </div>
    </section>
  );
}

function VisitUs({ settings }: { settings: Settings }) {
  const addressLines = [
    settings.addressStreet,
    [settings.addressArea, settings.addressCity, settings.addressState]
      .filter(Boolean)
      .join(", "),
  ].filter(Boolean);
  return (
    <section id="hours" className="mx-auto max-w-7xl px-4 pb-20 sm:px-6 lg:px-8">
      <div className="grid gap-6 md:grid-cols-2">
        <Card
          Icon={Clock}
          eyebrow="Open today"
          title={settings.hoursToday || "By appointment"}
          body={settings.hoursSummary || "Hours coming soon."}
        />
        <Card
          Icon={MapPin}
          eyebrow="Find us"
          title={settings.addressArea || settings.addressCity || "Find us"}
          body={addressLines.join(" · ") || "Address coming soon."}
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
              Cash on Delivery or bank transfer — whichever is easiest for you.
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
          </div>
        </div>
      </div>
    </section>
  );
}
