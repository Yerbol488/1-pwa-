import type { Item, StockMovement } from "../../types";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { formatNumber, cn } from "../../lib/format";
import { itemIcons, itemIconTints } from "../../data/icons";

export type StockLevel = "ok" | "low" | "out";

const LOW_THRESHOLD = 20;

export function stockLevel(item: Item): StockLevel {
  if (item.stockQuantity <= 0) return "out";
  if (item.stockQuantity <= LOW_THRESHOLD) return "low";
  return "ok";
}

const levelLabel: Record<StockLevel, string> = { ok: "В наличии", low: "Мало", out: "Заканчивается" };
const levelTone: Record<StockLevel, "green" | "amber" | "red"> = { ok: "green", low: "amber", out: "red" };
const levelBar: Record<StockLevel, string> = {
  ok: "bg-emerald-500 w-full",
  low: "bg-amber-500 w-1/3",
  out: "bg-red-500 w-[10%]",
};

const movementLabel: Record<StockMovement["movementType"], string> = {
  purchase_in: "покупка",
  production_in: "производство",
  sale_out: "продажа",
  production_consumption_out: "списано на производство",
  writeoff_out: "списание",
  adjustment_in: "корректировка",
  adjustment_out: "корректировка",
};

export function StockCard({ item, movements = [] }: { item: Item; movements?: StockMovement[] }) {
  const Icon = itemIcons[item.icon];
  const level = stockLevel(item);
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <span className={cn("flex h-11 w-11 shrink-0 items-center justify-center rounded-xl", itemIconTints[item.icon])}>
          <Icon className="h-5 w-5" />
        </span>
        <div className="flex-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-base font-bold text-slate-900">{item.name}</h3>
            <Badge tone={levelTone[level]}>{levelLabel[level]}</Badge>
          </div>
          <p className="text-sm text-slate-500 tabular">
            <span className="text-lg font-extrabold text-slate-900">{formatNumber(item.stockQuantity)}</span>{" "}
            {item.unit}
          </p>
        </div>
      </div>

      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div className={cn("h-full rounded-full", levelBar[level])} />
      </div>

      {movements.length > 0 && (
        <>
          <p className="mt-3 text-xs text-slate-400">
            Последнее действие: {movementLabel[movements[0].movementType]} {movements[0].quantity >= 0 ? "+" : ""}
            {formatNumber(movements[0].quantity)} · {movements[0].createdByName}
          </p>
          <div className="mt-2 flex flex-wrap gap-1.5">
            {movements.map((m) => (
              <span
                key={m.id}
                className={cn(
                  "rounded-lg px-2 py-1 text-[11px] font-medium",
                  m.quantity >= 0 ? "bg-emerald-50 text-emerald-700" : "bg-red-50 text-red-700"
                )}
              >
                {m.quantity >= 0 ? "+" : ""}
                {formatNumber(m.quantity)} {movementLabel[m.movementType]}
              </span>
            ))}
          </div>
        </>
      )}
    </Card>
  );
}
