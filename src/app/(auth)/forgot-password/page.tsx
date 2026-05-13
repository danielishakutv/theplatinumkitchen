import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import { BrandMark } from "@/components/brand-mark";
import { ForgotPasswordForm } from "./forgot-password-form";

export const metadata: Metadata = {
  title: "Forgot password",
  description: "Reset your Platinum Kitchen password.",
};

export default function ForgotPasswordPage() {
  return (
    <div className="flex flex-1 flex-col">
      <header className="mx-auto flex w-full max-w-7xl items-center justify-between px-4 py-6 sm:px-6 lg:px-8">
        <Link href="/">
          <BrandMark size="md" />
        </Link>
        <Link
          href="/sign-in"
          className="inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-medium text-muted-foreground transition-colors hover:bg-accent hover:text-foreground"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to sign in
        </Link>
      </header>

      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 pb-16 sm:px-6">
        <div className="rounded-3xl border border-platinum-200 bg-card p-7 shadow-2xl shadow-platinum-300/30 sm:p-9">
          <div className="space-y-2 text-center">
            <p className="text-xs font-semibold uppercase tracking-[0.2em] text-primary">
              Forgot password
            </p>
            <h1 className="font-display text-3xl font-medium leading-tight">
              Reset your password
            </h1>
            <p className="text-sm text-muted-foreground">
              Enter your email and we&apos;ll send you a reset link.
            </p>
          </div>

          <div className="mt-7">
            <ForgotPasswordForm />
          </div>
        </div>
      </main>
    </div>
  );
}
