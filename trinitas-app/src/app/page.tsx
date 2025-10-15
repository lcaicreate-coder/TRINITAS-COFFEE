"use client";

import Link from "next/link";
import { useState } from "react";
import { MENU } from "@/lib/menu";
import { Card } from "@/components/ui/card";
import Image from "next/image";

export default function Home() {
  const [selectedProduct, setSelectedProduct] = useState<string | null>(null);

  const products = MENU.map(item => ({
    id: item.id,
    name: item.nameEn,
    nameZh: item.nameZh,
    category: item.category,
    image: item.image || "",
    description: "",
    hasAddOns: item.addOns && item.addOns.length > 0
  }));

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 bg-background/80 backdrop-blur border-b border-border">
        <div className="mx-auto max-w-screen-lg px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 flex items-center justify-center">
              <img
                src="/images/brand/logo.jpg"
                alt="Trinitas Logo"
                className="w-10 h-10 object-contain"
              />
            </div>
            <div className="text-xl font-semibold tracking-tight text-primary">Trinitas 三一光隅</div>
          </div>
          <Link href="/barista" className="text-sm text-primary hover:text-primary/80 underline transition-colors">
            訂單頁(同工專用)
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-screen-lg px-4 py-8">
        <section className="mb-8">
          <h1 className="text-3xl font-semibold mb-3 text-foreground">Our Hospitality</h1>
        </section>

        <div className="grid grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
          {products.map((product) => (
            <Card
              key={product.id}
              className="overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-lg hover:-translate-y-1 border-border bg-card"
            >
              <Link href={`/${product.id}`}>
                <div className="aspect-square relative overflow-hidden bg-muted">
                  {product.image ? (
                    <Image
                      src={product.image}
                      alt={`${product.nameZh} - ${product.name}`}
                      fill
                      className="object-cover w-full h-full transition-transform duration-300 hover:scale-105"
                      sizes="(max-width: 640px) 50vw, 33vw"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                      <span className="text-4xl">☕</span>
                    </div>
                  )}
                </div>
                <div className="p-4">
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h3 className="text-foreground font-medium">{product.nameZh}</h3>
                      <p className="text-muted-foreground text-sm mt-1">{product.name}</p>
                    </div>
                    {product.hasAddOns && (
                      <div className="ml-2 px-2 py-1 bg-primary/10 text-primary text-xs rounded-full border border-primary/20">
                        可加柚蜜
                      </div>
                    )}
                  </div>
                </div>
              </Link>
            </Card>
          ))}
        </div>
      </main>

      <footer className="border-t border-border mt-12">
        <div className="mx-auto max-w-screen-lg px-4 h-16 flex items-center justify-center text-sm text-muted-foreground">
          Trinitas 三一光隅 — 與神共聚的美好時刻
        </div>
      </footer>
    </div>
  );
}