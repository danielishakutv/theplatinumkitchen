"use client";

import Link from "next/link";
import { useTransition } from "react";
import { Eye, EyeOff, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteItemAction, toggleAvailableAction } from "./actions";
import type { MenuItem } from "@/modules/menu";
// Import from the permissions leaf, not the users barrel. The barrel
// re-exports server-only service code (bcrypt, postgres) which the bundler
// can't resolve in a client component.
import { can, type ActorLike } from "@/modules/users/permissions";

interface Props {
  item: MenuItem;
  actor: ActorLike;
}

export function RowActions({ item, actor }: Props) {
  const [togglePending, startToggle] = useTransition();
  const [deletePending, startDelete] = useTransition();

  const handleToggle = () => {
    startToggle(async () => {
      await toggleAvailableAction(item.id);
    });
  };

  const handleDelete = () => {
    if (!confirm(`Delete "${item.name}"? This cannot be undone.`)) return;
    startDelete(async () => {
      await deleteItemAction(item.id);
    });
  };

  return (
    <div className="flex items-center gap-1">
      <Button
        variant="ghost"
        size="icon"
        title={item.available ? "Mark sold-out" : "Make available"}
        className="h-9 w-9"
        onClick={handleToggle}
        disabled={togglePending}
      >
        {item.available ? (
          <Eye className="h-4 w-4" />
        ) : (
          <EyeOff className="h-4 w-4 text-muted-foreground" />
        )}
      </Button>

      <Button
        asChild
        variant="ghost"
        size="icon"
        className="h-9 w-9"
        title="Edit"
      >
        <Link href={`/admin/menu/items/${item.id}/edit`}>
          <Pencil className="h-4 w-4" />
        </Link>
      </Button>

      {can(actor, "menu:delete") ? (
        <Button
          variant="ghost"
          size="icon"
          title="Delete"
          className="h-9 w-9 text-destructive hover:text-destructive"
          onClick={handleDelete}
          disabled={deletePending}
        >
          <Trash2 className="h-4 w-4" />
        </Button>
      ) : null}
    </div>
  );
}
