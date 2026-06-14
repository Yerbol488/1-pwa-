import type { Item } from "../../types";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { formatNumber, cn } from "../../lib/format";
import { itemIcons, itemIconTints } from "../../data/icons";

export type StockLevel = "ok" | "low" | "out";

const LOW_THRESHOLD = 20;

export function stockLevel(item: Item): StockLevel | null {
  if (item.type === "service") return null; // services don't track stock
  if (item.stockQuantity <= 0) return "out";
  if (item.stockQuantity <= LOW_THRESHOLD) return "low";
  return "ok";
}

const levelLabel: Record<StockLevel, string> = {
  ok: "В наличии",
  low: "Мало",
  out: "Заканчивается",
};

const levelTone: Record<StockLevel, "green" | "amber" | "red"> = {
  ok: "green",
  low: "amber",
  out: "red",
};

const levelBar: Record<StockLevel, string> = {
  ok: "bg-emerald-500 w-full",
  low: "bg-amber-500 w-1/3",
  out: "bg-red-500 w-[10%]",
};

interface StockCardProps {
  item: Item;
  /** Optional last-activity hint, e.g. "продажа −300 шт · Алишер". */
  lastActivity?: string;
}

export function StockCard({ item, lastActivity }: StockCardProps) {
  const Icon = itemIcons[item.icon];
  const level = stockLevel(item);
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
            itemIconTints[item.icon]
          )}
        >
          <Icon className="h-5 w-5" />
        </span>
        <div className="flex-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="text-base font-bold text-slate-900">{item.name}</h3>
            {level ? (
              <Badge tone={levelTone[level]}>{levelLabel[level]}</Badge>
            ) : (
              <Badge tone="slate">{item.typeLabel}</Badge>
            )}
          </div>
          <p className="text-sm text-slate-500 tabular">
            <span className="text-lg font-extrabold text-slate-900">{formatNumber(item.stockQuantity)}</span>{" "}
            {item.unit}
          </p>
        </div>
      </div>

      {level && (
        <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
          <div className={cn("h-full rounded-full", levelBar[level])} />
        </div>
      )}

      {item.attributes.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {item.attributes.map((a) => (
            <span key={a.id} className="rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600">
              {a.key}: {a.value}
            </span>
          ))}
        </div>
      )}

      {lastActivity && <p className="mt-3 text-xs text-slate-400">Последнее действие: {lastActivity}</p>}
    </Card>
  );
}
