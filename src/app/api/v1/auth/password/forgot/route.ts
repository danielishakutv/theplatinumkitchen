import { forgotPasswordSchema, requestPasswordReset } from "@/modules/auth";
import { fromAuthError, ok, readJson, error } from "../../_lib/response";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await readJson(request);
  const parsed = forgotPasswordSchema.safeParse(body);
  if (!parsed.success) {
    return error("INVALID_INPUT", parsed.error.message, 422);
  }

  try {
    const issued = await requestPasswordReset(parsed.data);
    // Uniform response — never reveals whether the email is registered.
    // devToken is present only in non-production environments.
    return ok({ requested: true, ...(issued.devToken ? { devToken: issued.devToken } : {}) });
  } catch (err) {
    return fromAuthError(err);
  }
}
