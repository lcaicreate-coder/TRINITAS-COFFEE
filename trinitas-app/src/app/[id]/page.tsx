"use client";

import { useState, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { MENU } from "@/lib/menu";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card } from "@/components/ui/card";
import { ArrowLeft } from "lucide-react";

export default function OrderPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const item = MENU.find((m) => m.id === id);
  const [name, setName] = useState("");
  const [note, setNote] = useState("");
  const [selectedAddOns, setSelectedAddOns] = useState<string[]>([]);
  const [submitted, setSubmitted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [orderNumber, setOrderNumber] = useState<number | null>(null);

  if (!item) {
    return (
      <div className="mx-auto max-w-screen-sm px-4 py-12">
        <p className="mb-4">找不到此飲品。</p>
        <Link href="/" className="text-[color:var(--primary)] underline">
          返回主頁
        </Link>
      </div>
    );
  }

  if (submitted) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center px-4">
        <Card className="w-full max-w-md p-8 text-center border-border bg-card">
          <div className="mx-auto mb-6 h-20 w-20 flex items-center justify-center">
            <img
              src="/images/brand/logo.jpg"
              alt="Trinitas Logo"
              className="h-16 w-16 object-contain"
            />
          </div>
          <h1 className="text-2xl font-semibold mb-3 text-foreground">訂單已送出</h1>
          {orderNumber && (
            <div className="mb-4 p-4 bg-primary/10 border border-primary/20 rounded-lg">
              <p className="text-primary font-semibold text-lg">
                No. {orderNumber}
              </p>
            </div>
          )}
          <p className="text-muted-foreground mb-8 leading-relaxed">
            請期待你的咖啡。如果你都享受 Trinitas 嘅體驗，歡迎奉獻支持。
          </p>
          <Button asChild size="lg" className="w-full">
            <Link href="/">
              返回主頁
            </Link>
          </Button>
        </Card>
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
        body: JSON.stringify({ displayName: name.trim(), note, menuItemId: item.id, addOns: selectedAddOns }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "送單失敗");
      }
      
      // Get order number from response
      const data = await res.json();
      if (data.order && data.order.orderNumber) {
        setOrderNumber(data.order.orderNumber);
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
    <div className="min-h-screen bg-background">
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center justify-between mb-6">
          <Button
            variant="ghost"
            asChild
            className="-ml-4"
          >
            <Link href="/">
              <ArrowLeft className="mr-2 h-4 w-4" />
              返回主頁
            </Link>
          </Button>
          
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 flex items-center justify-center">
              <img
                src="/images/brand/logo.jpg"
                alt="Trinitas Logo"
                className="w-8 h-8 object-contain"
              />
            </div>
            <span className="text-primary font-medium">Trinitas 三一光隅</span>
          </div>
        </div>

        <Card className="overflow-hidden border-border bg-card">
          <div className="aspect-square relative overflow-hidden bg-muted">
            {item.image ? (
              <Image
                src={item.image}
                alt={`${item.nameZh} - ${item.nameEn}`}
                fill
                className="object-cover w-full h-full"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                <span className="text-6xl">☕</span>
              </div>
            )}
          </div>

          <div className="p-6 md:p-8">
            <div className="mb-8">
              <h1 className="text-3xl font-semibold mb-2 text-foreground">{item.nameZh}</h1>
              <p className="text-muted-foreground text-lg">{item.nameEn}</p>
            </div>

            <form onSubmit={(e) => e.preventDefault()} className="space-y-6">
              <div className="space-y-2">
                <Label htmlFor="name">您的稱呼 *</Label>
                <Input
                  id="name"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      // 收回鍵盤 - 移除焦點
                      (e.target as HTMLInputElement).blur();
                    }
                  }}
                  placeholder="請輸入您的稱呼"
                  required
                  className="bg-input-background"
                />
                <div className="text-xs text-muted-foreground text-right">
                  {name.trim().length}/20
                </div>
              </div>

              {item.addOns && item.addOns.length > 0 && (
                <div className="space-y-3">
                  <Label>加料選項</Label>
                  <div className="space-y-2">
                    {item.addOns.map((addOn) => (
                      <label key={addOn.id} className="flex items-center space-x-3 cursor-pointer">
                        <input
                          type="checkbox"
                          checked={selectedAddOns.includes(addOn.id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedAddOns([...selectedAddOns, addOn.id]);
                            } else {
                              setSelectedAddOns(selectedAddOns.filter(id => id !== addOn.id));
                            }
                          }}
                          className="w-4 h-4 text-primary border-gray-300 rounded focus:ring-primary"
                        />
                        <span className="text-sm text-foreground">
                          {addOn.nameZh} {addOn.nameEn && `(${addOn.nameEn})`}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-2">
                <Label htmlFor="note">訂單備註</Label>
                <Textarea
                  id="note"
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      // 收回鍵盤 - 移除焦點
                      (e.target as HTMLTextAreaElement).blur();
                    }
                  }}
                  placeholder="請輸入訂單備註（選填）"
                  rows={4}
                  className="bg-input-background resize-none"
                />
                <div className="text-xs text-muted-foreground text-right">{note.length}/100</div>
              </div>

              {error && (
                <div className="p-3 bg-destructive/10 border border-destructive/20 rounded-lg">
                  <p className="text-destructive text-sm">{error}</p>
                </div>
              )}

              <Button
                type="button"
                onClick={onSubmit}
                className="w-full"
                size="lg"
                disabled={!canSubmit}
              >
                {submitting ? "送出中…" : "送出訂單"}
              </Button>
            </form>
          </div>
        </Card>
      </div>
    </div>
  );
}
