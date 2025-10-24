import { NextRequest } from "next/server";
import { createOrder, serializeOrders } from "@/lib/db";
import { getMenuItem } from "@/lib/menu";
import { kv } from "@vercel/kv";

export const dynamic = "force-dynamic";
export const revalidate = 0;
// Remove edge runtime to support file system operations
// export const runtime = "edge";

export async function GET() {
  const orders = await serializeOrders();
  return Response.json({ 
    orders,
    debug: {
      count: orders.length,
      ids: orders.map(o => o.id)
    }
  });
}

type PostBody = { displayName?: string; note?: string; menuItemId?: string; addOns?: string[] } | null;

export async function POST(req: NextRequest) {
  const body: PostBody = await req.json().catch(() => null);
  const displayName: string = (body?.displayName ?? "").trim();
  const note: string = (body?.note ?? "").slice(0, 100);
  const menuItemId: string = String(body?.menuItemId ?? "");
  const addOns: string[] = Array.isArray(body?.addOns) ? body.addOns : [];

  if (!displayName || displayName.length < 1 || displayName.length > 20) {
    return new Response(JSON.stringify({ error: "稱呼需為 1–20 字" }), { status: 400 });
  }
  if (!menuItemId || !getMenuItem(menuItemId)) {
    return new Response(JSON.stringify({ error: "無效的飲品" }), { status: 400 });
  }

  // Basic rate limit by IP: 5 requests / 30s window (only if KV is available)
  try {
    if (process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN) {
      const ip = req.headers.get("x-forwarded-for")?.split(",")[0]?.trim() || "unknown";
      const key = `ratelimit:orders:${ip}`;
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
    }
  } catch (error) {
    console.log("Rate limiting disabled due to KV error:", error);
  }

  try {
    const order = await createOrder({ displayName, note, menuItemId, addOns });
    return new Response(JSON.stringify({ order }), { status: 201, headers: { "content-type": "application/json" } });
  } catch (error) {
    console.error("Error creating order:", error);
    return new Response(JSON.stringify({ 
      error: "創建訂單失敗", 
      details: error instanceof Error ? error.message : "Unknown error" 
    }), { status: 500, headers: { "content-type": "application/json" } });
  }
}
