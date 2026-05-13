"use client";

import { useState, useTransition } from "react";
import {
  AtSign,
  CheckCircle2,
  Eye,
  EyeOff,
  Image as ImageIcon,
  Loader2,
  Lock,
  Mail,
  User as UserIcon,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  changePasswordAction,
  requestEmailChangeAction,
  updateProfileAction,
} from "./actions";
import type { Profile } from "@/modules/profiles";

function Notice({
  tone,
  children,
}: {
  tone: "success" | "error";
  children: React.ReactNode;
}) {
  const cls =
    tone === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-800"
      : "border-destructive/30 bg-destructive/5 text-destructive";
  return (
    <div role="alert" className={`rounded-xl border px-4 py-3 text-sm ${cls}`}>
      {children}
    </div>
  );
}

export function DisplayInfoForm({ profile }: { profile: Profile }) {
  const [name, setName] = useState(profile.name);
  const [avatarUrl, setAvatarUrl] = useState(profile.avatarUrl ?? "");
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);
  const [pending, start] = useTransition();

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSaved(false);
    const fd = new FormData(e.currentTarget);
    start(async () => {
      const result = await updateProfileAction(fd);
      if (!result.ok) setError(result.error ?? "Update failed.");
      else setSaved(true);
    });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="name">Display name</Label>
        <div className="relative">
          <UserIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="name"
            name="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="h-11 pl-10"
            required
            maxLength={120}
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="avatarUrl">Avatar URL</Label>
        <div className="relative">
          <ImageIcon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="avatarUrl"
            name="avatarUrl"
            type="url"
            value={avatarUrl}
            onChange={(e) => setAvatarUrl(e.target.value)}
            placeholder="https://…  (leave blank to remove)"
            className="h-11 pl-10"
            maxLength={500}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          Paste a public image URL. Uploads will come with the Cloudinary integration.
        </p>
      </div>

      {error ? <Notice tone="error">{error}</Notice> : null}
      {saved ? <Notice tone="success">Saved.</Notice> : null}

      <div className="flex justify-end">
        <Button type="submit" disabled={pending} className="rounded-full">
          {pending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Saving…
            </>
          ) : (
            "Save changes"
          )}
        </Button>
      </div>
    </form>
  );
}

export function PasswordForm() {
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, start] = useTransition();

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setDone(false);
    const form = e.currentTarget;
    const fd = new FormData(form);
    start(async () => {
      const result = await changePasswordAction(fd);
      if (!result.ok) {
        setError(result.error ?? "Password change failed.");
      } else {
        setDone(true);
        form.reset();
      }
    });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="currentPassword">Current password</Label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="currentPassword"
            name="currentPassword"
            type={showPw ? "text" : "password"}
            autoComplete="current-password"
            required
            className="h-11 pl-10 pr-11"
          />
          <button
            type="button"
            onClick={() => setShowPw((v) => !v)}
            className="absolute right-2.5 top-1/2 grid h-8 w-8 -translate-y-1/2 place-items-center rounded-full text-muted-foreground hover:bg-accent"
            aria-label={showPw ? "Hide passwords" : "Show passwords"}
          >
            {showPw ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="newPassword">New password</Label>
          <Input
            id="newPassword"
            name="newPassword"
            type={showPw ? "text" : "password"}
            autoComplete="new-password"
            minLength={8}
            required
            className="h-11"
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="confirm">Confirm new password</Label>
          <Input
            id="confirm"
            name="confirm"
            type={showPw ? "text" : "password"}
            autoComplete="new-password"
            minLength={8}
            required
            className="h-11"
          />
        </div>
      </div>

      {error ? <Notice tone="error">{error}</Notice> : null}
      {done ? <Notice tone="success">Password updated.</Notice> : null}

      <div className="flex justify-end">
        <Button type="submit" disabled={pending} className="rounded-full">
          {pending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Updating…
            </>
          ) : (
            "Update password"
          )}
        </Button>
      </div>
    </form>
  );
}

export function EmailForm({ currentEmail }: { currentEmail: string }) {
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState<{ to: string; devToken?: string } | null>(null);
  const [pending, start] = useTransition();

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    setSent(null);
    const form = e.currentTarget;
    const fd = new FormData(form);
    const newEmail = String(fd.get("newEmail") ?? "");
    start(async () => {
      const result = await requestEmailChangeAction(fd);
      if (!result.ok) {
        setError(result.error ?? "Could not request email change.");
      } else {
        setSent({ to: newEmail, devToken: result.devToken });
        form.reset();
      }
    });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <div className="space-y-2">
        <Label>Current email</Label>
        <div className="relative">
          <Mail className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={currentEmail}
            disabled
            className="h-11 bg-platinum-50 pl-10"
          />
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="newEmail">New email</Label>
        <div className="relative">
          <AtSign className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="newEmail"
            name="newEmail"
            type="email"
            autoComplete="email"
            required
            className="h-11 pl-10"
            maxLength={254}
          />
        </div>
        <p className="text-xs text-muted-foreground">
          A confirmation link will be sent to the new address. Email is updated only after you click it.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="currentPasswordEmail">Current password</Label>
        <div className="relative">
          <Lock className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="currentPasswordEmail"
            name="currentPassword"
            type="password"
            autoComplete="current-password"
            required
            className="h-11 pl-10"
          />
        </div>
      </div>

      {error ? <Notice tone="error">{error}</Notice> : null}

      {sent ? (
        <Notice tone="success">
          <div className="flex items-start gap-2">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
            <div className="space-y-1">
              <p>Verification link sent to {sent.to}.</p>
              {sent.devToken ? (
                <p className="text-xs">
                  Dev token (email transport not configured):{" "}
                  <code className="rounded bg-background px-1 py-0.5">
                    {sent.devToken}
                  </code>
                </p>
              ) : null}
            </div>
          </div>
        </Notice>
      ) : null}

      <div className="flex justify-end">
        <Button type="submit" disabled={pending} className="rounded-full">
          {pending ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" /> Sending…
            </>
          ) : (
            "Send verification link"
          )}
        </Button>
      </div>
    </form>
  );
}
