// Builds a fully-qualified URL for the running app. Reads AUTH_URL (same
// env var Auth.js uses) so dev + prod stay in sync. Falls back to localhost
// for dev runs without the var set.
export function appUrl(path: string = "/"): string {
  const base = process.env.AUTH_URL ?? "http://localhost:3000";
  const normalizedBase = base.replace(/\/$/, "");
  const normalizedPath = path.startsWith("/") ? path : `/${path}`;
  return `${normalizedBase}${normalizedPath}`;
}
