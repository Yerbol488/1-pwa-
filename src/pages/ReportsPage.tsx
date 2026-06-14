import { useMemo } from "react";
import { Card, CardHeader } from "../components/ui/Card";
import { StatCard } from "../components/ui/StatCard";
import { PageTitle } from "../components/ui/PageTitle";
import { useAppData } from "../context/AppDataContext";
import { formatNumber, formatTenge } from "../lib/format";
import { TrendingUp, TrendingDown, Wallet, ShoppingCart } from "lucide-react";

export function ReportsPage() {
  const { activeSales, activeExpenses, activeProduction } = useAppData();

  const revenue = activeSales.reduce((s, x) => s + x.total, 0);
  const expenses = activeExpenses.reduce((s, x) => s + x.amount, 0);
  const profit = revenue - expenses;
  const productionQty = activeProduction.reduce((s, x) => s + x.quantity, 0);

  // Top items by sold quantity (active sales only).
  const topItems = useMemo(() => {
    const map = new Map<string, number>();
    activeSales.forEach((s) => map.set(s.itemName, (map.get(s.itemName) ?? 0) + s.quantity));
    return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [activeSales]);
  const maxTop = topItems.length ? topItems[0][1] : 0;

  return (
    <div className="space-y-5">
      <PageTitle title="Отчеты" subtitle="По всем активным записям" />

      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Выручка" value={formatTenge(revenue)} accent="blue" icon={<TrendingUp className="h-5 w-5" />} />
        <StatCard label="Расходы" value={formatTenge(expenses)} accent="red" icon={<TrendingDown className="h-5 w-5" />} />
        <StatCard
          label="Прибыль"
          value={formatTenge(profit)}
          accent={profit < 0 ? "red" : "green"}
          icon={<Wallet className="h-5 w-5" />}
        />
        <StatCard
          label="Продаж"
          value={formatNumber(activeSales.length)}
          accent="slate"
          icon={<ShoppingCart className="h-5 w-5" />}
          hint={`Произведено: ${formatNumber(productionQty)}`}
        />
      </div>

      <Card>
        <CardHeader>
          <h2 className="text-base font-bold text-slate-900">Топ товаров по продажам</h2>
        </CardHeader>
        <div className="space-y-3 px-4 pb-5 pt-1">
          {topItems.length === 0 && <p className="text-sm text-slate-400">Пока нет продаж.</p>}
          {topItems.map(([name, qty]) => (
            <div key={name}>
              <div className="mb-1 flex items-center justify-between text-sm">
                <span className="font-medium text-slate-700">{name}</span>
                <span className="font-bold text-slate-900 tabular">{formatNumber(qty)}</span>
              </div>
              <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
                <div
                  className="h-full rounded-full bg-brand-500"
                  style={{ width: `${maxTop ? (qty / maxTop) * 100 : 0}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      <p className="px-1 text-xs text-slate-400">
        Отмененные записи не учитываются в суммах. Данные хранятся локально на этом устройстве.
      </p>
    </div>
  );
}
