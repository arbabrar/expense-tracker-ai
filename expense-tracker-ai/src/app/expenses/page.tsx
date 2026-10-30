"use client";

import { useMemo, useState } from "react";
import { CATEGORIES, type ExpenseFilters, type SortKey } from "@/types/expense";
import { useExpenses } from "@/hooks/useExpenses";
import { useToast } from "@/hooks/useToast";
import { applyFilters, sum } from "@/lib/analytics";
import { downloadCSV } from "@/lib/csv";
import { formatCurrency, todayISO, toISODate } from "@/lib/format";
import { ExpenseList } from "@/components/ExpenseList";
import { ConfirmDialog } from "@/components/Modal";
import { Skeleton, WelcomeState } from "@/components/States";

const EMPTY_FILTERS: ExpenseFilters = { search: "", category: "All", from: "", to: "" };

const PRESETS: { label: string; range: () => [string, string] }[] = [
  {
    label: "This month",
    range: () => {
      const d = new Date();
      return [toISODate(new Date(d.getFullYear(), d.getMonth(), 1)), todayISO()];
    },
  },
  {
    label: "Last 30 days",
    range: () => {
      const d = new Date();
      return [toISODate(new Date(d.getFullYear(), d.getMonth(), d.getDate() - 29)), todayISO()];
    },
  },
  {
    label: "This year",
    range: () => [`${new Date().getFullYear()}-01-01`, todayISO()],
  },
];

