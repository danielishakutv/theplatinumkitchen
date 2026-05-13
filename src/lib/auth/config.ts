import type { NextAuthConfig } from "next-auth";

// Edge-safe base config. Imported by middleware.ts (which can't pull bcrypt
// or any Node-only deps). The full provider list lives in ./index.ts.
export const authConfig = {
  pages: {
    signIn: "/sign-in",
  },
  providers: [],
  trustHost: true,
  callbacks: {
    authorized({ auth, request }) {
      const isAdmin = request.nextUrl.pathname.startsWith("/admin");
      if (isAdmin) return Boolean(auth);
      return true;
    },
  },
} satisfies NextAuthConfig;
