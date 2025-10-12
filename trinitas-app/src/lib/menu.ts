import type { MenuItem } from "@/lib/types";

export const MENU: MenuItem[] = [
  { id: "americano", nameZh: "美式咖啡", nameEn: "Americano", category: "Espresso", available: true },
  { id: "espresso", nameZh: "濃縮咖啡", nameEn: "Espresso", category: "Espresso", available: true },
  { id: "latte", nameZh: "拿鐵咖啡", nameEn: "Latte", category: "Milk Coffee", available: true },
  { id: "cappuccino", nameZh: "卡布奇諾", nameEn: "Cappuccino", category: "Milk Coffee", available: true },
  { id: "dirty", nameZh: "髒髒咖啡", nameEn: "Dirty", category: "Specialty", available: true },
  { id: "espresso_tonic", nameZh: "濃縮通寧", nameEn: "Espresso Tonic", category: "Specialty", available: true },
];

export function getMenuItem(id: string) {
  return MENU.find((m) => m.id === id);
}
