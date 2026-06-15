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
  HandCoins,
  TrendingDown,
  Wallet,
  ShoppingCart,
  ShoppingBag,
  Factory,
  ChevronRight,
} from "lucide-react";

export function DashboardPage() {
  const {
    currentBusiness,
    activeItems,
    activeSales,
    activeStockPurchases,
    activeOneOff,
    activeFixed,
    stockItems,
    businessActivity,
  } = useAppData();

  const todaySales = activeSales.filter((s) => isToday(s.createdAt));
  const soldToday = todaySales.reduce((sum, s) => sum + s.total, 0);
  const receivedToday = todaySales.reduce((sum, s) => sum + s.paidAmount, 0);
  const customerDebt = activeSales.reduce((sum, s) => sum + s.debtAmount, 0);
  const expensesToday =
    activeStockPurchases.filter((p) => isToday(p.createdAt)).reduce((s, p) => s + p.totalAmount, 0) +
    activeOneOff.filter((o) => isToday(o.createdAt)).reduce((s, o) => s + o.amount + o.deliveryCost, 0) +
    activeFixed.filter((f) => isToday(f.createdAt)).reduce((s, f) => s + f.amount, 0);

  const isEmpty =
    activeItems.length === 0 && activeSales.length === 0 && activeStockPurchases.length === 0 && activeOneOff.length === 0 && activeFixed.length === 0;

  const stockPreview = stockItems.slice(0, 3);
  const recent = businessActivity.slice(0, 4);

  return (
    <div className="space-y-5">
      <Card className="bg-gradient-to-br from-brand-600 to-blue-700 p-5 text-white">
        <p className="text-lg font-extrabold">{currentBusiness?.name}</p>
        <p className="mt-0.5 flex items-center gap-1.5 text-sm text-blue-100">
          <HardDrive className="h-4 w-4" />
          Локальный режим · Данные на этом устройстве
        </p>
      </Card>

      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Продано сегодня" value={formatTenge(soldToday)} accent="blue" icon={<TrendingUp className="h-5 w-5" />} />
        <StatCard label="Получено сегодня" value={formatTenge(receivedToday)} accent="green" icon={<HandCoins className="h-5 w-5" />} />
        <StatCard label="Расходы сегодня" value={formatTenge(expensesToday)} accent="red" icon={<TrendingDown className="h-5 w-5" />} />
        <StatCard
          label="Долг клиентов"
          value={formatTenge(customerDebt)}
          accent={customerDebt > 0 ? "red" : "slate"}
          icon={<Wallet className="h-5 w-5" />}
        />
      </div>

      {isEmpty && (
        <Card className="p-6 text-center">
          <h2 className="text-lg font-extrabold text-slate-900">Пока нет данных</h2>
          <p className="mx-auto mt-1 max-w-xs text-sm text-slate-500">
            Добавьте первую позицию, продажу или расход.
          </p>
        </Card>
      )}

      <div className="grid grid-cols-4 gap-2">
        <QuickAction to="/sales" label="Продажа" tint="bg-emerald-600" icon={<ShoppingCart className="h-5 w-5" />} />
        <QuickAction to="/expenses?tab=stock" label="Покупка" tint="bg-indigo-600" icon={<ShoppingBag className="h-5 w-5" />} />
        <QuickAction to="/expenses?tab=oneoff" label="Расход" tint="bg-red-600" icon={<Wallet className="h-5 w-5" />} />
        <QuickAction to="/production" label="Произв." tint="bg-brand-600" icon={<Factory className="h-5 w-5" />} />
      </div>

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

function QuickAction({ to, label, tint, icon }: { to: string; label: string; tint: string; icon: ReactNode }) {
  return (
    <Link
      to={to}
      className="flex flex-col items-center gap-1.5 rounded-2xl border border-slate-100 bg-white p-3 shadow-card transition active:scale-[0.98]"
    >
      <span className={"flex h-10 w-10 items-center justify-center rounded-xl text-white " + tint}>{icon}</span>
      <span className="text-[11px] font-semibold text-slate-700">{label}</span>
    </Link>
  );
}
