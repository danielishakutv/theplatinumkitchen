"use client";

import Link from "next/link";
import { useTransition } from "react";
import { Eye, EyeOff, Loader2, Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteItemAction, toggleAvailableAction } from "./actions";
import type { MenuItem } from "@/modules/menu";
// Import from the permissions leaf, not the users barrel. The barrel
// re-exports server-only service code (bcrypt, postgres) which the bundler
// can't resolve in a client component.
import { can, type ActorLike } from "@/modules/users/permissions";
import { cn } from "@/lib/utils";

interface Props {
  item: MenuItem;
  actor: ActorLike;
  // "inline" = compact icon-only toolbar for tablet/desktop rows (the
  // original look). "mobile" = labelled pill buttons for phone, where each
  // action gets its own touch target on its own row. The page picks which
  // variant to render via Tailwind responsive classes around it.
  variant?: "inline" | "mobile";
}

export function RowActions({ item, actor, variant = "inline" }: Props) {
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

  const canDelete = can(actor, "menu:delete");
  const editHref = `/admin/menu/items/${item.id}/edit`;

  if (variant === "mobile") {
    const ToggleIcon = togglePending
      ? Loader2
      : item.available
        ? Eye
        : EyeOff;
    const DeleteIcon = deletePending ? Loader2 : Trash2;
    return (
      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button
          variant="outline"
          size="sm"
          onClick={handleToggle}
          disabled={togglePending}
          className="h-9 gap-1.5 rounded-full border-platinum-300 px-3"
        >
          <ToggleIcon
            className={cn(
              "h-3.5 w-3.5",
              togglePending && "animate-spin",
              !item.available && !togglePending && "text-muted-foreground",
            )}
          />
          <span className="text-xs font-medium">
            {item.available ? "Hide" : "Show"}
          </span>
        </Button>

        <Button
          asChild
          variant="outline"
          size="sm"
          className="h-9 gap-1.5 rounded-full border-platinum-300 px-3"
        >
          <Link href={editHref}>
            <Pencil className="h-3.5 w-3.5" />
            <span className="text-xs font-medium">Edit</span>
          </Link>
        </Button>

        {canDelete ? (
          <Button
            variant="outline"
            size="sm"
            onClick={handleDelete}
            disabled={deletePending}
            className="h-9 gap-1.5 rounded-full border-destructive/30 px-3 text-destructive hover:bg-destructive/5 hover:text-destructive"
          >
            <DeleteIcon
              className={cn(
                "h-3.5 w-3.5",
                deletePending && "animate-spin",
              )}
            />
            <span className="text-xs font-medium">Delete</span>
          </Button>
        ) : null}
      </div>
    );
  }

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
        {togglePending ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : item.available ? (
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
        <Link href={editHref}>
          <Pencil className="h-4 w-4" />
        </Link>
      </Button>

      {canDelete ? (
        <Button
          variant="ghost"
          size="icon"
          title="Delete"
          className="h-9 w-9 text-destructive hover:text-destructive"
          onClick={handleDelete}
          disabled={deletePending}
        >
          {deletePending ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Trash2 className="h-4 w-4" />
          )}
        </Button>
      ) : null}
    </div>
  );
}
