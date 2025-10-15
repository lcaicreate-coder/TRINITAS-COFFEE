"use client";

import { useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card } from "@/components/ui/card";

function BaristaLoginForm() {
  const [code, setCode] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const params = useSearchParams();
  const router = useRouter();

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/barista/login", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ code }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "登入失敗");
      }
      const next = params.get("next") || "/barista";
      router.replace(next);
    } catch (err) {
      setError(err instanceof Error ? err.message : "登入失敗");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-4">
      <Card className="w-full max-w-md p-8 border-border bg-card">
        <div className="text-center mb-8">
          <div className="w-16 h-16 mx-auto mb-4 flex items-center justify-center">
            <img
              src="/images/brand/logo.jpg"
              alt="Trinitas Logo"
              className="w-16 h-16 object-contain"
            />
          </div>
          <h1 className="text-2xl font-semibold text-foreground mb-2">同工登入</h1>
          <p className="text-muted-foreground">請輸入密碼以存取訂單管理系統</p>
        </div>
        
        <form onSubmit={onSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="password">密碼</Label>
            <Input
              id="password"
              type="password"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="輸入同工密碼"
              className="bg-input-background"
              required
            />
          </div>
          
          {error && (
            <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
              <p className="text-destructive text-sm">{error}</p>
            </div>
          )}
          
          <Button
            type="submit"
            className="w-full"
            size="lg"
            disabled={!code || loading}
          >
            {loading ? "登入中…" : "登入"}
          </Button>
        </form>
      </Card>
    </div>
  );
}

export default function BaristaLogin() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <BaristaLoginForm />
    </Suspense>
  );
}

