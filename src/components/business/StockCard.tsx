import type { StockEntry, StockLevel } from "../../types";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { formatNumber, cn } from "../../lib/format";
import { itemIcons, itemIconTints } from "../../data/icons";

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
  out: "bg-red-500 w-[12%]",
};

export function StockCard({ entry }: { entry: StockEntry }) {
  const Icon = itemIcons[entry.icon];
  return (
    <Card className="p-4">
      <div className="flex items-center gap-3">
        <span
          className={cn(
            "flex h-11 w-11 shrink-0 items-center justify-center rounded-xl",
            itemIconTints[entry.icon]
          )}
        >
          <Icon className="h-5 w-5" />
        </span>
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-bold text-slate-900">{entry.name}</h3>
            <Badge tone={levelTone[entry.level]}>{levelLabel[entry.level]}</Badge>
          </div>
          <p className="text-sm text-slate-500 tabular">
            <span className="text-lg font-extrabold text-slate-900">{formatNumber(entry.quantity)}</span>{" "}
            {entry.unit}
          </p>
        </div>
      </div>
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-slate-100">
        <div className={cn("h-full rounded-full", levelBar[entry.level])} />
      </div>
    </Card>
  );
}
