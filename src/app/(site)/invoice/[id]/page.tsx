import { notFound } from "next/navigation";
import { getOrderById } from "@/modules/orders";
import { InvoiceView } from "./invoice-view";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = getOrderById(id);
  return {
    title: order ? `Invoice ${order.number}` : "Invoice",
  };
}

export default async function InvoicePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const order = getOrderById(id);
  if (!order) notFound();
  return <InvoiceView order={order} />;
}
