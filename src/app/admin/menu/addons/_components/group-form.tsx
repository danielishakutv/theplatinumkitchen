"use client";

import { useRouter } from "next/navigation";
import Link from "next/link";
import { useState, useTransition } from "react";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AddonGroup } from "@/modules/menu";
import { createAddonGroupAction, updateAddonGroupAction } from "../actions";

interface Props {
  mode: "create" | "edit";
  group?: AddonGroup;
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function GroupForm({ mode, group }: Props) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const isEdit = mode === "edit";
  const [label, setLabel] = useState(group?.label ?? "");
  const [id, setId] = useState(group?.id ?? "");
  const [idTouched, setIdTouched] = useState(false);
  const [kind, setKind] = useState<"single" | "multiple">(group?.kind ?? "single");
  const [required, setRequired] = useState(group?.required ?? false);

  const handleLabelChange = (v: string) => {
    setLabel(v);
    if (!isEdit && !idTouched) setId(slugify(v));
  };

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    fd.set("kind", kind);
    fd.set("required", required ? "on" : "");
    if (!isEdit) fd.set("id", id);

    start(async () => {
      const result = isEdit
        ? await updateAddonGroupAction(group!.id, fd)
        : await createAddonGroupAction(fd);
      if (!result.ok) {
        setError(result.error ?? "Save failed.");
        return;
      }
      router.push(isEdit ? `/admin/menu/addons/${group!.id}/edit` : "/admin/menu/addons");
      router.refresh();
    });
  };

  return (
    <form onSubmit={submit} className="space-y-6">
      <div className="space-y-2">
        <Link
          href="/admin/menu/addons"
          className="inline-flex items-center gap-1 text-xs font-medium text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-3 w-3" /> Back to variations
        </Link>
        <h1 className="font-display text-3xl font-medium tracking-tight sm:text-4xl">
          {isEdit ? `Edit ${group?.label ?? "group"}` : "New variation group"}
        </h1>
        <p className="text-sm text-muted-foreground">
          {isEdit
            ? "Update the group's settings. Options are managed on this page after saving."
            : "Reusable groups can be attached to multiple dishes (e.g. \"Spice level\" on every grill)."}
        </p>
      </div>

      <section className="rounded-3xl border border-platinum-200 bg-card p-5 sm:p-7">
        <header className="mb-5 space-y-1">
          <h2 className="font-display text-lg font-medium">Basics</h2>
          <p className="text-sm text-muted-foreground">
            Label customers see, plus the internal ID.
          </p>
        </header>

        <div className="space-y-4">
          <Field label="Label" htmlFor="label">
            <Input
              id="label"
              name="label"
              required
              value={label}
              onChange={(e) => handleLabelChange(e.target.value)}
              placeholder="Choose your protein"
              className="h-11"
            />
          </Field>

          {!isEdit ? (
            <Field
              label="ID"
              htmlFor="id"
              hint="Used internally. Auto-generated from the label."
            >
              <Input
                id="id"
                value={id}
                onChange={(e) => {
                  setId(e.target.value);
                  setIdTouched(true);
                }}
                required
                pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
                placeholder="protein"
                className="h-11 font-mono"
              />
            </Field>
          ) : (
            <Field label="ID">
              <Input
                value={group?.id ?? ""}
                disabled
                className="h-11 bg-platinum-50 font-mono"
              />
              <p className="text-xs text-muted-foreground">
                The ID is permanent once a group is created.
              </p>
            </Field>
          )}
        </div>
      </section>

      <section className="rounded-3xl border border-platinum-200 bg-card p-5 sm:p-7">
        <header className="mb-5 space-y-1">
          <h2 className="font-display text-lg font-medium">Selection rules</h2>
          <p className="text-sm text-muted-foreground">
            How many options can a customer pick at checkout?
          </p>
        </header>

        <div className="grid gap-4 sm:grid-cols-2">
          <Field label="Type">
            <Select
              value={kind}
              onValueChange={(v) => setKind((v ?? "single") as "single" | "multiple")}
            >
              <SelectTrigger className="h-11">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="single">Single (radio — choose one)</SelectItem>
                <SelectItem value="multiple">Multiple (checkboxes — pick any)</SelectItem>
              </SelectContent>
            </Select>
          </Field>

          <label className="flex items-center gap-3 cursor-pointer rounded-2xl border border-platinum-200 bg-platinum-50/40 p-3">
            <Checkbox
              checked={required}
              onCheckedChange={(v) => setRequired(v === true)}
            />
            <div>
              <p className="text-sm font-medium">Required at checkout</p>
              <p className="text-xs text-muted-foreground">
                Customer must pick at least one before adding to cart.
              </p>
            </div>
          </label>
        </div>

        {kind === "multiple" ? (
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <Field label="Min picks" htmlFor="minSelections" hint="Leave blank for no minimum.">
              <Input
                id="minSelections"
                name="minSelections"
                type="number"
                min={0}
                max={100}
                defaultValue={group?.min ?? ""}
                placeholder="0"
                className="h-11 tabular-nums"
              />
            </Field>
            <Field label="Max picks" htmlFor="maxSelections" hint="Leave blank for no max.">
              <Input
                id="maxSelections"
                name="maxSelections"
                type="number"
                min={1}
                max={100}
                defaultValue={group?.max ?? ""}
                placeholder="5"
                className="h-11 tabular-nums"
              />
            </Field>
          </div>
        ) : null}
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
          <Link href="/admin/menu/addons">Cancel</Link>
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
            "Create group"
          )}
        </Button>
      </div>
    </form>
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
