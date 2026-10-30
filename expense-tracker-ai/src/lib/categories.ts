import type { Category } from "@/types/expense";

/**
 * Each category owns a fixed color slot (the order is validated for
 * colorblind separation), so a category keeps its color everywhere —
 * badges, charts, legends — regardless of filters or rank.
 */
export const CATEGORY_META: Record<Category, { colorVar: string; icon: string }> = {
  Food: { colorVar: "--cat-1", icon: "🍽️" },
  Transportation: { colorVar: "--cat-2", icon: "🚗" },
  Entertainment: { colorVar: "--cat-3", icon: "🎬" },
  Shopping: { colorVar: "--cat-4", icon: "🛍️" },
  Bills: { colorVar: "--cat-5", icon: "🧾" },
  Other: { colorVar: "--cat-6", icon: "📦" },
};

export const categoryColor = (c: Category) => `rgb(var(${CATEGORY_META[c].colorVar}))`;
