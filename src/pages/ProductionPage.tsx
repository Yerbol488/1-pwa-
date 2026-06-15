import { useState, type FormEvent } from "react";
import { Card, CardBody } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { PageTitle } from "../components/ui/PageTitle";
import { Field } from "../components/ui/Field";
import { CancelDialog } from "../components/business/CancelDialog";
import { useAppData } from "../context/AppDataContext";
import { canCancelRecords } from "../lib/permissions";
import { formatNumber, formatDateTime } from "../lib/format";
import type { Production } from "../types";
import { Plus, Factory } from "lucide-react";

interface MaterialRow {
  itemId: string;
  quantity: string;
}

export function ProductionPage() {
  const { producibleItems, consumableItems, itemById, activeProduction, allProduction, addProduction, cancelProduction, role } =
    useAppData();

  const [itemId, setItemId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [comment, setComment] = useState("");
  const [materials, setMaterials] = useState<MaterialRow[]>([]);
  const [error, setError] = useState<string | null>(null);

  const [showCancelled, setShowCancelled] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<Production | null>(null);

  const list = showCancelled ? allProduction : activeProduction;

  const addMaterial = () => setMaterials((m) => [...m, { itemId: "", quantity: "" }]);
  const updateMaterial = (i: number, field: keyof MaterialRow, value: string) =>
    setMaterials((m) => m.map((r, idx) => (idx === i ? { ...r, [field]: value } : r)));
  const removeMaterial = (i: number) => setMaterials((m) => m.filter((_, idx) => idx !== i));

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!itemId) return setError("Выберите производимый товар.");
    const qty = Number(quantity);
    if (!qty || qty <= 0) return setError("Введите количество.");
    const consumed = materials
      .filter((m) => m.itemId && Number(m.quantity) > 0)
      .map((m) => ({ itemId: m.itemId, quantity: Number(m.quantity) }));
    const res = addProduction({ itemId, quantity: qty, consumedMaterials: consumed, comment });
    if (!res.ok) return setError(res.error ?? "Не удалось сохранить производство.");
    setError(null);
    setItemId("");
    setQuantity("");
    setComment("");
    setMaterials([]);
  }

  return (
    <div className="space-y-5">
      <PageTitle title="Производство" subtitle={`Активных партий: ${activeProduction.length}`} />

      <Card>
        <CardBody className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-brand-600">
              <Factory className="h-5 w-5" />
            </span>
            <h2 className="text-base font-bold text-slate-900">Новая партия</h2>
          </div>

          {producibleItems.length === 0 ? (
            <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-700">
              Нет товаров для производства. Добавьте позицию с галочкой «Учитывать на складе».
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <Field label="Готовый товар">
                <select className="form-input" value={itemId} onChange={(e) => setItemId(e.target.value)}>
                  <option value="">Выберите товар</option>
                  {producibleItems.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.name} ({i.unit})
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Произведено">
                <input className="form-input" inputMode="numeric" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="0" />
              </Field>

              {/* Consumed materials */}
              <div>
                <div className="mb-2 flex items-center justify-between">
                  <span className="text-sm font-medium text-slate-600">Списать материалы</span>
                  {consumableItems.length > 0 && (
                    <button type="button" onClick={addMaterial} className="text-xs font-semibold text-brand-600">
                      + Добавить материал
                    </button>
                  )}
                </div>
                {consumableItems.length === 0 && (
                  <p className="text-xs text-slate-400">Нет материалов с галочкой «Используется в производстве».</p>
                )}
                <div className="space-y-2">
                  {materials.map((row, i) => {
                    const mat = itemById(row.itemId);
                    return (
                      <div key={i} className="flex items-center gap-2">
                        <select className="form-input" value={row.itemId} onChange={(e) => updateMaterial(i, "itemId", e.target.value)}>
                          <option value="">Материал</option>
                          {consumableItems.map((m) => (
                            <option key={m.id} value={m.id}>
                              {m.name}
                            </option>
                          ))}
                        </select>
                        <input
                          className="form-input"
                          inputMode="numeric"
                          value={row.quantity}
                          onChange={(e) => updateMaterial(i, "quantity", e.target.value)}
                          placeholder={mat ? mat.unit : "Кол-во"}
                        />
                        <button
                          type="button"
                          onClick={() => removeMaterial(i)}
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-100 text-slate-400 hover:text-red-600"
                          aria-label="Удалить материал"
                        >
                          ×
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              <Field label="Комментарий">
                <input className="form-input" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Необязательно" />
              </Field>

              {error && <p className="text-sm font-medium text-red-600">{error}</p>}

              <Button type="submit" variant="primary" size="lg" fullWidth>
                <Plus className="h-5 w-5" /> Добавить производство
              </Button>
            </form>
          )}
        </CardBody>
      </Card>

      <div className="flex items-center justify-between px-1">
        <h2 className="text-sm font-bold uppercase tracking-wide text-slate-400">История</h2>
        <button onClick={() => setShowCancelled((v) => !v)} className="text-xs font-semibold text-brand-600">
          {showCancelled ? "Скрыть отмененные" : "Показать отмененные"}
        </button>
      </div>

      {list.length === 0 && <p className="px-1 text-sm text-slate-400">Записей пока нет.</p>}

      {list.map((rec) => {
        const deleted = rec.status === "deleted";
        const unit = itemById(rec.itemId)?.unit ?? "шт";
        return (
          <Card key={rec.id} className={deleted ? "border-red-100 bg-red-50/40 p-4" : "p-4"}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-base font-bold text-slate-900">{rec.itemName}</p>
                <p className="text-sm text-slate-400">{rec.createdByName} · {formatDateTime(rec.createdAt)}</p>
              </div>
              <p className={"text-lg font-extrabold tabular " + (deleted ? "text-slate-400 line-through" : "text-brand-600")}>
                +{formatNumber(rec.quantity)} {unit}
              </p>
            </div>
            {rec.consumedMaterials.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1.5">
                {rec.consumedMaterials.map((c, idx) => (
                  <span key={idx} className="rounded-lg bg-red-50 px-2 py-1 text-[11px] font-medium text-red-700">
                    −{formatNumber(c.quantity)} {c.unit} {c.itemName}
                  </span>
                ))}
              </div>
            )}
            {rec.comment && !deleted && <p className="mt-2 text-xs text-slate-400">{rec.comment}</p>}
            {deleted && (
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge tone="red">Отменено</Badge>
                {rec.deleteReason && <span className="text-xs text-red-600">Причина: {rec.deleteReason} · {rec.deletedByName}</span>}
              </div>
            )}
            {!deleted && canCancelRecords(role) && (
              <button onClick={() => setCancelTarget(rec)} className="mt-3 text-xs font-semibold text-slate-400 transition hover:text-red-600">
                Отменить запись
              </button>
            )}
          </Card>
        );
      })}

      <CancelDialog
        open={cancelTarget !== null}
        title="Отменить производство"
        description="Готовый товар уменьшится, списанные материалы вернутся на склад. История сохраняется."
        onClose={() => setCancelTarget(null)}
        onConfirm={(reason) => {
          if (cancelTarget) cancelProduction(cancelTarget.id, reason);
          setCancelTarget(null);
        }}
      />
    </div>
  );
}
