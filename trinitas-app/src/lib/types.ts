export type OrderStatus = "pending" | "in_progress" | "ready" | "done";

export interface MenuItem {
  id: string;
  nameZh: string;
  nameEn: string;
  category: string;
  available: boolean;
}

export interface OrderItem {
  menuItemId: string;
  qty: number;
}

export interface Order {
  id: string;
  displayName: string;
  note?: string;
  status: OrderStatus;
  createdAt: number; // epoch ms
  items: OrderItem[];
}
