import { notFound } from "next/navigation";
import { findCategoryBySlug } from "@/modules/menu";
import { CategoryForm } from "../../_components/category-form";

export const metadata = { title: "Edit category" };

interface PageProps {
  params: Promise<{ slug: string }>;
}

export default async function EditCategoryPage({ params }: PageProps) {
  const { slug } = await params;
  const category = await findCategoryBySlug(slug);
  if (!category) notFound();
  return <CategoryForm mode="edit" category={category} />;
}
