"use server";

import { revalidatePath } from "next/cache";
import { auth } from "@/lib/auth";
import {
  MenuServiceError,
  createAddonGroup,
  createAddonOption,
  deleteAddonGroup,
  deleteAddonOption,
  updateAddonGroup,
  updateAddonOption,
  type CreateAddonGroupInput,
  type CreateAddonOptionInput,
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
      MENU_ADDON_GROUP_NOT_FOUND: "That addon group doesn't exist.",
      MENU_ADDON_GROUP_ID_TAKEN: "Another addon group already uses that ID.",
      MENU_ADDON_OPTION_NOT_FOUND: "That option doesn't exist.",
      MENU_ADDON_OPTION_ID_TAKEN: "Another option already uses that ID.",
    };
    return { ok: false, error: map[err.code] ?? "Operation failed." };
  }
  if (err instanceof PermissionError) {
    return { ok: false, error: "You don't have permission for that." };
  }
  console.error("[admin/menu/addons] unexpected error", err);
  return { ok: false, error: "Something went wrong." };
}

function parseOptionalInt(value: FormDataEntryValue | null): number | undefined {
  if (value === null) return undefined;
  const s = String(value).trim();
  if (s === "") return undefined;
  const n = Number(s);
  return Number.isFinite(n) ? Math.round(n) : undefined;
}

function revalidateMenuPaths() {
  revalidatePath("/admin/menu");
  revalidatePath("/admin/menu/addons");
  revalidatePath("/menu");
  revalidatePath("/");
}

export async function createAddonGroupAction(
  formData: FormData,
): Promise<ActionResult> {
  const user = await requireUser();
  if (!user) return { ok: false, error: "Sign in first." };

  const input: CreateAddonGroupInput = {
    id: String(formData.get("id") ?? "").trim(),
    label: String(formData.get("label") ?? "").trim(),
    kind:
      String(formData.get("kind") ?? "single") === "multiple" ? "multiple" : "single",
    required: formData.get("required") === "on",
    minSelections: parseOptionalInt(formData.get("minSelections")),
    maxSelections: parseOptionalInt(formData.get("maxSelections")),
  };

  try {
    await createAddonGroup(user, input);
    revalidateMenuPaths();
    return { ok: true };
  } catch (err) {
    return toError(err);
  }
}

export async function updateAddonGroupAction(
  id: string,
  formData: FormData,
): Promise<ActionResult> {
  const user = await requireUser();
  if (!user) return { ok: false, error: "Sign in first." };

  try {
    await updateAddonGroup(user, id, {
      label: String(formData.get("label") ?? "").trim() || undefined,
      kind:
        formData.get("kind") === null
          ? undefined
          : String(formData.get("kind")) === "multiple"
            ? "multiple"
            : "single",
      required: formData.get("required") === "on",
      minSelections: parseOptionalInt(formData.get("minSelections")) ?? null,
      maxSelections: parseOptionalInt(formData.get("maxSelections")) ?? null,
    });
    revalidateMenuPaths();
    return { ok: true };
  } catch (err) {
    return toError(err);
  }
}

export async function deleteAddonGroupAction(id: string): Promise<ActionResult> {
  const user = await requireUser();
  if (!user) return { ok: false, error: "Sign in first." };
  try {
    await deleteAddonGroup(user, id);
    revalidateMenuPaths();
    return { ok: true };
  } catch (err) {
    return toError(err);
  }
}

export async function createAddonOptionAction(
  groupId: string,
  formData: FormData,
): Promise<ActionResult> {
  const user = await requireUser();
  if (!user) return { ok: false, error: "Sign in first." };

  const input: CreateAddonOptionInput = {
    id: String(formData.get("id") ?? "").trim(),
    groupId,
    name: String(formData.get("name") ?? "").trim(),
    priceDelta: Number(formData.get("priceDelta") ?? 0),
  };

  try {
    await createAddonOption(user, input);
    revalidateMenuPaths();
    return { ok: true };
  } catch (err) {
    return toError(err);
  }
}

export async function updateAddonOptionAction(
  id: string,
  formData: FormData,
): Promise<ActionResult> {
  const user = await requireUser();
  if (!user) return { ok: false, error: "Sign in first." };
  try {
    await updateAddonOption(user, id, {
      name: String(formData.get("name") ?? "").trim() || undefined,
      priceDelta: Number(formData.get("priceDelta") ?? 0),
    });
    revalidateMenuPaths();
    return { ok: true };
  } catch (err) {
    return toError(err);
  }
}

export async function deleteAddonOptionAction(id: string): Promise<ActionResult> {
  const user = await requireUser();
  if (!user) return { ok: false, error: "Sign in first." };
  try {
    await deleteAddonOption(user, id);
    revalidateMenuPaths();
    return { ok: true };
  } catch (err) {
    return toError(err);
  }
}
