import Link from "next/link";
import type { Metadata } from "next";
import { Suspense } from "react";
import { redirect } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { auth } from "@/lib/auth";
import { VerifyEmailClient } from "./verify-email-client";

export const metadata: Metadata = {
  title: "Verify your email",
};

interface PageProps {
  searchParams: Promise<{ token?: string }>;
}

export default async function VerifyEmailPage({ searchParams }: PageProps) {
  const session = await auth();
  const params = await searchParams;
  // Email change confirm requires an active session — the user must be
  // logged in for the request to count. Redirect to sign-in if not.
  if (!session?.user?.id) {
    const token = params.token ? `?token=${encodeURIComponent(params.token)}` : "";
    redirect(`/sign-in?from=${encodeURIComponent(`/verify-email${token}`)}`);
  }

  return (
    <div className="relative isolate flex min-h-screen flex-col bg-platinum-50">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10 overflow-hidden"
      >
        <div className="absolute -top-32 left-1/2 h-[42rem] w-[42rem] -translate-x-1/2 rounded-full bg-emerald-100/60 blur-3xl" />
      </div>

      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-6 sm:px-6 lg:px-8">
        <Link href="/">
          <BrandMark size="md" />
        </Link>
        <Link
          href="/admin"
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Admin
        </Link>
      </header>

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 pb-16 sm:px-6">
        <div className="rounded-3xl border border-platinum-200 bg-card p-7 shadow-2xl shadow-platinum-300/30 sm:p-9">
          <Suspense fallback={null}>
            <VerifyEmailClient />
          </Suspense>
        </div>
      </main>
    </div>
  );
}
