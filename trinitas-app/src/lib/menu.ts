import type { MenuItem } from "@/lib/types";

export const MENU: MenuItem[] = [
  { 
    id: "espresso", 
    nameZh: "濃縮咖啡", 
    nameEn: "Espresso", 
    category: "Espresso", 
    available: true,
    image: "/images/menu/espresso.jpg"
  },
  { 
    id: "americano", 
    nameZh: "美式咖啡", 
    nameEn: "Americano", 
    category: "Espresso", 
    available: true,
    image: "/images/menu/americano.jpg"
  },
  { 
    id: "ice_americano", 
    nameZh: "冰美式咖啡", 
    nameEn: "Ice Americano", 
    category: "Iced Coffee", 
    available: true,
    image: "/images/menu/ice-americano.jpg"
  },
  { 
    id: "cappuccino", 
    nameZh: "泡沫咖啡", 
    nameEn: "Cappuccino", 
    category: "Milk Coffee", 
    available: true,
    image: "/images/menu/cappuccino.jpg"
  },
  { 
    id: "iced_cappuccino", 
    nameZh: "冰卡布奇諾", 
    nameEn: "Iced Cappuccino", 
    category: "Iced Coffee", 
    available: false,
    image: "/images/menu/iced-cappuccino.jpg"
  },
  { 
    id: "latte", 
    nameZh: "拿鐵咖啡", 
    nameEn: "Latte", 
    category: "Milk Coffee", 
    available: true,
    image: "/images/menu/latte.jpg"
  },
  { 
    id: "iced_latte", 
    nameZh: "冰拿鐵", 
    nameEn: "Iced Latte", 
    category: "Iced Coffee", 
    available: true,
    image: "/images/menu/iced-latte.jpg"
  },
  { 
    id: "green_tea_latte", 
    nameZh: "抹茶拿鐵", 
    nameEn: "Green Tea Latte", 
    category: "Specialty", 
    available: true,
    image: "/images/menu/green-tea-latte.jpg",
    addOns: [
      { id: "honey_grapefruit", nameZh: "有柚蜜", nameEn: "Honey Grapefruit" }
    ]
  },
  { 
    id: "dirty", 
    nameZh: "髒髒咖啡", 
    nameEn: "Dirty", 
    category: "Specialty", 
    available: true,
    image: "/images/menu/dirty.jpg"
  },
  { 
    id: "espresso_tonic", 
    nameZh: "濃縮通寧", 
    nameEn: "Espresso Tonic", 
    category: "Specialty", 
    available: true,
    image: "/images/menu/espresso-tonic.jpg",
    addOns: [
      { id: "honey_grapefruit", nameZh: "有柚蜜", nameEn: "Honey Grapefruit" }
    ]
  },
  { 
    id: "coconut_latte", 
    nameZh: "椰子拿鐵", 
    nameEn: "Coconut Latte", 
    category: "Specialty", 
    available: true,
    image: "/images/menu/coconut-latte.jpg"
  },
];

export function getMenuItem(id: string) {
  return MENU.find((m) => m.id === id);
}
