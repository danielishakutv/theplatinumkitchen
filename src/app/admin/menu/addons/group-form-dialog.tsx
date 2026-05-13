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
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { AddonGroup } from "@/modules/menu";
import { createAddonGroupAction, updateAddonGroupAction } from "./actions";

interface Props {
  group?: AddonGroup;
  trigger?: React.ReactElement;
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 60);
}

export function GroupFormDialog({ group, trigger }: Props) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const isEdit = Boolean(group);

  const [id, setId] = useState(group?.id ?? "");
  const [idTouched, setIdTouched] = useState(false);
  const [label, setLabel] = useState(group?.label ?? "");
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
      setOpen(false);
    });
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger
        render={
          trigger ?? (
            <Button className="h-10 gap-1.5 rounded-full">
              <Plus className="h-4 w-4" /> New group
            </Button>
          )
        }
      />
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit addon group" : "New addon group"}</DialogTitle>
          <DialogDescription>
            Groups are reusable across dishes (e.g. &quot;Spice level&quot; on every grill).
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="label">Label</Label>
            <Input
              id="label"
              name="label"
              required
              value={label}
              onChange={(e) => handleLabelChange(e.target.value)}
              placeholder="Choose your protein"
            />
          </div>

          {!isEdit ? (
            <div className="space-y-2">
              <Label htmlFor="id">ID</Label>
              <Input
                id="id"
                value={id}
                onChange={(e) => {
                  setId(e.target.value);
                  setIdTouched(true);
                }}
                placeholder="protein"
                required
                pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
              />
              <p className="text-xs text-muted-foreground">
                Used internally. Auto-generated from the label.
              </p>
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <div className="space-y-2">
              <Label>Type</Label>
              <Select value={kind} onValueChange={(v) => setKind((v ?? "single") as "single" | "multiple")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="single">Single (choose one)</SelectItem>
                  <SelectItem value="multiple">Multiple (pick any)</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <label className="flex items-end gap-2.5 pb-2 cursor-pointer">
              <Checkbox
                checked={required}
                onCheckedChange={(v) => setRequired(v === true)}
              />
              <span className="text-sm">Required at checkout</span>
            </label>
          </div>

          {kind === "multiple" ? (
            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="minSelections">Min picks</Label>
                <Input
                  id="minSelections"
                  name="minSelections"
                  type="number"
                  min={0}
                  max={100}
                  defaultValue={group?.min ?? ""}
                  placeholder="e.g. 0"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="maxSelections">Max picks</Label>
                <Input
                  id="maxSelections"
                  name="maxSelections"
                  type="number"
                  min={1}
                  max={100}
                  defaultValue={group?.max ?? ""}
                  placeholder="e.g. 5"
                />
              </div>
            </div>
          ) : null}

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
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  {isEdit ? "Saving…" : "Creating…"}
                </>
              ) : isEdit ? (
                "Save changes"
              ) : (
                "Create group"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
