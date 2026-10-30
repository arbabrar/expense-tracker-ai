"use client";

import { useState, type FormEvent } from "react";
import { CATEGORIES, type Category, type Expense, type ExpenseInput } from "@/types/expense";
import { CATEGORY_META } from "@/lib/categories";
import { todayISO } from "@/lib/format";

const MAX_AMOUNT = 1_000_000;
const MAX_DESCRIPTION = 100;

interface FormValues {
  date: string;
  amount: string;
  category: Category | "";
  description: string;
}

type FormErrors = Partial<Record<keyof FormValues, string>>;

export function validateExpense(v: FormValues): FormErrors {
  const errors: FormErrors = {};

  if (!v.date) errors.date = "Pick a date.";
  else if (!/^\d{4}-\d{2}-\d{2}$/.test(v.date) || Number.isNaN(Date.parse(v.date))) errors.date = "Enter a valid date.";
  else if (v.date > todayISO()) errors.date = "Date can't be in the future.";
  else if (v.date < "1900-01-01") errors.date = "Date is too far in the past.";

  const amountText = v.amount.trim().replace(/,/g, "");
  if (!amountText) errors.amount = "Enter an amount.";
  else if (!/^\d+(\.\d{1,2})?$/.test(amountText)) errors.amount = "Use a number with up to 2 decimals, e.g. 12.50.";
  else {
    const n = Number(amountText);
    if (n <= 0) errors.amount = "Amount must be greater than $0.";
    else if (n > MAX_AMOUNT) errors.amount = "Amount must be under $1,000,000.";
  }

  if (!v.category) errors.category = "Choose a category.";

  const desc = v.description.trim();
  if (!desc) errors.description = "Add a short description.";
  else if (desc.length > MAX_DESCRIPTION) errors.description = `Keep it under ${MAX_DESCRIPTION} characters.`;

  return errors;
}

interface ExpenseFormProps {
  initial?: Expense;
  onSubmit: (input: ExpenseInput) => void;
  onCancel: () => void;
}

export function ExpenseForm({ initial, onSubmit, onCancel }: ExpenseFormProps) {
  const [values, setValues] = useState<FormValues>({
    date: initial?.date ?? todayISO(),
    amount: initial ? initial.amount.toFixed(2) : "",
    category: initial?.category ?? "",
    description: initial?.description ?? "",
  });
  const [touched, setTouched] = useState<Partial<Record<keyof FormValues, boolean>>>({});
  const [submitted, setSubmitted] = useState(false);
  const [saving, setSaving] = useState(false);

  const errors = validateExpense(values);
  const show = (field: keyof FormValues) => (submitted || touched[field]) && errors[field];

  const set = <K extends keyof FormValues>(field: K, value: FormValues[K]) =>
    setValues((v) => ({ ...v, [field]: value }));
  const blur = (field: keyof FormValues) => () => setTouched((t) => ({ ...t, [field]: true }));

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
    if (Object.keys(errors).length > 0) {
      const firstInvalid = (["date", "amount", "category", "description"] as const).find((f) => errors[f]);
      document.getElementById(`expense-${firstInvalid}`)?.focus();
      return;
    }
    setSaving(true);
    onSubmit({
      date: values.date,
      amount: Number(values.amount.trim().replace(/,/g, "")),
      category: values.category as Category,
      description: values.description.trim(),
    });
  };

  const fieldError = (field: keyof FormValues) =>
    show(field) ? (
      <p id={`expense-${field}-error`} className="mt-1.5 text-xs font-medium text-danger">
        {errors[field]}
      </p>
    ) : null;

  const aria = (field: keyof FormValues) => ({
    id: `expense-${field}`,
    "aria-invalid": Boolean(show(field)),
    "aria-describedby": show(field) ? `expense-${field}-error` : undefined,
    onBlur: blur(field),
  });

  return (
    <form onSubmit={handleSubmit} noValidate className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="expense-amount" className="label">
            Amount
          </label>
          <div className="relative">
            <span className="pointer-events-none absolute inset-y-0 left-3 flex items-center text-sm text-muted">$</span>
            <input
              {...aria("amount")}
              type="text"
              inputMode="decimal"
              autoComplete="off"
              placeholder="0.00"
              value={values.amount}
              onChange={(e) => set("amount", e.target.value)}
              className={`input pl-7 tabular-nums ${show("amount") ? "input-error" : ""}`}
            />
          </div>
          {fieldError("amount")}
        </div>

        <div>
          <label htmlFor="expense-date" className="label">
            Date
          </label>
          <input
            {...aria("date")}
            type="date"
            max={todayISO()}
            value={values.date}
            onChange={(e) => set("date", e.target.value)}
            className={`input ${show("date") ? "input-error" : ""}`}
          />
          {fieldError("date")}
        </div>
      </div>

      <fieldset>
        <legend id="expense-category" tabIndex={-1} className="label">
          Category
        </legend>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3" role="radiogroup" aria-labelledby="expense-category">
          {CATEGORIES.map((c) => {
            const active = values.category === c;
            return (
              <label
                key={c}
                className={`flex cursor-pointer items-center gap-2 rounded-lg border px-3 py-2 text-sm transition-colors ${
                  active
                    ? "border-brand bg-brand-soft font-medium text-ink"
                    : "border-line text-ink-2 hover:border-ink-2/40 hover:bg-surface-2"
                } has-[:focus-visible]:ring-2 has-[:focus-visible]:ring-brand`}
              >
                <input
                  type="radio"
                  name="category"
                  value={c}
                  checked={active}
                  onChange={() => set("category", c)}
                  onBlur={blur("category")}
                  className="sr-only"
                />
                <span aria-hidden>{CATEGORY_META[c].icon}</span>
                <span className="truncate">{c}</span>
              </label>
            );
          })}
        </div>
        {fieldError("category")}
      </fieldset>

      <div>
        <div className="flex items-baseline justify-between">
          <label htmlFor="expense-description" className="label">
            Description
          </label>
          <span
            className={`text-xs tabular-nums ${values.description.trim().length > MAX_DESCRIPTION ? "text-danger" : "text-muted"}`}
          >
            {values.description.trim().length}/{MAX_DESCRIPTION}
          </span>
        </div>
        <input
          {...aria("description")}
          type="text"
          placeholder="e.g. Weekly groceries"
          value={values.description}
          onChange={(e) => set("description", e.target.value)}
          className={`input ${show("description") ? "input-error" : ""}`}
        />
        {fieldError("description")}
      </div>

      <div className="flex flex-col-reverse gap-2 pt-2 sm:flex-row sm:justify-end">
        <button type="button" className="btn-secondary" onClick={onCancel}>
          Cancel
        </button>
        <button type="submit" className="btn-primary" disabled={saving}>
          {saving ? "Saving…" : initial ? "Save changes" : "Add expense"}
        </button>
      </div>
    </form>
  );
}
