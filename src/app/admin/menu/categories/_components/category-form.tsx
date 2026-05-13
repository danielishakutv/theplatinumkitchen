"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { createCategoryAction, updateCategoryAction } from "../actions";
import type { MenuCategory } from "@/modules/menu";

interface Props {
  mode: "create" | "edit";
  category?: MenuCategory;
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function CategoryForm({ mode, category }: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const isEdit = mode === "edit";
  const [name, setName] = useState(category?.name ?? "");
  const [slug, setSlug] = useState(category?.slug ?? "");
  const [slugTouched, setSlugTouched] = useState(false);

  const handleNameChange = (v: string) => {
    setName(v);
    if (!isEdit && !slugTouched) setSlug(slugify(v));
  };

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    if (!isEdit) fd.set("slug", slug);
    start(async () => {
      const result = isEdit
        ? await updateCategoryAction(category!.slug, fd)
        : await createCategoryAction(fd);
      if (!result.ok) {
        setError(result.error ?? "Save failed.");
        return;
      }
      router.push("/admin/menu/categories");
      router.refresh();
    });
  };

  return (
    <div className="mx-auto max-w-2xl space-y-6 pb-12">
      <div className="space-y-2">
        <Link
          href="/admin/menu/categories"
          className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" /> Back to categories
        </Link>
        <h1 className="font-display text-3xl font-medium tracking-tight sm:text-4xl">
          {isEdit ? `Edit ${category?.name ?? "category"}` : "New category"}
        </h1>
        <p className="text-sm text-muted-foreground">
          Categories group dishes on the menu page (e.g. Signatures, Soups & Swallow).
        </p>
      </div>

      <form onSubmit={submit} className="space-y-6">
        <section className="rounded-3xl border border-platinum-200 bg-card p-5 sm:p-7">
          <header className="mb-5 space-y-1">
            <h2 className="font-display text-lg font-medium">Basics</h2>
            <p className="text-sm text-muted-foreground">
              What customers see when browsing the menu.
            </p>
          </header>

          <div className="space-y-4">
            <Field label="Name" htmlFor="name">
              <Input
                id="name"
                name="name"
                required
                value={name}
                onChange={(e) => handleNameChange(e.target.value)}
                placeholder="Signatures"
                className="h-11"
              />
            </Field>

            {!isEdit ? (
              <Field
                label="Slug"
                htmlFor="slug"
                hint="Used in the URL anchor (/menu#signatures). Auto-generated from the name."
              >
                <Input
                  id="slug"
                  value={slug}
                  onChange={(e) => {
                    setSlug(e.target.value);
                    setSlugTouched(true);
                  }}
                  required
                  pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                  placeholder="signatures"
                  className="h-11 font-mono"
                />
              </Field>
            ) : (
              <Field label="Slug" hint="The slug is permanent once a category is created.">
                <Input
                  value={category?.slug ?? ""}
                  disabled
                  className="h-11 bg-platinum-50 font-mono"
                />
              </Field>
            )}

            <Field
              label="Tagline"
              htmlFor="tagline"
              hint="A short line shown under the category name."
            >
              <Textarea
                id="tagline"
                name="tagline"
                rows={2}
                defaultValue={category?.tagline ?? ""}
                maxLength={200}
                placeholder="The dishes we built our name on"
              />
            </Field>

            <Field
              label="Sort order"
              htmlFor="sortOrder"
              hint="Smaller numbers appear first. Use 10, 20, 30 to leave gaps for reordering."
            >
              <Input
                id="sortOrder"
                name="sortOrder"
                type="number"
                min={0}
                max={10000}
                defaultValue={category?.sortOrder ?? 0}
                className="h-11 tabular-nums"
              />
            </Field>
          </div>
        </section>

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
            <Link href="/admin/menu/categories">Cancel</Link>
          </Button>
          <Button type="submit" disabled={pending} className="h-11 rounded-full px-6">
            {pending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                {isEdit ? "Saving…" : "Creating…"}
              </>
            ) : isEdit ? (
              "Save changes"
            ) : (
              "Create category"
            )}
          </Button>
        </div>
      </form>
    </div>
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
