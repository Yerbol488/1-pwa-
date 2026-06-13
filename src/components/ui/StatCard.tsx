import type { ReactNode } from "react";
import { Card } from "./Card";
import { cn } from "../../lib/format";

type Accent = "blue" | "green" | "red" | "slate";

interface StatCardProps {
  label: string;
  value: string;
  icon?: ReactNode;
  accent?: Accent;
  hint?: string;
}

const accentText: Record<Accent, string> = {
  blue: "text-brand-600",
  green: "text-emerald-600",
  red: "text-red-600",
  slate: "text-slate-900",
};

const accentBg: Record<Accent, string> = {
  blue: "bg-blue-50 text-brand-600",
  green: "bg-emerald-50 text-emerald-600",
  red: "bg-red-50 text-red-600",
  slate: "bg-slate-100 text-slate-600",
};

export function StatCard({ label, value, icon, accent = "slate", hint }: StatCardProps) {
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between">
        <p className="text-sm font-medium text-slate-500">{label}</p>
        {icon && (
          <span className={cn("flex h-9 w-9 items-center justify-center rounded-xl", accentBg[accent])}>
            {icon}
          </span>
        )}
      </div>
      <p className={cn("mt-2 text-2xl font-extrabold tabular", accentText[accent])}>{value}</p>
      {hint && <p className="mt-1 text-xs text-slate-400">{hint}</p>}
    </Card>
  );
}
