import NextAuth from "next-auth";
import { authConfig } from "@/lib/auth/config";

export default NextAuth(authConfig).auth;

export const config = {
  matcher: [
    // Apply auth to all admin routes EXCEPT internal Next assets
    "/admin/:path*",
  ],
};
