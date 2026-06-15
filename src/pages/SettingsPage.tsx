import type { ReactNode } from "react";
import { useState } from "react";
import { Card, CardBody } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Button } from "../components/ui/Button";
import { Modal } from "../components/ui/Modal";
import { PageTitle } from "../components/ui/PageTitle";
import { useAppData } from "../context/AppDataContext";
import { Field } from "../components/ui/Field";
import { canInviteMembers, canResetCompanyData, roleLabel } from "../lib/permissions";
import { Building2, Users, Info, RotateCcw, UserPlus, Lock, LogOut, type LucideIcon } from "lucide-react";

export function SettingsPage() {
  const { currentBusiness, currentUser, role, businessMemberships, resetData, pinSet, logout, setPin } = useAppData();
  const [resetOpen, setResetOpen] = useState(false);
  const [pinOpen, setPinOpen] = useState(false);
  const [pin, setPinValue] = useState("");
  const [pin2, setPin2] = useState("");
  const [pinError, setPinError] = useState<string | null>(null);

  function openPin() {
    setPinValue("");
    setPin2("");
    setPinError(null);
    setPinOpen(true);
  }
  function savePin() {
    if (pin.trim().length < 4) return setPinError("PIN-код должен быть не короче 4 символов.");
    if (pin.trim() !== pin2.trim()) return setPinError("PIN-коды не совпадают.");
    setPin(pin.trim());
    setPinOpen(false);
  }

  return (
    <div className="space-y-5">
      <PageTitle title="Настройки" />

      <Section icon={Building2} title="Компания">
        <Row label="Название" value={currentBusiness?.name ?? "—"} />
        <Row label="Текущий пользователь" value={currentUser?.name ?? "—"} />
        <Row label="Роль" value={<Badge tone="blue">{roleLabel(role)}</Badge>} />
        <Row label="Режим" value="Локально на этом устройстве" />
      </Section>

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

      <Section icon={Lock} title="Локальный доступ">
        <Row label="PIN-код" value={pinSet ? <Badge tone="green">Установлен</Badge> : <Badge tone="slate">Не задан</Badge>} />
        <p className="py-2 text-xs text-slate-400">
          Локальная защита. Настоящий вход появится после подключения Supabase.
        </p>
        <div className="space-y-2 pt-1">
          <Button variant="secondary" fullWidth onClick={openPin}>
            <Lock className="h-5 w-5" /> {pinSet ? "Сменить PIN-код" : "Установить PIN-код"}
          </Button>
          {pinSet && (
            <Button variant="ghost" fullWidth onClick={logout} className="text-red-600 hover:bg-red-50">
              <LogOut className="h-5 w-5" /> Выйти
            </Button>
          )}
        </div>
      </Section>

      <Section icon={Users} title="Сотрудники и доступ">
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

        {canInviteMembers(role) && (
          <div className="mt-2 rounded-xl bg-slate-50 p-3">
            <p className="text-sm font-semibold text-slate-800">Приглашения скоро</p>
            <p className="mt-1 text-xs text-slate-500">
              После подключения облачной синхронизации вы сможете приглашать сотрудников по ссылке или коду. Сейчас данные
              хранятся только на этом устройстве.
            </p>
            <Button variant="secondary" fullWidth disabled className="mt-3">
              <UserPlus className="h-5 w-5" /> Пригласить сотрудника — скоро
            </Button>
          </div>
        )}
      </Section>

      {canResetCompanyData(role) && (
        <Section icon={RotateCcw} title="Данные">
          <p className="py-2 text-sm text-slate-500">
            Сброс данных удалит все записи компании. Можно начать с пустого учета или загрузить демо-данные.
          </p>
          <Button variant="secondary" fullWidth onClick={() => setResetOpen(true)}>
            <RotateCcw className="h-5 w-5" /> Сбросить данные
          </Button>
        </Section>
      )}

      <Modal
        open={resetOpen}
        title="Сбросить данные компании?"
        onClose={() => setResetOpen(false)}
        footer={
          <div className="space-y-2">
            <Button
              variant="secondary"
              fullWidth
              onClick={() => {
                resetData("demo");
                setResetOpen(false);
              }}
            >
              Сбросить и загрузить демо-данные
            </Button>
            <Button
              variant="danger"
              fullWidth
              onClick={() => {
                resetData("empty");
                setResetOpen(false);
              }}
            >
              Сбросить и начать с пустого
            </Button>
            <Button variant="ghost" fullWidth onClick={() => setResetOpen(false)}>
              Отмена
            </Button>
          </div>
        }
      >
        <p className="text-sm text-slate-600">
          Все товары, продажи, покупки, расходы, производство и поставщики будут удалены. Действие нельзя отменить.
        </p>
      </Modal>

      <Modal
        open={pinOpen}
        title={pinSet ? "Сменить PIN-код" : "Установить PIN-код"}
        onClose={() => setPinOpen(false)}
        footer={
          <div className="flex gap-3">
            <Button variant="secondary" fullWidth onClick={() => setPinOpen(false)}>
              Отмена
            </Button>
            <Button variant="primary" fullWidth onClick={savePin}>
              Сохранить
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          <Field label="PIN-код">
            <input
              type="password"
              inputMode="numeric"
              value={pin}
              onChange={(e) => setPinValue(e.target.value)}
              className="form-input text-center text-lg tracking-[0.4em]"
              placeholder="••••"
            />
          </Field>
          <Field label="Повтор PIN">
            <input
              type="password"
              inputMode="numeric"
              value={pin2}
              onChange={(e) => setPin2(e.target.value)}
              className="form-input text-center text-lg tracking-[0.4em]"
              placeholder="••••"
            />
          </Field>
          <p className="text-xs text-slate-400">Локальная защита, не настоящая безопасность.</p>
          {pinError && <p className="text-sm font-medium text-red-600">{pinError}</p>}
        </div>
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
