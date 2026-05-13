import { notFound } from "next/navigation";
import { auth } from "@/lib/auth";
import { listAddonGroups } from "@/modules/menu";
import { GroupForm } from "../../_components/group-form";
import { OptionsPanel } from "../../_components/options-panel";

export const metadata = { title: "Edit variation group" };

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditGroupPage({ params }: PageProps) {
  const { id } = await params;
  const session = await auth();
  const user = session!.user;

  // Look up by id from the full list since the service has listAddonGroups
  // (returns groups with options); no findById helper yet.
  const all = await listAddonGroups();
  const group = all.find((g) => g.id === id);
  if (!group) notFound();

  return (
    <div className="mx-auto max-w-3xl space-y-6 pb-12">
      <GroupForm mode="edit" group={group} />
      <OptionsPanel groupId={group.id} options={group.options} actor={user} />
    </div>
  );
}
