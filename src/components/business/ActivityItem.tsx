import type { ActivityLog, EntityType } from "../../types";
import {
  ShoppingCart,
  Wallet,
  ShoppingBag,
  CalendarClock,
  Factory,
  Package,
  Building2,
  Truck,
  Users,
  RotateCcw,
  type LucideIcon,
} from "lucide-react";
import { cn, formatDateTime } from "../../lib/format";
import { Badge } from "../ui/Badge";

const entityIcon: Record<EntityType, LucideIcon> = {
  sale: ShoppingCart,
  stock_purchase: ShoppingBag,
  one_off_expense: Wallet,
  fixed_expense: CalendarClock,
  production: Factory,
  item: Package,
  supplier: Truck,
  client: Users,
  company: Building2,
  system: RotateCcw,
};

const entityTint: Record<EntityType, string> = {
  sale: "bg-emerald-50 text-emerald-600",
  stock_purchase: "bg-indigo-50 text-indigo-600",
  one_off_expense: "bg-red-50 text-red-600",
  fixed_expense: "bg-amber-50 text-amber-600",
  production: "bg-blue-50 text-brand-600",
  item: "bg-blue-50 text-brand-600",
  supplier: "bg-cyan-50 text-cyan-600",
  client: "bg-blue-50 text-brand-600",
  company: "bg-slate-100 text-slate-600",
  system: "bg-slate-100 text-slate-600",
};

const actionLabel: Record<string, string> = {
  company_created: "Компания",
  demo_data_loaded: "Демо",
  data_reset: "Сброс",
  item_created: "Товар",
  item_updated: "Товар",
  item_archived: "Архив",
  sale_created: "Продажа",
  sale_cancelled: "Отмена",
  stock_purchase_created: "Покупка",
  stock_purchase_cancelled: "Отмена",
  one_off_expense_created: "Расход",
  one_off_expense_cancelled: "Отмена",
  fixed_expense_created: "Постоянный",
  fixed_expense_cancelled: "Отмена",
  production_created: "Производство",
  production_cancelled: "Отмена",
  price_override_used: "Цена",
  supplier_created: "Поставщик",
  supplier_updated: "Поставщик",
  supplier_archived: "Архив",
};

function isCancellation(actionType: string): boolean {
  return actionType.endsWith("_cancelled") || actionType === "data_reset";
}

export function ActivityItem({ log, compact }: { log: ActivityLog; compact?: boolean }) {
  const Icon = entityIcon[log.entityType];
  const cancelled = isCancellation(log.actionType);
  return (
    <div className="flex items-start gap-3 py-3">
      <span
        className={cn(
          "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl",
          cancelled ? "bg-red-50 text-red-600" : entityTint[log.entityType]
        )}
      >
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-semibold text-slate-900">{log.userName}</p>
          <span className="shrink-0 text-xs font-medium text-slate-400 tabular">{formatDateTime(log.createdAt)}</span>
        </div>
        <p className={cn("text-sm", cancelled ? "text-red-600" : "text-slate-500")}>{log.description}</p>
        {!compact && (
          <div className="mt-2">
            <Badge tone={cancelled ? "red" : "slate"}>{actionLabel[log.actionType] ?? log.actionType}</Badge>
          </div>
        )}
      </div>
    </div>
  );
}
