import "dotenv/config";
import bcrypt from "bcryptjs";
import { db } from "@/lib/db";
import { users } from "./schema";
import { staffUsers } from "./data";

const DEFAULT_PASSWORD = "platinum123";

async function main() {
  console.log("Seeding users…");

  const hash = await bcrypt.hash(DEFAULT_PASSWORD, 12);

  for (const u of staffUsers) {
    await db
      .insert(users)
      .values({
        email: u.email.toLowerCase(),
        name: u.name,
        role: u.role,
        passwordHash: hash,
        avatarUrl: u.avatarUrl,
        active: u.active,
        joinedAt: new Date(u.joinedAt),
      })
      .onConflictDoUpdate({
        target: users.email,
        set: {
          name: u.name,
          role: u.role,
          avatarUrl: u.avatarUrl,
          active: u.active,
        },
      });
    console.log(`  upserted ${u.email} (${u.role})`);
  }

  console.log(`\nDone. Default password for all seeded accounts: ${DEFAULT_PASSWORD}`);
  console.log("Change passwords from /admin once signed in.");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
