// Plain-Node version of src/modules/users/reset-for-launch.ts. The production
// image is a Next.js standalone bundle and doesn't ship tsx, so the .ts
// script can't run inside the container. This file uses only `postgres` and
// `bcryptjs`, both of which are traced into the standalone image, and runs
// straight under `node`.
//
// Usage from the VPS:
//
//   cd /home/theplatinumkitchen/app
//   docker compose -f docker-compose.prod.yml --env-file .env.production exec \
//     -e ADMIN_EMAIL=admin@theplatinumkitchen.com \
//     -e ADMIN_PASSWORD='your-strong-password' \
//     -e CONFIRM=WIPE \
//     -T app node --input-type=module < scripts/reset-for-launch.mjs
//
// The CONFIRM=WIPE gate is mandatory — without it the script aborts before
// touching anything.

import postgres from "postgres";
import bcrypt from "bcryptjs";

const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
const password = process.env.ADMIN_PASSWORD;
const confirm = process.env.CONFIRM;
const dbUrl = process.env.DATABASE_URL;

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
if (!dbUrl) {
  console.error("Aborting: DATABASE_URL is not set in the container.");
  process.exit(1);
}

console.log(`\nResetting database for launch. Sole admin -> ${email}\n`);

const sql = postgres(dbUrl, { max: 1, prepare: false });

try {
  // TRUNCATE ... CASCADE handles dependent rows (order_lines, addon options,
  // junction rows, etc.) in one statement. RESTART IDENTITY resets the
  // invoice counter so PK-2026-0001 starts fresh.
  await sql.unsafe(`
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

  await sql`DELETE FROM users WHERE lower(email) <> ${email};`;
  console.log("  cleared: all non-admin users");

  const hash = await bcrypt.hash(password, 12);
  await sql`
    INSERT INTO users (email, name, role, password_hash, active)
    VALUES (${email}, 'Administrator', 'super_admin', ${hash}, true)
    ON CONFLICT (email) DO UPDATE
      SET role = 'super_admin',
          password_hash = EXCLUDED.password_hash,
          active = true;
  `;
  console.log(`  upserted: ${email} (super_admin, active)`);

  console.log("\nDone. Sign in at /sign-in with that email + password.");
  console.log("Change the password from /account once you're in.\n");
} finally {
  await sql.end({ timeout: 5 });
}
