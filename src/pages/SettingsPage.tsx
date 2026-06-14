import type { ReactNode } from "react";
import { useState } from "react";
import { Card, CardBody } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { PageTitle } from "../components/ui/PageTitle";
import { useAppData } from "../context/AppDataContext";
import {
  canInviteMembers,
  canResetCompanyData,
  roleLabel,
} from "../lib/permissions";
import { uid } from "../lib/storage";
import {
  Building2,
  Users,
  RotateCcw,
  UserPlus,
  Info,
  type LucideIcon,
} from "lucide-react";

export function SettingsPage() {
  const { currentBusiness, currentUser, role, businessMemberships, resetDemoData } = useAppData();
  const [inviteOpen, setInviteOpen] = useState(false);
  const [resetOpen, setResetOpen] = useState(false);
  const [demoCode] = useState(() => uid("inv").toUpperCase().slice(-6));

  return (
    <div className="space-y-5">
      <PageTitle title="Настройки" />

      {/* Company */}
      <Section icon={Building2} title="Компания">
        <Row label="Название" value={currentBusiness?.name ?? "—"} />
        <Row label="Текущий пользователь" value={currentUser?.name ?? "—"} />
        <Row label="Роль" value={<Badge tone="blue">{roleLabel(role)}</Badge>} />
        <Row label="Режим" value="Локально на этом устройстве" />
      </Section>

      {/* Local mode notice */}
      <Card className="border-amber-100 bg-amber-50/60">
        <CardBody>
          <div className="flex gap-3">
            <Info className="h-5 w-5 shrink-0 text-amber-600" />
            <p className="text-sm text-amber-800">
              Пока данные хранятся только на этом устройстве. Общий доступ появится после подключения синхронизации.
            </p>
          </div>
        </CardBody>
      </Card>

      {/* Members */}
      <Section icon={Users} title="Сотрудники">
        {businessMemberships.map((m) => (
          <div key={m.id} className="flex items-center justify-between py-3">
            <div className="flex items-center gap-3">
              <span className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100 text-sm font-bold text-slate-600">
                {m.userName.charAt(0)}
              </span>
              <span className="text-sm font-semibold text-slate-900">{m.userName}</span>
            </div>
            <Badge tone={m.role === "owner" ? "blue" : "slate"}>{roleLabel(m.role)}</Badge>
          </div>
        ))}

        {canInviteMembers(role) ? (
          <button
            onClick={() => setInviteOpen(true)}
            className="mt-1 flex w-full items-center justify-center gap-2 rounded-xl border border-dashed border-slate-300 py-3 text-sm font-semibold text-brand-600"
          >
            <UserPlus className="h-5 w-5" /> Пригласить сотрудника
          </button>
        ) : (
          <p className="pt-2 text-xs text-slate-400">
            Приглашение сотрудников доступно владельцу и админу.
          </p>
        )}
      </Section>

      {/* Reset (owner only) */}
      {canResetCompanyData(role) && (
        <Section icon={RotateCcw} title="Данные">
          <p className="py-2 text-sm text-slate-500">
            Сбросить демо-данные: каталог вернется к начальному набору, а продажи, расходы и производство будут очищены.
          </p>
          <Button variant="secondary" fullWidth onClick={() => setResetOpen(true)}>
            <RotateCcw className="h-5 w-5" /> Сбросить демо-данные
          </Button>
        </Section>
      )}

      {/* Invite placeholder modal */}
      <Modal
        open={inviteOpen}
        title="Пригласить сотрудника"
        onClose={() => setInviteOpen(false)}
        footer={
          <Button fullWidth onClick={() => setInviteOpen(false)}>
            Понятно
          </Button>
        }
      >
        <p className="mb-4 text-sm text-slate-600">
          Приглашения заработают после подключения Supabase-синхронизации.
        </p>
        <div className="rounded-xl bg-slate-50 p-4 text-center">
          <p className="text-xs font-medium text-slate-500">Демо-код приглашения</p>
          <p className="mt-1 text-2xl font-extrabold tracking-widest text-slate-900">{demoCode}</p>
          <p className="mt-2 text-xs text-amber-600">Демо-код. На других устройствах пока не работает.</p>
        </div>
      </Modal>

      {/* Reset confirm modal */}
      <Modal
        open={resetOpen}
        title="Сбросить демо-данные?"
        onClose={() => setResetOpen(false)}
        footer={
          <div className="flex gap-3">
            <Button variant="secondary" fullWidth onClick={() => setResetOpen(false)}>
              Назад
            </Button>
            <Button
              variant="danger"
              fullWidth
              onClick={() => {
                resetDemoData();
                setResetOpen(false);
              }}
            >
              Сбросить
            </Button>
          </div>
        }
      >
        <p className="text-sm text-slate-600">
          Каталог вернется к начальному набору позиций. Все продажи, расходы и производство будут удалены. Действие нельзя отменить.
        </p>
      </Modal>
    </div>
  );
}

function Section({ icon: Icon, title, children }: { icon: LucideIcon; title: string; children: ReactNode }) {
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
