import { clearAllOrders } from "@/lib/db";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function DELETE() {
  try {
    await clearAllOrders();
    return Response.json({ success: true });
  } catch (error) {
    console.error('Failed to clear orders:', error);
    return new Response(JSON.stringify({ error: "清除失敗" }), { status: 500 });
  }
}
