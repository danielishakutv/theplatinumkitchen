import { Lock } from "lucide-react";
import { auth } from "@/lib/auth";
import { listStaff, can, PermissionError } from "@/modules/users";
import { UsersClient } from "./users-client";

export const dynamic = "force-dynamic";
export const metadata = { title: "Users" };

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
    <UsersClient
      staff={staff}
      currentUserId={user.id}
      canWrite={canWrite}
    />
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
        Your role doesn&apos;t have access to this page. Speak to a super admin
        or manager if you think that&apos;s wrong.
      </p>
    </div>
  );
}
