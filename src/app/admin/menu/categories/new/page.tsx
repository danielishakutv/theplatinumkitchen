import { CategoryForm } from "../_components/category-form";

export const metadata = { title: "New category" };

export default function NewCategoryPage() {
  return <CategoryForm mode="create" />;
}
