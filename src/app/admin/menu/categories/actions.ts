"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import {
  MenuServiceError,
  createCategory,
  deleteCategory,
  updateCategory,
  type CreateCategoryInput,
} from "@/modules/menu";
import { PermissionError } from "@/modules/users";

export interface ActionResult {
  ok: boolean;
  error?: string;
}

async function requireUser() {
  const session = await auth();
  return session?.user ?? null;
}

function toError(err: unknown): ActionResult {
  if (err instanceof MenuServiceError) {
    const map: Record<string, string> = {
      MENU_INVALID_INPUT: "Some fields don't look right. Check them and try again.",
      MENU_CATEGORY_NOT_FOUND: "That category doesn't exist.",
      MENU_CATEGORY_SLUG_TAKEN: "Another category already uses that slug.",
      MENU_CATEGORY_HAS_ITEMS:
        err.message || "Move every dish to another category before deleting.",
    };
    return { ok: false, error: map[err.code] ?? err.message ?? "Operation failed." };
  }
  if (err instanceof PermissionError) {
    return { ok: false, error: "You don't have permission for that." };
  }
  console.error("[admin/menu/categories] unexpected error", err);
  return { ok: false, error: "Something went wrong." };
}

function revalidateMenuPaths() {
  revalidatePath("/admin/menu");
  revalidatePath("/admin/menu/categories");
  revalidatePath("/menu");
  revalidatePath("/");
}

export async function createCategoryAction(
  formData: FormData,
): Promise<ActionResult> {
  const user = await requireUser();
  if (!user) return { ok: false, error: "Sign in first." };

  const input: CreateCategoryInput = {
    slug: String(formData.get("slug") ?? "").trim(),
    name: String(formData.get("name") ?? "").trim(),
    tagline: String(formData.get("tagline") ?? "").trim(),
    sortOrder: Number(formData.get("sortOrder") ?? 0),
  };

  try {
    await createCategory(user, input);
    revalidateMenuPaths();
    return { ok: true };
  } catch (err) {
    return toError(err);
  }
}

export async function updateCategoryAction(
  slug: string,
  formData: FormData,
): Promise<ActionResult> {
  const user = await requireUser();
  if (!user) return { ok: false, error: "Sign in first." };

  try {
    await updateCategory(user, slug, {
      name: String(formData.get("name") ?? "").trim() || undefined,
      tagline: String(formData.get("tagline") ?? "").trim(),
      sortOrder: Number(formData.get("sortOrder") ?? 0),
    });
    revalidateMenuPaths();
    return { ok: true };
  } catch (err) {
    return toError(err);
  }
}

export async function deleteCategoryAction(slug: string): Promise<ActionResult> {
  const user = await requireUser();
  if (!user) return { ok: false, error: "Sign in first." };
  try {
    await deleteCategory(user, slug);
    revalidateMenuPaths();
    return { ok: true };
  } catch (err) {
    return toError(err);
  }
}
