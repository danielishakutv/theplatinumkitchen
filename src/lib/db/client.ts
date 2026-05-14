import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

// Lazy-init so building the app doesn't require a live DATABASE_URL.
// The first DB call validates the env var; missing → clear runtime error.
declare global {
  var __pkPgClient: ReturnType<typeof postgres> | undefined;
  var __pkDb: ReturnType<typeof drizzle<typeof schema>> | undefined;
}

function buildDb() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set. Fill it in .env.local — see .env.example for templates.",
    );
  }
  const client =
    globalThis.__pkPgClient ??
    postgres(url, { max: 10, prepare: false, idle_timeout: 30 });
  if (process.env.NODE_ENV !== "production") {
    globalThis.__pkPgClient = client;
  }
  return drizzle(client, { schema });
}

export const db = new Proxy({} as ReturnType<typeof drizzle<typeof schema>>, {
  get(_target, prop) {
    if (!globalThis.__pkDb) {
      globalThis.__pkDb = buildDb();
    }
    return Reflect.get(globalThis.__pkDb, prop);
  },
});

export type Db = typeof db;
