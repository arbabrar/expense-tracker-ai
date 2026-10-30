"use client";

import { useState } from "react";
import type { Category } from "@/types/expense";
import { CATEGORY_META, categoryColor } from "@/lib/categories";
import { formatCompactCurrency, formatCurrency, formatMonth } from "@/lib/format";

/** Round the axis max up to a "nice" number and return evenly spaced ticks. */
function niceTicks(max: number, count = 4): number[] {
  if (max <= 0) return [0, 25, 50, 75, 100];
  const rawStep = max / count;
  const magnitude = 10 ** Math.floor(Math.log10(rawStep));
  const step = [1, 2, 2.5, 5, 10].map((m) => m * magnitude).find((s) => s >= rawStep) ?? rawStep;
  return Array.from({ length: Math.ceil(max / step) + 1 }, (_, i) => i * step);
}

export function MonthlyChart({ data }: { data: { month: string; total: number }[] }) {
  const [hover, setHover] = useState<number | null>(null);
  const ticks = niceTicks(Math.max(...data.map((d) => d.total)));
  const top = ticks[ticks.length - 1];
  const current = data.length - 1;

  return (
    <div>
      <div className="flex gap-3">
        {/* y-axis labels */}
        <div className="relative h-56 w-12 shrink-0 text-right text-xs tabular-nums text-muted" aria-hidden>
          {ticks.map((t) => (
            <span key={t} className="absolute right-0 -translate-y-1/2" style={{ bottom: `calc(${(t / top) * 100}% - 0px)` }}>
              {formatCompactCurrency(t)}
            </span>
          ))}
        </div>

        <div className="relative h-56 flex-1">
          {/* gridlines */}
          {ticks.map((t) => (
            <div
              key={t}
              aria-hidden
              className={`absolute inset-x-0 border-t ${t === 0 ? "border-ink-2/30" : "border-line"}`}
              style={{ bottom: `${(t / top) * 100}%` }}
            />
          ))}

          <div className="absolute inset-0 flex items-end gap-[2px]">
            {data.map((d, i) => (
              <div
                key={d.month}
                className="relative flex h-full flex-1 items-end justify-center"
                onMouseEnter={() => setHover(i)}
                onMouseLeave={() => setHover(null)}
                onFocus={() => setHover(i)}
                onBlur={() => setHover(null)}
                tabIndex={0}
                role="img"
                aria-label={`${formatMonth(d.month, "long")}: ${formatCurrency(d.total)}`}
              >
                {/* hover wash across the whole column = generous hit target */}
                <div className={`absolute inset-0 rounded-md transition-colors ${hover === i ? "bg-ink/[0.04]" : ""}`} />
                <div
                  className={`relative w-full max-w-12 rounded-t transition-[height,opacity] duration-500 ${
                    hover !== null && hover !== i ? "opacity-60" : ""
                  }`}
                  style={{
                    height: `${(d.total / top) * 100}%`,
                    minHeight: d.total > 0 ? 2 : 0,
                    background: "rgb(var(--brand))",
                  }}
                />
                {/* direct label on the current month only */}
                {i === current && d.total > 0 && hover === null && (
                  <span
                    className="absolute -translate-y-1.5 whitespace-nowrap text-xs font-semibold tabular-nums text-ink"
                    style={{ bottom: `${(d.total / top) * 100}%` }}
                  >
                    {formatCompactCurrency(d.total)}
                  </span>
                )}
                {hover === i && (
                  <div
                    className="pointer-events-none absolute z-10 mb-2 whitespace-nowrap rounded-lg border border-line bg-surface px-3 py-2 text-xs shadow-lg"
                    style={{ bottom: `${Math.min((d.total / top) * 100, 80)}%` }}
                  >
                    <div className="text-ink-2">{formatMonth(d.month, "long")}</div>
                    <div className="mt-0.5 text-sm font-semibold tabular-nums text-ink">{formatCurrency(d.total)}</div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
      {/* x-axis labels */}
      <div className="ml-[3.75rem] mt-2 flex gap-[2px] text-xs text-muted" aria-hidden>
        {data.map((d, i) => (
          <span key={d.month} className={`flex-1 text-center ${i === current ? "font-semibold text-ink-2" : ""}`}>
            {formatMonth(d.month)}
          </span>
        ))}
      </div>
    </div>
  );
}

export function CategoryChart({ data }: { data: { category: Category; total: number }[] }) {
  const [hover, setHover] = useState<Category | null>(null);
  const grand = data.reduce((s, d) => s + d.total, 0);
  const max = Math.max(...data.map((d) => d.total), 0);

  if (!data.length) return <p className="py-10 text-center text-sm text-muted">No spending in this period.</p>;

  return (
    <ul className="space-y-3.5">
      {data.map((d) => {
        const share = grand ? d.total / grand : 0;
        return (
          <li
            key={d.category}
            onMouseEnter={() => setHover(d.category)}
            onMouseLeave={() => setHover(null)}
            className={`transition-opacity ${hover && hover !== d.category ? "opacity-55" : ""}`}
          >
            <div className="mb-1.5 flex items-baseline justify-between gap-2 text-sm">
              <span className="flex items-center gap-2 text-ink">
                <span aria-hidden>{CATEGORY_META[d.category].icon}</span>
                {d.category}
              </span>
              <span className="tabular-nums">
                <span className="font-semibold text-ink">{formatCurrency(d.total)}</span>
                <span className="ml-2 inline-block w-10 text-right text-ink-2">{Math.round(share * 100)}%</span>
              </span>
            </div>
            <div className="h-2.5 overflow-hidden rounded-full bg-surface-2">
              <div
                className="h-full rounded-full transition-[width] duration-500"
                style={{ width: `${max ? (d.total / max) * 100 : 0}%`, background: categoryColor(d.category) }}
              />
            </div>
          </li>
        );
      })}
    </ul>
  );
}
