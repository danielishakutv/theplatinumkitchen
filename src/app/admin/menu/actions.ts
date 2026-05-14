"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import {
  MENU_ERROR_STATUS,
  MenuServiceError,
  createItem,
  deleteItem,
  toggleItemAvailable,
  updateItem,
  type CreateItemInput,
  type UpdateItemInput,
} from "@/modules/menu";
import { PermissionError } from "@/modules/users";

export interface ActionResult {
  ok: boolean;
  error?: string;
}

async function requireUser() {
  const session = await auth();
  if (!session?.user?.id) return null;
  return session.user;
}

function toError(err: unknown): ActionResult {
  if (err instanceof MenuServiceError) {
    void MENU_ERROR_STATUS;
    const map: Record<string, string> = {
      MENU_INVALID_INPUT: "Some fields don't look right. Check them and try again.",
      MENU_NOT_FOUND: "That dish doesn't exist.",
      MENU_SLUG_TAKEN: "Another dish already uses that slug.",
      MENU_CATEGORY_NOT_FOUND: "That category doesn't exist.",
    };
    return { ok: false, error: map[err.code] ?? "Operation failed." };
  }
  if (err instanceof PermissionError) {
    return { ok: false, error: "You don't have permission for that." };
  }
  console.error("[admin/menu] unexpected error", err);
  return { ok: false, error: "Something went wrong." };
}

function parsePrice(value: unknown): number {
  const n = Number(value);
  if (!Number.isFinite(n) || n < 0) return 0;
  return Math.round(n);
}

function parseTags(raw: string): string[] {
  return raw
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
}

function parseAddonGroupIds(formData: FormData): string[] {
  return formData
    .getAll("addonGroupIds")
    .map((v) => String(v).trim())
    .filter(Boolean);
}

// Server-side safety net: the form auto-fills the slug from the name, but if
// it ever arrives empty, derive it here so the only truly required field a
// user must fill is the dish name.
function slugify(input: string): string {
  return input
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 100);
}

export async function createItemAction(formData: FormData): Promise<ActionResult> {
  const user = await requireUser();
  if (!user) return { ok: false, error: "Sign in first." };

  const name = String(formData.get("name") ?? "").trim();
  const slug =
    String(formData.get("slug") ?? "").trim() || slugify(name);

  const input: CreateItemInput = {
    slug,
    name,
    description: String(formData.get("description") ?? "").trim(),
    price: parsePrice(formData.get("price")),
    imageUrl: String(formData.get("imageUrl") ?? "").trim(),
    categorySlug: String(formData.get("categorySlug") ?? "").trim(),
    tags: parseTags(String(formData.get("tags") ?? "")) as CreateItemInput["tags"],
    prepMinutes: Number(formData.get("prepMinutes") ?? 20),
    available: formData.get("available") === "on",
    notesEnabled: formData.get("notesEnabled") === "on",
    notesPlaceholder: String(formData.get("notesPlaceholder") ?? "").trim(),
    sortOrder: Number(formData.get("sortOrder") ?? 0),
    addonGroupIds: parseAddonGroupIds(formData),
  };

  try {
    await createItem(user, input);
    revalidatePath("/admin/menu");
    revalidatePath("/menu");
    revalidatePath("/");
    return { ok: true };
  } catch (err) {
    return toError(err);
  }
}

export async function updateItemAction(
  id: string,
  formData: FormData,
): Promise<ActionResult> {
  const user = await requireUser();
  if (!user) return { ok: false, error: "Sign in first." };

  const input: UpdateItemInput = {
    slug: String(formData.get("slug") ?? "").trim() || undefined,
    name: String(formData.get("name") ?? "").trim() || undefined,
    description: String(formData.get("description") ?? "").trim(),
    price: parsePrice(formData.get("price")),
    imageUrl: String(formData.get("imageUrl") ?? "").trim(),
    categorySlug: String(formData.get("categorySlug") ?? "").trim() || undefined,
    tags: parseTags(String(formData.get("tags") ?? "")) as UpdateItemInput["tags"],
    prepMinutes: Number(formData.get("prepMinutes") ?? 20),
    available: formData.get("available") === "on",
    notesEnabled: formData.get("notesEnabled") === "on",
    notesPlaceholder: String(formData.get("notesPlaceholder") ?? "").trim(),
    addonGroupIds: parseAddonGroupIds(formData),
  };

  try {
    await updateItem(user, id, input);
    revalidatePath("/admin/menu");
    revalidatePath("/menu");
    revalidatePath("/");
    return { ok: true };
  } catch (err) {
    return toError(err);
  }
}

export async function toggleAvailableAction(id: string): Promise<ActionResult> {
  const user = await requireUser();
  if (!user) return { ok: false, error: "Sign in first." };
  try {
    await toggleItemAvailable(user, id);
    revalidatePath("/admin/menu");
    revalidatePath("/menu");
    return { ok: true };
  } catch (err) {
    return toError(err);
  }
}

export async function deleteItemAction(id: string): Promise<ActionResult> {
  const user = await requireUser();
  if (!user) return { ok: false, error: "Sign in first." };
  try {
    await deleteItem(user, id);
    revalidatePath("/admin/menu");
    revalidatePath("/menu");
    return { ok: true };
  } catch (err) {
    return toError(err);
  }
}
