/**
 * One-shot launch reset. Wipes every demo row from the production database
 * and provisions a single super-admin account.
 *
 * What it deletes:
 *   - all orders + order lines + invoice counters
 *   - all notifications (in-app inbox)
 *   - all menu items, addon groups, addon options, categories
 *   - all password reset + email change tokens
 *   - every user except the launch admin
 *
 * What it preserves:
 *   - the settings singleton (admin can edit copy live)
 *   - schema + migrations
 *
 * Run from the VPS, inside the app container, with two env vars set:
 *
 *   ADMIN_EMAIL=admin@theplatinumkitchen.com \
 *   ADMIN_PASSWORD='a-long-password-you-pick' \
 *   CONFIRM=WIPE \
 *   pnpm tsx --env-file=.env.production src/modules/users/reset-for-launch.ts
 *
 * The CONFIRM=WIPE gate is mandatory — without it the script aborts before
 * touching anything. This file lives in the repo so the deploy loop never
 * runs it accidentally.
 */
import "dotenv/config";
import bcrypt from "bcryptjs";
import { sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "./schema";

async function main() {
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;
  const confirm = process.env.CONFIRM;

  if (confirm !== "WIPE") {
    console.error(
      "Aborting: set CONFIRM=WIPE to acknowledge this destroys every demo row.",
    );
    process.exit(1);
  }
  if (!email || !password) {
    console.error("Aborting: set ADMIN_EMAIL and ADMIN_PASSWORD.");
    process.exit(1);
  }
  if (password.length < 10) {
    console.error("Aborting: ADMIN_PASSWORD must be at least 10 characters.");
    process.exit(1);
  }

  console.log(`\nResetting database for launch. Sole admin → ${email}\n`);

  // Truncate child tables first; CASCADE handles dependents (order_lines,
  // menu_item_addons, menu_addon_options, password_reset_tokens, etc.) and
  // RESTART IDENTITY resets the invoice counter so PK-2026-0001 starts fresh.
  await db.execute(sql`
    TRUNCATE TABLE
      notifications,
      order_lines,
      orders,
      invoice_counters,
      menu_item_addons,
      menu_addon_options,
      menu_addon_groups,
      menu_items,
      menu_categories,
      password_reset_tokens,
      email_change_tokens
    RESTART IDENTITY CASCADE;
  `);
  console.log("  cleared: notifications, orders, menu, auth tokens");

  // Wipe every user that isn't the launch admin. Done after orders so the
  // orders FK (set null on user delete) doesn't fight us.
  await db.execute(sql`DELETE FROM users WHERE lower(email) <> ${email};`);
  console.log("  cleared: all non-admin users");

  const hash = await bcrypt.hash(password, 12);
  await db
    .insert(users)
    .values({
      email,
      name: "Administrator",
      role: "super_admin",
      passwordHash: hash,
      active: true,
    })
    .onConflictDoUpdate({
      target: users.email,
      set: {
        role: "super_admin",
        passwordHash: hash,
        active: true,
      },
    });
  console.log(`  upserted: ${email} (super_admin, active)`);

  console.log("\nDone. You can sign in at /sign-in with that email + password.");
  console.log("Change the password from /account once you're in.\n");
  process.exit(0);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
