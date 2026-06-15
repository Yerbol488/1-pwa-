import type { Item } from "../../types";
import { Card } from "../ui/Card";
import { Badge } from "../ui/Badge";
import { formatTenge, formatNumber, cn } from "../../lib/format";
import { itemIcons, itemIconTints } from "../../data/icons";
import { Archive, Pencil } from "lucide-react";

const typeTone = {
  product: "blue",
  material: "amber",
  service: "green",
  expense_category: "red",
} as const;

interface ItemCardProps {
  item: Item;
  onEdit?: (item: Item) => void;
  onArchive?: (item: Item) => void;
}

export function ItemCard({ item, onEdit, onArchive }: ItemCardProps) {
  const Icon = itemIcons[item.icon];
  const flags: string[] = [];
  if (item.sellable) flags.push("Продажа");
  if (item.purchasable) flags.push("Покупка");
  if (item.stockTracked) flags.push("Склад");
  if (item.consumableInProduction) flags.push("Производство");

  return (
    <Card className="p-4">
      <div className="flex items-start gap-3">
        <span className={cn("flex h-12 w-12 shrink-0 items-center justify-center rounded-xl", itemIconTints[item.icon])}>
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
        <div className={cn("rounded-xl py-2", item.sellable ? "bg-emerald-50" : "bg-slate-50 opacity-60")}>
          <p className="text-[11px] font-medium text-emerald-600">Продажа</p>
          <p className="text-sm font-bold text-emerald-700 tabular">
            {item.sellable ? formatTenge(item.salePrice) : "—"}
          </p>
        </div>
        <div className={cn("rounded-xl py-2", item.purchasable ? "bg-slate-50" : "bg-slate-50 opacity-60")}>
          <p className="text-[11px] font-medium text-slate-500">Закуп</p>
          <p className="text-sm font-bold text-slate-700 tabular">
            {item.purchasable ? formatTenge(item.purchasePrice) : "—"}
          </p>
        </div>
        <div className={cn("rounded-xl py-2", item.stockTracked ? "bg-blue-50" : "bg-slate-50 opacity-60")}>
          <p className="text-[11px] font-medium text-brand-600">Остаток</p>
          <p className="text-sm font-bold text-brand-700 tabular">
            {item.stockTracked ? formatNumber(item.stockQuantity) : "—"}
          </p>
        </div>
      </div>

      {flags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {flags.map((f) => (
            <span key={f} className="rounded-lg bg-blue-50 px-2 py-1 text-[11px] font-medium text-brand-700">
              {f}
            </span>
          ))}
        </div>
      )}

      {item.attributes.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {item.attributes.map((a) => (
            <span key={a.id} className="rounded-lg bg-slate-100 px-2 py-1 text-[11px] font-medium text-slate-600">
              {a.key}: {a.value}
            </span>
          ))}
        </div>
      )}

      {item.comment && <p className="mt-3 text-xs text-slate-400">{item.comment}</p>}

      {(onEdit || onArchive) && (
        <div className="mt-3 flex gap-4">
          {onEdit && (
            <button
              onClick={() => onEdit(item)}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 transition hover:text-brand-600"
            >
              <Pencil className="h-4 w-4" /> Изменить
            </button>
          )}
          {onArchive && (
            <button
              onClick={() => onArchive(item)}
              className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 transition hover:text-red-600"
            >
              <Archive className="h-4 w-4" /> В архив
            </button>
          )}
        </div>
      )}
    </Card>
  );
}
