"use client";

import { useState, useTransition } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Eye, EyeOff, Loader2, Lock, Mail } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { signInAction } from "./actions";
import { cn } from "@/lib/utils";

const DEMO_ACCOUNTS = [
  { email: "aisha@theplatinumkitchen.com", role: "Super admin" },
  { email: "emeka@theplatinumkitchen.com", role: "Manager" },
  { email: "temi@theplatinumkitchen.com", role: "Cashier" },
  { email: "folake@theplatinumkitchen.com", role: "Kitchen" },
];

const DEMO_PASSWORD = "platinum123";

export function SignInForm() {
  const params = useSearchParams();
  const from = params.get("from") ?? "/admin";

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    const fd = new FormData(e.currentTarget);
    fd.set("from", from);
    startTransition(async () => {
      const result = await signInAction(fd);
      if (!result.ok && result.error) setError(result.error);
    });
  };

  const fillDemo = (demoEmail: string) => {
    setEmail(demoEmail);
    setPassword(DEMO_PASSWORD);
    setError(null);
  };

  return (
    <div className="space-y-6">
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

        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label htmlFor="password" className="text-sm font-medium">
              Password
            </Label>
            <Link
              href="/forgot-password"
              className="text-xs font-medium text-primary hover:underline"
            >
              Forgot?
            </Link>
          </div>
          <div className="relative">
            <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="password"
              name="password"
              type={showPw ? "text" : "password"}
              autoComplete="current-password"
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
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Signing in…
            </>
          ) : (
            "Sign in"
          )}
        </Button>
      </form>

      <div className="rounded-2xl border border-dashed border-platinum-300 bg-platinum-100/50 p-4">
        <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">
          Demo accounts
        </p>
        <p className="mt-1 text-xs text-muted-foreground">
          Tap any to autofill. Password is{" "}
          <code className="rounded bg-background px-1.5 py-0.5 text-foreground">
            {DEMO_PASSWORD}
          </code>{" "}
          for all.
        </p>
        <ul className="mt-3 grid grid-cols-1 gap-1.5 sm:grid-cols-2">
          {DEMO_ACCOUNTS.map((a) => (
            <li key={a.email}>
              <button
                type="button"
                onClick={() => fillDemo(a.email)}
                className={cn(
                  "flex w-full items-center justify-between gap-2 rounded-lg border border-transparent bg-card px-3 py-2 text-left text-xs transition-colors",
                  "hover:border-platinum-300 hover:bg-card",
                )}
              >
                <span className="truncate font-mono text-[11px] text-foreground/80">
                  {a.email.split("@")[0]}
                </span>
                <span className="rounded-full bg-accent px-1.5 py-0.5 text-[9px] font-bold uppercase tracking-wider text-primary">
                  {a.role}
                </span>
              </button>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
