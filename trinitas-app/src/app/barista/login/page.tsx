"use client";

import { useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";

export default function BaristaLogin() {
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
    <div className="mx-auto max-w-screen-sm px-4 py-12">
      <h1 className="text-2xl font-semibold mb-4">咖啡師登入</h1>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label className="block text-sm mb-1">密碼</label>
          <input
            value={code}
            onChange={(e) => setCode(e.target.value)}
            type="password"
            className="w-full h-12 px-3 rounded-[var(--radius-md)] border border-border"
            placeholder="輸入咖啡師密碼"
          />
        </div>
        {error ? <p className="text-sm text-red-600">{error}</p> : null}
        <button
          type="submit"
          disabled={!code || loading}
          className="h-12 px-5 rounded-[var(--radius-md)] bg-[color:var(--primary)] text-white disabled:opacity-50"
        >
          {loading ? "登入中…" : "登入"}
        </button>
      </form>
    </div>
  );
}
