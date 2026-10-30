import type { Expense } from "@/types/expense";
import { todayISO } from "./format";

function escapeCell(value: string): string {
  // Guard against spreadsheet formula injection, then quote if needed.
  const safe = /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
  return /[",\n\r]/.test(safe) ? `"${safe.replace(/"/g, '""')}"` : safe;
}

export function expensesToCSV(expenses: Expense[]): string {
  const header = ["Date", "Category", "Description", "Amount"];
  const rows = expenses.map((e) => [e.date, e.category, escapeCell(e.description), e.amount.toFixed(2)]);
  return [header, ...rows].map((r) => r.join(",")).join("\r\n");
}

export function downloadCSV(expenses: Expense[], filename = `expenses-${todayISO()}.csv`): void {
  // BOM so Excel detects UTF-8.
  const blob = new Blob(["﻿" + expensesToCSV(expenses)], { type: "text/csv;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}
