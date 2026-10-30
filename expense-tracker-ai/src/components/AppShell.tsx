"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { createContext, useCallback, useContext, useState, type ReactNode } from "react";
import type { Expense, ExpenseInput } from "@/types/expense";
import { ExpensesProvider, useExpenses } from "@/hooks/useExpenses";
import { ToastProvider, useToast } from "@/hooks/useToast";
import { ExpenseForm } from "./ExpenseForm";
import { Modal } from "./Modal";
import { formatCurrency } from "@/lib/format";

interface EditorContextValue {
  openAdd: () => void;
  openEdit: (expense: Expense) => void;
}

const EditorContext = createContext<EditorContextValue | null>(null);

export function useExpenseEditor() {
  const ctx = useContext(EditorContext);
  if (!ctx) throw new Error("useExpenseEditor must be used within AppShell");
  return ctx;
}

const NAV = [
  { href: "/", label: "Dashboard" },
  { href: "/expenses", label: "Expenses" },
];

function Navbar({ onAdd }: { onAdd: () => void }) {
  const pathname = usePathname();
  return (
    <header className="sticky top-0 z-30 border-b border-line bg-surface/85 backdrop-blur">
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 sm:px-6">
        <Link href="/" className="flex items-center gap-2.5 font-semibold text-ink">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-brand text-white">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 17l6-6 4 4 8-8" />
              <path d="M14 7h7v7" />
            </svg>
          </span>
          <span className="hidden sm:inline">Spendwise</span>
        </Link>
        <nav className="flex items-center gap-1" aria-label="Main">
          {NAV.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={`rounded-lg px-3 py-2 text-sm font-medium transition-colors ${
                  active ? "bg-surface-2 text-ink" : "text-ink-2 hover:bg-surface-2 hover:text-ink"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
        </nav>
        <button onClick={onAdd} className="btn-primary ml-auto">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
            <path d="M12 5v14M5 12h14" />
          </svg>
          <span className="hidden sm:inline">Add expense</span>
          <span className="sm:hidden">Add</span>
        </button>
      </div>
    </header>
  );
}

function StorageBanner() {
  const { status, error, retry } = useExpenses();
  if (!error) return null;
  return (
    <div role="alert" className="border-b border-danger/30 bg-danger-soft">
      <div className="mx-auto flex max-w-6xl flex-wrap items-center gap-3 px-4 py-3 text-sm text-ink sm:px-6">
        <span className="font-semibold text-danger">Storage problem:</span>
        <span className="flex-1">{error}</span>
        {status === "error" && (
          <button className="btn-secondary py-1.5" onClick={retry}>
            Try again
          </button>
        )}
      </div>
    </div>
  );
}

function Shell({ children }: { children: ReactNode }) {
  const { addExpense, updateExpense } = useExpenses();
  const toast = useToast();
  const [editing, setEditing] = useState<Expense | null>(null);
  const [open, setOpen] = useState(false);

  const openAdd = useCallback(() => {
    setEditing(null);
    setOpen(true);
  }, []);
  const openEdit = useCallback((expense: Expense) => {
    setEditing(expense);
    setOpen(true);
  }, []);
  const close = useCallback(() => setOpen(false), []);

  const handleSubmit = (input: ExpenseInput) => {
    if (editing) {
      updateExpense(editing.id, input);
      toast("Expense updated");
    } else {
      addExpense(input);
      toast(`Added ${formatCurrency(input.amount)} for ${input.description}`);
    }
    setOpen(false);
  };

  return (
    <EditorContext.Provider value={{ openAdd, openEdit }}>
      <Navbar onAdd={openAdd} />
      <StorageBanner />
      <main className="mx-auto max-w-6xl px-4 py-6 sm:px-6 sm:py-8">{children}</main>
      <Modal
        open={open}
        onClose={close}
        title={editing ? "Edit expense" : "Add expense"}
        description={editing ? "Update the details of this expense." : "Record a new expense."}
      >
        {/* key remounts the form so it resets between add/edit sessions */}
        <ExpenseForm key={editing?.id ?? "new"} initial={editing ?? undefined} onSubmit={handleSubmit} onCancel={close} />
      </Modal>
    </EditorContext.Provider>
  );
}

export function AppShell({ children }: { children: ReactNode }) {
  return (
    <ToastProvider>
      <ExpensesProvider>
        <Shell>{children}</Shell>
      </ExpensesProvider>
    </ToastProvider>
  );
}
