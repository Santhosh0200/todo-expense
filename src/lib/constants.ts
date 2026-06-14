import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Bus,
  Gamepad2,
  HeartPulse,
  MoreHorizontal,
  ShoppingBag,
  Utensils,
} from "lucide-react";

export const CATEGORIES = [
  "Food",
  "Transport",
  "Shopping",
  "Education",
  "Health",
  "Entertainment",
  "Other",
];

export const CAT_COLORS = {
  Food: "#1D9E75",
  Transport: "#378ADD",
  Shopping: "#D4537E",
  Education: "#7F77DD",
  Health: "#E24B4A",
  Entertainment: "#BA7517",
  Other: "#888780",
};

export const CAT_BG = {
  Food: "#e1f5ee",
  Transport: "#e6f1fb",
  Shopping: "#fbeaf0",
  Education: "#eeedfe",
  Health: "#fcebeb",
  Entertainment: "#faeeda",
  Other: "#f1efe8",
};

export const CAT_ICONS = {
  Food: "bowl",
  Transport: "bus",
  Shopping: "shopping-bag",
  Education: "book",
  Health: "heart",
  Entertainment: "device-gamepad",
  Other: "dots",
};

export const CAT_LUCIDE: Record<string, LucideIcon> = {
  Food: Utensils,
  Transport: Bus,
  Shopping: ShoppingBag,
  Education: BookOpen,
  Health: HeartPulse,
  Entertainment: Gamepad2,
  Other: MoreHorizontal,
};