export default function ExpensesPage() {
  const { expenses, status, clearAll } = useExpenses();
  const toast = useToast();
  const [filters, setFilters] = useState<ExpenseFilters>(EMPTY_FILTERS);
  const [sort, setSort] = useState<SortKey>("date-desc");
  const [confirmClear, setConfirmClear] = useState(false);

  const filtered = useMemo(() => applyFilters(expenses, filters, sort), [expenses, filters, sort]);
  const filteredTotal = sum(filtered);
  const isFiltered = JSON.stringify(filters) !== JSON.stringify(EMPTY_FILTERS);
  const rangeInvalid = Boolean(filters.from && filters.to && filters.from > filters.to);

  const set = <K extends keyof ExpenseFilters>(key: K, value: ExpenseFilters[K]) =>
    setFilters((f) => ({ ...f, [key]: value }));

  const activePreset = PRESETS.find((p) => {
    const [from, to] = p.range();
    return filters.from === from && filters.to === to;
  })?.label;

  const handleExport = () => {
    if (!filtered.length) return;
    try {
      downloadCSV(filtered);
      toast(`Exported ${filtered.length} ${filtered.length === 1 ? "expense" : "expenses"} to CSV`);
    } catch {
      toast("Export failed. Please try again.", { tone: "error" });
    }
  };

  if (status === "loading") {
    return (
      <div className="space-y-4" aria-busy="true">
        <Skeleton className="h-8 w-40" />
        <Skeleton className="h-28" />
        <Skeleton className="h-96" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight text-ink">Expenses</h1>
          <p className="mt-1 text-sm text-ink-2">Search, filter, edit, and export your expenses.</p>
        </div>
        {expenses.length > 0 && (
          <div className="flex gap-2">
            <button className="btn-ghost" onClick={() => setConfirmClear(true)}>
              Clear all
            </button>
            <button className="btn-secondary" onClick={handleExport} disabled={!filtered.length}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M12 3v12m0 0-4-4m4 4 4-4M5 21h14" />
              </svg>
              Export CSV
            </button>
          </div>
        )}
      </div>

      {expenses.length === 0 ? (
        <WelcomeState />
      ) : (
        <>
          <section className="card space-y-4 p-4 sm:p-5" aria-label="Filters">
            <div className="grid gap-3 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)]">
              <div className="relative">
                <svg className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-muted" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
                  <circle cx="11" cy="11" r="7" />
                  <path d="m20 20-3.5-3.5" />
                </svg>
                <input
                  type="search"
                  aria-label="Search expenses"
                  placeholder="Search descriptions…"
                  value={filters.search}
                  onChange={(e) => set("search", e.target.value)}
                  className="input pl-9"
                />
              </div>
              <select
                aria-label="Filter by category"
                value={filters.category}
                onChange={(e) => set("category", e.target.value as ExpenseFilters["category"])}
                className="input"
              >
                <option value="All">All categories</option>
                {CATEGORIES.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
              <select aria-label="Sort expenses" value={sort} onChange={(e) => setSort(e.target.value as SortKey)} className="input">
                <option value="date-desc">Newest first</option>
                <option value="date-asc">Oldest first</option>
                <option value="amount-desc">Highest amount</option>
                <option value="amount-asc">Lowest amount</option>
              </select>
            </div>

            <div className="flex flex-wrap items-end gap-3">
              <div className="grid flex-1 grid-cols-2 gap-3 sm:max-w-sm">
                <div>
                  <label htmlFor="filter-from" className="mb-1 block text-xs font-medium text-ink-2">
                    From
                  </label>
                  <input id="filter-from" type="date" value={filters.from} max={filters.to || undefined} onChange={(e) => set("from", e.target.value)} className={`input ${rangeInvalid ? "input-error" : ""}`} />
                </div>
                <div>
                  <label htmlFor="filter-to" className="mb-1 block text-xs font-medium text-ink-2">
                    To
                  </label>
                  <input id="filter-to" type="date" value={filters.to} min={filters.from || undefined} onChange={(e) => set("to", e.target.value)} className={`input ${rangeInvalid ? "input-error" : ""}`} />
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5">
                {PRESETS.map((p) => (
                  <button
                    key={p.label}
                    onClick={() => {
                      const [from, to] = p.range();
                      setFilters((f) => ({ ...f, from, to }));
                    }}
                    aria-pressed={activePreset === p.label}
                    className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-colors ${
                      activePreset === p.label
                        ? "border-brand bg-brand-soft text-ink"
                        : "border-line text-ink-2 hover:bg-surface-2 hover:text-ink"
                    }`}
                  >
                    {p.label}
                  </button>
                ))}
                {isFiltered && (
                  <button onClick={() => setFilters(EMPTY_FILTERS)} className="rounded-full px-3 py-1.5 text-xs font-medium text-brand hover:bg-brand-soft">
                    Reset filters
                  </button>
                )}
              </div>
            </div>
            {rangeInvalid && <p className="text-xs font-medium text-danger">“From” date must be on or before “To” date.</p>}
          </section>

          <section className="card overflow-hidden" aria-label="Expense list">
            <div className="flex flex-wrap items-center justify-between gap-2 border-b border-line px-5 py-3.5 text-sm">
              <span className="text-ink-2" aria-live="polite">
                {isFiltered ? (
                  <>
                    Showing <strong className="text-ink">{filtered.length}</strong> of {expenses.length}
                  </>
                ) : (
                  <>
                    <strong className="text-ink">{expenses.length}</strong> {expenses.length === 1 ? "expense" : "expenses"}
                  </>
                )}
              </span>
              <span className="text-ink-2">
                Total <strong className="tabular-nums text-ink">{formatCurrency(filteredTotal)}</strong>
              </span>
            </div>
            {filtered.length ? (
              <ExpenseList expenses={filtered} />
            ) : (
              <div className="px-6 py-14 text-center">
                <p className="font-medium text-ink">No expenses match your filters</p>
                <p className="mt-1 text-sm text-ink-2">Try a different search term or widen the date range.</p>
                <button className="btn-secondary mt-4" onClick={() => setFilters(EMPTY_FILTERS)}>
                  Reset filters
                </button>
              </div>
            )}
          </section>
        </>
      )}

      <ConfirmDialog
        open={confirmClear}
        title="Delete all expenses?"
        message={`This permanently removes all ${expenses.length} expenses from this browser. Consider exporting a CSV first.`}
        confirmLabel="Delete all"
        onCancel={() => setConfirmClear(false)}
        onConfirm={() => {
          clearAll();
          setFilters(EMPTY_FILTERS);
          setConfirmClear(false);
          toast("All expenses deleted", { tone: "info" });
        }}
      />
    </div>
  );
}
