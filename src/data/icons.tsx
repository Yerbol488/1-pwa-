import {
  Box,
  Boxes,
  Droplets,
  Layers,
  Mountain,
  Truck,
  type LucideIcon,
} from "lucide-react";
import type { ItemIconKey } from "../types";

// Central registry mapping item icon keys to lucide icons.
export const itemIcons: Record<ItemIconKey, LucideIcon> = {
  block: Boxes,
  glue: Droplets,
  cement: Box,
  sand: Mountain,
  pallet: Layers,
  delivery: Truck,
};

// Tailwind tint classes per icon, kept soft (no neon).
export const itemIconTints: Record<ItemIconKey, string> = {
  block: "bg-blue-50 text-blue-600",
  glue: "bg-cyan-50 text-cyan-600",
  cement: "bg-slate-100 text-slate-600",
  sand: "bg-amber-50 text-amber-600",
  pallet: "bg-emerald-50 text-emerald-600",
  delivery: "bg-indigo-50 text-indigo-600",
};
