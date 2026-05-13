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
import type { AddonOption } from "@/modules/menu";
import { createAddonOptionAction, updateAddonOptionAction } from "./actions";

interface Props {
  groupId: string;
  option?: AddonOption;
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

export function OptionFormDialog({ groupId, option, trigger }: Props) {
  const [open, setOpen] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const isEdit = Boolean(option);

  const [name, setName] = useState(option?.name ?? "");
  const [id, setId] = useState(option?.id ?? "");
  const [idTouched, setIdTouched] = useState(false);

  const handleNameChange = (v: string) => {
    setName(v);
    if (!isEdit && !idTouched) setId(slugify(`${groupId}-${v}`));
  };

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    if (!isEdit) fd.set("id", id);
    start(async () => {
      const result = isEdit
        ? await updateAddonOptionAction(option!.id, fd)
        : await createAddonOptionAction(groupId, fd);
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
            <Button size="sm" variant="ghost" className="h-8 gap-1 rounded-full">
              <Plus className="h-3.5 w-3.5" /> Option
            </Button>
          )
        }
      />
      <DialogContent className="max-w-sm">
        <DialogHeader>
          <DialogTitle>{isEdit ? "Edit option" : "New option"}</DialogTitle>
          <DialogDescription>
            {isEdit
              ? "Update the option."
              : "Add an option (e.g. \"Grilled chicken\", \"+ ₦800\")."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={submit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="name">Name</Label>
            <Input
              id="name"
              name="name"
              required
              value={name}
              onChange={(e) => handleNameChange(e.target.value)}
              placeholder="Grilled chicken"
            />
          </div>

          {!isEdit ? (
            <div className="space-y-2">
              <Label htmlFor="option-id">ID</Label>
              <Input
                id="option-id"
                value={id}
                onChange={(e) => {
                  setId(e.target.value);
                  setIdTouched(true);
                }}
                required
                pattern="[a-z0-9]+(?:-[a-z0-9]+)*"
              />
            </div>
          ) : null}

          <div className="space-y-2">
            <Label htmlFor="priceDelta">Price delta (₦)</Label>
            <Input
              id="priceDelta"
              name="priceDelta"
              type="number"
              step={50}
              defaultValue={option?.priceDelta ?? 0}
            />
            <p className="text-xs text-muted-foreground">
              Add to the base price. Use negative for a discount.
            </p>
          </div>

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
                  {isEdit ? "Saving…" : "Adding…"}
                </>
              ) : isEdit ? (
                "Save"
              ) : (
                "Add option"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
