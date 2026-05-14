import type { NextAuthConfig } from "next-auth";
import type { UserRole } from "@/modules/users/types";

// Edge-safe base config. Imported by middleware.ts (which can't pull bcrypt
// or any Node-only deps). The full provider list lives in ./index.ts.
// `import type` above is fully erased at build time, so this stays edge-safe.
export const authConfig = {
  pages: {
    signIn: "/sign-in",
  },
  providers: [],
  trustHost: true,
  callbacks: {
    // Surface id/role onto the session so middleware (and pages) can read
    // them. The jwt callback that puts them on the token lives in ./index.ts.
    session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.role = (token.role as UserRole) ?? "customer";
      }
      return session;
    },
    authorized({ auth, request }) {
      const path = request.nextUrl.pathname;
      const role = auth?.user?.role;
      if (path.startsWith("/admin")) {
        // Staff console — a signed-in customer must not get in.
        return Boolean(role) && role !== "customer";
      }
      if (path.startsWith("/account")) {
        // Customer area — any signed-in user is fine.
        return Boolean(auth);
      }
      return true;
    },
  },
} satisfies NextAuthConfig;
