import { AuthError, registerCustomer, signUpSchema } from "@/modules/auth";
import { signIn } from "@/lib/auth";
import { fromAuthError, ok, readJson, error } from "../_lib/response";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await readJson(request);
  const parsed = signUpSchema.safeParse(body);
  if (!parsed.success) {
    return error("INVALID_INPUT", parsed.error.message, 422);
  }

  try {
    const user = await registerCustomer(parsed.data);
    // Issue session cookie on the same response so the new customer is
    // signed in immediately. signIn sets the cookie via next/headers.
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });
    return ok({ user }, { status: 201 });
  } catch (err) {
    if (err instanceof AuthError) return fromAuthError(err);
    return fromAuthError(err);
  }
}
