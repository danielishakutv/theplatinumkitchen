"use client";

import { useState, useTransition } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { CheckCircle2, Eye, EyeOff, Loader2, Lock } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { resetPasswordAction } from "./actions";

export function ResetPasswordForm() {
  const params = useSearchParams();
  const router = useRouter();
  const token = params.get("token") ?? "";

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, startTransition] = useTransition();

  if (!token) {
    return (
      <div
        role="alert"
        className="rounded-xl border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive"
      >
        This reset link is missing its token. Request a new one from{" "}
        <Link href="/forgot-password" className="font-medium underline">
          forgot password
        </Link>
        .
      </div>
    );
  }

  if (done) {
    return (
      <div className="space-y-5 text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-100">
          <CheckCircle2 className="h-7 w-7 text-emerald-700" />
        </div>
        <div className="space-y-1.5">
          <p className="text-base font-medium">Password updated</p>
          <p className="text-sm text-muted-foreground">
            You can now sign in with your new password.
          </p>
        </div>
        <Button
          onClick={() => router.push("/sign-in")}
          size="lg"
          className="h-12 w-full rounded-full text-base font-medium"
        >
          Go to sign in
        </Button>
      </div>
    );
  }

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    fd.set("token", token);
    startTransition(async () => {
      const result = await resetPasswordAction(fd);
      if (!result.ok && result.error) {
        setError(result.error);
        return;
      }
      setDone(true);
    });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="password" className="text-sm font-medium">
          New password
        </Label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="password"
            name="password"
            type={showPw ? "text" : "password"}
            autoComplete="new-password"
            minLength={8}
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="h-12 border-platinum-200 bg-card pl-10 pr-11"
          />
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            className="absolute right-2.5 top-1/2 grid h-9 w-9 -translate-y-1/2 place-items-center rounded-full text-muted-foreground hover:bg-accent hover:text-foreground"
            aria-label={showPw ? "Hide password" : "Show password"}
          >
            {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <p className="text-xs text-muted-foreground">At least 8 characters.</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirm" className="text-sm font-medium">
          Confirm password
        </Label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="confirm"
            name="confirm"
            type={showPw ? "text" : "password"}
            autoComplete="new-password"
            minLength={8}
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
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
            <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating…
          </>
        ) : (
          "Update password"
        )}
      </Button>
    </form>
  );
}
