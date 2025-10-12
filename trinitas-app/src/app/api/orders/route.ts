import { NextRequest } from "next/server";
import { createOrder, serializeOrders } from "@/lib/db";
import { getMenuItem } from "@/lib/menu";

export async function GET() {
  return Response.json({ orders: serializeOrders() });
}

type PostBody = { displayName?: string; note?: string; menuItemId?: string } | null;

export async function POST(req: NextRequest) {
  const body: PostBody = await req.json().catch(() => null);
  const displayName: string = (body?.displayName ?? "").trim();
  const note: string = (body?.note ?? "").slice(0, 100);
  const menuItemId: string = String(body?.menuItemId ?? "");

  if (!displayName || displayName.length < 1 || displayName.length > 20) {
    return new Response(JSON.stringify({ error: "稱呼需為 1–20 字" }), { status: 400 });
  }
  if (!menuItemId || !getMenuItem(menuItemId)) {
    return new Response(JSON.stringify({ error: "無效的飲品" }), { status: 400 });
  }

  const order = createOrder({ displayName, note, menuItemId });
  return new Response(JSON.stringify({ order }), { status: 201, headers: { "content-type": "application/json" } });
}
