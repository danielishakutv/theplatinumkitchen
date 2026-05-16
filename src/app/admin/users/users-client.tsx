"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Mail, Pencil, Plus, Trash2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";
// Deep-import leaf modules — the @/modules/users barrel is server-only.
import { ROLE_BADGE_TONE } from "@/modules/users/permissions";
import { ROLE_LABEL, type StaffUser, type UserRole } from "@/modules/users/types";
import {
  createUserAction,
  deleteUserAction,
  updateUserAction,
} from "./actions";

// Role pickers exclude "customer" — that role is for public sign-ups, not
// teammates the admin invites here.
const STAFF_ROLES: { value: UserRole; label: string }[] = [
  { value: "super_admin", label: "Super admin" },
  { value: "manager", label: "Manager" },
  { value: "cashier", label: "Cashier" },
  { value: "kitchen", label: "Kitchen" },
  { value: "rider", label: "Rider" },
];

export function UsersClient({
  staff,
  currentUserId,
  canWrite,
}: {
  staff: StaffUser[];
  currentUserId: string;
  canWrite: boolean;
}) {
  const [creating, setCreating] = useState(false);
  const [editing, setEditing] = useState<StaffUser | null>(null);
  const [deleting, setDeleting] = useState<StaffUser | null>(null);

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-medium tracking-tight">
            Users & roles
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {staff.length} teammate{staff.length === 1 ? "" : "s"} · permissions
            follow role
          </p>
        </div>
        {canWrite ? (
          <Button
            onClick={() => setCreating(true)}
            className="h-10 gap-1.5 rounded-full"
          >
            <Plus className="h-4 w-4" /> Invite teammate
          </Button>
        ) : null}
      </header>

      <div className="overflow-hidden rounded-3xl border border-platinum-200 bg-card">
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead className="border-b border-platinum-200 bg-platinum-50/60 text-[11px] uppercase tracking-[0.14em] text-muted-foreground">
              <tr>
                <th className="px-5 py-3 text-left font-semibold">Person</th>
                <th className="px-5 py-3 text-left font-semibold">Role</th>
                <th className="px-5 py-3 text-left font-semibold">Joined</th>
                <th className="px-5 py-3 text-left font-semibold">Status</th>
                <th className="px-5 py-3" />
              </tr>
            </thead>
            <tbody className="divide-y divide-platinum-200">
              {staff.map((u) => (
                <tr key={u.id} className="hover:bg-platinum-50/40">
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-3">
                      <Avatar className="h-10 w-10">
                        <AvatarImage src={u.avatarUrl} alt={u.name} />
                        <AvatarFallback>{u.name.charAt(0)}</AvatarFallback>
                      </Avatar>
                      <div>
                        <p className="font-medium">
                          {u.name}
                          {u.id === currentUserId ? (
                            <span className="ml-1.5 rounded-full bg-platinum-100 px-2 py-0.5 text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                              you
                            </span>
                          ) : null}
                        </p>
                        <p className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Mail className="h-3 w-3" />
                          {u.email}
                        </p>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={cn(
                        "rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wider",
                        ROLE_BADGE_TONE[u.role],
                      )}
                    >
                      {ROLE_LABEL[u.role]}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-xs text-muted-foreground">
                    {formatDate(u.joinedAt)}
                  </td>
                  <td className="px-5 py-4">
                    <span
                      className={cn(
                        "inline-flex items-center gap-1.5 text-xs font-medium",
                        u.active ? "text-emerald-700" : "text-muted-foreground",
                      )}
                    >
                      <span
                        className={cn(
                          "h-1.5 w-1.5 rounded-full",
                          u.active ? "bg-emerald-500" : "bg-platinum-400",
                        )}
                      />
                      {u.active ? "Active" : "Inactive"}
                    </span>
                  </td>
                  <td className="px-5 py-4 text-right">
                    {canWrite ? (
                      <div className="flex items-center justify-end gap-1">
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8"
                          onClick={() => setEditing(u)}
                          aria-label={`Edit ${u.name}`}
                        >
                          <Pencil className="h-3.5 w-3.5" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 text-destructive hover:text-destructive"
                          onClick={() => setDeleting(u)}
                          disabled={u.id === currentUserId}
                          aria-label={`Delete ${u.name}`}
                          title={
                            u.id === currentUserId
                              ? "You can't delete your own account"
                              : `Delete ${u.name}`
                          }
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                        </Button>
                      </div>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      <CreateUserDialog open={creating} onOpenChange={setCreating} />
      <EditUserDialog user={editing} onClose={() => setEditing(null)} />
      <DeleteUserDialog user={deleting} onClose={() => setDeleting(null)} />
    </div>
  );
}

function CreateUserDialog({
  open,
  onOpenChange,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [role, setRole] = useState<UserRole>("cashier");
  const [active, setActive] = useState(true);

  const reset = () => {
    setName("");
    setEmail("");
    setPassword("");
    setRole("cashier");
    setActive(true);
    setError(null);
  };

  const handleOpenChange = (next: boolean) => {
    if (!next) reset();
    onOpenChange(next);
  };

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    start(async () => {
      const r = await createUserAction({
        name,
        email,
        password,
        role,
        active,
      });
      if (!r.ok) {
        setError(r.error ?? "Could not create user.");
        return;
      }
      reset();
      onOpenChange(false);
      router.refresh();
    });
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Invite a teammate</DialogTitle>
          <DialogDescription>
            They&apos;ll be able to sign in immediately with the password you
            set here. Roles control which areas of the admin they can access.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={submit} className="space-y-4">
          <Field label="Name" htmlFor="create-name">
            <Input
              id="create-name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              maxLength={120}
              autoFocus
            />
          </Field>
          <Field label="Email" htmlFor="create-email">
            <Input
              id="create-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              maxLength={254}
            />
          </Field>
          <Field
            label="Password"
            htmlFor="create-password"
            hint="At least 8 characters. Share it with them out-of-band."
          >
            <Input
              id="create-password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={8}
              maxLength={200}
            />
          </Field>
          <Field label="Role">
            <RoleChips value={role} onChange={setRole} />
          </Field>
          <label
            htmlFor="create-active"
            className="flex cursor-pointer items-center gap-2 text-sm"
          >
            <Checkbox
              id="create-active"
              checked={active}
              onCheckedChange={(c) => setActive(c === true)}
            />
            <span>Active — can sign in</span>
          </label>

          {error ? (
            <div
              role="alert"
              className="rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive"
            >
              {error}
            </div>
          ) : null}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => handleOpenChange(false)}
              disabled={pending}
            >
              Cancel
            </Button>
            <Button type="submit" disabled={pending}>
              {pending ? (
                <>
                  <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                  Inviting…
                </>
              ) : (
                "Send invite"
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

function EditUserDialog({
  user,
  onClose,
}: {
  user: StaffUser | null;
  onClose: () => void;
}) {
  return (
    <Dialog
      open={!!user}
      onOpenChange={(o) => {
        if (!o) onClose();
      }}
    >
      <DialogContent className="sm:max-w-md">
        {user ? <EditUserForm key={user.id} user={user} onClose={onClose} /> : null}
      </DialogContent>
    </Dialog>
  );
}

function EditUserForm({
  user,
  onClose,
}: {
  user: StaffUser;
  onClose: () => void;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [name, setName] = useState(user.name);
  const [email, setEmail] = useState(user.email);
  const [role, setRole] = useState<UserRole>(user.role);
  const [active, setActive] = useState(user.active);
  const [password, setPassword] = useState("");

  const submit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setError(null);
    start(async () => {
      const r = await updateUserAction(user.id, {
        name: name !== user.name ? name : undefined,
        email: email.toLowerCase() !== user.email ? email : undefined,
        role: role !== user.role ? role : undefined,
        active: active !== user.active ? active : undefined,
        password: password.length > 0 ? password : undefined,
      });
      if (!r.ok) {
        setError(r.error ?? "Could not save.");
        return;
      }
      onClose();
      router.refresh();
    });
  };

  return (
    <>
      <DialogHeader>
        <DialogTitle>Edit {user.name}</DialogTitle>
        <DialogDescription>
          Update their details, change role, deactivate the account, or reset
          the password.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={submit} className="space-y-4">
        <Field label="Name" htmlFor="edit-name">
          <Input
            id="edit-name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            maxLength={120}
          />
        </Field>
        <Field label="Email" htmlFor="edit-email">
          <Input
            id="edit-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            maxLength={254}
          />
        </Field>
        <Field label="Role">
          <RoleChips value={role} onChange={setRole} />
        </Field>
        <label
          htmlFor="edit-active"
          className="flex cursor-pointer items-center gap-2 text-sm"
        >
          <Checkbox
            id="edit-active"
            checked={active}
            onCheckedChange={(c) => setActive(c === true)}
          />
          <span>Active — can sign in</span>
        </label>
        <Field
          label="Reset password"
          htmlFor="edit-password"
          hint="Leave blank to keep their current password. Min 8 characters if set."
        >
          <Input
            id="edit-password"
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={password.length > 0 ? 8 : undefined}
            maxLength={200}
            placeholder="(unchanged)"
          />
        </Field>

        {error ? (
          <div
            role="alert"
            className="rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive"
          >
            {error}
          </div>
        ) : null}

        <DialogFooter>
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={pending}
          >
            Cancel
          </Button>
          <Button type="submit" disabled={pending}>
            {pending ? (
              <>
                <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                Saving…
              </>
            ) : (
              "Save changes"
            )}
          </Button>
        </DialogFooter>
      </form>
    </>
  );
}

function DeleteUserDialog({
  user,
  onClose,
}: {
  user: StaffUser | null;
  onClose: () => void;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  const handleDelete = () => {
    if (!user) return;
    setError(null);
    start(async () => {
      const r = await deleteUserAction(user.id);
      if (!r.ok) {
        setError(r.error ?? "Could not delete user.");
        return;
      }
      onClose();
      router.refresh();
    });
  };

  return (
    <Dialog
      open={!!user}
      onOpenChange={(o) => {
        if (!o) {
          setError(null);
          onClose();
        }
      }}
    >
      <DialogContent className="sm:max-w-md">
        {user ? (
          <>
            <DialogHeader>
              <DialogTitle>Delete {user.name}?</DialogTitle>
              <DialogDescription>
                This permanently removes <strong>{user.email}</strong> and
                their in-app notifications. Any orders this account placed are
                kept — the customer details on each order record stay intact.
              </DialogDescription>
            </DialogHeader>

            {error ? (
              <div
                role="alert"
                className="rounded-xl border border-destructive/30 bg-destructive/5 px-3 py-2 text-xs text-destructive"
              >
                {error}
              </div>
            ) : null}

            <DialogFooter>
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={pending}
              >
                Cancel
              </Button>
              <Button
                type="button"
                variant="destructive"
                onClick={handleDelete}
                disabled={pending}
              >
                {pending ? (
                  <>
                    <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                    Deleting…
                  </>
                ) : (
                  "Delete user"
                )}
              </Button>
            </DialogFooter>
          </>
        ) : null}
      </DialogContent>
    </Dialog>
  );
}

function RoleChips({
  value,
  onChange,
}: {
  value: UserRole;
  onChange: (role: UserRole) => void;
}) {
  return (
    <div className="flex flex-wrap gap-1.5">
      {STAFF_ROLES.map((r) => {
        const active = value === r.value;
        return (
          <button
            key={r.value}
            type="button"
            onClick={() => onChange(r.value)}
            className={cn(
              "rounded-full border px-3 py-1 text-xs font-medium transition-colors",
              active
                ? "border-foreground bg-foreground text-background"
                : "border-platinum-200 bg-card text-foreground/80 hover:bg-accent",
            )}
          >
            {r.label}
          </button>
        );
      })}
    </div>
  );
}

function Field({
  label,
  htmlFor,
  hint,
  children,
}: {
  label: string;
  htmlFor?: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={htmlFor} className="text-sm font-medium">
        {label}
      </Label>
      {children}
      {hint ? <p className="text-xs text-muted-foreground">{hint}</p> : null}
    </div>
  );
}
