import Link from "next/link";
import type { Metadata } from "next";
import { Suspense } from "react";
import { ArrowLeft } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { SignInForm } from "./sign-in-form";

export const metadata: Metadata = {
  title: "Staff sign in",
  description: "Platinum Kitchen staff sign in.",
};

export default function SignInPage() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-6 sm:px-6 lg:px-8">
        <Link href="/">
          <BrandMark size="md" />
        </Link>
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to site
        </Link>
      </header>

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 pb-16 sm:px-6">
        <div className="rounded-3xl border border-platinum-200 bg-card p-7 shadow-2xl shadow-platinum-300/30 sm:p-9">
          <div className="space-y-2 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Staff console
            </p>
            <h1 className="font-display text-3xl font-medium leading-tight">
              Welcome back
            </h1>
            <p className="text-sm text-muted-foreground">
              Sign in to manage the kitchen.
            </p>
          </div>

          <div className="mt-7">
            <Suspense fallback={null}>
              <SignInForm />
            </Suspense>
          </div>
        </div>

        <p className="mt-5 text-center text-xs text-muted-foreground">
          Trouble signing in? Reach out to your manager.
        </p>
      </main>
    </div>
  );
}
