import { Fuel, Heart, MoreHorizontal, Music, ShoppingCart, Zap, type LucideIcon } from "lucide-react";

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  "shopping-cart": ShoppingCart,
  zap: Zap,
  fuel: Fuel,
  heart: Heart,
  music: Music,
  "more-horizontal": MoreHorizontal,
};

export function iconForCategory(icon: string | null | undefined): LucideIcon {
  return (icon && CATEGORY_ICONS[icon]) || ShoppingCart;
}
