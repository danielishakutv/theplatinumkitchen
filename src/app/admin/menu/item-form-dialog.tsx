"use client";

import { useState, useTransition } from "react";
import { Loader2, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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
import { createItemAction, updateItemAction } from "./actions";
import type { AddonGroup, MenuCategory, MenuItem } from "@/modules/menu";

interface Props {
  categories: MenuCategory[];
  addonGroups: AddonGroup[];
  item?: MenuItem;
  trigger?: React.ReactElement;
}

export function ItemFormDialog({ categories, addonGroups, item, trigger }: Props) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();
  const [available, setAvailable] = useState(item?.available ?? true);
  const [categorySlug, setCategorySlug] = useState(
    item?.category ?? categories[0]?.slug ?? "",
  );
  const [selectedAddonIds, setSelectedAddonIds] = useState<string[]>(
    () => (item?.addonGroups ?? []).map((g) => g.id),
  );
  const isEdit = Boolean(item);

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
    fd.set("categorySlug", categorySlug);
    // Wipe and re-append selected addon group ids in checked order.
    fd.delete("addonGroupIds");
    for (const id of selectedAddonIds) fd.append("addonGroupIds", id);

    startTransition(async () => {
      const result = isEdit
        ? await updateItemAction(item!.id, fd)
        : await createItemAction(fd);
      if (!result.ok) {
        setError(result.error ?? "Save failed.");
        return;
      }
      setOpen(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          trigger ?? (
            <Button className="h-10 gap-1.5 rounded-full">
              <Plus className="h-4 w-4" /> New dish
            </Button>
          )
        }
      />
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit dish" : "New dish"}</DialogTitle>
          <DialogDescription>
            {isEdit ? "Update the dish details." : "Add a new dish to the menu."}
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="name">Name</Label>
              <Input
                id="name"
                name="name"
                required
                defaultValue={item?.name ?? ""}
                placeholder="Classic Jollof Rice"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="slug">Slug</Label>
              <Input
                id="slug"
                name="slug"
                required
                defaultValue={item?.slug ?? ""}
                placeholder="classic-jollof"
                pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              rows={3}
              defaultValue={item?.description ?? ""}
              maxLength={2000}
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="price">Price (₦)</Label>
              <Input
                id="price"
                name="price"
                type="number"
                min={0}
                step={50}
                required
                defaultValue={item?.price ?? 0}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="prepMinutes">Prep (min)</Label>
              <Input
                id="prepMinutes"
                name="prepMinutes"
                type="number"
                min={1}
                max={600}
                defaultValue={item?.prepMinutes ?? 20}
              />
            </div>
            <div className="space-y-2">
              <Label>Category</Label>
              <Select
                value={categorySlug}
                onValueChange={(v) => setCategorySlug(v ?? "")}
              >
                <SelectTrigger>
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
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="imageUrl">Image URL</Label>
            <Input
              id="imageUrl"
              name="imageUrl"
              type="url"
              defaultValue={item?.imageUrl ?? ""}
              placeholder="https://…"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="tags">Tags</Label>
            <Input
              id="tags"
              name="tags"
              defaultValue={(item?.tags ?? []).join(", ")}
              placeholder="chef's-pick, spicy, new"
            />
            <p className="text-xs text-muted-foreground">
              Comma-separated. Allowed: spicy, chef&apos;s-pick, new, vegan,
              vegetarian, gluten-free.
            </p>
          </div>

          <div className="space-y-2">
            <Label>Variations &amp; add-ons</Label>
            {addonGroups.length === 0 ? (
              <p className="text-xs text-muted-foreground">
                No addon groups available yet. (Seed the menu or add them via DB.)
              </p>
            ) : (
              <div className="grid gap-2 rounded-xl border border-platinum-200 bg-platinum-50/40 p-3 sm:grid-cols-2">
                {addonGroups.map((g) => {
                  const checked = selectedAddonIds.includes(g.id);
                  return (
                    <label
                      key={g.id}
                      className="flex cursor-pointer items-start gap-2.5 rounded-lg p-2 hover:bg-card"
                    >
                      <Checkbox
                        checked={checked}
                        onCheckedChange={(v) => toggleAddon(g.id, v === true)}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-sm font-medium">{g.label}</p>
                        <p className="truncate text-[11px] text-muted-foreground">
                          {g.kind === "single" ? "Choose one" : "Pick any"}
                          {g.required ? " · required" : ""}
                          {g.options.length > 0
                            ? ` · ${g.options.length} option${g.options.length === 1 ? "" : "s"}`
                            : ""}
                        </p>
                      </div>
                    </label>
                  );
                })}
              </div>
            )}
            <p className="text-xs text-muted-foreground">
              Customers see the checked groups when they tap &quot;Customise&quot;.
            </p>
          </div>

          <label className="flex items-center gap-2.5 cursor-pointer">
            <Checkbox
              checked={available}
              onCheckedChange={(v) => setAvailable(v === true)}
            />
            <span className="text-sm">Available (visible to customers)</span>
          </label>

          {error ? (
            <div
              role="alert"
              className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
            >
              {error}
            </div>
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={pending}
              className="rounded-full"
            >
              Cancel
            </Button>
            <Button type="submit" disabled={pending} className="rounded-full">
              {pending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />{" "}
                  {isEdit ? "Saving…" : "Adding…"}
                </>
              ) : isEdit ? (
                "Save changes"
              ) : (
                "Add dish"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
