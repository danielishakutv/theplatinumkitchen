import { createElement, type ReactElement } from "react";
import { renderToBuffer, type DocumentProps } from "@react-pdf/renderer";
import { getOrderById } from "@/modules/orders";
import { InvoiceDocument } from "../invoice-pdf";

// react-pdf needs the Node runtime; it can't render on the edge.
export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;
  const order = await getOrderById(id);
  if (!order) {
    return new Response("Invoice not found", { status: 404 });
  }

  // InvoiceDocument renders a <Document> internally; react-pdf's renderToBuffer
  // wants the Document element type, so we assert the wrapper to match.
  const element = createElement(InvoiceDocument, {
    order,
  }) as ReactElement<DocumentProps>;
  const buffer = await renderToBuffer(element);

  return new Response(new Uint8Array(buffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${order.number}.pdf"`,
      "Cache-Control": "no-store",
    },
  });
}
