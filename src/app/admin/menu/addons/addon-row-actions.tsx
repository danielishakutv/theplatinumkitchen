"use client";

import { useTransition } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AddonGroup, AddonOption } from "@/modules/menu";
import { can, type ActorLike } from "@/modules/users/permissions";
import { GroupFormDialog } from "./group-form-dialog";
import { OptionFormDialog } from "./option-form-dialog";
import { deleteAddonGroupAction, deleteAddonOptionAction } from "./actions";

export function GroupRowActions({
  group,
  actor,
}: {
  group: AddonGroup;
  actor: ActorLike;
}) {
  const [pending, start] = useTransition();

  const handleDelete = () => {
    if (
      !confirm(
        `Delete "${group.label}"? Its options and every item that used this group lose it. This cannot be undone.`,
      )
    )
      return;
    start(async () => {
      await deleteAddonGroupAction(group.id);
    });
  };

  return (
    <div className="flex items-center gap-1">
      <GroupFormDialog
        group={group}
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

export function OptionRowActions({
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
          <Button variant="ghost" size="icon" className="h-7 w-7" title="Edit">
            <Pencil className="h-3 w-3" />
          </Button>
        }
      />
      {can(actor, "menu:delete") ? (
        <Button
          variant="ghost"
          size="icon"
          title="Delete"
          className="h-7 w-7 text-destructive hover:text-destructive"
          onClick={handleDelete}
          disabled={pending}
        >
          <Trash2 className="h-3 w-3" />
        </Button>
      ) : null}
    </div>
  );
}
