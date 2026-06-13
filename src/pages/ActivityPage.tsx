import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { PageTitle } from "../components/ui/PageTitle";
import { activity } from "../data/mockData";
import { ShoppingCart, Wallet, Factory, Boxes, type LucideIcon } from "lucide-react";
import type { ActivityKind } from "../types";

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

export function ActivityPage() {
  return (
    <div className="space-y-5">
      <PageTitle title="Журнал" subtitle="Все действия сотрудников" />

      <div className="space-y-3">
        {activity.map((log) => {
          const Icon = kindIcon[log.kind];
          return (
            <Card key={log.id} className="p-4">
              <div className="flex items-start gap-3">
                <span className={"flex h-11 w-11 shrink-0 items-center justify-center rounded-xl " + kindTint[log.kind]}>
                  <Icon className="h-5 w-5" />
                </span>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-2">
                    <p className="font-bold text-slate-900">{log.user}</p>
                    <span className="text-xs font-medium text-slate-400 tabular">{log.time}</span>
                  </div>
                  <p className="text-sm text-slate-600">{log.description}</p>
                  <div className="mt-2">
                    <Badge tone="slate">{log.action}</Badge>
                  </div>
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
