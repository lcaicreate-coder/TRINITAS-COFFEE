import { cookies } from "next/headers";

export const runtime = "edge";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(req: Request) {
  const { code } = (await req.json().catch(() => ({}))) as { code?: string };
  const passcode = process.env.BARISTA_PASSCODE || "";
  if (!passcode) {
    return new Response(JSON.stringify({ error: "未設定密碼" }), { status: 400 });
  }
  if (!code || code !== passcode) {
    return new Response(JSON.stringify({ error: "密碼不正確" }), { status: 401 });
  }
  const cookieStore = await cookies();
  cookieStore.set("barista_auth", "1", { path: "/", httpOnly: true, sameSite: "lax", secure: true, maxAge: 60 * 60 * 24 * 7 });
  return new Response(JSON.stringify({ ok: true }), { status: 200, headers: { "content-type": "application/json" } });
}
