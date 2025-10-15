import { cookies } from "next/headers";

// Remove edge runtime to support cookies properly
// export const runtime = "edge";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST() {
  const cookieStore = await cookies();
  cookieStore.delete("barista_auth");
  return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "content-type": "application/json" } });
}

