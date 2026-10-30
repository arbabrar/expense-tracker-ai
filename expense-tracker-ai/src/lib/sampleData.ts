import { CATEGORIES, type Category, type ExpenseInput } from "@/types/expense";
import { toISODate } from "./format";

const SAMPLES: Record<Category, [description: string, min: number, max: number][]> = {
  Food: [["Groceries", 45, 120], ["Lunch with team", 12, 35], ["Coffee", 3, 7], ["Dinner out", 30, 90]],
  Transportation: [["Gas", 35, 65], ["Metro card", 20, 40], ["Rideshare", 9, 28]],
  Entertainment: [["Movie tickets", 14, 32], ["Streaming subscription", 10, 18], ["Concert", 45, 120]],
  Shopping: [["Clothing", 25, 110], ["Household items", 15, 60], ["Books", 12, 40]],
  Bills: [["Electricity", 60, 110], ["Internet", 55, 70], ["Phone plan", 35, 50]],
  Other: [["Gift", 20, 80], ["Haircut", 18, 35], ["Pharmacy", 8, 30]],
};

const pick = <T,>(arr: readonly T[]) => arr[Math.floor(Math.random() * arr.length)];

/** Roughly three months of plausible demo data ending today. */
export function generateSampleExpenses(): ExpenseInput[] {
  const out: ExpenseInput[] = [];
  const now = new Date();
  for (let daysAgo = 0; daysAgo < 90; daysAgo++) {
    const perDay = Math.random() < 0.55 ? 1 : Math.random() < 0.3 ? 2 : 0;
    for (let i = 0; i < perDay; i++) {
      const category = pick(CATEGORIES);
      const [description, min, max] = pick(SAMPLES[category]);
      out.push({
        date: toISODate(new Date(now.getFullYear(), now.getMonth(), now.getDate() - daysAgo)),
        amount: Math.round((min + Math.random() * (max - min)) * 100) / 100,
        category,
        description,
      });
    }
  }
  return out;
}
