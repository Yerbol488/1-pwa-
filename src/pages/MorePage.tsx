import { Link } from "react-router-dom";
import { Card, CardBody } from "../components/ui/Card";
import { PageTitle } from "../components/ui/PageTitle";
import { useAppData } from "../context/AppDataContext";
import {
  Wallet,
  Factory,
  Package,
  ScrollText,
  Settings,
  Info,
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
  { to: "/items", label: "Товары и материалы", description: "Каталог и цены", icon: Package, tint: "bg-emerald-50 text-emerald-600" },
  { to: "/activity", label: "Журнал действий", description: "История операций", icon: ScrollText, tint: "bg-amber-50 text-amber-600" },
  { to: "/settings", label: "Настройки компании", description: "Компания, сотрудники, сброс", icon: Settings, tint: "bg-slate-100 text-slate-600" },
];

export function MorePage() {
  const { currentBusiness } = useAppData();

  return (
    <div className="space-y-5">
      <PageTitle title="Еще" subtitle={currentBusiness?.name} />

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

      <Card className="border-amber-100 bg-amber-50/60">
        <CardBody>
          <div className="flex gap-3">
            <Info className="h-5 w-5 shrink-0 text-amber-600" />
            <p className="text-sm text-amber-800">
              Локальный режим: данные хранятся только на этом устройстве. Общий доступ появится после подключения синхронизации.
            </p>
          </div>
        </CardBody>
      </Card>
    </div>
  );
}
