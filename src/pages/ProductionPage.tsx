import { useMemo, useState, type FormEvent } from "react";
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

export function ProductionPage() {
  const { activeItems, allItems, activeProduction, allProduction, addProduction, cancelProduction, role } =
    useAppData();

  // Production applies to products and materials (not services).
  const producible = useMemo(
    () => activeItems.filter((i) => i.type === "product" || i.type === "material"),
    [activeItems]
  );

  const [itemId, setItemId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [showCancelled, setShowCancelled] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<Production | null>(null);

  const unitOf = (id: string) => allItems.find((i) => i.id === id)?.unit ?? "шт";
  const list = showCancelled ? allProduction : activeProduction;
  const total = activeProduction.reduce((sum, p) => sum + p.quantity, 0);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!itemId) return setError("Выберите товар.");
    const qty = Number(quantity);
    if (!qty || qty <= 0) return setError("Введите количество.");
    const res = addProduction({ itemId, quantity: qty, comment });
    if (!res.ok) return setError(res.error ?? "Не удалось сохранить производство.");
    setError(null);
    setItemId("");
    setQuantity("");
    setComment("");
  }

  return (
    <div className="space-y-5">
      <PageTitle title="Производство" subtitle={`Выпущено (активно): ${formatNumber(total)}`} />

      {/* Add production form */}
      <Card>
        <CardBody className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-brand-600">
              <Factory className="h-5 w-5" />
            </span>
            <h2 className="text-base font-bold text-slate-900">Новая партия</h2>
          </div>

          {producible.length === 0 ? (
            <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-700">
              Нет товаров для производства. Добавьте позицию типа «Товар» или «Материал».
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <Field label="Товар">
                <select className="form-input" value={itemId} onChange={(e) => setItemId(e.target.value)}>
                  <option value="">Выберите товар</option>
                  {producible.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.name} ({i.unit})
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Количество">
                <input
                  className="form-input"
                  inputMode="numeric"
                  value={quantity}
                  onChange={(e) => setQuantity(e.target.value)}
                  placeholder="0"
                />
              </Field>

              <Field label="Комментарий">
                <input
                  className="form-input"
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Необязательно"
                />
              </Field>

              {error && <p className="text-sm font-medium text-red-600">{error}</p>}

              <Button type="submit" variant="primary" size="lg" fullWidth>
                <Plus className="h-5 w-5" /> Добавить производство
              </Button>
            </form>
          )}
        </CardBody>
      </Card>

      {/* List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-400">История</h2>
          <button onClick={() => setShowCancelled((v) => !v)} className="text-xs font-semibold text-brand-600">
            {showCancelled ? "Скрыть отмененные" : "Показать отмененные"}
          </button>
        </div>

        {list.length === 0 && <p className="px-1 text-sm text-slate-400">Записей пока нет.</p>}

        {list.map((rec) => {
          const deleted = rec.status === "deleted";
          return (
            <Card key={rec.id} className={deleted ? "border-red-100 bg-red-50/40 p-4" : "p-4"}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-base font-bold text-slate-900">{rec.itemName}</p>
                  <p className="text-sm text-slate-400">
                    {rec.createdByName} · {formatDateTime(rec.createdAt)}
                    {rec.comment && ` · ${rec.comment}`}
                  </p>
                </div>
                <p className={"text-lg font-extrabold tabular " + (deleted ? "text-slate-400 line-through" : "text-brand-600")}>
                  +{formatNumber(rec.quantity)} {unitOf(rec.itemId)}
                </p>
              </div>
              {deleted && (
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Badge tone="red">Отменено</Badge>
                  {rec.deleteReason && (
                    <span className="text-xs text-red-600">Причина: {rec.deleteReason} · {rec.deletedByName}</span>
                  )}
                </div>
              )}
              {!deleted && canCancelRecords(role) && (
                <button
                  onClick={() => setCancelTarget(rec)}
                  className="mt-3 text-xs font-semibold text-slate-400 transition hover:text-red-600"
                >
                  Отменить запись
                </button>
              )}
            </Card>
          );
        })}
      </div>

      <CancelDialog
        open={cancelTarget !== null}
        title="Отменить производство"
        description="Произведенное количество будет вычтено из остатка. История сохраняется."
        onClose={() => setCancelTarget(null)}
        onConfirm={(reason) => {
          if (cancelTarget) cancelProduction(cancelTarget.id, reason);
          setCancelTarget(null);
        }}
      />
    </div>
  );
}
