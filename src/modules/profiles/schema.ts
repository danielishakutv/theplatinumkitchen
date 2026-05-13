import { pgTable, text, timestamp, uuid, index } from "drizzle-orm/pg-core";
import { users } from "@/modules/users/schema";

// Email change is gated by a verification token sent to the NEW address.
// Same dev-mode stub pattern as password reset: raw token is logged to the
// console; only its SHA-256 hash is stored.
export const emailChangeTokens = pgTable(
  "email_change_tokens",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    newEmail: text("new_email").notNull(),
    tokenHash: text("token_hash").notNull().unique(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    usedAt: timestamp("used_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("email_change_user_idx").on(t.userId)],
);

export type EmailChangeTokenRow = typeof emailChangeTokens.$inferSelect;
export type NewEmailChangeTokenRow = typeof emailChangeTokens.$inferInsert;
