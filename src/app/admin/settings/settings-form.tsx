"use client";

import { useState, useTransition } from "react";
import { CheckCircle2, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { ImageUploadField } from "@/components/admin/image-upload-field";
import { saveSettingsAction } from "./actions";
import type { Settings } from "@/modules/settings";

export function SettingsForm({ settings }: { settings: Settings }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSavedAt(null);
    const fd = new FormData(e.currentTarget);
    start(async () => {
      const result = await saveSettingsAction(fd);
      if (!result.ok) {
        setError(result.error ?? "Save failed.");
        return;
      }
      setSavedAt(Date.now());
    });
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      <Section
        title="Restaurant identity"
        description="The name customers see across the site, header, footer, and emails."
      >
        <Field label="Restaurant name" htmlFor="restaurantName">
          <Input
            id="restaurantName"
            name="restaurantName"
            required
            defaultValue={settings.restaurantName}
            className="h-11"
          />
        </Field>
        <Field
          label="Tagline"
          htmlFor="tagline"
          hint="A short line shown in the page <title> and some headers."
        >
          <Input
            id="tagline"
            name="tagline"
            defaultValue={settings.tagline}
            placeholder="A quiet revolution of Nigerian flavour"
            maxLength={200}
            className="h-11"
          />
        </Field>
      </Section>

      <Section
        title="Contact"
        description="Phone for calls, WhatsApp number for share/order links, email for replies."
      >
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Display phone" htmlFor="phone">
            <Input
              id="phone"
              name="phone"
              defaultValue={settings.phone}
              placeholder="+234 803 412 9087"
              className="h-11"
              inputMode="tel"
            />
          </Field>
          <Field
            label="WhatsApp number"
            htmlFor="whatsappPhone"
            hint='International format, no "+" or spaces (e.g. 2348034129087).'
          >
            <Input
              id="whatsappPhone"
              name="whatsappPhone"
              defaultValue={settings.whatsappPhone}
              placeholder="2348034129087"
              className="h-11 tabular-nums"
              inputMode="numeric"
              pattern="[0-9]*"
            />
          </Field>
        </div>
        <Field label="Email" htmlFor="email">
          <Input
            id="email"
            name="email"
            type="email"
            defaultValue={settings.email}
            placeholder="hello@theplatinumkitchen.com"
            className="h-11"
          />
        </Field>
      </Section>

      <Section
        title="Address"
        description='The "Visit us" card on the homepage uses these.'
      >
        <Field label="Street" htmlFor="addressStreet">
          <Input
            id="addressStreet"
            name="addressStreet"
            defaultValue={settings.addressStreet}
            placeholder="12 Aminu Kano Crescent"
            className="h-11"
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Area" htmlFor="addressArea">
            <Input
              id="addressArea"
              name="addressArea"
              defaultValue={settings.addressArea}
              placeholder="Wuse 2"
              className="h-11"
            />
          </Field>
          <Field label="City" htmlFor="addressCity">
            <Input
              id="addressCity"
              name="addressCity"
              defaultValue={settings.addressCity}
              placeholder="Abuja"
              className="h-11"
            />
          </Field>
          <Field label="State" htmlFor="addressState">
            <Input
              id="addressState"
              name="addressState"
              defaultValue={settings.addressState}
              placeholder="FCT"
              className="h-11"
            />
          </Field>
        </div>
      </Section>

      <Section
        title="Operating hours"
        description="Plain text — replace with a real per-day schedule later if needed."
      >
        <Field
          label="Today's hours"
          htmlFor="hoursToday"
          hint='The headline value on the "Visit us" card.'
        >
          <Input
            id="hoursToday"
            name="hoursToday"
            defaultValue={settings.hoursToday}
            placeholder="11:00 — 22:00"
            className="h-11"
          />
        </Field>
        <Field label="Weekly summary" htmlFor="hoursSummary">
          <Input
            id="hoursSummary"
            name="hoursSummary"
            defaultValue={settings.hoursSummary}
            placeholder="Mon–Thu · 11:00 — 22:00 · Fri–Sat 11:00 — 23:00 · Sun 13:00 — 22:00"
            className="h-11"
          />
        </Field>
      </Section>

      <Section
        title="Bank transfer"
        description="Shown to customers who pick &quot;Bank Transfer&quot; at checkout. Leave the account number blank to hide the option entirely."
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Bank name" htmlFor="bankName">
            <Input
              id="bankName"
              name="bankName"
              defaultValue={settings.bankName}
              placeholder="GTBank"
              className="h-11"
            />
          </Field>
          <Field label="Account name" htmlFor="bankAccountName">
            <Input
              id="bankAccountName"
              name="bankAccountName"
              defaultValue={settings.bankAccountName}
              placeholder="Platinum Kitchen Ltd"
              className="h-11"
            />
          </Field>
          <Field label="Account number" htmlFor="bankAccountNumber">
            <Input
              id="bankAccountNumber"
              name="bankAccountNumber"
              defaultValue={settings.bankAccountNumber}
              placeholder="0123456789"
              className="h-11 tabular-nums"
              inputMode="numeric"
            />
          </Field>
        </div>
        <Field
          label="Transfer instructions"
          htmlFor="bankTransferNote"
          hint="A short line telling the customer what to do after transferring."
        >
          <Textarea
            id="bankTransferNote"
            name="bankTransferNote"
            rows={2}
            defaultValue={settings.bankTransferNote}
            maxLength={500}
            placeholder="Use your order number as the transfer reference, then send proof to our WhatsApp."
          />
        </Field>
      </Section>

      <Section
        title="Homepage hero"
        description="The big top section visitors see first."
      >
        <Field label="Eyebrow / badge" htmlFor="heroBadge">
          <Input
            id="heroBadge"
            name="heroBadge"
            defaultValue={settings.heroBadge}
            placeholder="Now serving across Abuja"
            className="h-11"
          />
        </Field>
        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Headline" htmlFor="heroHeadline">
            <Input
              id="heroHeadline"
              name="heroHeadline"
              defaultValue={settings.heroHeadline}
              placeholder="A quiet revolution"
              className="h-11"
            />
          </Field>
          <Field
            label="Headline accent"
            htmlFor="heroHeadlineAccent"
            hint="The italic emerald-coloured part."
          >
            <Input
              id="heroHeadlineAccent"
              name="heroHeadlineAccent"
              defaultValue={settings.heroHeadlineAccent}
              placeholder="of Nigerian flavour."
              className="h-11"
            />
          </Field>
        </div>
        <Field label="Subheadline" htmlFor="heroSubheadline">
          <Textarea
            id="heroSubheadline"
            name="heroSubheadline"
            rows={3}
            defaultValue={settings.heroSubheadline}
            maxLength={500}
          />
        </Field>
        <ImageUploadField
          name="heroImageUrl"
          label="Hero image"
          defaultValue={settings.heroImageUrl}
          hint="The full-width background behind the headline."
        />
      </Section>

      <Section
        title='"Our story" section'
        description="The narrative block under the homepage hero."
      >
        <Field label="Heading" htmlFor="storyHeading">
          <Input
            id="storyHeading"
            name="storyHeading"
            defaultValue={settings.storyHeading}
            className="h-11"
          />
        </Field>
        <Field
          label="Body"
          htmlFor="storyBody"
          hint="Blank lines separate paragraphs."
        >
          <Textarea
            id="storyBody"
            name="storyBody"
            rows={8}
            defaultValue={settings.storyBody}
            maxLength={2000}
          />
        </Field>
        <ImageUploadField
          name="storyImageUrl"
          label="Story image"
          defaultValue={settings.storyImageUrl}
          hint="The portrait image beside the story text."
        />
      </Section>

      <Section
        title="Social"
        description="Optional links shown in the footer."
      >
        <div className="grid gap-4 sm:grid-cols-3">
          <Field label="Instagram URL" htmlFor="instagramUrl">
            <Input
              id="instagramUrl"
              name="instagramUrl"
              type="url"
              defaultValue={settings.instagramUrl}
              placeholder="https://instagram.com/…"
              className="h-11"
            />
          </Field>
          <Field label="Facebook URL" htmlFor="facebookUrl">
            <Input
              id="facebookUrl"
              name="facebookUrl"
              type="url"
              defaultValue={settings.facebookUrl}
              placeholder="https://facebook.com/…"
              className="h-11"
            />
          </Field>
          <Field label="Twitter / X URL" htmlFor="twitterUrl">
            <Input
              id="twitterUrl"
              name="twitterUrl"
              type="url"
              defaultValue={settings.twitterUrl}
              placeholder="https://x.com/…"
              className="h-11"
            />
          </Field>
        </div>
      </Section>

      {error ? (
        <div
          role="alert"
          className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </div>
      ) : null}
      {savedAt ? (
        <div
          role="status"
          className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"
        >
          <CheckCircle2 className="h-4 w-4" />
          Saved.
        </div>
      ) : null}

      <div className="sticky bottom-4 -mx-4 flex flex-col-reverse gap-3 border-t border-platinum-200 bg-background/90 px-4 py-4 backdrop-blur sm:mx-0 sm:flex-row sm:justify-end sm:rounded-2xl sm:border sm:px-6">
        <Button
          type="submit"
          disabled={pending}
          className="h-11 rounded-full px-6"
        >
          {pending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…
            </>
          ) : (
            "Save settings"
          )}
        </Button>
      </div>
    </form>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-3xl border border-platinum-200 bg-card p-5 sm:p-7">
      <header className="mb-5 space-y-1">
        <h2 className="font-display text-lg font-medium tracking-tight">{title}</h2>
        {description ? (
          <p className="text-sm text-muted-foreground">{description}</p>
        ) : null}
      </header>
      <div className="space-y-4">{children}</div>
    </section>
  );
}

function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor} className="text-sm font-medium">
        {label}
      </Label>
      {children}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
