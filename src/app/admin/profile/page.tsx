import { redirect } from "next/navigation";
import type { Metadata } from "next";
import { auth } from "@/lib/auth";
import { getProfile } from "@/modules/profiles";
import { ROLE_LABEL } from "@/modules/users";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DisplayInfoForm,
  EmailForm,
  PasswordForm,
} from "./profile-forms";

export const metadata: Metadata = {
  title: "My profile",
};

export default async function ProfilePage() {
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/sign-in?from=/admin/profile");
  }
  const profile = await getProfile(session.user.id);

  const initials = profile.name
    .split(" ")
    .map((p) => p.charAt(0))
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="mx-auto max-w-3xl space-y-6">
      <header className="flex items-center gap-4">
        <Avatar className="h-16 w-16 ring-2 ring-platinum-200">
          <AvatarImage src={profile.avatarUrl ?? undefined} alt={profile.name} />
          <AvatarFallback className="text-lg">{initials}</AvatarFallback>
        </Avatar>
        <div>
          <h1 className="font-display text-2xl font-medium">My profile</h1>
          <p className="text-sm text-muted-foreground">
            {profile.email} · {ROLE_LABEL[profile.role]}
          </p>
        </div>
      </header>

      <Card>
        <CardHeader>
          <CardTitle>Display info</CardTitle>
          <CardDescription>
            How your name and photo appear across the admin.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <DisplayInfoForm profile={profile} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Password</CardTitle>
          <CardDescription>
            Choose a new password. You&apos;ll stay signed in after the change.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <PasswordForm />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Email address</CardTitle>
          <CardDescription>
            Changing this also changes the address you sign in with.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <EmailForm currentEmail={profile.email} />
        </CardContent>
      </Card>
    </div>
  );
}
