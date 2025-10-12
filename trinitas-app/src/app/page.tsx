import Link from "next/link";

export default function Home() {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="sticky top-0 z-10 bg-white/80 backdrop-blur border-b border-border">
        <div className="mx-auto max-w-screen-md px-4 h-16 flex items-center justify-between">
          <div className="text-xl font-semibold tracking-tight">Trinitas 三一光隅</div>
          <Link href="/barista" className="text-sm text-[color:var(--primary)] underline">
            訂單頁(同工專用)
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-screen-md px-4 py-6">
        <section className="mb-6">
          <h1 className="text-2xl font-semibold mb-2">菜單 Menu</h1>
          <p className="text-sm text-neutral-600">價錢：自由奉獻</p>
        </section>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {[
            { id: "americano", nameZh: "美式咖啡", nameEn: "Americano" },
            { id: "espresso", nameZh: "濃縮咖啡", nameEn: "Espresso" },
            { id: "latte", nameZh: "拿鐵咖啡", nameEn: "Latte" },
            { id: "cappuccino", nameZh: "卡布奇諾", nameEn: "Cappuccino" },
            { id: "dirty", nameZh: "髒髒咖啡", nameEn: "Dirty" },
            { id: "espresso_tonic", nameZh: "濃縮通寧", nameEn: "Espresso Tonic" },
          ].map((item) => (
            <Link
              key={item.id}
              href={`/${item.id}`}
              className="group rounded-[var(--radius-md)] border border-border p-4 bg-white hover:shadow-sm transition"
            >
              <div className="aspect-square w-full rounded-[var(--radius-sm)] bg-muted/60" />
              <div className="mt-3">
                <div className="text-[15px]">{item.nameZh}</div>
                <div className="text-xs text-neutral-500">{item.nameEn}</div>
                <div className="mt-2 inline-flex items-center text-xs px-2 py-1 rounded-full bg-[color:var(--primary)]/10 text-[color:var(--primary)]">自由奉獻</div>
              </div>
            </Link>
          ))}
        </div>
      </main>

      <footer className="border-t border-border mt-8">
        <div className="mx-auto max-w-screen-md px-4 h-16 flex items-center justify-center text-sm text-neutral-600">
          Trinitas 三一光隅 — 享受一杯好咖啡
        </div>
      </footer>
    </div>
  );
}
