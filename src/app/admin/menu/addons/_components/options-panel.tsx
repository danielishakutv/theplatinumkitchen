"use client";

import { useTransition } from "react";
import { Pencil, Plus, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { OptionFormDialog } from "../option-form-dialog";
import { deleteAddonOptionAction } from "../actions";
import type { AddonOption } from "@/modules/menu";
import { formatNaira } from "@/lib/format";
import { can, type ActorLike } from "@/modules/users/permissions";

interface Props {
  groupId: string;
  options: AddonOption[];
  actor: ActorLike;
}

export function OptionsPanel({ groupId, options, actor }: Props) {
  return (
    <section className="rounded-3xl border border-platinum-200 bg-card">
      <header className="flex flex-wrap items-center justify-between gap-3 border-b border-platinum-200 p-5 sm:p-6">
        <div>
          <h2 className="font-display text-lg font-medium">Options</h2>
          <p className="text-sm text-muted-foreground">
            What customers pick from inside this group.
          </p>
        </div>
        <OptionFormDialog
          groupId={groupId}
          trigger={
            <Button size="sm" className="h-9 gap-1.5 rounded-full">
              <Plus className="h-3.5 w-3.5" /> New option
            </Button>
          }
        />
      </header>

      {options.length === 0 ? (
        <div className="p-10 text-center text-sm text-muted-foreground">
          No options yet. Tap &quot;New option&quot; to add the first one.
        </div>
      ) : (
        <ul className="divide-y divide-platinum-200">
          {options.map((option) => (
            <li
              key={option.id}
              className="flex flex-wrap items-center justify-between gap-3 px-5 py-3.5 sm:px-6"
            >
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium">{option.name}</p>
                <p className="truncate text-[11px] text-muted-foreground">
                  <code className="rounded bg-platinum-50 px-1.5 py-0.5">
                    {option.id}
                  </code>
                  {option.priceDelta !== 0 ? (
                    <span className="ml-2 font-medium tabular-nums text-foreground/80">
                      {option.priceDelta > 0 ? "+" : ""}
                      {formatNaira(option.priceDelta)}
                    </span>
                  ) : null}
                </p>
              </div>
              <OptionActions option={option} groupId={groupId} actor={actor} />
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}

function OptionActions({
  option,
  groupId,
  actor,
}: {
  option: AddonOption;
  groupId: string;
  actor: ActorLike;
}) {
  const [pending, start] = useTransition();

  const handleDelete = () => {
    if (!confirm(`Delete "${option.name}"?`)) return;
    start(async () => {
      await deleteAddonOptionAction(option.id);
    });
  };

  return (
    <div className="flex items-center gap-1">
      <OptionFormDialog
        groupId={groupId}
        option={option}
        trigger={
          <Button variant="ghost" size="icon" className="h-8 w-8" title="Edit">
            <Pencil className="h-3.5 w-3.5" />
          </Button>
        }
      />
      {can(actor, "menu:delete") ? (
        <Button
          variant="ghost"
          size="icon"
          title="Delete"
          className="h-8 w-8 text-destructive hover:text-destructive"
          onClick={handleDelete}
          disabled={pending}
        >
          <Trash2 className="h-3.5 w-3.5" />
        </Button>
      ) : null}
    </div>
  );
}
