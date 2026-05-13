import {
  changePassword,
  ProfileError,
  PROFILE_ERROR_STATUS,
  changePasswordSchema,
} from "@/modules/profiles";
import { ok, apiError, readJson, requireSession } from "@/lib/api/response";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const session = await requireSession();
  if (session instanceof Response) return session;

  const body = await readJson(request);
  const parsed = changePasswordSchema.safeParse(body);
  if (!parsed.success) {
    return apiError("INVALID_INPUT", parsed.error.message, 422);
  }

  try {
    await changePassword(session.userId, parsed.data);
    return ok({ changed: true });
  } catch (err) {
    if (err instanceof ProfileError) {
      return apiError(err.code, err.message, PROFILE_ERROR_STATUS[err.code]);
    }
    console.error("[profile/password] unexpected error", err);
    return apiError("INTERNAL", "Something went wrong", 500);
  }
}
