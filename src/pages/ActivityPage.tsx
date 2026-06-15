import { useMemo, useState } from "react";
import { Card } from "../components/ui/Card";
import { PageTitle } from "../components/ui/PageTitle";
import { ActivityItem } from "../components/business/ActivityItem";
import { useAppData } from "../context/AppDataContext";
import { cn } from "../lib/format";
import type { EntityType } from "../types";

type Filter = "all" | "sales" | "expenses" | "production" | "items" | "system";

const filters: Array<{ key: Filter; label: string; entities: EntityType[] }> = [
  { key: "all", label: "Все", entities: [] },
  { key: "sales", label: "Продажи", entities: ["sale"] },
  { key: "expenses", label: "Расходы", entities: ["stock_purchase", "one_off_expense", "fixed_expense"] },
  { key: "production", label: "Производство", entities: ["production"] },
  { key: "items", label: "Товары", entities: ["item"] },
  { key: "system", label: "Система", entities: ["company", "system", "supplier", "client"] },
];

export function ActivityPage() {
  const { businessActivity } = useAppData();
  const [filter, setFilter] = useState<Filter>("all");

  const visible = useMemo(() => {
    const def = filters.find((f) => f.key === filter)!;
    if (def.entities.length === 0) return businessActivity;
    return businessActivity.filter((a) => def.entities.includes(a.entityType));
  }, [businessActivity, filter]);

  return (
    <div className="space-y-5">
      <PageTitle title="Журнал" subtitle="История всех действий" />

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 no-scrollbar">
        {filters.map((f) => (
          <button
            key={f.key}
            onClick={() => setFilter(f.key)}
            className={cn(
              "shrink-0 rounded-full px-3.5 py-2 text-sm font-semibold transition",
              filter === f.key ? "bg-brand-600 text-white" : "bg-white text-slate-500 shadow-card"
            )}
          >
            {f.label}
          </button>
        ))}
      </div>

      {visible.length === 0 ? (
        <Card className="p-5 text-center text-sm text-slate-400">Нет событий в этой категории.</Card>
      ) : (
        <Card>
          <div className="divide-y divide-slate-100 px-4">
            {visible.map((log) => (
              <ActivityItem key={log.id} log={log} />
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
