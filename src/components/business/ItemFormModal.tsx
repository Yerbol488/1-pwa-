import { useEffect, useState } from "react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Field } from "../ui/Field";
import { cn } from "../../lib/format";
import { iconOrder, iconPresets, itemIcons, itemIconTints } from "../../data/icons";
import { TYPE_OPTIONS, defaultFlagsForType } from "../../lib/items";
import type { ItemInput } from "../../context/AppDataContext";
import type { ItemIconKey, ItemType } from "../../types";

export interface ItemFormSeed {
  name: string;
  type: ItemType;
  unit: string;
  salePrice: string;
  purchasePrice: string;
  stockQuantity: string;
  icon: ItemIconKey;
  comment: string;
  attributes: Array<{ key: string; value: string }>;
  sellable: boolean;
  purchasable: boolean;
  stockTracked: boolean;
  consumableInProduction: boolean;
}

export const emptySeed: ItemFormSeed = {
  name: "",
  type: "product",
  unit: "шт",
  salePrice: "",
  purchasePrice: "",
  stockQuantity: "",
  icon: "box",
  comment: "",
  attributes: [],
  ...defaultFlagsForType("product"),
};

const FLAG_LABELS: Array<{ key: keyof ItemFormSeed; label: string }> = [
  { key: "sellable", label: "Можно продавать" },
  { key: "purchasable", label: "Можно покупать" },
  { key: "stockTracked", label: "Учитывать на складе" },
  { key: "consumableInProduction", label: "Используется в производстве" },
];

