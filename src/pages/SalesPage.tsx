import { useState, type FormEvent } from "react";
import { Card, CardBody } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { PageTitle } from "../components/ui/PageTitle";
import { Field } from "../components/ui/Field";
import { CancelDialog } from "../components/business/CancelDialog";
import { useAppData } from "../context/AppDataContext";
import { canCancelRecords } from "../lib/permissions";
import { formatNumber, formatTenge, formatDateTime } from "../lib/format";
import { paymentTypes } from "../data/seedData";
import type { PaymentType, Sale } from "../types";
import { Plus, ShoppingCart } from "lucide-react";

const paymentTone: Record<PaymentType, "blue" | "green" | "amber"> = {
  Наличные: "green",
  Карта: "blue",
  Перевод: "blue",
  "В долг": "amber",
};

export function SalesPage() {
  const { sellableItems, itemById, activeSales, allSales, addSale, cancelSale, role } = useAppData();

  const [itemId, setItemId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [paymentType, setPaymentType] = useState<PaymentType>("Наличные");
  const [comment, setComment] = useState("");
  const [priceReason, setPriceReason] = useState("");
  const [showPriceEdit, setShowPriceEdit] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [showCancelled, setShowCancelled] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<Sale | null>(null);

  const selected = itemById(itemId);
  const priceChanged = selected ? Number(price) !== selected.salePrice : false;
  const list = showCancelled ? allSales : activeSales;
  const total = (Number(quantity) || 0) * (Number(price) || 0);

  function selectItem(id: string) {
    setItemId(id);
    const item = sellableItems.find((i) => i.id === id);
    if (item) setPrice(String(item.salePrice));
    setPriceReason("");
    setShowPriceEdit(false);
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!itemId) return setError("Выберите товар.");
    const qty = Number(quantity);
    const prc = Number(price);
    if (!qty || qty <= 0) return setError("Введите количество.");
    if (prc < 0) return setError("Цена не может быть отрицательной.");
    const res = addSale({
      itemId,
      quantity: qty,
      price: prc,
      paymentType,
      comment,
      priceOverrideReason: priceChanged && priceReason.trim() ? priceReason.trim() : undefined,
    });
    if (!res.ok) return setError(res.error ?? "Не удалось сохранить продажу.");
    setError(null);
    setItemId("");
    setQuantity("");
    setPrice("");
    setComment("");
    setPriceReason("");
    setShowPriceEdit(false);
  }

  return (
    <div className="space-y-5">
      <PageTitle title="Продажи" subtitle={`Активных продаж: ${activeSales.length}`} />

      <Card>
        <CardBody className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <ShoppingCart className="h-5 w-5" />
            </span>
            <h2 className="text-base font-bold text-slate-900">Новая продажа</h2>
          </div>

          {sellableItems.length === 0 ? (
            <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-700">
              Нет товаров для продажи. Добавьте позицию с галочкой «Можно продавать» на странице «Товары».
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <Field label="Товар или услуга">
                <select className="form-input" value={itemId} onChange={(e) => selectItem(e.target.value)}>
                  <option value="">Выберите позицию</option>
                  {sellableItems.map((i) => (
                    <option key={i.id} value={i.id}>
                      {i.name} ({i.unit})
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="Количество">
                <input className="form-input" inputMode="numeric" value={quantity} onChange={(e) => setQuantity(e.target.value)} placeholder="0" />
              </Field>

              {/* Price: read-only by default, editable behind "Изменить цену" */}
              {selected && !showPriceEdit ? (
                <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                  <div>
                    <p className="text-xs font-medium text-slate-500">Цена за ед.</p>
                    <p className="text-base font-bold text-slate-900 tabular">{formatTenge(Number(price) || 0)}</p>
                  </div>
                  <button type="button" onClick={() => setShowPriceEdit(true)} className="text-sm font-semibold text-brand-600">
                    Изменить цену
                  </button>
                </div>
              ) : (
                selected && (
                  <div className="space-y-3 rounded-xl bg-slate-50 p-3">
                    <Field label="Новая цена за ед.">
                      <input className="form-input" inputMode="numeric" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="0" />
                    </Field>
                    {priceChanged && (
                      <Field label={`Причина изменения (по умолчанию ${formatTenge(selected.salePrice)})`}>
                        <input
                          className="form-input"
                          value={priceReason}
                          onChange={(e) => setPriceReason(e.target.value)}
                          placeholder="Например: скидка постоянному клиенту"
                        />
                      </Field>
                    )}
                  </div>
                )
              )}

              <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
                <span className="text-sm font-medium text-slate-500">Итог</span>
                <span className="text-xl font-extrabold text-slate-900 tabular">{formatTenge(total)}</span>
              </div>

              <Field label="Тип оплаты">
                <select className="form-input" value={paymentType} onChange={(e) => setPaymentType(e.target.value as PaymentType)}>
                  {paymentTypes.map((p) => (
                    <option key={p}>{p}</option>
                  ))}
                </select>
              </Field>

              <Field label="Комментарий">
                <input className="form-input" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Необязательно" />
              </Field>

              {error && <p className="text-sm font-medium text-red-600">{error}</p>}

              <Button type="submit" variant="success" size="lg" fullWidth>
                <Plus className="h-5 w-5" /> Добавить продажу
              </Button>
            </form>
          )}
        </CardBody>
      </Card>

      <div className="space-y-3">
        <div className="flex items-center justify-between px-1">
          <h2 className="text-sm font-bold uppercase tracking-wide text-slate-400">История</h2>
          <button onClick={() => setShowCancelled((v) => !v)} className="text-xs font-semibold text-brand-600">
            {showCancelled ? "Скрыть отмененные" : "Показать отмененные"}
          </button>
        </div>

        {list.length === 0 && <p className="px-1 text-sm text-slate-400">Продаж пока нет.</p>}

        {list.map((sale) => {
          const deleted = sale.status === "deleted";
          const unit = itemById(sale.itemId)?.unit ?? "шт";
          return (
            <Card key={sale.id} className={deleted ? "border-red-100 bg-red-50/40 p-4" : "p-4"}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-base font-bold text-slate-900">{sale.itemName}</p>
                  <p className="text-sm text-slate-500 tabular">
                    {formatNumber(sale.quantity)} {unit} × {formatTenge(sale.price)}
                  </p>
                </div>
                <p className={"text-lg font-extrabold tabular " + (deleted ? "text-slate-400 line-through" : "text-emerald-600")}>
                  {formatTenge(sale.total)}
                </p>
              </div>
              <div className="mt-3 flex flex-wrap items-center gap-2">
                {deleted ? <Badge tone="red">Отменено</Badge> : <Badge tone={paymentTone[sale.paymentType]}>{sale.paymentType}</Badge>}
                <span className="text-xs text-slate-400">{sale.createdByName}</span>
                <span className="text-xs text-slate-400">· {formatDateTime(sale.createdAt)}</span>
              </div>
              {sale.priceOverrideReason && !deleted && (
                <p className="mt-2 text-xs text-amber-600">
                  Цена изменена с {formatTenge(sale.originalUnitPrice ?? 0)}. Причина: {sale.priceOverrideReason}
                </p>
              )}
              {deleted && sale.deleteReason && (
                <p className="mt-2 text-xs text-red-600">Причина: {sale.deleteReason} · {sale.deletedByName}</p>
              )}
              {!deleted && canCancelRecords(role) && (
                <button onClick={() => setCancelTarget(sale)} className="mt-3 text-xs font-semibold text-slate-400 transition hover:text-red-600">
                  Отменить запись
                </button>
              )}
            </Card>
          );
        })}
      </div>

      <CancelDialog
        open={cancelTarget !== null}
        title="Отменить продажу"
        onClose={() => setCancelTarget(null)}
        onConfirm={(reason) => {
          if (cancelTarget) cancelSale(cancelTarget.id, reason);
          setCancelTarget(null);
        }}
      />
    </div>
  );
}
