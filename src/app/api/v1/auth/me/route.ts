import { auth } from "@/lib/auth";
import { getPublicUserById } from "@/modules/auth";
import { ok, error } from "../_lib/response";

export const runtime = "nodejs";

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return error("UNAUTHENTICATED", "Not signed in", 401);
  }
  const user = await getPublicUserById(session.user.id);
  if (!user) return error("UNAUTHENTICATED", "Session user not found", 401);
  return ok({ user });
}