export function ItemFormModal({
  open,
  title,
  seed,
  onClose,
  onSubmit,
}: {
  open: boolean;
  title: string;
  seed: ItemFormSeed;
  onClose: () => void;
  onSubmit: (input: ItemInput) => void;
}) {
  const [form, setForm] = useState<ItemFormSeed>(seed);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (open) {
      setForm(seed);
      setError(null);
    }
  }, [open, seed]);

  const set = <K extends keyof ItemFormSeed>(key: K, value: ItemFormSeed[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  // Picking a type applies its sensible default flags (still editable).
  function pickType(type: ItemType) {
    setForm((f) => ({ ...f, type, ...defaultFlagsForType(type) }));
  }

  const addAttr = () => set("attributes", [...form.attributes, { key: "", value: "" }]);
  const updateAttr = (i: number, field: "key" | "value", value: string) =>
    set("attributes", form.attributes.map((a, idx) => (idx === i ? { ...a, [field]: value } : a)));
  const removeAttr = (i: number) => set("attributes", form.attributes.filter((_, idx) => idx !== i));

  function handleSubmit() {
    if (!form.name.trim()) return setError("Введите название позиции.");
    if (!form.unit.trim()) return setError("Укажите единицу измерения.");
    onSubmit({
      name: form.name,
      type: form.type,
      unit: form.unit,
      salePrice: Number(form.salePrice) || 0,
      purchasePrice: Number(form.purchasePrice) || 0,
      stockQuantity: Number(form.stockQuantity) || 0,
      icon: form.icon,
      comment: form.comment,
      attributes: form.attributes,
      sellable: form.sellable,
      purchasable: form.purchasable,
      stockTracked: form.stockTracked,
      consumableInProduction: form.consumableInProduction,
    });
  }

  return (
    <Modal
      open={open}
      title={title}
      onClose={onClose}
      footer={
        <div className="flex gap-3">
          <Button variant="secondary" fullWidth onClick={onClose}>
            Отмена
          </Button>
          <Button variant="primary" fullWidth onClick={handleSubmit}>
            Сохранить
          </Button>
        </div>
      }
    >
      <div className="space-y-4">
        <Field label="Название">
          <input
            className="form-input"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="Например: Цемент"
          />
        </Field>

        {/* Quick type select */}
        <div>
          <span className="mb-1.5 block text-sm font-medium text-slate-600">Быстрый выбор типа</span>
          <div className="flex flex-wrap gap-2">
            {TYPE_OPTIONS.map((o) => (
              <button
                key={o.type}
                type="button"
                onClick={() => pickType(o.type)}
                className={cn(
                  "rounded-xl border px-3 py-2 text-sm font-medium transition",
                  form.type === o.type
                    ? "border-brand-500 bg-blue-50 text-brand-700"
                    : "border-slate-200 bg-white text-slate-600"
                )}
              >
                {o.label}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Ед. измерения">
            <input
              className="form-input"
              value={form.unit}
              onChange={(e) => set("unit", e.target.value)}
              placeholder="шт, мешок, м²"
            />
          </Field>
          <Field label="Остаток">
            <input
              className="form-input"
              inputMode="numeric"
              value={form.stockQuantity}
              onChange={(e) => set("stockQuantity", e.target.value)}
              placeholder="0"
            />
          </Field>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <Field label="Цена продажи">
            <input
              className="form-input"
              inputMode="numeric"
              value={form.salePrice}
              onChange={(e) => set("salePrice", e.target.value)}
              placeholder="0"
            />
          </Field>
          <Field label="Цена закупа">
            <input
              className="form-input"
              inputMode="numeric"
              value={form.purchasePrice}
              onChange={(e) => set("purchasePrice", e.target.value)}
              placeholder="0"
            />
          </Field>
        </div>

        {/* Icon picker */}
        <div>
          <span className="mb-1.5 block text-sm font-medium text-slate-600">Выберите иконку</span>
          <div className="flex flex-wrap gap-2">
            {iconOrder.map((key) => {
              const Icon = itemIcons[key];
              const active = form.icon === key;
              const label = iconPresets.find((p) => p.key === key)?.label;
              return (
                <button
                  key={key}
                  type="button"
                  title={label}
                  onClick={() => set("icon", key)}
                  className={cn(
                    "flex h-10 w-10 items-center justify-center rounded-xl border transition",
                    active ? "border-brand-500 ring-2 ring-brand-200" : "border-transparent",
                    itemIconTints[key]
                  )}
                >
                  <Icon className="h-5 w-5" />
                </button>
              );
            })}
          </div>
        </div>

        {/* Accounting behavior flags */}
        <div>
          <span className="mb-1.5 block text-sm font-medium text-slate-600">Настройки учета</span>
          <div className="space-y-2">
            {FLAG_LABELS.map(({ key, label }) => (
              <label
                key={key}
                className="flex cursor-pointer items-center justify-between rounded-xl bg-slate-50 px-3 py-2.5"
              >
                <span className="text-sm font-medium text-slate-700">{label}</span>
                <input
                  type="checkbox"
                  checked={form[key] as boolean}
                  onChange={(e) => set(key, e.target.checked as ItemFormSeed[typeof key])}
                  className="h-5 w-5 rounded accent-brand-600"
                />
              </label>
            ))}
          </div>
        </div>

        <Field label="Комментарий">
          <input
            className="form-input"
            value={form.comment}
            onChange={(e) => set("comment", e.target.value)}
            placeholder="Необязательно"
          />
        </Field>

        {/* Custom attributes */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-medium text-slate-600">Дополнительные атрибуты</span>
            <button type="button" onClick={addAttr} className="text-xs font-semibold text-brand-600">
              + Добавить атрибут
            </button>
          </div>
          {form.attributes.length === 0 && (
            <p className="text-xs text-slate-400">Например: Размер = 600×300×200, Марка = М500</p>
          )}
          <div className="space-y-2">
            {form.attributes.map((a, i) => (
              <div key={i} className="flex items-center gap-2">
                <input
                  className="form-input"
                  value={a.key}
                  onChange={(e) => updateAttr(i, "key", e.target.value)}
                  placeholder="Название"
                />
                <input
                  className="form-input"
                  value={a.value}
                  onChange={(e) => updateAttr(i, "value", e.target.value)}
                  placeholder="Значение"
                />
                <button
                  type="button"
                  onClick={() => removeAttr(i)}
                  className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-400 hover:text-red-600"
                  aria-label="Удалить атрибут"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        </div>

        {error && <p className="text-sm font-medium text-red-600">{error}</p>}
      </div>
    </Modal>
  );
}
