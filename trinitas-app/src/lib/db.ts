import type { Order, OrderStatus } from "@/lib/types";
import { MENU } from "@/lib/menu";
import { kv } from "@vercel/kv";
import { writeFile, readFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { supabase } from "./supabase";

// In-memory fallback store
const memoryOrders: Order[] = [];

// Local file storage for development
const DATA_DIR = path.join(process.cwd(), ".data");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");

async function ensureDataDir() {
  if (!existsSync(DATA_DIR)) {
    await mkdir(DATA_DIR, { recursive: true });
  }
}

async function loadOrdersFromFile(): Promise<Order[]> {
  try {
    await ensureDataDir();
    if (!existsSync(ORDERS_FILE)) return [];
    const data = await readFile(ORDERS_FILE, "utf-8");
    return JSON.parse(data);
  } catch {
    return [];
  }
}

async function saveOrdersToFile(orders: Order[]): Promise<void> {
  try {
    await ensureDataDir();
    await writeFile(ORDERS_FILE, JSON.stringify(orders, null, 2));
  } catch (error) {
    console.error("Failed to save orders to file:", error);
  }
}

function generateId(prefix = "oid"): string {
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${Date.now()}_${rand}`;
}

function isKvEnabled(): boolean {
  return Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

function isSupabaseEnabled(): boolean {
  return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
}

// Supabase functions
async function listOrdersFromSupabase(): Promise<Order[]> {
  if (!supabase) {
    console.error('Supabase client not initialized');
    return [];
  }
  
  const { data, error } = await supabase
    .from('orders')
    .select('*')
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Failed to fetch orders from Supabase:', error);
    return [];
  }
  
  return data.map(row => ({
    id: row.id,
    displayName: row.display_name,
    note: row.note,
    status: row.status as Order['status'],
    createdAt: row.created_at,
    items: row.items || []
  }));
}

async function createOrderInSupabase(params: { displayName: string; note?: string; menuItemId: string; addOns?: string[] }): Promise<Order> {
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }
  
  const order: Order = {
    id: generateId(),
    displayName: params.displayName,
    note: params.note?.trim() ? params.note.trim() : undefined,
    status: "pending",
    createdAt: Date.now(),
    items: [{ menuItemId: params.menuItemId, qty: 1, addOns: params.addOns || [] }],
  };
  
  const { error } = await supabase
    .from('orders')
    .insert({
      id: order.id,
      display_name: order.displayName,
      note: order.note,
      status: order.status,
      created_at: order.createdAt,
      items: order.items
    });
  
  if (error) {
    console.error('Failed to create order in Supabase:', error);
    throw new Error('創建訂單失敗');
  }
  
  return order;
}

async function updateOrderStatusInSupabase(orderId: string, next: OrderStatus): Promise<Order | undefined> {
  if (!supabase) {
    console.error('Supabase client not initialized');
    return undefined;
  }
  
  const { data, error } = await supabase
    .from('orders')
    .update({ status: next })
    .eq('id', orderId)
    .select()
    .single();
  
  if (error) {
    console.error('Failed to update order status in Supabase:', error);
    return undefined;
  }
  
  return {
    id: data.id,
    displayName: data.display_name,
    note: data.note,
    status: data.status as Order['status'],
    createdAt: data.created_at,
    items: data.items || []
  };
}

async function deleteOrderFromSupabase(orderId: string): Promise<boolean> {
  if (!supabase) {
    console.error('Supabase client not initialized');
    return false;
  }
  
  const { error } = await supabase
    .from('orders')
    .delete()
    .eq('id', orderId);
  
  if (error) {
    console.error('Failed to delete order from Supabase:', error);
    return false;
  }
  
  return true;
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

async function createOrderInKv(params: { displayName: string; note?: string; menuItemId: string; addOns?: string[] }): Promise<Order> {
  const order: Order = {
    id: generateId(),
    displayName: params.displayName,
    note: params.note?.trim() ? params.note.trim() : undefined,
    status: "pending",
    createdAt: Date.now(),
    items: [{ menuItemId: params.menuItemId, qty: 1, addOns: params.addOns || [] }],
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

// Public API with priority: Supabase > KV > File > Memory
export async function listOrders(): Promise<Order[]> {
  if (isSupabaseEnabled()) return listOrdersFromSupabase();
  if (isKvEnabled()) return listOrdersFromKv();
  
  // Load from file if memory is empty (after restart)
  if (memoryOrders.length === 0) {
    const fileOrders = await loadOrdersFromFile();
    memoryOrders.push(...fileOrders);
  }
  
  // Remove duplicates by ID and sort by creation time
  const uniqueOrders = memoryOrders.filter((order, index, self) => 
    index === self.findIndex(o => o.id === order.id)
  );
  
  return uniqueOrders.sort((a, b) => b.createdAt - a.createdAt);
}

export async function createOrder(params: { displayName: string; note?: string; menuItemId: string; addOns?: string[] }): Promise<Order> {
  if (isSupabaseEnabled()) return createOrderInSupabase(params);
  if (isKvEnabled()) return createOrderInKv(params);
  
  // Load existing orders if memory is empty
  if (memoryOrders.length === 0) {
    const fileOrders = await loadOrdersFromFile();
    memoryOrders.push(...fileOrders);
  }
  
  const order: Order = {
    id: generateId(),
    displayName: params.displayName,
    note: params.note?.trim() ? params.note.trim() : undefined,
    status: "pending",
    createdAt: Date.now(),
    items: [{ menuItemId: params.menuItemId, qty: 1, addOns: params.addOns || [] }],
  };
  memoryOrders.unshift(order);
  
  // Save to file
  await saveOrdersToFile(memoryOrders);
  
  return order;
}

export async function updateOrderStatus(orderId: string, next: OrderStatus): Promise<Order | undefined> {
  if (isSupabaseEnabled()) return updateOrderStatusInSupabase(orderId, next);
  if (isKvEnabled()) return updateOrderStatusInKv(orderId, next);
  
  // Load from file if memory is empty
  if (memoryOrders.length === 0) {
    const fileOrders = await loadOrdersFromFile();
    memoryOrders.push(...fileOrders);
  }
  
  console.log("Looking for order ID:", orderId);
  console.log("Available orders:", memoryOrders.map(o => ({ id: o.id, status: o.status })));
  
  const idx = memoryOrders.findIndex((o) => o.id === orderId);
  if (idx === -1) {
    console.log("Order not found in memory or file");
    return undefined;
  }
  memoryOrders[idx] = { ...memoryOrders[idx], status: next };
  
  // Save to file
  await saveOrdersToFile(memoryOrders);
  
  console.log("Updated order:", memoryOrders[idx]);
  return memoryOrders[idx];
}

export async function deleteOrder(orderId: string): Promise<boolean> {
  if (isSupabaseEnabled()) {
    return await deleteOrderFromSupabase(orderId);
  }
  if (isKvEnabled()) {
    // Delete from KV
    await kv.del(ORDER_KEY(orderId));
    await kv.zrem(ORDERS_ZSET_KEY, orderId);
    return true;
  }
  
  // Load from file if memory is empty
  if (memoryOrders.length === 0) {
    const fileOrders = await loadOrdersFromFile();
    memoryOrders.push(...fileOrders);
  }
  
  const idx = memoryOrders.findIndex((o) => o.id === orderId);
  if (idx === -1) {
    console.log("Order not found for deletion:", orderId);
    return false;
  }
  
  memoryOrders.splice(idx, 1);
  await saveOrdersToFile(memoryOrders);
  console.log("Order deleted:", orderId);
  return true;
}

export async function clearAllOrders(): Promise<void> {
  if (isSupabaseEnabled()) {
    if (!supabase) {
      console.error('Supabase client not initialized');
      return;
    }
    
    const { error } = await supabase
      .from('orders')
      .delete()
      .neq('id', 'dummy'); // Delete all rows
    
    if (error) {
      console.error('Failed to clear orders from Supabase:', error);
    } else {
      console.log("All orders cleared from Supabase");
    }
    return;
  }
  if (isKvEnabled()) {
    // Clear from KV (when implemented)
    return;
  }
  
  // Clear from memory and file
  memoryOrders.length = 0;
  await saveOrdersToFile([]);
  console.log("All orders cleared");
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
