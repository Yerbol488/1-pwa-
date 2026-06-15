import { useMemo, useState } from "react";
import { Card, CardHeader } from "../components/ui/Card";
import { StatCard } from "../components/ui/StatCard";
import { PageTitle } from "../components/ui/PageTitle";
import { useAppData } from "../context/AppDataContext";
import { cn, formatNumber, formatTenge } from "../lib/format";
import {
  PERIOD_OPTIONS,
  getPeriodRange,
  monthRange,
  filterByRange,
  getSalesByTimeBucket,
  bestTimeBucket,
  type DateRange,
  type PeriodKey,
} from "../lib/reports";
import { TrendingUp, TrendingDown, Wallet, Clock } from "lucide-react";

type Mode = PeriodKey | "pick_month" | "pick_range";

export function ReportsPage() {
  const { activeSales, activeStockPurchases, activeOneOff, activeFixed, activeProduction } = useAppData();
  const [mode, setMode] = useState<Mode>("month");
  const [monthVal, setMonthVal] = useState(() => new Date().toISOString().slice(0, 7)); // YYYY-MM
  const [startDate, setStartDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [endDate, setEndDate] = useState(() => new Date().toISOString().slice(0, 10));

  const range = useMemo<DateRange>(() => {
    if (mode === "pick_month") {
      const [y, m] = monthVal.split("-").map(Number);
      if (y && m) return monthRange(y, m - 1);
      return getPeriodRange("month");
    }
    if (mode === "pick_range") {
      const start = new Date(startDate);
      const end = new Date(endDate);
      end.setHours(23, 59, 59, 999);
      return { start, end };
    }
    return getPeriodRange(mode);
  }, [mode, monthVal, startDate, endDate]);

  const sales = useMemo(() => filterByRange(activeSales, range), [activeSales, range]);
  const purchases = useMemo(() => filterByRange(activeStockPurchases, range), [activeStockPurchases, range]);
  const oneOff = useMemo(() => filterByRange(activeOneOff, range), [activeOneOff, range]);
  const fixed = useMemo(() => filterByRange(activeFixed, range), [activeFixed, range]);
  const productionRecs = useMemo(() => filterByRange(activeProduction, range), [activeProduction, range]);

  const revenue = sales.reduce((s, x) => s + x.total, 0);
  const stockExp = purchases.reduce((s, x) => s + x.totalAmount, 0);
  const oneOffExp = oneOff.reduce((s, x) => s + x.amount + x.deliveryCost, 0);
  const fixedExp = fixed.reduce((s, x) => s + x.amount, 0);
  const totalExp = stockExp + oneOffExp + fixedExp;
  const profit = revenue - totalExp;
  const productionQty = productionRecs.reduce((s, x) => s + x.quantity, 0);

  const groups = [
    { label: "Покупки на склад", value: stockExp, color: "bg-indigo-500" },
    { label: "Разовые расходы", value: oneOffExp, color: "bg-red-400" },
    { label: "Постоянные расходы", value: fixedExp, color: "bg-amber-400" },
  ];
  const maxGroup = Math.max(1, ...groups.map((g) => g.value));

  const topItems = useMemo(() => {
    const map = new Map<string, number>();
    sales.forEach((s) => map.set(s.itemName, (map.get(s.itemName) ?? 0) + s.quantity));
    return [...map.entries()].sort((a, b) => b[1] - a[1]).slice(0, 5);
  }, [sales]);
  const maxTop = topItems.length ? topItems[0][1] : 1;

  const buckets = useMemo(() => getSalesByTimeBucket(sales), [sales]);
  const best = bestTimeBucket(buckets);
  const maxBucket = Math.max(1, ...buckets.map((b) => b.revenue));

  return (
    <div className="space-y-5">
      <PageTitle title="Отчеты" subtitle="Аналитика по активным записям" />

      {/* Period filter */}
      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 no-scrollbar">
        {PERIOD_OPTIONS.map((p) => (
          <button
            key={p.key}
            onClick={() => setMode(p.key)}
            className={cn(
              "shrink-0 rounded-full px-3.5 py-2 text-sm font-semibold transition",
              mode === p.key ? "bg-brand-600 text-white" : "bg-white text-slate-500 shadow-card"
            )}
          >
            {p.label}
          </button>
        ))}
        <button
          onClick={() => setMode("pick_month")}
          className={cn(
            "shrink-0 rounded-full px-3.5 py-2 text-sm font-semibold transition",
            mode === "pick_month" ? "bg-brand-600 text-white" : "bg-white text-slate-500 shadow-card"
          )}
        >
          Выбрать месяц
        </button>
        <button
          onClick={() => setMode("pick_range")}
          className={cn(
            "shrink-0 rounded-full px-3.5 py-2 text-sm font-semibold transition",
            mode === "pick_range" ? "bg-brand-600 text-white" : "bg-white text-slate-500 shadow-card"
          )}
        >
          Выбрать период
        </button>
      </div>

      {mode === "pick_month" && (
        <input type="month" className="form-input" value={monthVal} onChange={(e) => setMonthVal(e.target.value)} />
      )}
      {mode === "pick_range" && (
        <div className="grid grid-cols-2 gap-3">
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-600">С</span>
            <input type="date" className="form-input" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </label>
          <label className="block">
            <span className="mb-1.5 block text-sm font-medium text-slate-600">По</span>
            <input type="date" className="form-input" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </label>
        </div>
      )}

      <div className="grid grid-cols-2 gap-3">
        <StatCard label="Выручка" value={formatTenge(revenue)} accent="blue" icon={<TrendingUp className="h-5 w-5" />} />
        <StatCard label="Расходы" value={formatTenge(totalExp)} accent="red" icon={<TrendingDown className="h-5 w-5" />} />
        <StatCard label="Прибыль" value={formatTenge(profit)} accent={profit < 0 ? "red" : "green"} icon={<Wallet className="h-5 w-5" />} />
        <StatCard
          label="Продаж"
          value={formatNumber(sales.length)}
          accent="slate"
          hint={`Произведено: ${formatNumber(productionQty)}`}
        />
      </div>

      {/* Revenue vs expenses bar */}
      <Card>
        <CardHeader>
          <h2 className="text-base font-bold text-slate-900">Выручка и расходы</h2>
        </CardHeader>
        <div className="space-y-3 px-4 pb-5 pt-1">
          <Bar label="Выручка" value={revenue} max={Math.max(1, revenue, totalExp)} color="bg-brand-500" />
          <Bar label="Расходы" value={totalExp} max={Math.max(1, revenue, totalExp)} color="bg-red-400" />
        </div>
      </Card>

      {/* Expenses by group */}
      <Card>
        <CardHeader>
          <h2 className="text-base font-bold text-slate-900">Расходы по группам</h2>
        </CardHeader>
        <div className="space-y-3 px-4 pb-5 pt-1">
          {totalExp === 0 && <p className="text-sm text-slate-400">Нет расходов за период.</p>}
          {totalExp > 0 &&
            groups.map((g) => <Bar key={g.label} label={g.label} value={g.value} max={maxGroup} color={g.color} />)}
        </div>
      </Card>

      {/* Sales by time of day */}
      <Card>
        <CardHeader>
          <h2 className="text-base font-bold text-slate-900">Продажи по времени</h2>
          {best && (
            <span className="flex items-center gap-1 text-xs font-semibold text-emerald-600">
              <Clock className="h-3.5 w-3.5" /> Лучшее: {best.label}
            </span>
          )}
        </CardHeader>
        <div className="px-4 pb-5 pt-1">
          {sales.length === 0 ? (
            <p className="text-sm text-slate-400">Недостаточно данных для анализа по времени.</p>
          ) : (
            <div className="flex items-end justify-between gap-1.5" style={{ height: 150 }}>
              {buckets.map((b) => (
                <div key={b.label} className="flex flex-1 flex-col items-center gap-1.5">
                  <div className="flex h-full w-full items-end justify-center">
                    <div
                      className={cn("w-full max-w-[26px] rounded-t-md", b.count > 0 ? "bg-brand-500" : "bg-slate-100")}
                      style={{ height: `${(b.revenue / maxBucket) * 100}%` }}
                      title={`${formatTenge(b.revenue)} · ${b.count} продаж`}
                    />
                  </div>
                  <span className="text-center text-[9px] font-medium leading-tight text-slate-400">
                    {b.label.replace("–", "\n")}
                  </span>
                </div>
              ))}
            </div>
          )}
          {best && (
            <p className="mt-3 text-sm text-slate-500">
              Лучшее время продаж: <span className="font-bold text-slate-900">{best.label}</span> · продаж {best.count} ·
              выручка {formatTenge(best.revenue)}
            </p>
          )}
        </div>
      </Card>

      {/* Top products */}
      <Card>
        <CardHeader>
          <h2 className="text-base font-bold text-slate-900">Топ товаров по продажам</h2>
        </CardHeader>
        <div className="space-y-3 px-4 pb-5 pt-1">
          {topItems.length === 0 && <p className="text-sm text-slate-400">Пока нет продаж.</p>}
          {topItems.map(([name, qty]) => (
            <Bar key={name} label={name} value={qty} max={maxTop} color="bg-emerald-500" valueText={formatNumber(qty)} />
          ))}
        </div>
      </Card>

      <p className="px-1 text-xs text-slate-400">
        Отмененные записи не учитываются в суммах. Данные хранятся локально на этом устройстве.
      </p>
    </div>
  );
}

function Bar({
  label,
  value,
  max,
  color,
  valueText,
}: {
  label: string;
  value: number;
  max: number;
  color: string;
  valueText?: string;
}) {
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="font-medium text-slate-700">{label}</span>
        <span className="font-bold text-slate-900 tabular">{valueText ?? formatTenge(value)}</span>
      </div>
      <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-100">
        <div className={cn("h-full rounded-full", color)} style={{ width: `${Math.min(100, (value / max) * 100)}%` }} />
      </div>
    </div>
  );
}
