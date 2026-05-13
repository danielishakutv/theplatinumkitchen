import { GroupForm } from "../_components/group-form";

export const metadata = { title: "New variation group" };

export default function NewGroupPage() {
  return (
    <div className="mx-auto max-w-3xl pb-12">
      <GroupForm mode="create" />
    </div>
  );
}
