import "server-only";

import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { z } from "zod";

import { authConfig } from "./config";
import { verifyCredentials, recordLogin } from "@/modules/users/service";
import type { UserRole } from "@/modules/users/types";

const credentialsSchema = z.object({
  email: z.string().email(),
  password: z.string().min(1),
});

export const { handlers, signIn, signOut, auth } = NextAuth({
  ...authConfig,
  session: { strategy: "jwt", maxAge: 60 * 60 * 24 * 7 }, // 7 days
  providers: [
    Credentials({
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(raw) {
        const parsed = credentialsSchema.safeParse(raw);
        if (!parsed.success) return null;
        const user = await verifyCredentials(parsed.data.email, parsed.data.password);
        if (!user) return null;
        // Fire-and-forget; don't block sign-in on the update.
        recordLogin(user.id).catch(() => {});
        return {
          id: user.id,
          email: user.email,
          name: user.name,
          role: user.role as UserRole,
          image: user.avatarUrl ?? null,
        };
      },
    }),
  ],
  callbacks: {
    // `authorized` + `session` come from authConfig (edge-safe). Only `jwt`
    // — which seeds the token at sign-in — needs to live here.
    ...authConfig.callbacks,
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id as string;
        token.role = (user as { role?: UserRole }).role ?? "customer";
      }
      return token;
    },
  },
});

export async function currentUser() {
  const session = await auth();
  return session?.user ?? null;
}
