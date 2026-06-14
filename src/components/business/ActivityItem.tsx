import type { ActivityLog, EntityType } from "../../types";
import {
  ShoppingCart,
  Wallet,
  Factory,
  Package,
  Building2,
  RotateCcw,
  type LucideIcon,
} from "lucide-react";
import { cn, formatDateTime } from "../../lib/format";
import { Badge } from "../ui/Badge";

const entityIcon: Record<EntityType, LucideIcon> = {
  sale: ShoppingCart,
  expense: Wallet,
  production: Factory,
  item: Package,
  company: Building2,
  system: RotateCcw,
};

const entityTint: Record<EntityType, string> = {
  sale: "bg-emerald-50 text-emerald-600",
  expense: "bg-red-50 text-red-600",
  production: "bg-blue-50 text-brand-600",
  item: "bg-amber-50 text-amber-600",
  company: "bg-slate-100 text-slate-600",
  system: "bg-slate-100 text-slate-600",
};

const actionLabel: Record<string, string> = {
  company_created: "Компания",
  item_created: "Товар",
  item_archived: "Архив",
  sale_created: "Продажа",
  sale_deleted: "Отмена",
  expense_created: "Расход",
  expense_deleted: "Отмена",
  production_created: "Производство",
  production_deleted: "Отмена",
  demo_data_reset: "Сброс",
};

function isCancellation(actionType: string): boolean {
  return actionType.endsWith("_deleted") || actionType === "demo_data_reset";
}

interface ActivityItemProps {
  log: ActivityLog;
  compact?: boolean;
}

export function ActivityItem({ log, compact }: ActivityItemProps) {
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
          <span className="shrink-0 text-xs font-medium text-slate-400 tabular">
            {formatDateTime(log.createdAt)}
          </span>
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
