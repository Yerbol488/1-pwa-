import { dashboardSummary } from "../../data/mockData";
import { Bell, CheckCircle2, RefreshCw } from "lucide-react";
import { cn } from "../../lib/format";

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  const pending = dashboardSummary.pendingSync;
  const synced = pending === 0;
  return (
    <header className="sticky top-0 z-20 border-b border-slate-100 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-sm font-extrabold text-white">
            MF
          </div>
          <div>
            <p className="text-[13px] font-bold leading-tight text-slate-900">{title}</p>
            <p className="text-[11px] leading-tight text-slate-400">Material Flow</p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={cn(
              "inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold",
              synced ? "bg-emerald-50 text-emerald-700" : "bg-amber-50 text-amber-700"
            )}
          >
            {synced ? <CheckCircle2 className="h-3.5 w-3.5" /> : <RefreshCw className="h-3.5 w-3.5" />}
            {synced ? "Синхр." : pending}
          </span>
          <button className="flex h-9 w-9 items-center justify-center rounded-xl bg-slate-100 text-slate-500">
            <Bell className="h-5 w-5" />
          </button>
        </div>
      </div>
    </header>
  );
}
