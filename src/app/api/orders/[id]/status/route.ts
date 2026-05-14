// Polled by the customer order page so the status timeline updates live
// without a page refresh. Public-by-id — the order id is the unguessable
// token, the same trust model as the /order/[id] page itself. Returns only
// the fields the timeline needs, never the full order.
import { getOrderById } from "@/modules/orders";

export const dynamic = "force-dynamic";

export async function GET(
  _req: Request,
  ctx: { params: Promise<{ id: string }> },
) {
  const { id } = await ctx.params;
  const order = await getOrderById(id);
  if (!order) {
    return Response.json({ error: "not_found" }, { status: 404 });
  }
  return Response.json(
    { status: order.status, paymentStatus: order.paymentStatus },
    { headers: { "Cache-Control": "no-store" } },
  );
}
