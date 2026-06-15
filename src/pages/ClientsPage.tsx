import { useState } from "react";
import { PageTitle } from "../components/ui/PageTitle";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Modal } from "../components/ui/Modal";
import { Field } from "../components/ui/Field";
import { useAppData, type ClientInput } from "../context/AppDataContext";
import { canManageSuppliers } from "../lib/permissions";
import { whatsappLink, copyText } from "../lib/contacts";
import type { Client, ClientStatus } from "../types";
import { Plus, MessageCircle, Copy, Pencil, Archive, Users } from "lucide-react";

const STATUS_OPTIONS: ClientStatus[] = ["Новый", "Думает", "Заказал", "Оплатил", "Доставлено", "Отказался"];
const statusTone: Record<ClientStatus, "blue" | "amber" | "green" | "red" | "slate"> = {
  Новый: "blue",
  Думает: "amber",
  Заказал: "blue",
  Оплатил: "green",
  Доставлено: "green",
  Отказался: "red",
};

const emptyForm: ClientInput = {
  name: "",
  contactPerson: "",
  whatsappNumber: "",
  phoneNumber: "",
  interestText: "",
  clientStatus: "Новый",
  comment: "",
};

export function ClientsPage() {
  const { activeClients, addClient, updateClient, archiveClient, showFeedback, role } = useAppData();
  const canManage = canManageSuppliers(role);

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<ClientInput>(emptyForm);
  const [error, setError] = useState<string | null>(null);

  function openCreate() {
    setForm(emptyForm);
    setEditingId(null);
    setError(null);
    setOpen(true);
  }
  function openEdit(c: Client) {
    setForm({
      name: c.name,
      contactPerson: c.contactPerson,
      whatsappNumber: c.whatsappNumber,
      phoneNumber: c.phoneNumber,
      interestText: c.interestText,
      clientStatus: c.clientStatus,
      comment: c.comment,
    });
    setEditingId(c.id);
    setError(null);
    setOpen(true);
  }
  function submit() {
    if (!form.name.trim()) return setError("Введите имя клиента.");
    if (editingId) updateClient(editingId, form);
    else addClient(form);
    setOpen(false);
  }
  async function copyPhone(phone: string) {
    const ok = await copyText(phone);
    showFeedback(ok ? "Номер скопирован." : "Не удалось скопировать.");
  }

  const set = <K extends keyof ClientInput>(k: K, v: ClientInput[K]) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="space-y-5">
      <PageTitle
        title="Контакты / CRM"
        subtitle={`${activeClients.length} клиентов`}
        action={
          canManage && activeClients.length > 0 ? (
            <Button variant="primary" onClick={openCreate}>
              <Plus className="h-5 w-5" /> Добавить
            </Button>
          ) : undefined
        }
      />

      {activeClients.length === 0 ? (
        <Card className="p-6 text-center">
          <span className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-brand-600">
            <Users className="h-7 w-7" />
          </span>
          <h2 className="text-lg font-extrabold text-slate-900">Пока нет клиентов</h2>
          <p className="mx-auto mt-1 max-w-xs text-sm text-slate-500">
            Добавляйте клиентов, отслеживайте статус и пишите им в WhatsApp.
          </p>
          {canManage && (
            <Button variant="primary" size="lg" fullWidth className="mt-5" onClick={openCreate}>
              <Plus className="h-5 w-5" /> Добавить клиента
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-3">
          {activeClients.map((c) => {
            const wa = whatsappLink(c.whatsappNumber);
            return (
              <Card key={c.id} className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{c.name}</h3>
                    {c.contactPerson && <p className="text-sm text-slate-500">{c.contactPerson}</p>}
                  </div>
                  <Badge tone={statusTone[c.clientStatus]}>{c.clientStatus}</Badge>
                </div>

                {c.interestText && <p className="mt-2 text-sm text-slate-600">Интересует: {c.interestText}</p>}
                {c.phoneNumber && (
                  <p className="mt-2 text-sm text-slate-500">
                    Телефон: <span className="font-semibold text-slate-800 tabular">{c.phoneNumber}</span>
                  </p>
                )}
                {c.comment && <p className="mt-1 text-xs text-slate-400">{c.comment}</p>}

                <div className="mt-3 flex flex-wrap gap-2">
                  {wa && (
                    <a
                      href={wa}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-emerald-600 px-3 text-sm font-semibold text-white"
                    >
                      <MessageCircle className="h-4 w-4" /> WhatsApp
                    </a>
                  )}
                  {c.phoneNumber && (
                    <button
                      onClick={() => copyPhone(c.phoneNumber)}
                      className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-slate-100 px-3 text-sm font-semibold text-slate-700"
                    >
                      <Copy className="h-4 w-4" /> Скопировать номер
                    </button>
                  )}
                </div>

                {canManage && (
                  <div className="mt-3 flex gap-4">
                    <button onClick={() => openEdit(c)} className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 transition hover:text-brand-600">
                      <Pencil className="h-4 w-4" /> Изменить
                    </button>
                    <button onClick={() => archiveClient(c.id)} className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 transition hover:text-red-600">
                      <Archive className="h-4 w-4" /> В архив
                    </button>
                  </div>
                )}
              </Card>
            );
          })}
        </div>
      )}

      <Modal
        open={open}
        title={editingId ? "Изменить клиента" : "Новый клиент"}
        onClose={() => setOpen(false)}
        footer={
          <div className="flex gap-3">
            <Button variant="secondary" fullWidth onClick={() => setOpen(false)}>
              Отмена
            </Button>
            <Button variant="primary" fullWidth onClick={submit}>
              Сохранить
            </Button>
          </div>
        }
      >
        <div className="space-y-3">
          <Field label="Имя клиента">
            <input className="form-input" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="Например: Айгерим" />
          </Field>
          <Field label="Контактное лицо">
            <input className="form-input" value={form.contactPerson} onChange={(e) => set("contactPerson", e.target.value)} placeholder="Необязательно" />
          </Field>
          <Field label="WhatsApp номер">
            <input className="form-input" value={form.whatsappNumber} onChange={(e) => set("whatsappNumber", e.target.value)} placeholder="+7 777 123 45 67" />
          </Field>
          <Field label="Телефон">
            <input className="form-input" value={form.phoneNumber} onChange={(e) => set("phoneNumber", e.target.value)} placeholder="+7 777 123 45 67" />
          </Field>
          <Field label="Что интересует">
            <input className="form-input" value={form.interestText} onChange={(e) => set("interestText", e.target.value)} placeholder="Например: газоблок 1000 шт" />
          </Field>
          <Field label="Статус">
            <select className="form-input" value={form.clientStatus} onChange={(e) => set("clientStatus", e.target.value as ClientStatus)}>
              {STATUS_OPTIONS.map((s) => (
                <option key={s}>{s}</option>
              ))}
            </select>
          </Field>
          <Field label="Комментарий">
            <input className="form-input" value={form.comment} onChange={(e) => set("comment", e.target.value)} placeholder="Необязательно" />
          </Field>
          {error && <p className="text-sm font-medium text-red-600">{error}</p>}
        </div>
      </Modal>
    </div>
  );
}
