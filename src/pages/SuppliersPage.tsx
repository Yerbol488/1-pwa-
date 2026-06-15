import { useState } from "react";
import { PageTitle } from "../components/ui/PageTitle";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { Badge } from "../components/ui/Badge";
import { Modal } from "../components/ui/Modal";
import { Field } from "../components/ui/Field";
import { useAppData, type SupplierInput } from "../context/AppDataContext";
import { canManageSuppliers } from "../lib/permissions";
import { whatsappLink, copyText } from "../lib/contacts";
import type { Supplier, SupplierStatus } from "../types";
import { Plus, MessageCircle, Copy, Pencil, Archive, Truck } from "lucide-react";

const STATUS_OPTIONS: SupplierStatus[] = ["Активный", "Запасной", "Не использовать"];
const statusTone: Record<SupplierStatus, "green" | "amber" | "red"> = {
  Активный: "green",
  Запасной: "amber",
  "Не использовать": "red",
};

const emptyForm: SupplierInput = {
  name: "",
  contactPerson: "",
  whatsappNumber: "",
  phoneNumber: "",
  sellsText: "",
  comment: "",
  supplierStatus: "Активный",
};

export function SuppliersPage() {
  const { activeSuppliers, addSupplier, updateSupplier, archiveSupplier, showFeedback, role } = useAppData();
  const canManage = canManageSuppliers(role);

  const [open, setOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<SupplierInput>(emptyForm);
  const [error, setError] = useState<string | null>(null);

  function openCreate() {
    setForm(emptyForm);
    setEditingId(null);
    setError(null);
    setOpen(true);
  }
  function openEdit(s: Supplier) {
    setForm({
      name: s.name,
      contactPerson: s.contactPerson,
      whatsappNumber: s.whatsappNumber,
      phoneNumber: s.phoneNumber,
      sellsText: s.sellsText,
      comment: s.comment,
      supplierStatus: s.supplierStatus,
    });
    setEditingId(s.id);
    setError(null);
    setOpen(true);
  }

  function submit() {
    if (!form.name.trim()) return setError("Введите название поставщика.");
    if (editingId) updateSupplier(editingId, form);
    else addSupplier(form);
    setOpen(false);
  }

  async function copyPhone(phone: string) {
    const ok = await copyText(phone);
    showFeedback(ok ? "Номер скопирован." : "Не удалось скопировать.");
  }

  const set = <K extends keyof SupplierInput>(k: K, v: SupplierInput[K]) => setForm((f) => ({ ...f, [k]: v }));

  return (
    <div className="space-y-5">
      <PageTitle
        title="Поставщики"
        subtitle={`${activeSuppliers.length} активных`}
        action={
          canManage && activeSuppliers.length > 0 ? (
            <Button variant="primary" onClick={openCreate}>
              <Plus className="h-5 w-5" /> Добавить
            </Button>
          ) : undefined
        }
      />

      {activeSuppliers.length === 0 ? (
        <Card className="p-6 text-center">
          <span className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-cyan-50 text-cyan-600">
            <Truck className="h-7 w-7" />
          </span>
          <h2 className="text-lg font-extrabold text-slate-900">Пока нет поставщиков</h2>
          <p className="mx-auto mt-1 max-w-xs text-sm text-slate-500">
            Добавьте поставщиков, чтобы привязывать их к покупкам и быстро писать в WhatsApp.
          </p>
          {canManage && (
            <Button variant="primary" size="lg" fullWidth className="mt-5" onClick={openCreate}>
              <Plus className="h-5 w-5" /> Добавить поставщика
            </Button>
          )}
        </Card>
      ) : (
        <div className="space-y-3">
          {activeSuppliers.map((s) => {
            const wa = whatsappLink(s.whatsappNumber);
            return (
              <Card key={s.id} className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">{s.name}</h3>
                    {s.contactPerson && <p className="text-sm text-slate-500">{s.contactPerson}</p>}
                  </div>
                  <Badge tone={statusTone[s.supplierStatus]}>{s.supplierStatus}</Badge>
                </div>

                {s.sellsText && <p className="mt-2 text-sm text-slate-600">Продает: {s.sellsText}</p>}
                {s.phoneNumber && (
                  <p className="mt-2 text-sm text-slate-500">
                    Телефон: <span className="font-semibold text-slate-800 tabular">{s.phoneNumber}</span>
                  </p>
                )}
                {s.comment && <p className="mt-1 text-xs text-slate-400">{s.comment}</p>}

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
                  {s.phoneNumber && (
                    <button
                      onClick={() => copyPhone(s.phoneNumber)}
                      className="inline-flex h-10 items-center gap-1.5 rounded-xl bg-slate-100 px-3 text-sm font-semibold text-slate-700"
                    >
                      <Copy className="h-4 w-4" /> Скопировать номер
                    </button>
                  )}
                </div>

                {canManage && (
                  <div className="mt-3 flex gap-4">
                    <button onClick={() => openEdit(s)} className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 transition hover:text-brand-600">
                      <Pencil className="h-4 w-4" /> Изменить
                    </button>
                    <button onClick={() => archiveSupplier(s.id)} className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 transition hover:text-red-600">
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
        title={editingId ? "Изменить поставщика" : "Новый поставщик"}
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
          <Field label="Название поставщика">
            <input className="form-input" value={form.name} onChange={(e) => set("name", e.target.value)} placeholder="ТОО СтройМатериал" />
          </Field>
          <Field label="Контактное лицо">
            <input className="form-input" value={form.contactPerson} onChange={(e) => set("contactPerson", e.target.value)} placeholder="Асхат" />
          </Field>
          <div className="grid grid-cols-1 gap-3">
            <Field label="WhatsApp номер">
              <input className="form-input" value={form.whatsappNumber} onChange={(e) => set("whatsappNumber", e.target.value)} placeholder="+7 777 123 45 67" />
            </Field>
            <Field label="Телефон">
              <input className="form-input" value={form.phoneNumber} onChange={(e) => set("phoneNumber", e.target.value)} placeholder="+7 777 123 45 67" />
            </Field>
          </div>
          <Field label="Что продает">
            <input className="form-input" value={form.sellsText} onChange={(e) => set("sellsText", e.target.value)} placeholder="цемент, песок, клей" />
          </Field>
          <Field label="Статус">
            <select className="form-input" value={form.supplierStatus} onChange={(e) => set("supplierStatus", e.target.value as SupplierStatus)}>
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
