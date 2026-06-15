import { useMemo } from "react";
import { PageTitle } from "../components/ui/PageTitle";
import { Card } from "../components/ui/Card";
import { StockCard, stockLevel } from "../components/business/StockCard";
import { useAppData } from "../context/AppDataContext";

export function StockPage() {
  const { stockItems, movementsForItem } = useAppData();

  const counts = useMemo(() => {
    const acc = { ok: 0, low: 0, out: 0 };
    stockItems.forEach((i) => {
      acc[stockLevel(i)] += 1;
    });
    return acc;
  }, [stockItems]);

  return (
    <div className="space-y-5">
      <PageTitle title="Склад" subtitle={`${stockItems.length} позиций на складе`} />

      <div className="grid grid-cols-3 gap-3">
        <Summary label="В наличии" value={counts.ok} dot="bg-emerald-500" text="text-emerald-600" />
        <Summary label="Мало" value={counts.low} dot="bg-amber-500" text="text-amber-600" />
        <Summary label="Заканчивается" value={counts.out} dot="bg-red-500" text="text-red-600" />
      </div>

      {stockItems.length === 0 && (
        <Card className="p-5 text-center text-sm text-slate-400">
          Нет позиций на складе. Добавьте товар или материал с галочкой «Учитывать на складе».
        </Card>
      )}

      <div className="grid gap-3 sm:grid-cols-2">
        {stockItems.map((item) => (
          <StockCard key={item.id} item={item} movements={movementsForItem(item.id, 2)} />
        ))}
      </div>
    </div>
  );
}

function Summary({ label, value, dot, text }: { label: string; value: number; dot: string; text: string }) {
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
