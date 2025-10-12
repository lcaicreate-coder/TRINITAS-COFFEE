import { NextRequest } from "next/server";
import { createOrder, serializeOrders } from "@/lib/db";
import { getMenuItem } from "@/lib/menu";
import { kv } from "@vercel/kv";

export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "edge";

export async function GET() {
  const orders = await serializeOrders();
  return Response.json({ orders });
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

  // Basic rate limit by IP: 5 requests / 30s window
  try {
    const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
    const key = `ratelimit:orders:${ip}`;
    const now = Date.now();
    const windowMs = 30_000;
    const limit = 5;
    // increment counter with TTL
    const tx = kv.multi();
    tx.incr(key);
    tx.pttl(key);
    const [count, ttl] = (await tx.exec()) as [number, number];
    if (ttl < 0) {
      await kv.pexpire(key, windowMs);
    }
    if (typeof count === "number" && count > limit) {
      const retryAfter = Math.ceil(((await kv.pttl(key)) || windowMs) / 1000);
      return new Response(JSON.stringify({ error: "請稍後再試" }), { status: 429, headers: { "retry-after": String(retryAfter) } });
    }
  } catch {}

  const order = await createOrder({ displayName, note, menuItemId });
  return new Response(JSON.stringify({ order }), { status: 201, headers: { "content-type": "application/json" } });
}
