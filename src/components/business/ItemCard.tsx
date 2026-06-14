import type { Item } from "../../types";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { formatTenge, formatNumber, cn } from "../../lib/format";
import { itemIcons, itemIconTints } from "../../data/icons";
import { Archive } from "lucide-react";

const typeTone = {
  product: "blue",
  material: "amber",
  service: "green",
  expense_category: "red",
} as const;

interface ItemCardProps {
  item: Item;
  /** Shown only when the current role may manage items. */
  onArchive?: (item: Item) => void;
}

export function ItemCard({ item, onArchive }: ItemCardProps) {
  const Icon = itemIcons[item.icon];
  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        <span
          className={cn(
            "flex h-12 w-12 shrink-0 items-center justify-center rounded-xl",
            itemIconTints[item.icon]
          )}
        >
          <Icon className="h-6 w-6" />
        </span>
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between gap-2">
            <h3 className="truncate text-base font-bold text-slate-900">{item.name}</h3>
            <Badge tone={typeTone[item.type]}>{item.typeLabel}</Badge>
          </div>
          <p className="text-xs text-slate-400">Ед. измерения: {item.unit}</p>
        </div>
      </div>

      <div className="mt-4 grid grid-cols-3 gap-2 text-center">
        <div className="rounded-xl bg-emerald-50 py-2">
          <p className="text-[11px] font-medium text-emerald-600">Продажа</p>
          <p className="text-sm font-bold text-emerald-700 tabular">{formatTenge(item.salePrice)}</p>
        </div>
        <div className="rounded-xl bg-slate-50 py-2">
          <p className="text-[11px] font-medium text-slate-500">Закуп</p>
          <p className="text-sm font-bold text-slate-700 tabular">{formatTenge(item.purchasePrice)}</p>
        </div>
        <div className="rounded-xl bg-blue-50 py-2">
          <p className="text-[11px] font-medium text-brand-600">Остаток</p>
          <p className="text-sm font-bold text-brand-700 tabular">{formatNumber(item.stockQuantity)}</p>
        </div>
      </div>

      {item.attributes.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {item.attributes.map((a) => (
            <span key={a.id} className="rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600">
              {a.key}: {a.value}
            </span>
          ))}
        </div>
      )}

      {item.comment && <p className="mt-3 text-xs text-slate-400">{item.comment}</p>}

      {onArchive && (
        <button
          onClick={() => onArchive(item)}
          className="mt-3 flex items-center gap-1.5 text-xs font-semibold text-slate-400 transition hover:text-red-600"
        >
          <Archive className="h-4 w-4" /> В архив
        </button>
      )}
    </Card>
  );
}
