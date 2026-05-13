"use client";

import Link from "next/link";
import { useTransition } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { AddonGroup } from "@/modules/menu";
import { can, type ActorLike } from "@/modules/users/permissions";
import { deleteAddonGroupAction } from "./actions";

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
      <Button
        asChild
        variant="ghost"
        size="icon"
        className="h-8 w-8"
        title="Edit"
      >
        <Link href={`/admin/menu/addons/${group.id}/edit`}>
          <Pencil className="h-3.5 w-3.5" />
        </Link>
      </Button>
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
