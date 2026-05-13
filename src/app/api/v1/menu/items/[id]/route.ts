import {
  MENU_ERROR_STATUS,
  MenuServiceError,
  deleteItem,
  findItemById,
  updateItem,
  updateItemSchema,
} from "@/modules/menu";
import { PermissionError } from "@/modules/users";
import { apiError, ok, readJson, requireSession } from "@/lib/api/response";

export const runtime = "nodejs";

export async function GET(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const { id } = await ctx.params;
  const item = await findItemById(id);
  if (!item) return apiError("MENU_NOT_FOUND", "Item not found", 404);
  return ok({ item });
}

export async function PATCH(request: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  if (session instanceof Response) return session;
  const { id } = await ctx.params;

  const body = await readJson(request);
  const parsed = updateItemSchema.safeParse(body);
  if (!parsed.success) {
    return apiError("INVALID_INPUT", parsed.error.message, 422);
  }

  try {
    const item = await updateItem(
      { role: session.role as never },
      id,
      parsed.data,
    );
    return ok({ item });
  } catch (err) {
    if (err instanceof MenuServiceError) {
      return apiError(err.code, err.message, MENU_ERROR_STATUS[err.code]);
    }
    if (err instanceof PermissionError) {
      return apiError("FORBIDDEN", err.message, 403);
    }
    console.error("[menu items PATCH] unexpected", err);
    return apiError("INTERNAL", "Something went wrong", 500);
  }
}

export async function DELETE(_req: Request, ctx: { params: Promise<{ id: string }> }) {
  const session = await requireSession();
  if (session instanceof Response) return session;
  const { id } = await ctx.params;

  try {
    await deleteItem({ role: session.role as never }, id);
    return ok({ deleted: true });
  } catch (err) {
    if (err instanceof MenuServiceError) {
      return apiError(err.code, err.message, MENU_ERROR_STATUS[err.code]);
    }
    if (err instanceof PermissionError) {
      return apiError("FORBIDDEN", err.message, 403);
    }
    console.error("[menu items DELETE] unexpected", err);
    return apiError("INTERNAL", "Something went wrong", 500);
  }
}
