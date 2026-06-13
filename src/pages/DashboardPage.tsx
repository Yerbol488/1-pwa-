import type { ReactNode } from "react";
import { Link } from "react-router-dom";
import { Card, CardHeader } from "../components/ui/Card";
import { StatCard } from "../components/ui/StatCard";
import { ActivityItem } from "../components/business/ActivityItem";
import {
  activity,
  dashboardSummary,
  stockEntries,
} from "../data/mockData";
import { formatNumber, formatTenge } from "../lib/format";
import { itemIcons, itemIconTints } from "../data/icons";
import {
  CheckCircle2,
  RefreshCw,
  TrendingUp,
  TrendingDown,
  Wallet,
  ShoppingCart,
  Factory,
  ChevronRight,
} from "lucide-react";

export function DashboardPage() {
  const { revenueToday, expensesToday, profitToday, pendingSync } = dashboardSummary;
  const synced = pendingSync === 0;
  const previewStock = stockEntries.slice(0, 3);

  return (
    <div className="space-y-5">
      {/* Sync status */}
      <Card
        className={
          synced
            ? "border-emerald-100 bg-emerald-50/50 p-4"
            : "border-amber-100 bg-amber-50/60 p-4"
        }
      >
        <div className="flex items-center gap-3">
          <span
            className={
              "flex h-11 w-11 items-center justify-center rounded-xl " +
              (synced ? "bg-emerald-100 text-emerald-600" : "bg-amber-100 text-amber-600")
            }
          >
            {synced ? <CheckCircle2 className="h-6 w-6" /> : <RefreshCw className="h-6 w-6" />}
          </span>
          <div>
            <p className="text-sm font-bold text-slate-900">
              {synced ? "✅ Синхронизировано" : `🟡 ${pendingSync} записи ждут отправки`}
            </p>
            <p className="text-xs text-slate-500">
              {synced ? "Все данные сохранены" : "Будут отправлены при подключении"}
            </p>
          </div>
        </div>
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
          label="Расходы"
          value={formatTenge(expensesToday)}
          accent="red"
          icon={<TrendingDown className="h-5 w-5" />}
        />
        <div className="col-span-2">
          <StatCard
            label="Прибыль"
            value={formatTenge(profitToday)}
            accent="green"
            icon={<Wallet className="h-5 w-5" />}
            hint="Выручка минус расходы за сегодня"
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
          {previewStock.map((s) => {
            const Icon = itemIcons[s.icon];
            return (
              <div key={s.id} className="flex items-center gap-3 py-3">
                <span className={"flex h-10 w-10 items-center justify-center rounded-xl " + itemIconTints[s.icon]}>
                  <Icon className="h-5 w-5" />
                </span>
                <span className="flex-1 text-sm font-medium text-slate-700">{s.name}</span>
                <span className="text-sm font-bold text-slate-900 tabular">
                  {formatNumber(s.quantity)} {s.unit}
                </span>
              </div>
            );
          })}
        </div>
      </Card>

      {/* Latest activity */}
      <Card>
        <CardHeader>
          <h2 className="text-base font-bold text-slate-900">Последние действия</h2>
          <Link to="/activity" className="flex items-center text-sm font-medium text-brand-600">
            Журнал <ChevronRight className="h-4 w-4" />
          </Link>
        </CardHeader>
        <div className="divide-y divide-slate-100 px-4 pb-2">
          {activity.slice(0, 3).map((log) => (
            <ActivityItem key={log.id} log={log} />
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
      <span className={"flex h-12 w-12 items-center justify-center rounded-xl text-white " + tint}>
        {icon}
      </span>
      <span className="text-xs font-semibold text-slate-700">{label}</span>
    </Link>
  );
}
