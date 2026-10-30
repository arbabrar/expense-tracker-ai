import { CATEGORIES, type Category, type Expense, type ExpenseFilters, type SortKey } from "@/types/expense";
import { monthKey, todayISO, toISODate } from "./format";

export const sum = (expenses: Expense[]) =>
  Math.round(expenses.reduce((acc, e) => acc + e.amount, 0) * 100) / 100;

const monthOffsetKey = (offset: number) => {
  const now = new Date();
  return toISODate(new Date(now.getFullYear(), now.getMonth() + offset, 1)).slice(0, 7);
};

export function totalsByCategory(expenses: Expense[]) {
  const totals = new Map<Category, number>(CATEGORIES.map((c) => [c, 0]));
  for (const e of expenses) totals.set(e.category, (totals.get(e.category) ?? 0) + e.amount);
  return CATEGORIES.map((category) => ({ category, total: totals.get(category) ?? 0 }))
    .filter((r) => r.total > 0)
    .sort((a, b) => b.total - a.total);
}

/** Totals for the last `count` calendar months, oldest first, including empty months. */
export function totalsByMonth(expenses: Expense[], count = 6) {
  const keys = Array.from({ length: count }, (_, i) => monthOffsetKey(i - count + 1));
  const totals = new Map(keys.map((k) => [k, 0]));
  for (const e of expenses) {
    const k = monthKey(e.date);
    const current = totals.get(k);
    if (current !== undefined) totals.set(k, current + e.amount);
  }
  return keys.map((month) => ({ month, total: totals.get(month) ?? 0 }));
}

export function dashboardStats(expenses: Expense[]) {
  const thisMonth = todayISO().slice(0, 7);
  const lastMonth = monthOffsetKey(-1);

  const thisMonthExpenses = expenses.filter((e) => monthKey(e.date) === thisMonth);
  const thisMonthTotal = sum(thisMonthExpenses);
  const lastMonthTotal = sum(expenses.filter((e) => monthKey(e.date) === lastMonth));

  const total = sum(expenses);
  const monthsWithData = new Set(expenses.map((e) => monthKey(e.date))).size;
  const topScope = thisMonthExpenses.length ? thisMonthExpenses : expenses;

  return {
    total,
    count: expenses.length,
    thisMonthTotal,
    thisMonthCount: thisMonthExpenses.length,
    lastMonthTotal,
    monthChange: lastMonthTotal > 0 ? (thisMonthTotal - lastMonthTotal) / lastMonthTotal : null,
    monthlyAverage: monthsWithData ? total / monthsWithData : 0,
    topCategory: totalsByCategory(topScope)[0] ?? null,
    topCategoryScope: thisMonthExpenses.length ? "this month" : "all time",
  };
}

const comparators: Record<SortKey, (a: Expense, b: Expense) => number> = {
  "date-desc": (a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt),
  "date-asc": (a, b) => a.date.localeCompare(b.date) || a.createdAt.localeCompare(b.createdAt),
  "amount-desc": (a, b) => b.amount - a.amount,
  "amount-asc": (a, b) => a.amount - b.amount,
};

export function applyFilters(expenses: Expense[], f: ExpenseFilters, sort: SortKey): Expense[] {
  const q = f.search.trim().toLowerCase();
  return expenses
    .filter((e) => {
      if (f.category !== "All" && e.category !== f.category) return false;
      if (f.from && e.date < f.from) return false;
      if (f.to && e.date > f.to) return false;
      if (q && !e.description.toLowerCase().includes(q) && !e.category.toLowerCase().includes(q)) return false;
      return true;
    })
    .sort(comparators[sort]);
}
