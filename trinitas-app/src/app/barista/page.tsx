"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type DetailedOrder = {
  id: string;
  displayName: string;
  status: "pending" | "in_progress" | "ready" | "done";
  createdAt: number;
  note?: string;
  itemsDetailed: { menuItemId: string; nameZh: string; nameEn: string; qty: number }[];
};

function useOrdersPolling(intervalMs = 2000) {
  const [orders, setOrders] = useState<DetailedOrder[]>([]);
  useEffect(() => {
    let active = true;
    async function tick() {
      try {
        const res = await fetch("/api/orders", { cache: "no-store" });
        const data = (await res.json()) as { orders: DetailedOrder[] };
        if (active) setOrders(data.orders);
      } catch {
        // ignore
      }
    }
    tick();
    const t = setInterval(tick, intervalMs);
    return () => {
      active = false;
      clearInterval(t);
    };
  }, [intervalMs]);
  return orders;
}

function formatSince(ts: number) {
  const diff = Math.max(0, Date.now() - ts);
  const m = Math.floor(diff / 60000);
  if (m <= 0) return "剛剛";
  return `${m} 分鐘前`;
}

export default function Barista() {
  const orders = useOrdersPolling(2000);
  const [muted, setMuted] = useState<boolean>(() => {
    if (typeof window === "undefined") return false;
    return localStorage.getItem("barista-muted") === "1";
  });
  const knownIds = useRef<Set<string>>(new Set());

  // Beep when new order arrives
  useEffect(() => {
    const current = new Set(orders.map((o) => o.id));
    let hasNew = false;
    for (const id of current) if (!knownIds.current.has(id)) { hasNew = true; break; }
    if (hasNew && !muted) {
      // WebAudio beep
      try {
        type AudioContextCtor = typeof AudioContext;
        const AC: AudioContextCtor | undefined =
          typeof window !== "undefined"
            ? window.AudioContext ?? (window as Window & { webkitAudioContext?: AudioContextCtor }).webkitAudioContext
            : undefined;
        if (!AC) return;
        const ctx = new AC();
        const o = ctx.createOscillator();
        const g = ctx.createGain();
        o.type = "sine";
        o.frequency.value = 880;
        o.connect(g);
        g.connect(ctx.destination);
        g.gain.setValueAtTime(0.0001, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.01);
        o.start();
        o.stop(ctx.currentTime + 0.25);
        o.onended = () => ctx.close();
      } catch {}
    }
    knownIds.current = current;
  }, [orders, muted]);

  useEffect(() => {
    if (typeof window !== "undefined") localStorage.setItem("barista-muted", muted ? "1" : "0");
  }, [muted]);

  const grouped = useMemo(() => {
    return {
      pending: orders.filter((o) => o.status === "pending"),
      in_progress: orders.filter((o) => o.status === "in_progress"),
      done: orders.filter((o) => o.status === "done"),
    };
  }, [orders]);

  async function updateStatus(id: string, status: "in_progress" | "done") {
    await fetch(`/api/orders/${id}`, {
      method: "PATCH",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ status }),
    });
  }

  function Column({ title, children }: { title: string; children: React.ReactNode }) {
    return (
      <div className="flex-1 min-w-0">
        <h2 className="text-lg font-semibold mb-3">{title}</h2>
        <div className="space-y-3">
          {children}
        </div>
      </div>
    );
  }

  function Card({ o }: { o: DetailedOrder }) {
    return (
      <div className="rounded-[var(--radius-md)] border border-border bg-white p-4">
        <div className="flex items-center justify-between">
          <div className="text-base font-semibold">{o.displayName}</div>
          <div className="text-xs text-neutral-500">{formatSince(o.createdAt)}</div>
        </div>
        <div className="mt-1 text-sm text-neutral-700">
          {o.itemsDetailed.map((it) => (
            <div key={it.menuItemId}>{it.nameZh} <span className="text-neutral-500 text-xs">{it.nameEn}</span></div>
          ))}
        </div>
        {o.note ? (
          <div className="mt-2 text-xs text-neutral-600 bg-muted/60 p-2 rounded-[var(--radius-sm)]">備註：{o.note}</div>
        ) : null}
        <div className="mt-3 flex gap-2">
          {o.status === "pending" && (
            <button onClick={() => updateStatus(o.id, "in_progress")} className="h-9 px-3 rounded-[var(--radius-sm)] bg-[color:var(--primary)] text-white">開始製作</button>
          )}
          {o.status === "in_progress" && (
            <button onClick={() => updateStatus(o.id, "done")} className="h-9 px-3 rounded-[var(--radius-sm)] bg-[color:var(--primary)] text-white">完成</button>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-border">
        <div className="mx-auto max-w-screen-xl px-4 h-16 flex items-center justify-between">
          <div className="text-xl font-semibold tracking-tight">咖啡師看板</div>
          <div className="flex items-center gap-3">
            <form action="/api/barista/logout" method="post">
              <button
                className="h-10 px-3 rounded-[var(--radius-sm)] border border-border"
              >
                登出
              </button>
            </form>
            <button
              onClick={() => setMuted((m) => !m)}
              className="h-10 px-3 rounded-[var(--radius-sm)] border border-border"
            >
              {muted ? "🔕 靜音" : "🔔 提示音"}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-screen-xl px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Column title="待處理">
            {grouped.pending.map((o) => (
              <Card key={o.id} o={o} />
            ))}
            {grouped.pending.length === 0 && <div className="text-sm text-neutral-500">暫無訂單</div>}
          </Column>
          <Column title="製作中">
            {grouped.in_progress.map((o) => (
              <Card key={o.id} o={o} />
            ))}
            {grouped.in_progress.length === 0 && <div className="text-sm text-neutral-500">暫無訂單</div>}
          </Column>
          <Column title="已完成">
            {grouped.done.map((o) => (
              <Card key={o.id} o={o} />
            ))}
            {grouped.done.length === 0 && <div className="text-sm text-neutral-500">暫無訂單</div>}
          </Column>
        </div>
      </main>
    </div>
  );
}
