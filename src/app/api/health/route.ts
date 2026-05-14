// Lightweight liveness probe for the Docker healthcheck. Deliberately does NOT
// touch the database — it answers "is the Next.js server up and serving?",
// which is exactly what Compose needs to decide the container is ready.
export const dynamic = "force-dynamic";

export function GET() {
  return Response.json({ ok: true });
}
