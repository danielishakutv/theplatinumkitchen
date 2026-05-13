import { signOut } from "@/lib/auth";
import { ok } from "../_lib/response";

export const runtime = "nodejs";

export async function POST() {
  await signOut({ redirect: false });
  return ok({ signedOut: true });
}
