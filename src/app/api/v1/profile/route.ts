import {
  getProfile,
  updateProfile,
  ProfileError,
  PROFILE_ERROR_STATUS,
  updateProfileSchema,
} from "@/modules/profiles";
import { ok, apiError, readJson, requireSession } from "@/lib/api/response";

export const runtime = "nodejs";

export async function GET() {
  const session = await requireSession();
  if (session instanceof Response) return session;

  try {
    const profile = await getProfile(session.userId);
    return ok({ profile });
  } catch (err) {
    if (err instanceof ProfileError) {
      return apiError(err.code, err.message, PROFILE_ERROR_STATUS[err.code]);
    }
    console.error("[profile] unexpected error", err);
    return apiError("INTERNAL", "Something went wrong", 500);
  }
}

export async function PATCH(request: Request) {
  const session = await requireSession();
  if (session instanceof Response) return session;

  const body = await readJson(request);
  const parsed = updateProfileSchema.safeParse(body);
  if (!parsed.success) {
    return apiError("INVALID_INPUT", parsed.error.message, 422);
  }

  try {
    const profile = await updateProfile(session.userId, parsed.data);
    return ok({ profile });
  } catch (err) {
    if (err instanceof ProfileError) {
      return apiError(err.code, err.message, PROFILE_ERROR_STATUS[err.code]);
    }
    console.error("[profile] unexpected error", err);
    return apiError("INTERNAL", "Something went wrong", 500);
  }
}
