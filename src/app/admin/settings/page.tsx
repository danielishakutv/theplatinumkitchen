import { redirect } from "next/navigation";
import { auth } from "@/lib/auth";
import { can } from "@/modules/users/permissions";
import { getSettings } from "@/modules/settings";
import { SettingsForm } from "./settings-form";

export const dynamic = "force-dynamic";
export const metadata = { title: "Settings" };

export default async function AdminSettingsPage() {
  const session = await auth();
  const user = session!.user;
  if (!can(user, "settings:write")) {
    redirect("/admin");
  }
  const settings = await getSettings();

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-24">
      <header>
        <h1 className="font-display text-3xl font-medium tracking-tight sm:text-4xl">
          Site settings
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Edit anything customers see across the site, the order email, and the
          contact info shown in the footer.
        </p>
      </header>
      <SettingsForm settings={settings} />
    </div>
  );
}
