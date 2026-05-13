import { notFound } from "next/navigation";
import { findItemById, listAddonGroups, listCategories } from "@/modules/menu";
import { ItemForm } from "../../_components/item-form";

export const metadata = { title: "Edit dish" };

interface PageProps {
  params: Promise<{ id: string }>;
}

export default async function EditItemPage({ params }: PageProps) {
  const { id } = await params;
  const [item, categories, addonGroups] = await Promise.all([
    findItemById(id),
    listCategories(),
    listAddonGroups(),
  ]);
  if (!item) notFound();
  return (
    <ItemForm
      mode="edit"
      item={item}
      categories={categories}
      addonGroups={addonGroups}
    />
  );
}
