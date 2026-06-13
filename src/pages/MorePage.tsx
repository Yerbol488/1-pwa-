import { Link, useNavigate } from "react-router-dom";
import { Card } from "../components/ui/Card";
import { PageTitle } from "../components/ui/PageTitle";
import { useAuth } from "../app/auth";
import {
  Wallet,
  Factory,
  Package,
  ScrollText,
  Settings,
  LogOut,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";

interface MenuLink {
  to: string;
  label: string;
  description: string;
  icon: LucideIcon;
  tint: string;
}

const links: MenuLink[] = [
  { to: "/expenses", label: "Расходы", description: "Учет затрат", icon: Wallet, tint: "bg-red-50 text-red-600" },
  { to: "/production", label: "Производство", description: "Выпуск продукции", icon: Factory, tint: "bg-blue-50 text-brand-600" },
  { to: "/items", label: "Товары", description: "Каталог и цены", icon: Package, tint: "bg-emerald-50 text-emerald-600" },
  { to: "/activity", label: "Журнал", description: "История действий", icon: ScrollText, tint: "bg-amber-50 text-amber-600" },
  { to: "/settings", label: "Настройки", description: "Компания и пользователи", icon: Settings, tint: "bg-slate-100 text-slate-600" },
];

export function MorePage() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  return (
    <div className="space-y-5">
      <PageTitle title="Еще" subtitle="Дополнительные разделы" />

      <Card>
        <div className="divide-y divide-slate-100">
          {links.map(({ to, label, description, icon: Icon, tint }) => (
            <Link key={to} to={to} className="flex items-center gap-3 px-4 py-3.5">
              <span className={"flex h-10 w-10 items-center justify-center rounded-xl " + tint}>
                <Icon className="h-5 w-5" />
              </span>
              <div className="flex-1">
                <p className="text-sm font-semibold text-slate-900">{label}</p>
                <p className="text-xs text-slate-400">{description}</p>
              </div>
              <ChevronRight className="h-5 w-5 text-slate-300" />
            </Link>
          ))}
        </div>
      </Card>

      <button
        onClick={() => {
          logout();
          navigate("/login");
        }}
        className="flex w-full items-center justify-center gap-2 rounded-xl py-3 text-sm font-semibold text-red-600 transition hover:bg-red-50"
      >
        <LogOut className="h-5 w-5" /> Выйти из аккаунта
      </button>
    </div>
  );
}
