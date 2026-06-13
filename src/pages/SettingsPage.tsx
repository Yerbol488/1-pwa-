import type { ReactNode } from "react";
import { Card, CardBody } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { PageTitle } from "../components/ui/PageTitle";
import { useAuth } from "../app/auth";
import { useNavigate } from "react-router-dom";
import { users } from "../data/mockData";
import {
  Building2,
  Users,
  RefreshCw,
  Smartphone,
  Download,
  LogOut,
  ChevronRight,
  type LucideIcon,
} from "lucide-react";

export function SettingsPage() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login");
  }

  return (
    <div className="space-y-5">
      <PageTitle title="Настройки" />

      {/* Компания */}
      <Section icon={Building2} title="Компания">
        <Row label="Название" value="ГазоБлок Астана" />
        <Row label="ИИН/БИН" value="010203456789" />
        <Row label="Валюта" value="₸ (тенге)" />
      </Section>

      {/* Пользователи */}
      <Section icon={Users} title="Пользователи">
        {users.map((u) => (
          <div key={u.id} className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600">
                {u.name.charAt(0)}
              </span>
              <div>
                <p className="text-sm font-semibold text-slate-900">{u.name}</p>
                <p className="text-xs text-slate-400">{u.email}</p>
              </div>
            </div>
            <Badge tone={u.role === "Владелец" ? "blue" : "slate"}>{u.role}</Badge>
          </div>
        ))}
      </Section>

      {/* Синхронизация */}
      <Section icon={RefreshCw} title="Синхронизация">
        <Row label="Статус" value={<Badge tone="amber">3 записи ждут отправки</Badge>} />
        <Row label="Последняя синхр." value="Сегодня, 15:30" />
        <Row label="Авто-синхронизация" value={<Badge tone="green">Включена</Badge>} />
      </Section>

      {/* PWA / Установка */}
      <Section icon={Smartphone} title="PWA / Установка">
        <p className="py-2 text-sm text-slate-500">
          Установите приложение на главный экран для быстрого доступа и работы офлайн.
        </p>
        <Button variant="secondary" fullWidth>
          <Smartphone className="h-5 w-5" /> Установить на устройство
        </Button>
      </Section>

      {/* Экспорт данных */}
      <Section icon={Download} title="Экспорт данных">
        <button className="flex w-full items-center justify-between py-3 text-left">
          <span className="text-sm font-medium text-slate-700">Экспорт в Excel</span>
          <ChevronRight className="h-4 w-4 text-slate-400" />
        </button>
        <button className="flex w-full items-center justify-between py-3 text-left">
          <span className="text-sm font-medium text-slate-700">Экспорт в PDF</span>
          <ChevronRight className="h-4 w-4 text-slate-400" />
        </button>
      </Section>

      <Button variant="ghost" fullWidth onClick={handleLogout} className="text-red-600 hover:bg-red-50">
        <LogOut className="h-5 w-5" /> Выйти из аккаунта
      </Button>
    </div>
  );
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: LucideIcon;
  title: string;
  children: ReactNode;
}) {
  return (
    <Card>
      <CardBody>
        <div className="mb-2 flex items-center gap-2">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
            <Icon className="h-4 w-4" />
          </span>
          <h2 className="text-base font-bold text-slate-900">{title}</h2>
        </div>
        <div className="divide-y divide-slate-100">{children}</div>
      </CardBody>
    </Card>
  );
}

function Row({ label, value }: { label: string; value: ReactNode }) {
  return (
    <div className="flex items-center justify-between py-3">
      <span className="text-sm text-slate-500">{label}</span>
      <span className="text-sm font-semibold text-slate-900">{value}</span>
    </div>
  );
}
