import { cookies } from "next/headers";

// Remove edge runtime to support cookies properly
// export const runtime = "edge";
export const dynamic = "force-dynamic";
export const revalidate = 0;

export async function POST(req: Request) {
  console.log("🔐 Login API called");
  
  const { code } = (await req.json().catch(() => ({}))) as { code?: string };
  const passcode = process.env.BARISTA_PASSCODE || "4778337";
  
  console.log("🔐 Received code:", code);
  console.log("🔐 Expected passcode:", passcode);
  
  if (!passcode) {
    console.log("❌ No passcode configured");
    return new Response(JSON.stringify({ error: "未設定密碼" }), { status: 400 });
  }
  
  if (!code || code !== passcode) {
    console.log("❌ Invalid code provided");
    return new Response(JSON.stringify({ error: "密碼不正確" }), { status: 401 });
  }
  
  console.log("✅ Code validated, setting cookie...");
  
  const cookieStore = await cookies();
  cookieStore.set("barista_auth", "1", { 
    path: "/", 
    httpOnly: true, 
    sameSite: "lax", 
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 7 
  });
  
  console.log("✅ Cookie set successfully");
  
  return new Response(JSON.stringify({ ok: true }), { 
    status: 200, 
    headers: { 
      "content-type": "application/json",
      "Set-Cookie": "barista_auth=1; Path=/; HttpOnly; SameSite=Lax; Max-Age=604800"
    } 
  });
}

