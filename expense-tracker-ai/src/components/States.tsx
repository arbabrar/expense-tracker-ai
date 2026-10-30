"use client";

import { useExpenses } from "@/hooks/useExpenses";
import { useToast } from "@/hooks/useToast";
import { generateSampleExpenses } from "@/lib/sampleData";
import { useExpenseEditor } from "./AppShell";

export function Skeleton({ className = "" }: { className?: string }) {
  return <div className={`animate-pulse rounded-lg bg-surface-2 ${className}`} />;
}

export function PageSkeleton() {
  return (
    <div className="space-y-6" aria-busy="true" aria-label="Loading expenses">
      <Skeleton className="h-8 w-48" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {Array.from({ length: 4 }, (_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-5">
        <Skeleton className="h-80 lg:col-span-3" />
        <Skeleton className="h-80 lg:col-span-2" />
      </div>
    </div>
  );
}

export function WelcomeState() {
  const { addMany } = useExpenses();
  const { openAdd } = useExpenseEditor();
  const toast = useToast();

  const loadSample = () => {
    const sample = generateSampleExpenses();
    addMany(sample);
    toast(`Loaded ${sample.length} sample expenses`);
  };

  return (
    <div className="card flex flex-col items-center px-6 py-16 text-center">
      <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-brand-soft text-2xl" aria-hidden>
        💸
      </span>
      <h2 className="mt-5 text-xl font-semibold text-ink">Start tracking your spending</h2>
      <p className="mt-2 max-w-md text-sm text-ink-2">
        Add your first expense to see summaries and charts here. Want to look around first? Load some sample data —
        you can clear it anytime from the Expenses page.
      </p>
      <div className="mt-6 flex flex-col gap-2 sm:flex-row">
        <button className="btn-primary" onClick={openAdd}>
          Add your first expense
        </button>
        <button className="btn-secondary" onClick={loadSample}>
          Load sample data
        </button>
      </div>
    </div>
  );
}
