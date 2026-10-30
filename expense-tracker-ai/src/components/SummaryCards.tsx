import type { dashboardStats } from "@/lib/analytics";
import { CATEGORY_META, categoryColor } from "@/lib/categories";
import { formatCurrency, formatMonth, todayISO } from "@/lib/format";

type Stats = ReturnType<typeof dashboardStats>;

function Card({ label, value, children }: { label: string; value: string; children?: React.ReactNode }) {
  return (
    <div className="card p-5">
      <p className="text-sm font-medium text-ink-2">{label}</p>
      <p className="mt-2 truncate text-2xl font-semibold tracking-tight text-ink sm:text-[1.75rem]">{value}</p>
      <div className="mt-2 min-h-5 text-sm text-ink-2">{children}</div>
    </div>
  );
}

function MonthDelta({ change }: { change: number | null }) {
  if (change === null) return <span className="text-muted">No data for last month</span>;
  const up = change > 0;
  const pct = Math.abs(change * 100).toFixed(change !== 0 && Math.abs(change) < 0.1 ? 1 : 0);
  // Spending going up is the "bad" direction here.
  return (
    <span className="inline-flex items-center gap-1">
      <span
        className={`inline-flex items-center gap-0.5 rounded-md px-1.5 py-0.5 text-xs font-semibold ${
          up ? "bg-danger-soft text-danger" : "bg-success-soft text-success"
        }`}
      >
        <span aria-hidden>{up ? "▲" : "▼"}</span>
        {pct}%
      </span>
      <span>{up ? "more" : "less"} than last month</span>
    </span>
  );
}

export function SummaryCards({ stats }: { stats: Stats }) {
  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <Card label={`${formatMonth(todayISO().slice(0, 7), "long")}`} value={formatCurrency(stats.thisMonthTotal)}>
        <MonthDelta change={stats.monthChange} />
      </Card>
      <Card label="Total spending" value={formatCurrency(stats.total)}>
        {stats.count} {stats.count === 1 ? "expense" : "expenses"} recorded
      </Card>
      <Card label="Monthly average" value={formatCurrency(stats.monthlyAverage)}>
        Across months with spending
      </Card>
      <Card
        label="Top category"
        value={stats.topCategory ? `${CATEGORY_META[stats.topCategory.category].icon} ${stats.topCategory.category}` : "—"}
      >
        {stats.topCategory ? (
          <span className="inline-flex items-center gap-1.5">
            <span className="h-2 w-2 rounded-full" style={{ background: categoryColor(stats.topCategory.category) }} />
            {formatCurrency(stats.topCategory.total)} {stats.topCategoryScope}
          </span>
        ) : (
          <span className="text-muted">No expenses yet</span>
        )}
      </Card>
    </div>
  );
}
