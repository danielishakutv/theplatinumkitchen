import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth/config";

export default NextAuth(authConfig).auth;

export const config = {
  matcher: [
    // Staff console and customer account area — both require a session.
    "/admin/:path*",
    "/account/:path*",
  ],
};
