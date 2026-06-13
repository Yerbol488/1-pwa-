import type { ReactNode } from "react";

interface PageTitleProps {
  title: string;
  subtitle?: string;
  action?: ReactNode;
}

export function PageTitle({ title, subtitle, action }: PageTitleProps) {
  return (
    <div className="flex items-end justify-between gap-3 mb-4">
      <div>
        <h1 className="text-xl font-extrabold text-slate-900">{title}</h1>
        {subtitle && <p className="text-sm text-slate-500 mt-0.5">{subtitle}</p>}
      </div>
      {action}
    </div>
  );
}
