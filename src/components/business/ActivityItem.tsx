import type { ActivityKind, ActivityLog } from "../../types";
import { ShoppingCart, Wallet, Factory, Boxes, type LucideIcon } from "lucide-react";
import { cn } from "../../lib/format";

const kindIcon: Record<ActivityKind, LucideIcon> = {
  sale: ShoppingCart,
  expense: Wallet,
  production: Factory,
  stock: Boxes,
};

const kindTint: Record<ActivityKind, string> = {
  sale: "bg-emerald-50 text-emerald-600",
  expense: "bg-red-50 text-red-600",
  production: "bg-blue-50 text-brand-600",
  stock: "bg-amber-50 text-amber-600",
};

export function ActivityItem({ log }: { log: ActivityLog }) {
  const Icon = kindIcon[log.kind];
  return (
    <div className="flex items-start gap-3 py-3">
      <span className={cn("flex h-10 w-10 shrink-0 items-center justify-center rounded-xl", kindTint[log.kind])}>
        <Icon className="h-5 w-5" />
      </span>
      <div className="min-w-0 flex-1">
        <div className="flex items-center justify-between gap-2">
          <p className="truncate text-sm font-semibold text-slate-900">{log.user}</p>
          <span className="shrink-0 text-xs font-medium text-slate-400 tabular">{log.time}</span>
        </div>
        <p className="text-sm text-slate-500">{log.description}</p>
      </div>
    </div>
  );
}
