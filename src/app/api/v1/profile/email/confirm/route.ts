import {
  confirmEmailChange,
  ProfileError,
  PROFILE_ERROR_STATUS,
  confirmEmailChangeSchema,
} from "@/modules/profiles";
import { ok, apiError, readJson, requireSession } from "@/lib/api/response";

export const runtime = "nodejs";

// Confirm requires authentication so a leaked token alone is not enough to
// flip an account's email — the user must also be signed in.
export async function POST(request: Request) {
  const session = await requireSession();
  if (session instanceof Response) return session;

  const body = await readJson(request);
  const parsed = confirmEmailChangeSchema.safeParse(body);
  if (!parsed.success) {
    return apiError("INVALID_INPUT", parsed.error.message, 422);
  }

  try {
    const result = await confirmEmailChange(parsed.data);
    return ok({ email: result.newEmail });
  } catch (err) {
    if (err instanceof ProfileError) {
      return apiError(err.code, err.message, PROFILE_ERROR_STATUS[err.code]);
    }
    console.error("[profile/email/confirm] unexpected error", err);
    return apiError("INTERNAL", "Something went wrong", 500);
  }
}
