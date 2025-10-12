"use client";

import { useState } from "react";
import Link from "next/link";
import { MENU } from "@/lib/menu";

export default function OrderPage({ params }: { params: { id: string } }) {
  const item = MENU.find((m) => m.id === params.id);
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!item) {
    return (
      <div className="mx-auto max-w-screen-sm px-4 py-12">
        <p className="mb-4">找不到此飲品。</p>
        <Link href="/" className="text-[color:var(--primary)] underline">
          返回菜單
        </Link>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="mx-auto max-w-screen-sm px-4 py-12 text-center">
        <div className="mx-auto mb-4 h-16 w-16 rounded-full bg-[color:var(--primary)]/10 grid place-items-center text-[color:var(--primary)] text-2xl">✓</div>
        <h1 className="text-xl font-semibold mb-2">訂單已送出</h1>
        <p className="text-sm text-neutral-600 mb-6">
          請期待你的咖啡。如果你都享受 Trinitas 嘅體驗，歡迎奉獻支持。
        </p>
        <Link
          href="/"
          className="inline-flex h-12 items-center justify-center rounded-[var(--radius-md)] px-5 bg-[color:var(--primary)] text-white"
        >
          返回菜單
        </Link>
      </div>
    );
  }

  const nameValid = name.trim().length >= 1 && name.trim().length <= 20;
  const noteValid = note.length <= 100;
  const canSubmit = nameValid && noteValid && !submitting;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    try {
      if (!item) throw new Error("無效的飲品");
      const res = await fetch("/api/orders", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ displayName: name.trim(), note, menuItemId: item.id }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "送單失敗");
      }
      setSubmitted(true);
    } catch (err) {
      const msg = err instanceof Error ? err.message : "送單失敗";
      setError(msg);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-screen-sm px-4 py-6">
      <Link href="/" className="text-[color:var(--primary)] underline text-sm">
        ← 返回
      </Link>

      <h1 className="text-2xl font-semibold mt-4">
        {item.nameZh}
        <span className="ml-2 text-neutral-500 text-base">{item.nameEn}</span>
      </h1>

      <div className="mt-4 aspect-square w-full rounded-[var(--radius-sm)] bg-muted/60" />
      <div className="mt-2 inline-flex items-center text-xs px-2 py-1 rounded-full bg-[color:var(--primary)]/10 text-[color:var(--primary)]">
        自由奉獻
      </div>

      <form onSubmit={onSubmit} className="mt-6 space-y-4">
        <div>
          <label className="block text-sm mb-1">稱呼（1–20 字，可含 emoji）</label>
          <input
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="例如：阿明 ☕️"
            className="w-full h-12 px-3 rounded-[var(--radius-md)] border border-border focus:outline-none focus:ring-[color:var(--primary)]/40 focus:ring-4"
          />
          <div className="mt-1 text-xs text-neutral-500 text-right">
            {name.trim().length}/20
          </div>
        </div>

        <div>
          <label className="block text-sm mb-1">備註（最多 100 字）</label>
          <textarea
            value={note}
            onChange={(e) => setNote(e.target.value)}
            rows={4}
            placeholder="例如：唔落糖；幫我畫個笑臉 😊"
            className="w-full px-3 py-2 rounded-[var(--radius-md)] border border-border focus:outline-none focus:ring-[color:var(--primary)]/40 focus:ring-4"
          />
          <div className="mt-1 text-xs text-neutral-500 text-right">{note.length}/100</div>
        </div>

        {error ? <p className="text-sm text-red-600">{error}</p> : null}

        <button
          type="submit"
          disabled={!canSubmit}
          className="w-full h-12 rounded-[var(--radius-md)] px-5 bg-[color:var(--primary)] text-white disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {submitting ? "送出中…" : "送出訂單"}
        </button>
      </form>
    </div>
  );
}
