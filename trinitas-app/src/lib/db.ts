import type { Order, OrderStatus } from "@/lib/types";
import { MENU } from "@/lib/menu";
import { kv } from "@vercel/kv";
import { writeFile, readFile, mkdir } from "fs/promises";
import { existsSync } from "fs";
import path from "path";
import { supabase, isSupabaseAvailable } from "./supabase";

// In-memory fallback store
const memoryOrders: Order[] = [];

// Local file storage for development
const DATA_DIR = path.join(process.cwd(), ".data");
const ORDERS_FILE = path.join(DATA_DIR, "orders.json");
const ORDER_COUNTER_FILE = path.join(DATA_DIR, "order_counter.json");

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

// Order counter management
const COUNTER_KEY = "order_counter";

async function loadOrderCounterFromKv(): Promise<{ counter: number; lastResetDate: string }> {
  try {
    const data = await kv.get<{ counter: number; lastResetDate: string }>(COUNTER_KEY);
    if (!data) {
      const today = new Date().toDateString();
      console.log("No counter in KV, creating new counter for:", today);
      return { counter: 0, lastResetDate: today };
    }
    
    // Check if we need to reset the counter (new day)
    const today = new Date().toDateString();
    if (data.lastResetDate !== today) {
      console.log("New day detected, resetting counter from", data.lastResetDate, "to", today);
      return { counter: 0, lastResetDate: today };
    }
    
    console.log("Loaded counter from KV:", data);
    return data;
  } catch (error) {
    console.error("Error loading counter from KV:", error);
    const today = new Date().toDateString();
    return { counter: 0, lastResetDate: today };
  }
}

async function saveOrderCounterToKv(counter: { counter: number; lastResetDate: string }): Promise<void> {
  try {
    await kv.set(COUNTER_KEY, counter);
    console.log("Saved counter to KV:", counter);
  } catch (error) {
    console.error("Failed to save order counter to KV:", error);
  }
}

async function loadOrderCounterFromFile(): Promise<{ counter: number; lastResetDate: string }> {
  try {
    await ensureDataDir();
    if (!existsSync(ORDER_COUNTER_FILE)) {
      const today = new Date().toDateString();
      console.log("No counter file found, creating new counter for:", today);
      return { counter: 0, lastResetDate: today };
    }
    const data = await readFile(ORDER_COUNTER_FILE, "utf-8");
    const counter = JSON.parse(data);
    
    // Check if we need to reset the counter (new day)
    const today = new Date().toDateString();
    if (counter.lastResetDate !== today) {
      console.log("New day detected, resetting counter from", counter.lastResetDate, "to", today);
      return { counter: 0, lastResetDate: today };
    }
    
    console.log("Loaded counter from file:", counter);
    return counter;
  } catch (error) {
    console.error("Error loading counter from file:", error);
    const today = new Date().toDateString();
    return { counter: 0, lastResetDate: today };
  }
}

async function saveOrderCounterToFile(counter: { counter: number; lastResetDate: string }): Promise<void> {
  try {
    await ensureDataDir();
    await writeFile(ORDER_COUNTER_FILE, JSON.stringify(counter, null, 2));
    console.log("Saved counter to file:", counter);
  } catch (error) {
    console.error("Failed to save order counter to file:", error);
  }
}

async function loadOrderCounter(): Promise<{ counter: number; lastResetDate: string }> {
  if (isKvEnabled()) {
    return await loadOrderCounterFromKv();
  }
  return await loadOrderCounterFromFile();
}

async function saveOrderCounter(counter: { counter: number; lastResetDate: string }): Promise<void> {
  if (isKvEnabled()) {
    await saveOrderCounterToKv(counter);
  } else {
    await saveOrderCounterToFile(counter);
  }
}

async function getNextOrderNumber(): Promise<number> {
  const counter = await loadOrderCounter();
  counter.counter += 1;
  await saveOrderCounter(counter);
  console.log("Generated order number:", counter.counter);
  return counter.counter;
}

