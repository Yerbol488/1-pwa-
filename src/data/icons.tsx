import {
  Banknote,
  Box,
  Boxes,
  Brush,
  Droplets,
  Grid3x3,
  Layers,
  Mountain,
  Package,
  ShoppingBag,
  Truck,
  Warehouse,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import type { ItemIconKey } from "../types";

export const itemIcons: Record<ItemIconKey, LucideIcon> = {
  box: Package,
  bag: ShoppingBag,
  delivery: Truck,
  tool: Wrench,
  money: Banknote,
  warehouse: Warehouse,
  block: Boxes,
  glue: Droplets,
  cement: Box,
  sand: Mountain,
  pallet: Layers,
  brick: Grid3x3,
  paint: Brush,
};

export const itemIconTints: Record<ItemIconKey, string> = {
  box: "bg-blue-50 text-blue-600",
  bag: "bg-amber-50 text-amber-600",
  delivery: "bg-indigo-50 text-indigo-600",
  tool: "bg-slate-100 text-slate-600",
  money: "bg-emerald-50 text-emerald-600",
  warehouse: "bg-cyan-50 text-cyan-600",
  block: "bg-blue-50 text-blue-600",
  glue: "bg-cyan-50 text-cyan-600",
  cement: "bg-slate-100 text-slate-600",
  sand: "bg-amber-50 text-amber-600",
  pallet: "bg-emerald-50 text-emerald-600",
  brick: "bg-orange-50 text-orange-600",
  paint: "bg-pink-50 text-pink-600",
};

/** Universal icon presets shown in the item form ("Выберите иконку"). */
export const iconPresets: Array<{ key: ItemIconKey; label: string }> = [
  { key: "box", label: "Коробка" },
  { key: "bag", label: "Мешок" },
  { key: "delivery", label: "Грузовик" },
  { key: "tool", label: "Инструмент" },
  { key: "money", label: "Деньги" },
  { key: "warehouse", label: "Склад" },
];

/** Full ordered list for the icon picker grid. */
export const iconOrder: ItemIconKey[] = [
  "box",
  "bag",
  "delivery",
  "tool",
  "money",
  "warehouse",
  "block",
  "glue",
  "cement",
  "sand",
  "pallet",
  "brick",
  "paint",
];
