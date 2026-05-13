import { AUTH_ERROR_STATUS, AuthError } from "@/modules/auth";

export interface ApiErrorBody {
  error: {
    code: string;
    message: string;
  };
}

export function ok<T>(data: T, init?: ResponseInit): Response {
  return Response.json({ data }, init);
}

export function error(code: string, message: string, status: number): Response {
  const body: ApiErrorBody = { error: { code, message } };
  return Response.json(body, { status });
}

export function fromAuthError(err: unknown): Response {
  if (err instanceof AuthError) {
    return error(err.code, err.message, AUTH_ERROR_STATUS[err.code]);
  }
  console.error("[auth-api] unexpected error", err);
  return error("INTERNAL", "Something went wrong", 500);
}

export async function readJson<T = unknown>(request: Request): Promise<T | null> {
  try {
    return (await request.json()) as T;
  } catch {
    return null;
  }
}
