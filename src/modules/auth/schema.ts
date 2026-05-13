import { pgTable, text, timestamp, uuid, index } from "drizzle-orm/pg-core";
import { users } from "@/modules/users/schema";

// Password reset flow only stores the SHA-256 hash of the token; the raw
// token is delivered to the user (currently logged to the console — email
// transport lands in a follow-up module). Tokens are single-use.
export const passwordResetTokens = pgTable(
  "password_reset_tokens",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),
    tokenHash: text("token_hash").notNull().unique(),
    expiresAt: timestamp("expires_at", { withTimezone: true }).notNull(),
    usedAt: timestamp("used_at", { withTimezone: true }),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("pwd_reset_user_idx").on(t.userId)],
);

export type PasswordResetTokenRow = typeof passwordResetTokens.$inferSelect;
export type NewPasswordResetTokenRow = typeof passwordResetTokens.$inferInsert;
