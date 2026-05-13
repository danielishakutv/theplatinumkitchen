"use client";

import { useTransition } from "react";
import Link from "next/link";
import { LogOut, User as UserIcon, Loader2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ROLE_LABEL, type UserRole } from "@/modules/users/types";
import { signOutAction } from "@/app/admin/actions";
import { cn } from "@/lib/utils";

interface SessionUserLike {
  name?: string | null;
  email?: string | null;
  image?: string | null;
  role: UserRole;
}

export function UserMenu({
  user,
  asPill = false,
}: {
  user: SessionUserLike;
  asPill?: boolean;
}) {
  const [pending, startTransition] = useTransition();

  const initials = (user.name ?? user.email ?? "?")
    .split(" ")
    .map((p) => p.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

  const handleSignOut = () => {
    startTransition(() => {
      signOutAction();
    });
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        aria-label="Account menu"
        className={cn(
          "outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background",
          asPill
            ? "flex w-full items-center gap-3 rounded-xl border border-platinum-200 bg-platinum-50 p-3 text-left transition-colors hover:bg-card"
            : "grid h-10 w-10 place-items-center rounded-full ring-1 ring-platinum-200 transition-colors hover:bg-accent",
        )}
      >
        <Avatar className={asPill ? "h-9 w-9 ring-2 ring-card" : "h-9 w-9"}>
          <AvatarImage src={user.image ?? undefined} alt={user.name ?? ""} />
          <AvatarFallback>{initials}</AvatarFallback>
        </Avatar>
        {asPill ? (
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{user.name}</p>
            <p className="truncate text-xs text-muted-foreground">
              {ROLE_LABEL[user.role]}
            </p>
          </div>
        ) : null}
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60 p-1.5">
        <DropdownMenuLabel className="px-2 py-2">
          <div className="space-y-0.5">
            <p className="truncate text-sm font-medium text-foreground">
              {user.name}
            </p>
            <p className="truncate text-xs font-normal text-muted-foreground">
              {user.email}
            </p>
            <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-primary">
              {ROLE_LABEL[user.role]}
            </p>
          </div>
        </DropdownMenuLabel>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          render={
            <Link href="/admin/profile" className="cursor-pointer">
              <UserIcon /> Profile
            </Link>
          }
        />
        <DropdownMenuSeparator />
        <DropdownMenuItem
          variant="destructive"
          onClick={handleSignOut}
          disabled={pending}
          className="cursor-pointer"
        >
          {pending ? <Loader2 className="animate-spin" /> : <LogOut />}
          Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
