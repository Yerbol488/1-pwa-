import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Card, CardHeader } from "../components/ui/Card";
import { StatCard } from "../components/ui/StatCard";
import { ActivityItem } from "../components/business/ActivityItem";
import { useAppData } from "../context/AppDataContext";
import { formatNumber, formatTenge, isToday } from "../lib/format";
import { itemIcons, itemIconTints } from "../data/icons";
import {
  HardDrive,
  TrendingUp,
  TrendingDown,
  Wallet,
  ShoppingCart,
  Factory,
  ChevronRight,
} from "lucide-react";

export function DashboardPage() {
  const { currentBusiness, activeSales, activeExpenses, activeItems, businessActivity } = useAppData();

  const revenueToday = activeSales.filter((s) => isToday(s.createdAt)).reduce((sum, s) => sum + s.total, 0);
  const expensesToday = activeExpenses.filter((e) => isToday(e.createdAt)).reduce((sum, e) => sum + e.amount, 0);
  const profitToday = revenueToday - expensesToday;

  const stockPreview = activeItems.filter((i) => i.type !== "service").slice(0, 3);
  const recent = businessActivity.slice(0, 4);

  return (
    <div className="space-y-5">
      {/* Company / local mode block */}
      <Card className="bg-gradient-to-br from-brand-600 to-blue-700 p-5 text-white">
        <p className="text-lg font-extrabold">{currentBusiness?.name}</p>
        <p className="mt-0.5 flex items-center gap-1.5 text-sm text-blue-100">
          <HardDrive className="h-4 w-4" />
          Локальный режим · Данные на этом устройстве
        </p>
      </Card>

      {/* Today figures */}
      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="Выручка сегодня"
          value={formatTenge(revenueToday)}
          accent="blue"
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <StatCard
          label="Расходы сегодня"
          value={formatTenge(expensesToday)}
          accent="red"
          icon={<TrendingDown className="h-5 w-5" />}
        />
        <div className="col-span-2">
          <StatCard
            label="Прибыль сегодня"
            value={formatTenge(profitToday)}
            accent={profitToday < 0 ? "red" : "green"}
            icon={<Wallet className="h-5 w-5" />}
            hint="Выручка минус расходы за сегодня · Локально сохранено"
          />
        </div>
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-3 gap-3">
        <QuickAction to="/sales" label="Продажа" tint="bg-emerald-600" icon={<ShoppingCart className="h-6 w-6" />} />
        <QuickAction to="/expenses" label="Расход" tint="bg-red-600" icon={<Wallet className="h-6 w-6" />} />
        <QuickAction to="/production" label="Производство" tint="bg-brand-600" icon={<Factory className="h-6 w-6" />} />
      </div>

      {/* Stock preview */}
      <Card>
        <CardHeader>
          <h2 className="text-base font-bold text-slate-900">Склад</h2>
          <Link to="/stock" className="flex items-center text-sm font-medium text-brand-600">
            Все <ChevronRight className="h-4 w-4" />
          </Link>
        </CardHeader>
        <div className="divide-y divide-slate-100 px-4 pb-2">
          {stockPreview.length === 0 && <p className="py-3 text-sm text-slate-400">Нет позиций на складе.</p>}
          {stockPreview.map((item) => {
            const Icon = itemIcons[item.icon];
            return (
              <div key={item.id} className="flex items-center gap-3 py-3">
                <span className={"flex h-10 w-10 items-center justify-center rounded-xl " + itemIconTints[item.icon]}>
                  <Icon className="h-5 w-5" />
                </span>
                <span className="flex-1 text-sm font-medium text-slate-700">{item.name}</span>
                <span className="text-sm font-bold text-slate-900 tabular">
                  {formatNumber(item.stockQuantity)} {item.unit}
                </span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Recent activity */}
      <Card>
        <CardHeader>
          <h2 className="text-base font-bold text-slate-900">Последние действия</h2>
          <Link to="/activity" className="flex items-center text-sm font-medium text-brand-600">
            Журнал <ChevronRight className="h-4 w-4" />
          </Link>
        </CardHeader>
        <div className="divide-y divide-slate-100 px-4 pb-2">
          {recent.length === 0 && <p className="py-3 text-sm text-slate-400">Пока нет действий.</p>}
          {recent.map((log) => (
            <ActivityItem key={log.id} log={log} compact />
          ))}
        </div>
      </Card>
    </div>
  );
}

function QuickAction({
  to,
  label,
  tint,
  icon,
}: {
  to: string;
  label: string;
  tint: string;
  icon: ReactNode;
}) {
  return (
    <Link
      to={to}
      className="flex flex-col items-center gap-2 rounded-2xl border border-slate-100 bg-white p-4 shadow-card transition active:scale-[0.98]"
    >
      <span className={"flex h-12 w-12 items-center justify-center rounded-xl text-white " + tint}>{icon}</span>
      <span className="text-xs font-semibold text-slate-700">{label}</span>
    </Link>
  );
}
