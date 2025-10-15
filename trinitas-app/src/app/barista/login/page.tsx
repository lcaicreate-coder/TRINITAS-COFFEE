"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";
import Link from "next/link";

export default function BaristaLogin() {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      console.log("🔐 Attempting login with code:", code);
      
      const res = await fetch("/api/barista/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code }),
      });

      console.log("🔐 Login response status:", res.status);

      if (res.ok) {
        console.log("✅ Login successful, checking cookies...");
        
        // Wait a moment for cookie to be set
        await new Promise(resolve => setTimeout(resolve, 500));
        
        // Check if cookie was set
        const allCookies = document.cookie;
        console.log("🍪 All cookies after login:", allCookies);
        
        const authCookie = document.cookie
          .split('; ')
          .find(row => row.startsWith('barista_auth='))
          ?.split('=')[1];
        
        console.log("🔍 Auth cookie after login:", authCookie);
        
        if (authCookie === '1') {
          console.log("✅ Cookie confirmed, redirecting to barista page...");
          window.location.href = "/barista";
        } else {
          console.log("❌ Cookie not found, retrying redirect...");
          // Force redirect anyway
          window.location.href = "/barista";
        }
      } else {
        const data = await res.json();
        console.log("❌ Login failed:", data);
        setError(data.error || "登入失敗");
      }
    } catch (error) {
      console.error("❌ Login error:", error);
      setError("網路錯誤，請重試");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-md p-6">
        <div className="text-center mb-6">
          <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <img
              src="/images/brand/logo.jpg"
              alt="Trinitas Logo"
              className="w-16 h-16 object-contain"
            />
          </div>
          <h1 className="text-2xl font-semibold">同工登入</h1>
          <p className="text-muted-foreground text-sm mt-2">
            請輸入密碼以進入訂單管理系統
          </p>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="code">密碼</Label>
            <Input
              id="code"
              type="password"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="請輸入密碼"
              required
              disabled={loading}
            />
          </div>

          {error && (
            <div className="text-sm text-red-500 bg-red-50 p-3 rounded-md">
              {error}
            </div>
          )}

          <Button
            type="submit"
            className="w-full"
            disabled={!code || loading}
          >
            {loading ? "登入中…" : "登入"}
          </Button>
        </form>

        <div className="mt-6 text-center">
          <Button variant="link" asChild>
            <Link href="/">返回主頁</Link>
          </Button>
        </div>
      </Card>
    </div>
  );
}