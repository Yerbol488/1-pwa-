import { useEffect, useState } from "react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { Field } from "../ui/Field";
import { cn } from "../../lib/format";
import { iconOrder, itemIcons, itemIconTints } from "../../data/icons";
import type { AddItemInput } from "../../context/AppDataContext";
import type { ItemIconKey, ItemType, ItemTypeLabel } from "../../types";

/** Plain editable shape used by the form (numbers kept as strings while typing). */
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
}

export const TYPE_OPTIONS: Array<{ type: ItemType; label: ItemTypeLabel }> = [
  { type: "product", label: "Товар" },
  { type: "material", label: "Материал" },
  { type: "service", label: "Услуга" },
  { type: "expense_category", label: "Расходная категория" },
];

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
};

function labelForType(type: ItemType): ItemTypeLabel {
  return TYPE_OPTIONS.find((o) => o.type === type)!.label;
}

interface ItemFormModalProps {
  open: boolean;
  title: string;
  seed: ItemFormSeed;
  onClose: () => void;
  onSubmit: (input: AddItemInput) => void;
}

export function ItemFormModal({ open, title, seed, onClose, onSubmit }: ItemFormModalProps) {
  const [form, setForm] = useState<ItemFormSeed>(seed);
  const [error, setError] = useState<string | null>(null);

  // Re-seed whenever the modal opens (or the chosen template changes).
  useEffect(() => {
    if (open) {
      setForm(seed);
      setError(null);
    }
  }, [open, seed]);

  const set = <K extends keyof ItemFormSeed>(key: K, value: ItemFormSeed[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const addAttr = () => set("attributes", [...form.attributes, { key: "", value: "" }]);
  const updateAttr = (i: number, field: "key" | "value", value: string) =>
    set(
      "attributes",
      form.attributes.map((a, idx) => (idx === i ? { ...a, [field]: value } : a))
    );
  const removeAttr = (i: number) =>
    set("attributes", form.attributes.filter((_, idx) => idx !== i));

  function handleSubmit() {
    if (!form.name.trim()) return setError("Введите название позиции.");
    if (!form.unit.trim()) return setError("Укажите единицу измерения.");
    onSubmit({
      name: form.name,
      type: form.type,
      typeLabel: labelForType(form.type),
      unit: form.unit,
      salePrice: Number(form.salePrice) || 0,
      purchasePrice: Number(form.purchasePrice) || 0,
      stockQuantity: Number(form.stockQuantity) || 0,
      icon: form.icon,
      comment: form.comment,
      attributes: form.attributes,
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
      <div className="space-y-3">
        <Field label="Название">
          <input
            className="form-input"
            value={form.name}
            onChange={(e) => set("name", e.target.value)}
            placeholder="Например: Брусчатка"
          />
        </Field>

        <Field label="Тип">
          <select
            className="form-input"
            value={form.type}
            onChange={(e) => set("type", e.target.value as ItemType)}
          >
            {TYPE_OPTIONS.map((o) => (
              <option key={o.type} value={o.type}>
                {o.label}
              </option>
            ))}
          </select>
        </Field>

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
          <span className="mb-1.5 block text-sm font-medium text-slate-600">Иконка</span>
          <div className="flex flex-wrap gap-2">
            {iconOrder.map((key) => {
              const Icon = itemIcons[key];
              const active = form.icon === key;
              return (
                <button
                  key={key}
                  type="button"
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
            <p className="text-xs text-slate-400">Например: Размер = 600×300×200, Плотность = D500</p>
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
