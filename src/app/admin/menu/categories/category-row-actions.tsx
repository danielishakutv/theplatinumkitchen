"use client";

import Link from "next/link";
import { useTransition } from "react";
import { Pencil, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { deleteCategoryAction } from "./actions";
import { can, type ActorLike } from "@/modules/users/permissions";

interface Props {
  slug: string;
  name: string;
  itemCount: number;
  actor: ActorLike;
}

export function CategoryRowActions({ slug, name, itemCount, actor }: Props) {
  const [pending, start] = useTransition();

  const handleDelete = () => {
    if (itemCount > 0) {
      alert(
        `${name} still has ${itemCount} dish${itemCount === 1 ? "" : "es"}. Move them to another category first.`,
      );
      return;
    }
    if (!confirm(`Delete "${name}"? This cannot be undone.`)) return;
    start(async () => {
      const result = await deleteCategoryAction(slug);
      if (!result.ok) alert(result.error ?? "Delete failed.");
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
        <Link href={`/admin/menu/categories/${slug}/edit`}>
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
