import { findItemBySlug } from "@/modules/menu";
import { apiError, ok } from "@/lib/api/response";

export const runtime = "nodejs";

export async function GET(_req: Request, ctx: { params: Promise<{ slug: string }> }) {
  const { slug } = await ctx.params;
  const item = await findItemBySlug(slug);
  if (!item) return apiError("MENU_NOT_FOUND", "Item not found", 404);
  return ok({ item });
}
