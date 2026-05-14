"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useTransition } from "react";
import { ArrowLeft, Eye, ExternalLink, Loader2, Pencil, Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { createItemAction, updateItemAction } from "../../actions";
import type { AddonGroup, MenuCategory, MenuItem } from "@/modules/menu";
import { formatNaira } from "@/lib/format";
import { cn } from "@/lib/utils";

interface Props {
  mode: "create" | "edit";
  categories: MenuCategory[];
  addonGroups: AddonGroup[];
  item?: MenuItem;
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

export function ItemForm({ mode, categories, addonGroups, item }: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [available, setAvailable] = useState(item?.available ?? true);
  const [notesEnabled, setNotesEnabled] = useState(item?.notesEnabled ?? true);
  const [categorySlug, setCategorySlug] = useState(
    item?.category ?? categories[0]?.slug ?? "",
  );
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>(
    () => (item?.addonGroups ?? []).map((g) => g.id),
  );

  const isEdit = mode === "edit";

  // Name drives the slug automatically on create. The slug field stays
  // editable — once the user touches it manually we stop overwriting it.
  const [name, setName] = useState(item?.name ?? "");
  const [slug, setSlug] = useState(item?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(false);

  const handleNameChange = (v: string) => {
    setName(v);
    if (!isEdit && !slugTouched) setSlug(slugify(v));
  };

  const toggleAddon = (id: string, checked: boolean) => {
    setSelectedAddonIds((prev) => {
      if (checked) return prev.includes(id) ? prev : [...prev, id];
      return prev.filter((x) => x !== id);
    });
  };

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    fd.set("available", available ? "on" : "");
    fd.set("notesEnabled", notesEnabled ? "on" : "");
    fd.set("categorySlug", categorySlug);
    // Slug is derived from the name when the user hasn't typed one.
    fd.set("slug", (slug.trim() || slugify(name)));
    fd.delete("addonGroupIds");
    for (const id of selectedAddonIds) fd.append("addonGroupIds", id);

    start(async () => {
      const result = isEdit
        ? await updateItemAction(item!.id, fd)
        : await createItemAction(fd);
      if (!result.ok) {
        setError(result.error ?? "Save failed.");
        return;
      }
      router.push("/admin/menu");
      router.refresh();
    });
  };

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-12">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-2">
          <Link
            href="/admin/menu"
            className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-3 w-3" /> Back to menu
          </Link>
          <h1 className="font-display text-3xl font-medium tracking-tight sm:text-4xl">
            {isEdit ? `Edit ${item?.name ?? "dish"}` : "Add a new dish"}
          </h1>
          <p className="text-sm text-muted-foreground">
            {isEdit
              ? "Tweak the details. Changes go live immediately after saving."
              : "Fill in the dish details. You can attach variations and add-ons too."}
          </p>
        </div>
        {isEdit && item ? (
          <Button asChild variant="outline" size="sm" className="h-9 gap-1.5 rounded-full">
            <Link href={`/menu#${item.slug}`} target="_blank" rel="noreferrer">
              <Eye className="h-3.5 w-3.5" /> View on site
            </Link>
          </Button>
        ) : null}
      </div>

      <form onSubmit={submit} className="space-y-6">
        <Section
          title="Basics"
          description="The dish's name, internal slug, and short description."
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Name" htmlFor="name">
              <Input
                id="name"
                name="name"
                required
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Classic Jollof Rice"
                className="h-11"
              />
            </Field>
            <Field
              label="Slug"
              htmlFor="slug"
              hint="Auto-filled from the name. Used in the public URL — only edit if you need a specific one."
            >
              <Input
                id="slug"
                value={slug}
                onChange={(e) => {
                  setSlug(slugify(e.target.value));
                  setSlugTouched(true);
                }}
                placeholder="auto-generated from name"
                className="h-11 font-mono"
              />
            </Field>
          </div>

          <Field label="Description" htmlFor="description">
            <Textarea
              id="description"
              name="description"
              rows={4}
              defaultValue={item?.description ?? ""}
              maxLength={2000}
              placeholder="One or two sentences customers see on the card."
            />
          </Field>
        </Section>

        <Section
          title="Pricing &amp; logistics"
          description="Price in Naira, expected prep time, and which category this lives under."
        >
          <div className="grid gap-4 sm:grid-cols-3">
            <Field
              label="Price (₦)"
              htmlFor="price"
              hint="Leave at 0 if you'll set it later."
            >
              <Input
                id="price"
                name="price"
                type="number"
                min={0}
                step={50}
                defaultValue={item?.price ?? 0}
                className="h-11 tabular-nums"
              />
            </Field>
            <Field label="Prep time (min)" htmlFor="prepMinutes">
              <Input
                id="prepMinutes"
                name="prepMinutes"
                type="number"
                min={1}
                max={600}
                defaultValue={item?.prepMinutes ?? 20}
                className="h-11 tabular-nums"
              />
            </Field>
            <Field label="Category">
              <Select
                value={categorySlug}
                onValueChange={(v) => setCategorySlug(v ?? "")}
              >
                <SelectTrigger className="h-11">
                  <SelectValue placeholder="Pick a category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.slug} value={c.slug}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </Field>
          </div>
        </Section>

        <Section
          title="Image &amp; tags"
          description="The hero image and any badges (chef's pick, spicy, vegan, etc.)."
        >
          <Field
            label="Image URL"
            htmlFor="imageUrl"
            hint="Paste a public image URL. Cloudinary uploads land in a later module."
          >
            <Input
              id="imageUrl"
              name="imageUrl"
              type="url"
              defaultValue={item?.imageUrl ?? ""}
              placeholder="https://…"
              className="h-11"
            />
          </Field>

          <Field
            label="Tags"
            htmlFor="tags"
            hint="Comma-separated. Allowed: spicy, chef's-pick, new, vegan, vegetarian, gluten-free."
          >
            <Input
              id="tags"
              name="tags"
              defaultValue={(item?.tags ?? []).join(", ")}
              placeholder="chef's-pick, spicy"
              className="h-11"
            />
          </Field>
        </Section>

        <Section
          title="Variations &amp; add-ons"
          description="These are the choices customers will see on the dish detail page. Tick which groups apply, and tap a group to edit its options."
        >
          {addonGroups.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-platinum-300 p-6 text-center text-sm text-muted-foreground">
              No variation groups exist yet.{" "}
              <Link
                href="/admin/menu/addons/new"
                className="font-medium text-primary hover:underline"
              >
                Create the first one
              </Link>
              .
            </div>
          ) : (
            <div className="space-y-3">
              {addonGroups.map((g) => {
                const checked = selectedAddonIds.includes(g.id);
                return (
                  <div
                    key={g.id}
                    className={cn(
                      "rounded-2xl border transition-colors",
                      checked
                        ? "border-primary/40 bg-emerald-50/40"
                        : "border-platinum-200 bg-platinum-50/40",
                    )}
                  >
                    <label className="flex cursor-pointer items-start gap-3 p-3 sm:p-4">
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(v) => toggleAddon(g.id, v === true)}
                      />
                      <div className="min-w-0 flex-1">
                        <div className="flex flex-wrap items-center gap-2">
                          <p className="text-sm font-medium">{g.label}</p>
                          <span className="rounded-full bg-card px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-muted-foreground ring-1 ring-platinum-200">
                            {g.kind === "single" ? "Single" : "Multiple"}
                          </span>
                          {g.required ? (
                            <span className="rounded-full bg-accent px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-primary">
                              Required
                            </span>
                          ) : null}
                        </div>
                        {g.options.length > 0 ? (
                          <ul className="mt-2 flex flex-wrap gap-1.5">
                            {g.options.map((opt) => (
                              <li
                                key={opt.id}
                                className="inline-flex items-center gap-1 rounded-full bg-card px-2.5 py-1 text-[11px] text-foreground/80 ring-1 ring-platinum-200"
                              >
                                <span>{opt.name}</span>
                                {opt.priceDelta !== 0 ? (
                                  <span className="font-medium tabular-nums text-muted-foreground">
                                    {opt.priceDelta > 0 ? "+" : ""}
                                    {formatNaira(opt.priceDelta)}
                                  </span>
                                ) : null}
                              </li>
                            ))}
                          </ul>
                        ) : (
                          <p className="mt-2 text-[11px] text-muted-foreground">
                            No options yet — add some on the group page.
                          </p>
                        )}
                      </div>
                      <Link
                        href={`/admin/menu/addons/${g.id}/edit`}
                        className="shrink-0 inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-medium text-muted-foreground hover:bg-card hover:text-foreground"
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Pencil className="h-3 w-3" /> Edit
                      </Link>
                    </label>
                  </div>
                );
              })}

              <div className="flex flex-wrap gap-2 pt-1">
                <Button
                  asChild
                  variant="outline"
                  size="sm"
                  className="h-9 gap-1.5 rounded-full"
                >
                  <Link href="/admin/menu/addons/new">
                    <Plus className="h-3.5 w-3.5" /> New variation group
                  </Link>
                </Button>
                <Button
                  asChild
                  variant="ghost"
                  size="sm"
                  className="h-9 gap-1.5 rounded-full"
                >
                  <Link href="/admin/menu/addons">
                    Manage all groups <ExternalLink className="h-3 w-3" />
                  </Link>
                </Button>
              </div>
            </div>
          )}
        </Section>

        <Section
          title="Customer notes"
          description="The free-text field where customers can ask for special handling (e.g. no onions)."
        >
          <label className="flex items-center gap-3 cursor-pointer rounded-2xl border border-platinum-200 bg-platinum-50/40 p-4">
            <Checkbox
              checked={notesEnabled}
              onCheckedChange={(v) => setNotesEnabled(v === true)}
            />
            <div>
              <p className="text-sm font-medium">Show notes field on this dish</p>
              <p className="text-xs text-muted-foreground">
                Turn off for items where notes don&apos;t make sense (e.g. bottled drinks).
              </p>
            </div>
          </label>

          <Field
            label="Notes placeholder"
            htmlFor="notesPlaceholder"
            hint="Hint text shown inside the empty textarea. Defaults to a generic line if blank."
          >
            <Input
              id="notesPlaceholder"
              name="notesPlaceholder"
              defaultValue={item?.notesPlaceholder ?? ""}
              placeholder="No onions, extra crispy, etc."
              maxLength={200}
              className="h-11"
              disabled={!notesEnabled}
            />
          </Field>
        </Section>

        <Section
          title="Visibility"
          description="Sold-out dishes appear greyed out on the public menu and can't be ordered."
        >
          <label className="flex items-center gap-3 cursor-pointer rounded-2xl border border-platinum-200 bg-platinum-50/40 p-4">
            <Checkbox
              checked={available}
              onCheckedChange={(v) => setAvailable(v === true)}
            />
            <div>
              <p className="text-sm font-medium">Available for orders</p>
              <p className="text-xs text-muted-foreground">
                Uncheck to mark the dish as sold out today.
              </p>
            </div>
          </label>
        </Section>

        {error ? (
          <div
            role="alert"
            className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
          >
            {error}
          </div>
        ) : null}

        <div className="flex flex-col-reverse gap-3 border-t border-platinum-200 pt-6 sm:flex-row sm:justify-end">
          <Button
            type="button"
            variant="outline"
            asChild
            disabled={pending}
            className="h-11 rounded-full"
          >
            <Link href="/admin/menu">Cancel</Link>
          </Button>
          <Button
            type="submit"
            disabled={pending}
            className="h-11 rounded-full px-6"
          >
            {pending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEdit ? "Saving…" : "Creating…"}
              </>
            ) : isEdit ? (
              "Save changes"
            ) : (
              "Create dish"
            )}
          </Button>
        </div>
      </form>
    </div>
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
        <h2
          className="font-display text-lg font-medium tracking-tight"
          dangerouslySetInnerHTML={{ __html: title }}
        />
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
