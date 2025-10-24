export type OrderStatus = "pending" | "in_progress" | "ready" | "done";

export interface AddOn {
  id: string;
  nameZh: string;
  nameEn: string;
  price?: number; // 可選：加料價格
}

export interface MenuItem {
  id: string;
  nameZh: string;
  nameEn: string;
  category: string;
  available: boolean;
  image?: string;
  addOns?: AddOn[]; // 新增：加料選項
}

export interface OrderItem {
  menuItemId: string;
  qty: number;
  addOns?: string[]; // 新增：選中的加料 ID 列表
}

export interface Order {
  id: string;
  orderNumber?: number; // 新增：訂單編號
  displayName: string;
  note?: string;
  status: OrderStatus;
  createdAt: number; // epoch ms
  items: OrderItem[];
}
