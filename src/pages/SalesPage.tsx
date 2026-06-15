import { useState, type FormEvent } from "react";
import { Card, CardBody } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { PageTitle } from "../components/ui/PageTitle";
import { Field } from "../components/ui/Field";
import { CancelDialog } from "../components/business/CancelDialog";
import { useAppData, methodLabel } from "../context/AppDataContext";
import { canCancelRecords } from "../lib/permissions";
import { cn, formatNumber, formatTenge, formatDateTime } from "../lib/format";
import type { PaymentMethod, PaymentStatus, Sale } from "../types";
import { Plus, ShoppingCart } from "lucide-react";

const STATUS_OPTIONS: Array<{ value: PaymentStatus; label: string }> = [
  { value: "paid", label: "Оплачено полностью" },
  { value: "partial", label: "Частично оплачено" },
  { value: "debt", label: "В долг" },
];

const METHOD_OPTIONS: Array<{ value: PaymentMethod; label: string }> = [
  { value: "cash", label: "Наличные" },
  { value: "kaspi", label: "Kaspi / перевод" },
  { value: "card", label: "Карта" },
  { value: "other", label: "Другое" },
];

export function SalesPage() {
  const { sellableItems, itemById, activeClients, activeSales, allSales, addSale, cancelSale, role } = useAppData();

  const [itemId, setItemId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [price, setPrice] = useState("");
  const [comment, setComment] = useState("");
  const [priceReason, setPriceReason] = useState("");
  const [showPriceEdit, setShowPriceEdit] = useState(false);
  const [paymentStatus, setPaymentStatus] = useState<PaymentStatus>("paid");
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>("cash");
  const [paidAmount, setPaidAmount] = useState("");
  const [customerId, setCustomerId] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [showCancelled, setShowCancelled] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<Sale | null>(null);

  const selected = itemById(itemId);
  const priceChanged = selected ? Number(price) !== selected.salePrice : false;
  const list = showCancelled ? allSales : activeSales;
  const total = (Number(quantity) || 0) * (Number(price) || 0);
  const paidNow = paymentStatus === "paid" ? total : paymentStatus === "debt" ? 0 : Number(paidAmount) || 0;
  const debtNow = Math.max(0, total - paidNow);

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
    const client = activeClients.find((c) => c.id === customerId);
    const res = addSale({
      itemId,
      quantity: qty,
      price: prc,
      comment,
      priceOverrideReason: priceChanged && priceReason.trim() ? priceReason.trim() : undefined,
      paymentStatus,
      paymentMethod,
      paidAmount: paymentStatus === "partial" ? Number(paidAmount) || 0 : 0,
      customerContactId: client?.id,
      customerName: client?.name,
    });
    if (!res.ok) return setError(res.error ?? "Не удалось сохранить продажу.");
    setError(null);
    setItemId("");
    setQuantity("");
    setPrice("");
    setComment("");
    setPriceReason("");
    setShowPriceEdit(false);
    setPaymentStatus("paid");
    setPaymentMethod("cash");
    setPaidAmount("");
    setCustomerId("");
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

              {/* Payment / debt section */}
              <div className="space-y-3 rounded-xl border border-slate-100 p-3">
                <Field label="Статус оплаты">
                  <select className="form-input" value={paymentStatus} onChange={(e) => setPaymentStatus(e.target.value as PaymentStatus)}>
                    {STATUS_OPTIONS.map((o) => (
                      <option key={o.value} value={o.value}>
                        {o.label}
                      </option>
                    ))}
                  </select>
                </Field>

                {paymentStatus !== "debt" && (
                  <Field label="Способ оплаты">
                    <select className="form-input" value={paymentMethod} onChange={(e) => setPaymentMethod(e.target.value as PaymentMethod)}>
                      {METHOD_OPTIONS.map((o) => (
                        <option key={o.value} value={o.value}>
                          {o.label}
                        </option>
                      ))}
                    </select>
                  </Field>
                )}

                {paymentStatus === "partial" && (
                  <div className="grid grid-cols-2 gap-3">
                    <Field label="Оплачено сейчас">
                      <input className="form-input" inputMode="numeric" value={paidAmount} onChange={(e) => setPaidAmount(e.target.value)} placeholder="0" />
                    </Field>
                    <div>
                      <p className="mb-1.5 text-sm font-medium text-slate-600">Осталось к оплате</p>
                      <div className="form-input flex items-center font-bold text-red-600">{formatTenge(debtNow)}</div>
                    </div>
                  </div>
                )}

                {activeClients.length > 0 && (
                  <Field label="Клиент">
                    <select className="form-input" value={customerId} onChange={(e) => setCustomerId(e.target.value)}>
                      <option value="">Без клиента</option>
                      {activeClients.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.name}
                        </option>
                      ))}
                    </select>
                  </Field>
                )}
              </div>

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
                  {sale.customerName && <p className="text-xs text-slate-400">Клиент: {sale.customerName}</p>}
                </div>
                <p className={cn("text-lg font-extrabold tabular", deleted ? "text-slate-400 line-through" : "text-slate-900")}>
                  {formatTenge(sale.total)}
                </p>
              </div>

              {!deleted && <PaymentLine sale={sale} />}

              <div className="mt-2 flex flex-wrap items-center gap-2">
                {deleted && <Badge tone="red">Отменено</Badge>}
                <span className="text-xs text-slate-400">{sale.createdByName} · {formatDateTime(sale.createdAt)}</span>
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

function PaymentLine({ sale }: { sale: Sale }) {
  if (sale.paymentStatus === "paid") {
    return (
      <div className="mt-2">
        <Badge tone="green">Оплачено: {formatTenge(sale.paidAmount)} · {methodLabel(sale.paymentMethod)}</Badge>
      </div>
    );
  }
  if (sale.paymentStatus === "partial") {
    return (
      <div className="mt-2 flex flex-wrap gap-2">
        <Badge tone="amber">Частично: {formatTenge(sale.paidAmount)} из {formatTenge(sale.total)}</Badge>
        <Badge tone="red">Долг: {formatTenge(sale.debtAmount)}</Badge>
      </div>
    );
  }
  return (
    <div className="mt-2">
      <Badge tone="red">В долг: {formatTenge(sale.debtAmount)}</Badge>
    </div>
  );
}
