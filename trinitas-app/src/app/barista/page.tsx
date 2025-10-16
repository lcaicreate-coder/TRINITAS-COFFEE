"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { LogOut, Bell, BellOff, User, StickyNote, Trash2 } from "lucide-react";
import Link from "next/link";
import { MENU } from "@/lib/menu";

type Order = {
  id: string;
  displayName: string;
  status: "pending" | "in_progress" | "ready" | "done";
  createdAt: number;
  note?: string;
  items: { menuItemId: string; qty: number; addOns?: string[] }[];
};

function formatTime(createdAt: number) {
  const diff = Date.now() - createdAt;
  const m = Math.floor(diff / 60000);
  if (m <= 0) return "剛剛";
  return `${m} 分鐘前`;
}

export default function Barista() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean | null>(null);
  const [orders, setOrders] = useState<Order[]>([]);
  const [muted, setMuted] = useState<boolean>(false);

  // Simple authentication check
  useEffect(() => {
    console.log("🔒 Checking authentication...");
    
    // Check if we have the auth cookie
    const hasAuth = document.cookie.includes('barista_auth=1');
    console.log("🍪 Has auth cookie:", hasAuth);
    console.log("🍪 All cookies:", document.cookie);
    
    if (hasAuth) {
      console.log("✅ Authenticated");
      setIsAuthenticated(true);
    } else {
      console.log("❌ Not authenticated, redirecting...");
      setIsAuthenticated(false);
      // Immediate redirect
      window.location.replace('/barista/login');
    }
  }, []);

  // Fetch orders when authenticated
  useEffect(() => {
    if (!isAuthenticated) return;

    const fetchOrders = async () => {
      try {
        const res = await fetch("/api/orders", { cache: "no-store" });
        const data = await res.json();
        setOrders(data.orders || []);
      } catch (error) {
        console.error("Failed to fetch orders:", error);
      }
    };

    fetchOrders();
    const interval = setInterval(fetchOrders, 2000);
    return () => clearInterval(interval);
  }, [isAuthenticated]);

  // Show loading while checking authentication
  if (isAuthenticated === null) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">檢查認證中...</p>
        </div>
      </div>
    );
  }

  // Show redirecting if not authenticated
  if (isAuthenticated === false) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">重定向到登入頁面...</p>
        </div>
      </div>
    );
  }

  // Group orders by status
  const grouped = {
    pending: orders.filter(o => o.status === "pending"),
    in_progress: orders.filter(o => o.status === "in_progress"),
    done: orders.filter(o => o.status === "done")
  };

  const updateStatus = async (orderId: string, status: string) => {
    try {
      const res = await fetch(`/api/orders/${orderId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setOrders(prev => prev.map(o => 
          o.id === orderId ? { ...o, status: status as Order['status'] } : o
        ));
      }
    } catch (error) {
      console.error("Failed to update order:", error);
    }
  };

  const deleteOrder = async (orderId: string) => {
    if (!confirm("確定要刪除這個訂單嗎？")) {
      return;
    }
    
    try {
      const res = await fetch(`/api/orders/${orderId}/delete`, {
        method: "DELETE"
      });
      if (res.ok) {
        setOrders(prev => prev.filter(o => o.id !== orderId));
      } else {
        const errorText = await res.text();
        console.error("Failed to delete order:", errorText);
        alert("刪除訂單失敗");
      }
    } catch (error) {
      console.error("Error deleting order:", error);
      alert("刪除訂單失敗");
    }
  };

  const clearAllOrders = async () => {
    if (confirm('確定要清除所有訂單嗎？此操作無法復原。')) {
      try {
        const response = await fetch('/api/orders/clear', { method: 'DELETE' });
        if (response.ok) {
          setOrders([]);
        }
      } catch (error) {
        console.error('清除訂單失敗:', error);
      }
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="sticky top-0 z-10 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 border-b">
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
                <h1 className="text-xl font-semibold">訂單管理看板</h1>
                <p className="text-sm text-muted-foreground">Trinitas 三一光隅</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <Button
                variant="destructive"
                size="sm"
                onClick={clearAllOrders}
              >
                清除所有訂單
              </Button>
              
              <div className="flex items-center space-x-2">
                <Switch
                  id="sound-toggle"
                  checked={!muted}
                  onCheckedChange={(checked) => setMuted(!checked)}
                />
                <Label htmlFor="sound-toggle" className="cursor-pointer text-sm">
                  {muted ? (
                    <BellOff className="w-4 h-4 text-muted-foreground" />
                  ) : (
                    <Bell className="w-4 h-4 text-primary" />
                  )}
                  音效提醒
                </Label>
              </div>
              
              <Link href="/">
                <Button variant="outline" size="sm">
                  <LogOut className="w-4 h-4 mr-2" />
                  登出
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      <div className="container mx-auto px-4 py-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* 待處理 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">待處理</h2>
              <Badge variant="secondary">{grouped.pending.length}</Badge>
            </div>
            <div className="space-y-3">
              {grouped.pending.length === 0 ? (
                <p className="text-muted-foreground text-sm">暫無待處理訂單</p>
              ) : (
                grouped.pending.map((order) => (
                  <Card key={order.id} className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">
                            {MENU.find(m => m.id === order.items[0].menuItemId)?.nameZh || '未知商品'}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {MENU.find(m => m.id === order.items[0].menuItemId)?.nameEn || ''}
                          </p>
                        </div>
                        <Badge variant="outline">{formatTime(order.createdAt)}</Badge>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span>{order.displayName}</span>
                        </div>
                        
                        {order.note && (
                          <div className="flex items-start gap-2 text-sm">
                            <StickyNote className="w-4 h-4 text-muted-foreground mt-0.5" />
                            <span className="flex-1">{order.note}</span>
                          </div>
                        )}

                        {order.items[0].addOns && order.items[0].addOns.length > 0 && (
                          <div className="flex items-start gap-2 text-sm">
                            <span className="text-muted-foreground">加料:</span>
                            <span>
                              {order.items[0].addOns.map(addOnId => {
                                const menuItem = MENU.find(m => m.id === order.items[0].menuItemId);
                                const addOn = menuItem?.addOns?.find(a => a.id === addOnId);
                                return addOn?.nameZh;
                              }).join(', ')}
                            </span>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={() => updateStatus(order.id, "in_progress")}
                          className="flex-1"
                          size="sm"
                        >
                          開始製作
                        </Button>
                        <Button
                          onClick={() => deleteOrder(order.id)}
                          variant="outline"
                          size="sm"
                          className="px-3"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* 製作中 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">製作中</h2>
              <Badge variant="secondary">{grouped.in_progress.length}</Badge>
            </div>
            <div className="space-y-3">
              {grouped.in_progress.length === 0 ? (
                <p className="text-muted-foreground text-sm">暫無製作中訂單</p>
              ) : (
                grouped.in_progress.map((order) => (
                  <Card key={order.id} className="p-4">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">
                            {MENU.find(m => m.id === order.items[0].menuItemId)?.nameZh || '未知商品'}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {MENU.find(m => m.id === order.items[0].menuItemId)?.nameEn || ''}
                          </p>
                        </div>
                        <Badge variant="outline">{formatTime(order.createdAt)}</Badge>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span>{order.displayName}</span>
                        </div>
                        
                        {order.note && (
                          <div className="flex items-start gap-2 text-sm">
                            <StickyNote className="w-4 h-4 text-muted-foreground mt-0.5" />
                            <span className="flex-1">{order.note}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex gap-2">
                        <Button
                          onClick={() => updateStatus(order.id, "done")}
                          className="flex-1"
                          size="sm"
                          variant="outline"
                        >
                          完成製作
                        </Button>
                        <Button
                          onClick={() => deleteOrder(order.id)}
                          variant="outline"
                          size="sm"
                          className="px-3"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>

          {/* 已完成 */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold">已完成</h2>
              <Badge variant="secondary">{grouped.done.length}</Badge>
            </div>
            <div className="space-y-3">
              {grouped.done.length === 0 ? (
                <p className="text-muted-foreground text-sm">暫無已完成訂單</p>
              ) : (
                grouped.done.map((order) => (
                  <Card key={order.id} className="p-4 bg-muted/50">
                    <div className="space-y-3">
                      <div className="flex items-center justify-between">
                        <div>
                          <h3 className="font-medium">
                            {MENU.find(m => m.id === order.items[0].menuItemId)?.nameZh || '未知商品'}
                          </h3>
                          <p className="text-sm text-muted-foreground">
                            {MENU.find(m => m.id === order.items[0].menuItemId)?.nameEn || ''}
                          </p>
                        </div>
                        <Badge variant="outline">{formatTime(order.createdAt)}</Badge>
                      </div>

                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <User className="w-4 h-4 text-muted-foreground" />
                          <span>{order.displayName}</span>
                        </div>
                        
                        {order.note && (
                          <div className="flex items-start gap-2 text-sm">
                            <StickyNote className="w-4 h-4 text-muted-foreground mt-0.5" />
                            <span className="flex-1">{order.note}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center justify-between">
                        <Badge variant="default" className="bg-green-500">
                          ✓ 已完成
                        </Badge>
                        <Button
                          onClick={() => deleteOrder(order.id)}
                          variant="outline"
                          size="sm"
                          className="px-3"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </Card>
                ))
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}