function generateId(prefix = "oid"): string {
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${Date.now()}_${rand}`;
}

function isKvEnabled(): boolean {
  return Boolean(process.env.KV_REST_API_URL && process.env.KV_REST_API_TOKEN);
}

function isSupabaseEnabled(): boolean {
  // 在生產環境中，如果 Supabase 環境變量未設置，則禁用 Supabase
  if (process.env.NODE_ENV === 'production') {
    return isSupabaseAvailable() && Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL);
  }
  return isSupabaseAvailable();
}

// Supabase functions
async function listOrdersFromSupabase(): Promise<Order[]> {
  if (!supabase) {
    console.error('Supabase client not initialized');
    return [];
  }

  try {
    const { data: orders, error } = await supabase
      .from('orders')
      .select(`
        id,
        order_number,
        display_name,
        note,
        status,
        created_at,
        items
      `)
      .order('created_at', { ascending: true });

    if (error) {
      console.error('Error fetching orders from Supabase:', error);
      return [];
    }

    return orders.map(order => ({
      id: order.id,
      orderNumber: order.order_number,
      displayName: order.display_name,
      note: order.note,
      status: order.status as OrderStatus,
      createdAt: order.created_at,
      items: order.items || []
    }));
  } catch (error) {
    console.error('Error in listOrdersFromSupabase:', error);
    return [];
  }
}

async function createOrderInSupabase(params: { displayName: string; note?: string; menuItemId: string; addOns?: string[] }): Promise<Order> {
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }

  try {
    // 獲取下一個訂單編號
    const orderNumber = await getNextOrderNumberFromSupabase();
    
    const orderId = generateId();
    const now = Date.now(); // 使用時間戳（毫秒）

    // 創建訂單（包含項目）
    const orderItems = [{
      menuItemId: params.menuItemId,
      qty: 1,
      addOns: params.addOns || []
    }];

    const { data: order, error: orderError } = await supabase
      .from('orders')
      .insert({
        id: orderId,
        order_number: orderNumber,
        display_name: params.displayName,
        note: params.note?.trim() || null,
        status: 'pending',
        created_at: now,
        items: orderItems
      })
      .select()
      .single();

    if (orderError) {
      console.error('Error creating order in Supabase:', orderError);
      throw new Error('Failed to create order');
    }

    return {
      id: order.id,
      orderNumber: order.order_number,
      displayName: order.display_name,
      note: order.note,
      status: order.status as OrderStatus,
      createdAt: order.created_at,
      items: orderItems
    };
  } catch (error) {
    console.error('Error in createOrderInSupabase:', error);
    throw error;
  }
}

async function updateOrderStatusInSupabase(orderId: string, next: OrderStatus): Promise<Order | undefined> {
  if (!supabase) {
    console.error('Supabase client not initialized');
    return undefined;
  }

  try {
    const { data, error } = await supabase
      .from('orders')
      .update({ 
        status: next,
        updated_at: new Date().toISOString()
      })
      .eq('id', orderId)
      .select(`
        id,
        order_number,
        display_name,
        note,
        status,
        created_at,
        items
      `)
      .single();

    if (error) {
      console.error('Error updating order status in Supabase:', error);
      return undefined;
    }

    return {
      id: data.id,
      orderNumber: data.order_number,
      displayName: data.display_name,
      note: data.note,
      status: data.status as OrderStatus,
      createdAt: data.created_at,
      items: data.items || []
    };
  } catch (error) {
    console.error('Error in updateOrderStatusInSupabase:', error);
    return undefined;
  }
}

async function deleteOrderFromSupabase(orderId: string): Promise<boolean> {
  if (!supabase) {
    console.error('Supabase client not initialized');
    return false;
  }

  try {
    const { error } = await supabase
      .from('orders')
      .delete()
      .eq('id', orderId);

    if (error) {
      console.error('Error deleting order from Supabase:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteOrderFromSupabase:', error);
    return false;
  }
}

async function clearAllOrdersFromSupabase(): Promise<void> {
  if (!supabase) {
    console.error('Supabase client not initialized');
    return;
  }

  try {
    const { error } = await supabase
      .from('orders')
      .delete()
      .neq('id', 'dummy'); // 刪除所有訂單

    if (error) {
      console.error('Error clearing orders from Supabase:', error);
    }
  } catch (error) {
    console.error('Error in clearAllOrdersFromSupabase:', error);
  }
}

async function getNextOrderNumberFromSupabase(): Promise<number> {
  if (!supabase) {
    throw new Error('Supabase client not initialized');
  }

  try {
    const today = new Date().toDateString();
    
    // 獲取當前計數器
    const { data: counter, error: fetchError } = await supabase
      .from('order_counter')
      .select('counter, last_reset_date')
      .eq('id', 1)
      .single();

    if (fetchError && fetchError.code !== 'PGRST116') { // PGRST116 = no rows found
      console.error('Error fetching counter from Supabase:', fetchError);
      throw new Error('Failed to fetch counter');
    }

    let currentCounter = 0;
    let lastResetDate = today;

    if (counter) {
      // 檢查是否需要重置（新的一天）
      if (counter.last_reset_date !== today) {
        console.log('New day detected, resetting counter from', counter.last_reset_date, 'to', today);
        currentCounter = 0;
        lastResetDate = today;
      } else {
        currentCounter = counter.counter;
        lastResetDate = counter.last_reset_date;
      }
    }

    // 增加計數器
    const newCounter = currentCounter + 1;

    // 更新計數器
    const { error: updateError } = await supabase
      .from('order_counter')
      .upsert({
        id: 1,
        counter: newCounter,
        last_reset_date: lastResetDate,
        updated_at: new Date().toISOString()
      });

    if (updateError) {
      console.error('Error updating counter in Supabase:', updateError);
      throw new Error('Failed to update counter');
    }

    console.log('Generated order number from Supabase:', newCounter);
    return newCounter;
  } catch (error) {
    console.error('Error in getNextOrderNumberFromSupabase:', error);
    throw error;
  }
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
  // Get next order number
  const orderNumber = await getNextOrderNumber();
  
  const order: Order = {
    id: generateId(),
    orderNumber: orderNumber,
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
  console.log('listOrders: Checking database availability...');
  console.log('Supabase enabled:', isSupabaseEnabled());
  console.log('KV enabled:', isKvEnabled());
  console.log('Environment:', process.env.NODE_ENV);
  
  if (isSupabaseEnabled()) {
    console.log('Using Supabase for listOrders');
    return listOrdersFromSupabase();
  }
  if (isKvEnabled()) {
    console.log('Using KV for listOrders');
    return listOrdersFromKv();
  }
  
  console.log('Using file/memory for listOrders');
  // Load from file if memory is empty (after restart)
  if (memoryOrders.length === 0) {
    const fileOrders = await loadOrdersFromFile();
    memoryOrders.push(...fileOrders);
  }
  
  // Remove duplicates by ID and sort by creation time
  const uniqueOrders = memoryOrders.filter((order, index, self) => 
    index === self.findIndex(o => o.id === order.id)
  );
  
  return uniqueOrders.sort((a, b) => a.createdAt - b.createdAt);
}

export async function createOrder(params: { displayName: string; note?: string; menuItemId: string; addOns?: string[] }): Promise<Order> {
  console.log('createOrder: Checking database availability...');
  console.log('Supabase enabled:', isSupabaseEnabled());
  console.log('KV enabled:', isKvEnabled());
  console.log('Environment:', process.env.NODE_ENV);
  
  try {
    if (isSupabaseEnabled()) {
      console.log('Using Supabase for createOrder');
      return await createOrderInSupabase(params);
    }
    if (isKvEnabled()) {
      console.log('Using KV for createOrder');
      return await createOrderInKv(params);
    }
    
    console.log('Using file/memory for createOrder');
    // Load existing orders if memory is empty
    if (memoryOrders.length === 0) {
      const fileOrders = await loadOrdersFromFile();
      memoryOrders.push(...fileOrders);
    }
    
    // Get next order number
    const orderNumber = await getNextOrderNumber();
    
    const order: Order = {
      id: generateId(),
      orderNumber: orderNumber,
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
  } catch (error) {
    console.error('Error in createOrder:', error);
    throw error;
  }
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
    // Delete from KV (when implemented)
    return false;
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
    await clearAllOrdersFromSupabase();
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
