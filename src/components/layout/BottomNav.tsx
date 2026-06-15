import { NavLink } from "react-router-dom";
import { Home, ShoppingCart, Boxes, BarChart3, Menu, type LucideIcon } from "lucide-react";
import { cn } from "../../lib/format";

const items: Array<{ to: string; label: string; icon: LucideIcon }> = [
  { to: "/dashboard", label: "Главная", icon: Home },
  { to: "/sales", label: "Продажи", icon: ShoppingCart },
  { to: "/stock", label: "Склад", icon: Boxes },
  { to: "/reports", label: "Отчеты", icon: BarChart3 },
  { to: "/more", label: "Еще", icon: Menu },
];

export function BottomNav() {
  return (
    <nav className="fixed inset-x-0 bottom-0 z-30 border-t border-slate-100 bg-white/95 backdrop-blur pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto grid max-w-3xl grid-cols-5">
        {items.map(({ to, label, icon: Icon }) => (
          <NavLink
            key={to}
            to={to}
            className={({ isActive }) =>
              cn(
                "flex flex-col items-center gap-1 py-2.5 text-[11px] font-medium transition",
                isActive ? "text-brand-600" : "text-slate-400"
              )
            }
          >
            {({ isActive }) => (
              <>
                <span
                  className={cn(
                    "flex h-8 w-12 items-center justify-center rounded-full transition",
                    isActive && "bg-blue-50"
                  )}
                >
                  <Icon className="h-5 w-5" />
                </span>
                {label}
              </>
            )}
          </NavLink>
        ))}
      </div>
    </nav>
  );
}
