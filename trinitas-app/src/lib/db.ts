import type { Order, OrderStatus } from "@/lib/types";
import { MENU } from "@/lib/menu";
import { kv } from "@vercel/kv";

// In-memory fallback store
const memoryOrders: Order[] = [];

function generateId(prefix = "oid"): string {
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${Date.now()}_${rand}`;
}

function isKvEnabled(): boolean {
  return Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

const ORDERS_ZSET_KEY = "orders:createdAt";
const ORDER_KEY = (id: string) => `order:${id}`;

async function listOrdersFromKv(): Promise<Order[]> {
  const ids = (await kv.zrange<string[]>(ORDERS_ZSET_KEY, 0, -1, { rev: true })) || [];
  if (!ids.length) return [];
  const keys = ids.map((id) => ORDER_KEY(id));
  const rows = await kv.mget<Order[]>(...keys);
  const orders: Order[] = [];
  for (let i = 0; i < keys.length; i++) {
    const row = Array.isArray(rows) ? (rows as unknown as (Order | null)[])[i] : null;
    if (row) orders.push(row);
  }
  return orders;
}

async function createOrderInKv(params: { displayName: string; note?: string; menuItemId: string }): Promise<Order> {
  const order: Order = {
    id: generateId(),
    displayName: params.displayName,
    note: params.note?.trim() ? params.note.trim() : undefined,
    status: "pending",
    createdAt: Date.now(),
    items: [{ menuItemId: params.menuItemId, qty: 1 }],
  };
  await kv.set(ORDER_KEY(order.id), order);
  await kv.zadd(ORDERS_ZSET_KEY, { score: order.createdAt, member: order.id });
  return order;
}

async function updateOrderStatusInKv(orderId: string, next: OrderStatus): Promise<Order | undefined> {
  const found = await kv.get<Order>(ORDER_KEY(orderId));
  if (!found) return undefined;
  const updated: Order = { ...found, status: next };
  await kv.set(ORDER_KEY(orderId), updated);
  return updated;
}

// Public API (async) with in-memory fallback
export async function listOrders(): Promise<Order[]> {
  if (isKvEnabled()) return listOrdersFromKv();
  return memoryOrders.slice().sort((a, b) => b.createdAt - a.createdAt);
}

export async function createOrder(params: { displayName: string; note?: string; menuItemId: string }): Promise<Order> {
  if (isKvEnabled()) return createOrderInKv(params);
  const order: Order = {
    id: generateId(),
    displayName: params.displayName,
    note: params.note?.trim() ? params.note.trim() : undefined,
    status: "pending",
    createdAt: Date.now(),
    items: [{ menuItemId: params.menuItemId, qty: 1 }],
  };
  memoryOrders.unshift(order);
  return order;
}

export async function updateOrderStatus(orderId: string, next: OrderStatus): Promise<Order | undefined> {
  if (isKvEnabled()) return updateOrderStatusInKv(orderId, next);
  const idx = memoryOrders.findIndex((o) => o.id === orderId);
  if (idx === -1) return undefined;
  memoryOrders[idx] = { ...memoryOrders[idx], status: next };
  return memoryOrders[idx];
}

export async function serializeOrders() {
  const orders = await listOrders();
  return orders.map((o) => ({
    ...o,
    itemsDetailed: o.items.map((it) => {
      const menu = MENU.find((m) => m.id === it.menuItemId);
      return { ...it, nameZh: menu?.nameZh ?? it.menuItemId, nameEn: menu?.nameEn ?? it.menuItemId };
    }),
  }));
}
