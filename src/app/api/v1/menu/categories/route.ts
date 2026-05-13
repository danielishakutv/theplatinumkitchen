import { listCategories } from "@/modules/menu";
import { ok } from "@/lib/api/response";

export const runtime = "nodejs";

export async function GET() {
  const categories = await listCategories();
  return ok({ categories });
}
