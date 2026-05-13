import { listAddonGroups, listCategories } from "@/modules/menu";
import { ItemForm } from "../_components/item-form";

export const metadata = { title: "New dish" };

export default async function NewItemPage() {
  const [categories, addonGroups] = await Promise.all([
    listCategories(),
    listAddonGroups(),
  ]);
  return (
    <ItemForm mode="create" categories={categories} addonGroups={addonGroups} />
  );
}
