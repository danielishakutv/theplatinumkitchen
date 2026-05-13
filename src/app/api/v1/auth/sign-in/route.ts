import { AuthError as NextAuthError } from "next-auth";
import { signIn } from "@/lib/auth";
import { signInSchema, getPublicUserById } from "@/modules/auth";
import { auth } from "@/lib/auth";
import { fromAuthError, ok, readJson, error } from "../_lib/response";

export const runtime = "nodejs";

export async function POST(request: Request) {
  const body = await readJson(request);
  const parsed = signInSchema.safeParse(body);
  if (!parsed.success) {
    return error("INVALID_INPUT", parsed.error.message, 422);
  }

  try {
    await signIn("credentials", {
      email: parsed.data.email,
      password: parsed.data.password,
      redirect: false,
    });
  } catch (err) {
    if (err instanceof NextAuthError) {
      if (err.type === "CredentialsSignin") {
        return error("INVALID_CREDENTIALS", "Email or password is incorrect", 401);
      }
      return error("INTERNAL", "Sign-in failed", 500);
    }
    return fromAuthError(err);
  }

  const session = await auth();
  if (!session?.user?.id) {
    return error("INVALID_CREDENTIALS", "Email or password is incorrect", 401);
  }
  const user = await getPublicUserById(session.user.id);
  if (!user) return error("INVALID_CREDENTIALS", "User not found", 401);
  return ok({ user });
}
