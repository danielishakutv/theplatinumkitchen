"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { verifyEmailAction } from "./actions";

type State =
  | { kind: "verifying" }
  | { kind: "success"; newEmail: string }
  | { kind: "error"; message: string };

export function VerifyEmailClient() {
  const params = useSearchParams();
  const token = params.get("token") ?? "";
  const [state, setState] = useState<State>(() =>
    token
      ? { kind: "verifying" }
      : { kind: "error", message: "Missing verification token." },
  );
  // useRef guards against React StrictMode's double-invocation in dev, so we
  // don't burn the single-use token by calling verify twice.
  const ran = useRef(false);

  useEffect(() => {
    if (ran.current || !token) return;
    ran.current = true;

    verifyEmailAction(token).then((result) => {
      if (result.ok && result.newEmail) {
        setState({ kind: "success", newEmail: result.newEmail });
      } else {
        setState({ kind: "error", message: result.error ?? "Verification failed." });
      }
    });
  }, [token]);

  if (state.kind === "verifying") {
    return (
      <div className="space-y-3 text-center">
        <Loader2 className="mx-auto h-7 w-7 animate-spin text-muted-foreground" />
        <p className="text-sm text-muted-foreground">Verifying your new email…</p>
      </div>
    );
  }

  if (state.kind === "success") {
    return (
      <div className="space-y-5 text-center">
        <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-emerald-100">
          <CheckCircle2 className="h-7 w-7 text-emerald-700" />
        </div>
        <div className="space-y-1.5">
          <p className="text-base font-medium">Email updated</p>
          <p className="text-sm text-muted-foreground">
            Your account email is now{" "}
            <span className="font-medium text-foreground">{state.newEmail}</span>.
            Use this to sign in from now on.
          </p>
        </div>
        <Button asChild size="lg" className="h-12 w-full rounded-full">
          <Link href="/admin">Back to admin</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="space-y-5 text-center">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-full bg-destructive/10">
        <XCircle className="h-7 w-7 text-destructive" />
      </div>
      <div className="space-y-1.5">
        <p className="text-base font-medium">Couldn&apos;t verify</p>
        <p className="text-sm text-muted-foreground">{state.message}</p>
      </div>
      <Button asChild variant="outline" size="lg" className="h-12 w-full rounded-full">
        <Link href="/admin/profile">Go to profile</Link>
      </Button>
    </div>
  );
}
