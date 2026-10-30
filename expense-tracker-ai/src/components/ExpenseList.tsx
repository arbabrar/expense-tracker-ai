"use client";

import type { Expense } from "@/types/expense";
import { CATEGORY_META, categoryColor } from "@/lib/categories";
import { formatCurrency, formatDate } from "@/lib/format";
import { useExpenses } from "@/hooks/useExpenses";
import { useToast } from "@/hooks/useToast";
import { useExpenseEditor } from "./AppShell";

export function CategoryBadge({ category }: { category: Expense["category"] }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full border border-line bg-surface-2 px-2 py-0.5 text-xs font-medium text-ink-2">
      <span className="h-2 w-2 rounded-full" style={{ background: categoryColor(category) }} aria-hidden />
      {category}
    </span>
  );
}

function IconButton({ label, onClick, danger, children }: { label: string; onClick: () => void; danger?: boolean; children: React.ReactNode }) {
  return (
    <button
      onClick={onClick}
      aria-label={label}
      title={label}
      className={`rounded-lg p-2 text-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand ${
        danger ? "hover:bg-danger-soft hover:text-danger" : "hover:bg-surface-2 hover:text-ink"
      }`}
    >
      {children}
    </button>
  );
}

export function ExpenseList({ expenses, compact = false }: { expenses: Expense[]; compact?: boolean }) {
  const { deleteExpense, restoreExpense } = useExpenses();
  const { openEdit } = useExpenseEditor();
  const toast = useToast();

  const handleDelete = (e: Expense) => {
    const removed = deleteExpense(e.id);
    if (!removed) return;
    toast(`Deleted "${removed.description}"`, {
      tone: "info",
      action: { label: "Undo", onClick: () => restoreExpense(removed) },
    });
  };

  return (
    <ul className="divide-y divide-line">
      {expenses.map((e) => (
        <li key={e.id} className="group flex items-center gap-3 px-4 py-3 transition-colors hover:bg-surface-2/60 sm:gap-4 sm:px-5">
          <span
            aria-hidden
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-surface-2 text-lg"
          >
            {CATEGORY_META[e.category].icon}
          </span>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium text-ink">{e.description}</p>
            <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-ink-2">
              <time dateTime={e.date}>{formatDate(e.date)}</time>
              {!compact && <CategoryBadge category={e.category} />}
              {compact && <span className="text-muted">· {e.category}</span>}
            </div>
          </div>
          <span className="shrink-0 text-right text-sm font-semibold tabular-nums text-ink">{formatCurrency(e.amount)}</span>
          {!compact && (
            <div className="flex shrink-0 items-center sm:opacity-60 sm:group-hover:opacity-100 sm:group-focus-within:opacity-100">
              <IconButton label={`Edit ${e.description}`} onClick={() => openEdit(e)}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 20h9" />
                  <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
                </svg>
              </IconButton>
              <IconButton label={`Delete ${e.description}`} onClick={() => handleDelete(e)} danger>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" />
                </svg>
              </IconButton>
            </div>
          )}
        </li>
      ))}
    </ul>
  );
}
