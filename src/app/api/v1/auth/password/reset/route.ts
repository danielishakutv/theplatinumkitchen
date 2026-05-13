import { resetPasswordSchema, resetPassword } from "@/modules/auth";
import { fromAuthError, ok, readJson, error } from "../../_lib/response";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await readJson(request);
  const parsed = resetPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return error("INVALID_INPUT", parsed.error.message, 422);
  }

  try {
    await resetPassword(parsed.data);
    return ok({ reset: true });
  } catch (err) {
    return fromAuthError(err);
  }
}
