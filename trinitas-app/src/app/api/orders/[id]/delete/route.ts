import { deleteOrder } from "@/lib/db";

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    await deleteOrder(id);
    return new Response(JSON.stringify({ success: true }), { status: 200 });
  } catch (error) {
    console.error("Failed to delete order:", error);
    return new Response(
      JSON.stringify({ error: "刪除訂單失敗" }),
      { status: 500 }
    );
  }
}
