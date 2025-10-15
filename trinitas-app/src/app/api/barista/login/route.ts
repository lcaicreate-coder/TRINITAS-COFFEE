import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { code } = await req.json();
    const passcode = "4778337"; // Hardcoded for simplicity
    
    console.log("🔐 Login attempt with code:", code);
    
    if (code !== passcode) {
      console.log("❌ Invalid code");
      return NextResponse.json({ error: "密碼不正確" }, { status: 401 });
    }
    
    console.log("✅ Code valid, setting cookie");
    
    // Create response with cookie
    const response = NextResponse.json({ success: true });
    
    // Set cookie with simple settings
    response.cookies.set("barista_auth", "1", {
      path: "/",
      maxAge: 60 * 60 * 24 * 7, // 7 days
      httpOnly: false, // Allow client-side access
      secure: false, // Allow HTTP in development
      sameSite: "lax"
    });
    
    console.log("✅ Cookie set successfully");
    
    return response;
  } catch (error) {
    console.error("❌ Login API error:", error);
    return NextResponse.json({ error: "伺服器錯誤" }, { status: 500 });
  }
}