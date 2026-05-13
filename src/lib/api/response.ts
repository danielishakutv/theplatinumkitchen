// Shared response helpers for REST route handlers. Lives outside modules
// because every module's routes need the same envelope shape.

import { auth } from "@/lib/auth";

export interface ApiErrorBody {
  error: { code: string; message: string };
}

export function ok<T>(data: T, init?: ResponseInit): Response {
  return Response.json({ data }, init);
}

export function apiError(code: string, message: string, status: number): Response {
  const body: ApiErrorBody = { error: { code, message } };
  return Response.json(body, { status });
}

export async function readJson<T = unknown>(request: Request): Promise<T | null> {
  try {
    return (await request.json()) as T;
  } catch {
    return null;
  }
}

export interface AuthedSession {
  userId: string;
  role: string;
}

export async function requireSession(): Promise<AuthedSession | Response> {
  const session = await auth();
  if (!session?.user?.id) {
    return apiError("UNAUTHENTICATED", "Not signed in", 401);
  }
  return { userId: session.user.id, role: session.user.role };
}
