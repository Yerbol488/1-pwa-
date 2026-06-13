import { PageTitle } from "../components/ui/PageTitle";
import { StockCard } from "../components/business/StockCard";
import { Card } from "../components/ui/Card";
import { stockEntries } from "../data/mockData";
import type { StockLevel } from "../types";

const counts = stockEntries.reduce(
  (acc, s) => {
    acc[s.level] += 1;
    return acc;
  },
  { ok: 0, low: 0, out: 0 } as Record<StockLevel, number>
);

export function StockPage() {
  return (
    <div className="space-y-5">
      <PageTitle title="Склад" subtitle={`${stockEntries.length} позиций`} />

      {/* Status summary */}
      <div className="grid grid-cols-3 gap-3">
        <Summary label="В наличии" value={counts.ok} dot="bg-emerald-500" text="text-emerald-600" />
        <Summary label="Мало" value={counts.low} dot="bg-amber-500" text="text-amber-600" />
        <Summary label="Заканчивается" value={counts.out} dot="bg-red-500" text="text-red-600" />
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        {stockEntries.map((entry) => (
          <StockCard key={entry.id} entry={entry} />
        ))}
      </div>
    </div>
  );
}

function Summary({
  label,
  value,
  dot,
  text,
}: {
  label: string;
  value: number;
  dot: string;
  text: string;
}) {
  return (
    <Card className="p-3 text-center">
      <div className="flex items-center justify-center gap-1.5">
        <span className={"h-2 w-2 rounded-full " + dot} />
        <span className={"text-2xl font-extrabold tabular " + text}>{value}</span>
      </div>
      <p className="mt-0.5 text-[11px] font-medium text-slate-500">{label}</p>
    </Card>
  );
}
