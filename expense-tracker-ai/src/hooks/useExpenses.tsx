"use client";

import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import type { Expense, ExpenseInput } from "@/types/expense";
import { loadExpenses, newId, saveExpenses } from "@/lib/storage";

type Status = "loading" | "ready" | "error";

interface ExpensesContextValue {
  expenses: Expense[];
  status: Status;
  error: string | null;
  addExpense: (input: ExpenseInput) => Expense;
  updateExpense: (id: string, input: ExpenseInput) => void;
  deleteExpense: (id: string) => Expense | undefined;
  restoreExpense: (expense: Expense) => void;
  addMany: (inputs: ExpenseInput[]) => void;
  clearAll: () => void;
  retry: () => void;
}

const ExpensesContext = createContext<ExpensesContextValue | null>(null);

const stamp = (input: ExpenseInput): Omit<Expense, "id" | "createdAt"> => ({
  ...input,
  amount: Math.round(input.amount * 100) / 100,
  description: input.description.trim(),
  updatedAt: new Date().toISOString(),
});

export function ExpensesProvider({ children }: { children: ReactNode }) {
  const [expenses, setExpenses] = useState<Expense[]>([]);
  const [status, setStatus] = useState<Status>("loading");
  const [error, setError] = useState<string | null>(null);

  const load = useCallback(() => {
    setStatus("loading");
    try {
      setExpenses(loadExpenses());
      setError(null);
      setStatus("ready");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not read saved expenses.");
      setStatus("error");
    }
  }, []);

  useEffect(load, [load]);

  // Persist only once loaded; never overwrite storage we failed to read.
  useEffect(() => {
    if (status !== "ready") return;
    try {
      saveExpenses(expenses);
    } catch {
      setError("Couldn't save changes — browser storage may be full or disabled.");
    }
  }, [expenses, status]);

  const addExpense = useCallback((input: ExpenseInput) => {
    const now = new Date().toISOString();
    const expense: Expense = { id: newId(), createdAt: now, ...stamp(input) };
    setExpenses((prev) => [expense, ...prev]);
    return expense;
  }, []);

  const updateExpense = useCallback((id: string, input: ExpenseInput) => {
    setExpenses((prev) => prev.map((e) => (e.id === id ? { ...e, ...stamp(input) } : e)));
  }, []);

  const deleteExpense = useCallback(
    (id: string) => {
      const target = expenses.find((e) => e.id === id);
      setExpenses((prev) => prev.filter((e) => e.id !== id));
      return target;
    },
    [expenses],
  );

  const restoreExpense = useCallback((expense: Expense) => {
    setExpenses((prev) => (prev.some((e) => e.id === expense.id) ? prev : [expense, ...prev]));
  }, []);

  const addMany = useCallback((inputs: ExpenseInput[]) => {
    const now = new Date().toISOString();
    setExpenses((prev) => [...inputs.map((i) => ({ id: newId(), createdAt: now, ...stamp(i) })), ...prev]);
  }, []);

  const clearAll = useCallback(() => setExpenses([]), []);

  const value = useMemo(
    () => ({
      expenses,
      status,
      error,
      addExpense,
      updateExpense,
      deleteExpense,
      restoreExpense,
      addMany,
      clearAll,
      retry: load,
    }),
    [expenses, status, error, addExpense, updateExpense, deleteExpense, restoreExpense, addMany, clearAll, load],
  );

  return <ExpensesContext.Provider value={value}>{children}</ExpensesContext.Provider>;
}

export function useExpenses() {
  const ctx = useContext(ExpensesContext);
  if (!ctx) throw new Error("useExpenses must be used within ExpensesProvider");
  return ctx;
}
