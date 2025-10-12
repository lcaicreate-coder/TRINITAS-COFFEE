import type { Order, OrderStatus } from "@/lib/types";
import { MENU } from "@/lib/menu";

const orders: Order[] = [];

function generateId(prefix = "oid"): string {
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${Date.now()}_${rand}`;
}

export function listOrders() {
  return orders.slice().sort((a, b) => b.createdAt - a.createdAt);
}

export function createOrder(params: { displayName: string; note?: string; menuItemId: string }) {
  const order: Order = {
    id: generateId(),
    displayName: params.displayName,
    note: params.note?.trim() ? params.note.trim() : undefined,
    status: "pending",
    createdAt: Date.now(),
    items: [{ menuItemId: params.menuItemId, qty: 1 }],
  };
  orders.unshift(order);
  return order;
}

export function updateOrderStatus(orderId: string, next: OrderStatus) {
  const idx = orders.findIndex((o) => o.id === orderId);
  if (idx === -1) return undefined;
  orders[idx] = { ...orders[idx], status: next };
  return orders[idx];
}

export function serializeOrders() {
  return listOrders().map((o) => ({
    ...o,
    itemsDetailed: o.items.map((it) => {
      const menu = MENU.find((m) => m.id === it.menuItemId);
      return { ...it, nameZh: menu?.nameZh ?? it.menuItemId, nameEn: menu?.nameEn ?? it.menuItemId };
    }),
  }));
}
