"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { CheckCircle2, Loader2, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { forgotPasswordAction } from "./actions";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [pending, startTransition] = useTransition();

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    startTransition(async () => {
      const result = await forgotPasswordAction(fd);
      if (!result.ok && result.error) {
        setError(result.error);
        return;
      }
      setSent(true);
    });
  };

  if (sent) {
    return (
      <div className="space-y-5 text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-100">
          <CheckCircle2 className="h-7 w-7 text-emerald-700" />
        </div>
        <div className="space-y-1.5">
          <p className="text-base font-medium">Check your inbox</p>
          <p className="text-sm text-muted-foreground">
            If <span className="font-medium text-foreground">{email}</span> is registered, a
            reset link is on its way. The link expires in 60 minutes.
          </p>
        </div>
        <Link
          href="/sign-in"
          className="inline-block text-sm font-medium text-primary hover:underline"
        >
          Back to sign in
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="email" className="text-sm font-medium">
          Email
        </Label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="you@theplatinumkitchen.com"
            className="h-12 border-platinum-200 bg-card pl-10"
          />
        </div>
      </div>

      {error ? (
        <div
          role="alert"
          className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
        >
          {error}
        </div>
      ) : null}

      <Button
        type="submit"
        disabled={pending}
        size="lg"
        className="h-12 w-full rounded-full text-base font-medium shadow-lg shadow-primary/15"
      >
        {pending ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending…
          </>
        ) : (
          "Send reset link"
        )}
      </Button>

      <p className="text-center text-sm text-muted-foreground">
        Remembered it?{" "}
        <Link href="/sign-in" className="font-medium text-primary hover:underline">
          Back to sign in
        </Link>
      </p>
    </form>
  );
}
