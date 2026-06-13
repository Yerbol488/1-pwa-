import { Card, CardHeader } from "../components/ui/Card";
import { StatCard } from "../components/ui/StatCard";
import { PageTitle } from "../components/ui/PageTitle";
import { reportSummary, weeklyBars } from "../data/mockData";
import { formatNumber, formatTenge } from "../lib/format";
import { TrendingUp, TrendingDown, Wallet, Trophy } from "lucide-react";

export function ReportsPage() {
  const maxValue = Math.max(...weeklyBars.map((b) => Math.max(b.revenue, b.expense)));

  return (
    <div className="space-y-5">
      <PageTitle title="Отчеты" subtitle="За текущую неделю" />

      <div className="grid grid-cols-2 gap-3">
        <StatCard
          label="Выручка за неделю"
          value={formatTenge(reportSummary.revenueWeek)}
          accent="blue"
          icon={<TrendingUp className="h-5 w-5" />}
        />
        <StatCard
          label="Расходы за неделю"
          value={formatTenge(reportSummary.expenseWeek)}
          accent="red"
          icon={<TrendingDown className="h-5 w-5" />}
        />
        <StatCard
          label="Прибыль"
          value={formatTenge(reportSummary.profitWeek)}
          accent="green"
          icon={<Wallet className="h-5 w-5" />}
        />
        <StatCard
          label="Самый продаваемый"
          value={reportSummary.topItem}
          accent="slate"
          icon={<Trophy className="h-5 w-5" />}
          hint={`${formatNumber(reportSummary.topItemUnits)} шт за неделю`}
        />
      </div>

      {/* Bar chart built from plain divs */}
      <Card>
        <CardHeader>
          <h2 className="text-base font-bold text-slate-900">Выручка и расходы</h2>
          <div className="flex items-center gap-3 text-xs font-medium text-slate-500">
            <span className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-sm bg-brand-500" /> Выручка
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2.5 w-2.5 rounded-sm bg-red-400" /> Расход
            </span>
          </div>
        </CardHeader>
        <div className="px-4 pb-5 pt-2">
          <div className="flex items-end justify-between gap-2" style={{ height: 180 }}>
            {weeklyBars.map((b) => (
              <div key={b.label} className="flex flex-1 flex-col items-center gap-1.5">
                <div className="flex h-full w-full items-end justify-center gap-1">
                  <div
                    className="w-1/2 rounded-t-md bg-brand-500 transition-all"
                    style={{ height: `${(b.revenue / maxValue) * 100}%` }}
                    title={formatTenge(b.revenue)}
                  />
                  <div
                    className="w-1/2 rounded-t-md bg-red-400 transition-all"
                    style={{ height: `${(b.expense / maxValue) * 100}%` }}
                    title={formatTenge(b.expense)}
                  />
                </div>
                <span className="text-[11px] font-medium text-slate-400">{b.label}</span>
              </div>
            ))}
          </div>
        </div>
      </Card>
    </div>
  );
}
