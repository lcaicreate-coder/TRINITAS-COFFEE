export const dynamic = "force-dynamic";
export const revalidate = 0;
export const runtime = "edge";

export async function GET() {
  return new Response(JSON.stringify({ ok: true, ts: Date.now() }), {
    status: 200,
    headers: { "content-type": "application/json", "cache-control": "no-store" },
  });
}

