import { redirect } from "next/navigation";
import { Plus, Mail, MoreHorizontal, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  ROLE_LABEL,
  ROLE_BADGE_TONE,
  listStaff,
  can,
  PermissionError,
} from "@/modules/users";
import { auth } from "@/lib/auth";
import { formatDate } from "@/lib/format";
import { cn } from "@/lib/utils";

export default async function UsersPage() {
  const session = await auth();
  const user = session!.user;

  if (!can(user, "users:read")) {
    return <Forbidden />;
  }

  let staff;
  try {
    staff = await listStaff(user);
  } catch (e) {
    if (e instanceof PermissionError) return <Forbidden />;
    throw e;
  }

  const canWrite = can(user, "users:write");

  return (
    <div className="space-y-6">
      <header className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-medium tracking-tight">Users & roles</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            {staff.length} teammate{staff.length === 1 ? "" : "s"} · permissions follow role
          </p>
        </div>
        {canWrite ? (
          <Button className="h-10 gap-1.5 rounded-full">
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
                        <p className="font-medium">{u.name}</p>
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
                      <Button variant="ghost" size="icon" className="h-8 w-8">
                        <MoreHorizontal className="h-4 w-4" />
                      </Button>
                    ) : null}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

function Forbidden() {
  return (
    <div className="grid place-items-center rounded-3xl border border-platinum-200 bg-card p-16 text-center">
      <div className="grid h-14 w-14 place-items-center rounded-full bg-platinum-100">
        <Lock className="h-6 w-6 text-muted-foreground" />
      </div>
      <h2 className="mt-5 font-display text-2xl">Not authorised</h2>
      <p className="mt-1 max-w-sm text-sm text-muted-foreground">
        Your role doesn't have access to this page. Speak to a super admin or
        manager if you think that's wrong.
      </p>
    </div>
  );
}
