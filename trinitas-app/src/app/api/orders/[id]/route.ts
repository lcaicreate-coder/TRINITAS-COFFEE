import { NextRequest } from "next/server";
import { updateOrderStatus } from "@/lib/db";
import type { OrderStatus } from "@/lib/types";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "edge";

type PatchBody = { status?: OrderStatus } | null;

export async function PATCH(req: NextRequest, context: { params: Promise<{ id: string }> }) {
  const { id } = await context.params;
  const body: PatchBody = await req.json().catch(() => null);
  const status: OrderStatus | undefined = body?.status;
  if (!status || !["pending", "in_progress", "ready", "done"].includes(status)) {
    return new Response(JSON.stringify({ error: "無效狀態" }), { status: 400 });
  }
  const updated = await updateOrderStatus(id, status);
  if (!updated) return new Response(JSON.stringify({ error: "訂單不存在" }), { status: 404 });
  return Response.json({ order: updated });
}
