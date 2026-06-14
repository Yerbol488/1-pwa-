import { useMemo } from "react";
import { PageTitle } from "../components/ui/PageTitle";
import { Card } from "../components/ui/Card";
import { StockCard, stockLevel } from "../components/business/StockCard";
import { useAppData } from "../context/AppDataContext";
import { formatNumber } from "../lib/format";

export function StockPage() {
  const { activeItems, activeSales, activeProduction } = useAppData();

  const counts = useMemo(() => {
    const acc = { ok: 0, low: 0, out: 0 };
    activeItems.forEach((i) => {
      const lvl = stockLevel(i);
      if (lvl) acc[lvl] += 1;
    });
    return acc;
  }, [activeItems]);

  // Last stock-changing action per item (most recent active sale/production).
  const lastActivityByItem = useMemo(() => {
    const map = new Map<string, { at: string; text: string }>();
    const consider = (itemId: string, at: string, text: string) => {
      const prev = map.get(itemId);
      if (!prev || prev.at < at) map.set(itemId, { at, text });
    };
    activeSales.forEach((s) =>
      consider(s.itemId, s.createdAt, `продажа −${formatNumber(s.quantity)} · ${s.createdByName}`)
    );
    activeProduction.forEach((p) =>
      consider(p.itemId, p.createdAt, `производство +${formatNumber(p.quantity)} · ${p.createdByName}`)
    );
    return map;
  }, [activeSales, activeProduction]);

  return (
    <div className="space-y-5">
      <PageTitle title="Склад" subtitle={`${activeItems.length} позиций`} />

      <div className="grid grid-cols-3 gap-3">
        <Summary label="В наличии" value={counts.ok} dot="bg-emerald-500" text="text-emerald-600" />
        <Summary label="Мало" value={counts.low} dot="bg-amber-500" text="text-amber-600" />
        <Summary label="Заканчивается" value={counts.out} dot="bg-red-500" text="text-red-600" />
      </div>

      {activeItems.length === 0 && (
        <Card className="p-5 text-center text-sm text-slate-400">
          Склад пуст. Добавьте позиции на странице «Товары».
        </Card>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {activeItems.map((item) => (
          <StockCard key={item.id} item={item} lastActivity={lastActivityByItem.get(item.id)?.text} />
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
