"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { LogOut, Bell, BellOff, Clock, User, StickyNote } from "lucide-react";
import Link from "next/link";
import { MENU } from "@/lib/menu";

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
  const [muted, setMuted] = useState<boolean>(false);
  const [mounted, setMounted] = useState(false);
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

  // Initialize muted state from localStorage after mount
  useEffect(() => {
    setMounted(true);
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("barista-muted");
      setMuted(saved === "1");
    }
  }, []);

  // Save muted state to localStorage
  useEffect(() => {
    if (mounted && typeof window !== "undefined") {
      localStorage.setItem("barista-muted", muted ? "1" : "0");
    }
  }, [muted, mounted]);

  const grouped = useMemo(() => {
    return {
      pending: orders.filter((o) => o.status === "pending"),
      in_progress: orders.filter((o) => o.status === "in_progress"),
      done: orders.filter((o) => o.status === "done"),
    };
  }, [orders]);

  async function updateStatus(id: string, status: "in_progress" | "done") {
    try {
      console.log("Updating order:", { id, status });
      console.log("Current orders in UI:", orders.map(o => ({ id: o.id, status: o.status })));
      
      const res = await fetch(`/api/orders/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) {
        const errorText = await res.text();
        console.error("Failed to update order status:", errorText);
        try {
          const errorData = JSON.parse(errorText);
          console.error("Error details:", errorData);
        } catch {}
      } else {
        console.log("Update successful");
      }
    } catch (error) {
      console.error("Error updating order status:", error);
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-amber-100 text-amber-800 border-amber-200';
      case 'in_progress':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'done':
        return 'bg-green-100 text-green-800 border-green-200';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return '待處理';
      case 'in_progress':
        return '製作中';
      case 'done':
        return '已完成';
      default:
        return status;
    }
  };

  function Column({ title, children, count }: { title: string; children: React.ReactNode; count: number }) {
    return (
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-foreground">{title}</h2>
          <Badge variant="outline" className={getStatusColor(title === '待處理' ? 'pending' : title === '製作中' ? 'in_progress' : 'done')}>
            {count}
          </Badge>
        </div>
        <div className="space-y-4">
          {children}
          {count === 0 && (
            <Card className="p-8 text-center border-dashed border-border bg-muted/30">
              <p className="text-muted-foreground">暫無{title}訂單</p>
            </Card>
          )}
        </div>
      </div>
    );
  }

  function OrderCard({ o }: { o: DetailedOrder }) {
    return (
      <Card className="p-4 border-border bg-card">
        <div className="flex items-start justify-between mb-3">
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-2">
              <Badge variant="outline" className={getStatusColor(o.status)}>
                {getStatusText(o.status)}
              </Badge>
              <span className="text-muted-foreground text-sm">#{o.id.slice(-6)}</span>
            </div>
            <h3 className="font-medium text-foreground mb-1">
              {o.itemsDetailed.map((it) => it.nameZh).join(', ')}
            </h3>
            <p className="text-muted-foreground text-sm">
              {o.itemsDetailed.map((it) => it.nameEn).join(', ')}
            </p>
          </div>
        </div>

        <div className="space-y-2 mb-4">
          <div className="flex items-center gap-2 text-foreground/80">
            <User className="w-4 h-4 text-muted-foreground" />
            <span>{o.displayName}</span>
          </div>
          {o.note && (
            <div className="flex items-start gap-2 text-foreground/80">
              <StickyNote className="w-4 h-4 text-muted-foreground mt-0.5" />
              <span className="flex-1 text-sm">{o.note}</span>
            </div>
          )}
          {o.items[0].addOns && o.items[0].addOns.length > 0 && (
            <div className="flex items-start gap-2 text-foreground/80">
              <span className="text-muted-foreground text-sm">加料:</span>
              <span className="text-sm">
                {o.items[0].addOns.map(addOnId => {
                  const menuItem = MENU.find(m => m.id === o.items[0].menuItemId);
                  const addOn = menuItem?.addOns?.find(a => a.id === addOnId);
                  return addOn?.nameZh;
                }).join(', ')}
              </span>
            </div>
          )}
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="w-4 h-4" />
            <span className="text-sm">{formatSince(o.createdAt)}</span>
          </div>
        </div>

        <div className="flex gap-2">
          {o.status === "pending" && (
            <Button
              onClick={() => {
                console.log("Button clicked for order:", o.id);
                updateStatus(o.id, "in_progress");
              }}
              className="flex-1"
              size="sm"
            >
              開始製作
            </Button>
          )}
          {o.status === "in_progress" && (
            <Button
              onClick={() => {
                console.log("Button clicked for order:", o.id);
                updateStatus(o.id, "done");
              }}
              className="flex-1"
              size="sm"
            >
              完成訂單
            </Button>
          )}
          {o.status === "done" && (
            <Button
              variant="outline"
              disabled
              className="flex-1"
              size="sm"
            >
              已完成
            </Button>
          )}
        </div>
      </Card>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-background/80 backdrop-blur border-b border-border">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 flex items-center justify-center">
                <img
                  src="/images/brand/logo.jpg"
                  alt="Trinitas Logo"
                  className="w-10 h-10 object-contain"
                />
              </div>
              <div>
                <h1 className="text-xl font-semibold text-foreground">訂單管理看板</h1>
                <p className="text-muted-foreground text-sm">Trinitas 三一光隅</p>
              </div>
            </div>

            <div className="flex items-center gap-4">
              <Button
                variant="destructive"
                size="sm"
                onClick={async () => {
                  if (confirm('確定要清除所有訂單嗎？此操作無法復原。')) {
                    try {
                      const response = await fetch('/api/orders/clear', { method: 'DELETE' });
                      if (response.ok) {
                        window.location.reload();
                      }
                    } catch (error) {
                      console.error('清除訂單失敗:', error);
                    }
                  }
                }}
              >
                清除所有訂單
              </Button>

              <div className="flex items-center gap-2">
                {!muted ? (
                  <Bell className="w-4 h-4 text-primary" />
                ) : (
                  <BellOff className="w-4 h-4 text-muted-foreground" />
                )}
                <Label htmlFor="sound-toggle" className="cursor-pointer text-sm">
                  音效提醒
                </Label>
                <Switch
                  id="sound-toggle"
                  checked={!muted}
                  onCheckedChange={(checked) => setMuted(!checked)}
                />
              </div>

              <Button variant="outline" asChild>
                <Link href="/">
                  <LogOut className="mr-2 h-4 w-4" />
                  登出
                </Link>
              </Button>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Column title="待處理" count={grouped.pending.length}>
            {grouped.pending.map((o, index) => (
              <OrderCard key={`pending-${o.id}-${index}`} o={o} />
            ))}
          </Column>
          <Column title="製作中" count={grouped.in_progress.length}>
            {grouped.in_progress.map((o, index) => (
              <OrderCard key={`in_progress-${o.id}-${index}`} o={o} />
            ))}
          </Column>
          <Column title="已完成" count={grouped.done.length}>
            {grouped.done.map((o, index) => (
              <OrderCard key={`done-${o.id}-${index}`} o={o} />
            ))}
          </Column>
        </div>
      </div>
    </div>
  );
}
