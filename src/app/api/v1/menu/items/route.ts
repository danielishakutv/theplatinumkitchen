import {
  MENU_ERROR_STATUS,
  MenuServiceError,
  createItem,
  createItemSchema,
  listItems,
} from "@/modules/menu";
import { PermissionError } from "@/modules/users";
import { apiError, ok, readJson, requireSession } from "@/lib/api/response";

export const runtime = "nodejs";

export async function GET() {
  const items = await listItems();
  return ok({ items });
}

export async function POST(request: Request) {
  const session = await requireSession();
  if (session instanceof Response) return session;

  const body = await readJson(request);
  const parsed = createItemSchema.safeParse(body);
  if (!parsed.success) {
    return apiError("INVALID_INPUT", parsed.error.message, 422);
  }

  try {
    const item = await createItem(
      { role: session.role as never },
      parsed.data,
    );
    return ok({ item }, { status: 201 });
  } catch (err) {
    if (err instanceof MenuServiceError) {
      return apiError(err.code, err.message, MENU_ERROR_STATUS[err.code]);
    }
    if (err instanceof PermissionError) {
      return apiError("FORBIDDEN", err.message, 403);
    }
    console.error("[menu items POST] unexpected", err);
    return apiError("INTERNAL", "Something went wrong", 500);
  }
}
