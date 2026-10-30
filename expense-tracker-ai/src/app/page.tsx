"use client";

import Link from "next/link";
import { useMemo } from "react";
import { useExpenses } from "@/hooks/useExpenses";
import { dashboardStats, totalsByCategory, totalsByMonth } from "@/lib/analytics";
import { monthKey, todayISO } from "@/lib/format";
import { SummaryCards } from "@/components/SummaryCards";
import { CategoryChart, MonthlyChart } from "@/components/Charts";
import { ExpenseList } from "@/components/ExpenseList";
import { PageSkeleton, WelcomeState } from "@/components/States";

export default function DashboardPage() {
  const { expenses, status } = useExpenses();

  const stats = useMemo(() => dashboardStats(expenses), [expenses]);
  const monthly = useMemo(() => totalsByMonth(expenses, 6), [expenses]);
  const thisMonth = todayISO().slice(0, 7);
  const byCategory = useMemo(
    () => totalsByCategory(expenses.filter((e) => monthKey(e.date) === thisMonth)),
    [expenses, thisMonth],
  );
  const recent = useMemo(
    () => [...expenses].sort((a, b) => b.date.localeCompare(a.date) || b.createdAt.localeCompare(a.createdAt)).slice(0, 5),
    [expenses],
  );

  if (status === "loading") return <PageSkeleton />;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-ink">Dashboard</h1>
        <p className="mt-1 text-sm text-ink-2">An overview of where your money is going.</p>
      </div>

      {expenses.length === 0 ? (
        <WelcomeState />
      ) : (
        <>
          <SummaryCards stats={stats} />

          <div className="grid gap-4 lg:grid-cols-5">
            <section className="card p-5 lg:col-span-3" aria-labelledby="monthly-title">
              <h2 id="monthly-title" className="font-semibold text-ink">
                Monthly spending
              </h2>
              <p className="mb-5 mt-0.5 text-sm text-ink-2">Last 6 months</p>
              <MonthlyChart data={monthly} />
            </section>

            <section className="card p-5 lg:col-span-2" aria-labelledby="category-title">
              <h2 id="category-title" className="font-semibold text-ink">
                By category
              </h2>
              <p className="mb-5 mt-0.5 text-sm text-ink-2">This month</p>
              <CategoryChart data={byCategory} />
            </section>
          </div>

          <section className="card overflow-hidden" aria-labelledby="recent-title">
            <div className="flex items-center justify-between border-b border-line px-5 py-4">
              <h2 id="recent-title" className="font-semibold text-ink">
                Recent expenses
              </h2>
              <Link href="/expenses" className="text-sm font-medium text-brand hover:text-brand-strong">
                View all →
              </Link>
            </div>
            <ExpenseList expenses={recent} compact />
          </section>
        </>
      )}
    </div>
  );
}
