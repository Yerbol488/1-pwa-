import { useMemo, useState, type FormEvent } from "react";
import { useSearchParams } from "react-router-dom";
import { Card, CardBody } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { PageTitle } from "../components/ui/PageTitle";
import { Field } from "../components/ui/Field";
import { CancelDialog } from "../components/business/CancelDialog";
import { useAppData } from "../context/AppDataContext";
import { canCancelRecords } from "../lib/permissions";
import { cn, formatNumber, formatTenge, formatDateTime } from "../lib/format";
import { PERIOD_OPTIONS, getPeriodRange, filterByRange, type PeriodKey } from "../lib/reports";
import { whatsappLink } from "../lib/contacts";
import { fixedExpenseCategories } from "../data/seedData";
import { ItemFormModal, emptySeed, type ItemFormSeed } from "../components/business/ItemFormModal";
import type { FixedExpense, OneOffExpense, StockPurchase } from "../types";
import { Plus, ShoppingBag, Wallet, CalendarClock, Repeat, MessageCircle, PackagePlus } from "lucide-react";

type Tab = "stock" | "oneoff" | "fixed";

export function ExpensesPage() {
  const [params, setParams] = useSearchParams();
  const initial = (params.get("tab") as Tab) || "stock";
  const [tab, setTab] = useState<Tab>(["stock", "oneoff", "fixed"].includes(initial) ? initial : "stock");
  const { totalExpenses } = useAppData();

  function selectTab(t: Tab) {
    setTab(t);
    setParams({ tab: t }, { replace: true });
  }

  const tabs: Array<{ key: Tab; label: string }> = [
    { key: "stock", label: "Покупки на склад" },
    { key: "oneoff", label: "Разовые расходы" },
    { key: "fixed", label: "Постоянные расходы" },
  ];

  return (
    <div className="space-y-5">
      <PageTitle title="Расходы" subtitle={`Всего активных расходов: ${formatTenge(totalExpenses)}`} />

      <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 no-scrollbar">
        {tabs.map((t) => (
          <button
            key={t.key}
            onClick={() => selectTab(t.key)}
            className={cn(
              "shrink-0 rounded-full px-3.5 py-2 text-sm font-semibold transition",
              tab === t.key ? "bg-brand-600 text-white" : "bg-white text-slate-500 shadow-card"
            )}
          >
            {t.label}
          </button>
        ))}
      </div>

      {tab === "stock" && <StockPurchaseTab />}
      {tab === "oneoff" && <OneOffTab />}
      {tab === "fixed" && <FixedTab />}
    </div>
  );
}

function PeriodFilter({ value, onChange }: { value: PeriodKey; onChange: (p: PeriodKey) => void }) {
  return (
    <div className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 no-scrollbar">
      {PERIOD_OPTIONS.map((p) => (
        <button
          key={p.key}
          onClick={() => onChange(p.key)}
          className={cn(
            "shrink-0 rounded-full px-3 py-1.5 text-xs font-semibold transition",
            value === p.key ? "bg-slate-900 text-white" : "bg-white text-slate-500 shadow-card"
          )}
        >
          {p.label}
        </button>
      ))}
    </div>
  );
}

// --- Tab 1: stock purchases -------------------------------------------------

function StockPurchaseTab() {
  const { purchasableItems, itemById, activeSuppliers, supplierById, activeStockPurchases, allStockPurchases, addStockPurchase, cancelStockPurchase, role } =
    useAppData();

  const [itemId, setItemId] = useState("");
  const [quantity, setQuantity] = useState("");
  const [unitPrice, setUnitPrice] = useState("");
  const [showPriceEdit, setShowPriceEdit] = useState(false);
  const [priceReason, setPriceReason] = useState("");
  const [delivery, setDelivery] = useState("");
  const [supplierId, setSupplierId] = useState("");
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [period, setPeriod] = useState<PeriodKey>("month");
  const [supplierFilter, setSupplierFilter] = useState("");
  const [itemFilter, setItemFilter] = useState("");
  const [showCancelled, setShowCancelled] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<StockPurchase | null>(null);

  const selected = itemById(itemId);
  const qtyN = Number(quantity) || 0;
  const priceN = Number(unitPrice) || 0;
  const deliveryN = Number(delivery) || 0;
  const itemSubtotal = qtyN * priceN;
  const totalAmount = itemSubtotal + deliveryN;
  const priceChanged = selected ? priceN !== selected.purchasePrice : false;

  function selectItem(id: string) {
    setItemId(id);
    const item = purchasableItems.find((i) => i.id === id);
    if (item) setUnitPrice(String(item.purchasePrice));
    setShowPriceEdit(false);
    setPriceReason("");
  }

  function resetForm() {
    setItemId("");
    setQuantity("");
    setUnitPrice("");
    setDelivery("");
    setSupplierId("");
    setComment("");
    setShowPriceEdit(false);
    setPriceReason("");
  }

  function repeat(p: StockPurchase) {
    setItemId(p.itemId);
    setQuantity(String(p.quantity));
    setUnitPrice(String(p.unitPrice));
    setDelivery(p.deliveryCost ? String(p.deliveryCost) : "");
    setSupplierId(p.supplierId ?? "");
    setComment(p.comment);
    setShowPriceEdit(false);
    setPriceReason("");
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!itemId) return setError("Выберите товар или материал.");
    if (qtyN <= 0) return setError("Введите количество.");
    const res = addStockPurchase({
      itemId,
      quantity: qtyN,
      unitPrice: priceN,
      deliveryCost: deliveryN,
      supplierId: supplierId || undefined,
      comment,
      priceOverrideReason: priceChanged && priceReason.trim() ? priceReason.trim() : undefined,
    });
    if (!res.ok) return setError(res.error ?? "Не удалось сохранить покупку.");
    setError(null);
    resetForm();
  }

  const range = getPeriodRange(period);
  const filtered = useMemo(() => {
    let list = showCancelled ? allStockPurchases : activeStockPurchases;
    list = filterByRange(list, range);
    if (supplierFilter) list = list.filter((p) => p.supplierId === supplierFilter);
    if (itemFilter) list = list.filter((p) => p.itemId === itemFilter);
    return list;
  }, [showCancelled, allStockPurchases, activeStockPurchases, range, supplierFilter, itemFilter]);

  const subtotal = filtered.filter((p) => p.status === "active");
  const sumTotal = subtotal.reduce((s, p) => s + p.totalAmount, 0);
  const sumDelivery = subtotal.reduce((s, p) => s + p.deliveryCost, 0);
  const sumUnits = subtotal.reduce((s, p) => s + p.quantity, 0);

  return (
    <div className="space-y-5">
      <Card>
        <CardBody className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-indigo-50 text-indigo-600">
              <ShoppingBag className="h-5 w-5" />
            </span>
            <h2 className="text-base font-bold text-slate-900">Покупка на склад</h2>
          </div>

          {purchasableItems.length === 0 ? (
            <p className="rounded-xl bg-amber-50 p-3 text-sm text-amber-700">
              Нет позиций для покупки. Добавьте товар или материал с галочками «Можно покупать» и «Учитывать на складе».
            </p>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <Field label="Товар / материал">
                <select className="form-input" value={itemId} onChange={(e) => selectItem(e.target.value)}>
                  <option value="">Выберите позицию</option>
                  {purchasableItems.map((i) => (
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
                    <p className="text-base font-bold text-slate-900 tabular">{formatTenge(priceN)}</p>
                  </div>
                  <button type="button" onClick={() => setShowPriceEdit(true)} className="text-sm font-semibold text-brand-600">
                    Изменить цену
                  </button>
                </div>
              ) : (
                selected && (
                  <div className="space-y-3 rounded-xl bg-slate-50 p-3">
                    <Field label="Новая цена за ед.">
                      <input className="form-input" inputMode="numeric" value={unitPrice} onChange={(e) => setUnitPrice(e.target.value)} placeholder="0" />
                    </Field>
                    {priceChanged && (
                      <Field label={`Причина изменения (закуп по умолчанию ${formatTenge(selected.purchasePrice)})`}>
                        <input
                          className="form-input"
                          value={priceReason}
                          onChange={(e) => setPriceReason(e.target.value)}
                          placeholder="Например: скидка из-за задержки доставки"
                        />
                      </Field>
                    )}
                  </div>
                )
              )}

              <div className="grid grid-cols-2 gap-3">
                <Field label="Доставка">
                  <input className="form-input" inputMode="numeric" value={delivery} onChange={(e) => setDelivery(e.target.value)} placeholder="0" />
                </Field>
                <Field label="Поставщик">
                  <select className="form-input" value={supplierId} onChange={(e) => setSupplierId(e.target.value)}>
                    <option value="">Без поставщика</option>
                    {activeSuppliers.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>
                </Field>
              </div>

              <div className="rounded-xl bg-slate-50 px-4 py-3 text-sm">
                <div className="flex items-center justify-between text-slate-500">
                  <span>Товар</span>
                  <span className="tabular">{formatTenge(itemSubtotal)}</span>
                </div>
                {deliveryN > 0 && (
                  <div className="flex items-center justify-between text-slate-500">
                    <span>Доставка</span>
                    <span className="tabular">{formatTenge(deliveryN)}</span>
                  </div>
                )}
                <div className="mt-1 flex items-center justify-between border-t border-slate-200 pt-1 font-bold text-slate-900">
                  <span>Итого</span>
                  <span className="tabular text-lg">{formatTenge(totalAmount)}</span>
                </div>
              </div>

              <Field label="Комментарий">
                <input className="form-input" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Необязательно" />
              </Field>

              {error && <p className="text-sm font-medium text-red-600">{error}</p>}

              <Button type="submit" variant="primary" size="lg" fullWidth>
                <Plus className="h-5 w-5" /> Добавить покупку
              </Button>
            </form>
          )}
        </CardBody>
      </Card>

      <PeriodFilter value={period} onChange={setPeriod} />

      <div className="grid grid-cols-2 gap-3">
        <select className="form-input" value={itemFilter} onChange={(e) => setItemFilter(e.target.value)}>
          <option value="">Все позиции</option>
          {purchasableItems.map((i) => (
            <option key={i.id} value={i.id}>
              {i.name}
            </option>
          ))}
        </select>
        {activeSuppliers.length > 0 ? (
          <select className="form-input" value={supplierFilter} onChange={(e) => setSupplierFilter(e.target.value)}>
            <option value="">Все поставщики</option>
            {activeSuppliers.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        ) : (
          <div />
        )}
      </div>

      {/* Subtotals */}
      <Card className="p-4">
        <div className="grid grid-cols-3 gap-2 text-center">
          <div>
            <p className="text-lg font-extrabold text-slate-900 tabular">{formatTenge(sumTotal)}</p>
            <p className="text-[11px] text-slate-400">Итого покупок</p>
          </div>
          <div>
            <p className="text-lg font-extrabold text-slate-900 tabular">{formatTenge(sumDelivery)}</p>
            <p className="text-[11px] text-slate-400">Из них доставка</p>
          </div>
          <div>
            <p className="text-lg font-extrabold text-slate-900 tabular">{formatNumber(subtotal.length)}</p>
            <p className="text-[11px] text-slate-400">Покупок · {formatNumber(sumUnits)} ед.</p>
          </div>
        </div>
      </Card>

      <div className="flex items-center justify-between px-1">
        <h2 className="text-sm font-bold uppercase tracking-wide text-slate-400">История</h2>
        <button onClick={() => setShowCancelled((v) => !v)} className="text-xs font-semibold text-brand-600">
          {showCancelled ? "Скрыть отмененные" : "Показать отмененные"}
        </button>
      </div>

      {filtered.length === 0 && <p className="px-1 text-sm text-slate-400">Покупок за период нет.</p>}

      {filtered.map((p) => {
        const deleted = p.status === "deleted";
        const supplier = supplierById(p.supplierId);
        return (
          <Card key={p.id} className={deleted ? "border-red-100 bg-red-50/40 p-4" : "p-4"}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-base font-bold text-slate-900">{p.itemName}</p>
                <p className="text-sm text-slate-500 tabular">
                  +{formatNumber(p.quantity)} {p.unit} · {formatTenge(p.unitPrice)}/ед.
                </p>
              </div>
              <p className={"text-lg font-extrabold tabular " + (deleted ? "text-slate-400 line-through" : "text-slate-900")}>
                {formatTenge(p.totalAmount)}
              </p>
            </div>
            <p className="mt-1 text-xs text-slate-400">
              Товар {formatTenge(p.itemSubtotal)}
              {p.deliveryCost > 0 && ` · доставка ${formatTenge(p.deliveryCost)}`}
            </p>
            <div className="mt-2 flex flex-wrap items-center gap-2">
              {deleted && <Badge tone="red">Отменено</Badge>}
              {p.supplierName && <Badge tone="blue">Поставщик: {p.supplierName}</Badge>}
              <span className="text-xs text-slate-400">{p.createdByName} · {formatDateTime(p.createdAt)}</span>
            </div>
            {p.supplierName && !deleted && (
              (() => {
                const wa = supplier && supplier.status === "active" ? whatsappLink(supplier.whatsappNumber) : null;
                return wa ? (
                  <a
                    href={wa}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-2 inline-flex h-9 items-center gap-1.5 rounded-xl bg-emerald-600 px-3 text-xs font-semibold text-white"
                  >
                    <MessageCircle className="h-4 w-4" /> WhatsApp поставщика
                  </a>
                ) : (
                  <span className="mt-2 inline-flex h-9 items-center gap-1.5 rounded-xl bg-slate-100 px-3 text-xs font-semibold text-slate-400">
                    <MessageCircle className="h-4 w-4" /> WhatsApp недоступен
                  </span>
                );
              })()
            )}
            {p.priceOverrideReason && !deleted && (
              <p className="mt-2 text-xs text-amber-600">
                Цена изменена с {formatTenge(p.originalUnitPrice ?? 0)}. Причина: {p.priceOverrideReason}
              </p>
            )}
            {deleted && p.deleteReason && (
              <p className="mt-2 text-xs text-red-600">Причина: {p.deleteReason} · {p.deletedByName}</p>
            )}
            {!deleted && (
              <div className="mt-3 flex gap-4">
                <button onClick={() => repeat(p)} className="flex items-center gap-1.5 text-xs font-semibold text-brand-600">
                  <Repeat className="h-4 w-4" /> Повторить
                </button>
                {canCancelRecords(role) && (
                  <button onClick={() => setCancelTarget(p)} className="text-xs font-semibold text-slate-400 transition hover:text-red-600">
                    Отменить
                  </button>
                )}
              </div>
            )}
          </Card>
        );
      })}

      <CancelDialog
        open={cancelTarget !== null}
        title="Отменить покупку"
        description="Количество вернется со склада, сумма уйдет из расходов. История сохраняется."
        onClose={() => setCancelTarget(null)}
        onConfirm={(reason) => {
          if (cancelTarget) cancelStockPurchase(cancelTarget.id, reason);
          setCancelTarget(null);
        }}
      />
    </div>
  );
}

// --- Tab 2: one-off expenses ------------------------------------------------

function OneOffTab() {
  const { activeOneOff, allOneOff, addOneOffExpense, cancelOneOffExpense, addItem, role } = useAppData();

  const [title, setTitle] = useState("");
  const [amount, setAmount] = useState("");
  const [delivery, setDelivery] = useState("");
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [period, setPeriod] = useState<PeriodKey>("month");
  const [showCancelled, setShowCancelled] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<OneOffExpense | null>(null);

  // "Создать как позицию склада" — opens the item form prefilled, never auto-creates.
  const [itemFormOpen, setItemFormOpen] = useState(false);
  const [itemSeed, setItemSeed] = useState<ItemFormSeed>(emptySeed);

  function createAsItem(o: OneOffExpense) {
    setItemSeed({
      ...emptySeed,
      type: "material",
      name: o.title,
      purchasePrice: String(o.amount),
      sellable: false,
      purchasable: true,
      stockTracked: true,
      consumableInProduction: false,
    });
    setItemFormOpen(true);
  }

  const range = getPeriodRange(period);
  const filtered = useMemo(
    () => filterByRange(showCancelled ? allOneOff : activeOneOff, range),
    [showCancelled, allOneOff, activeOneOff, range]
  );
  const sum = filtered.filter((o) => o.status === "active").reduce((s, o) => s + o.amount + o.deliveryCost, 0);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return setError("Введите название.");
    const amt = Number(amount);
    if (!amt || amt <= 0) return setError("Введите сумму.");
    const res = addOneOffExpense({ title, amount: amt, deliveryCost: Number(delivery) || 0, comment });
    if (!res.ok) return setError(res.error ?? "Не удалось сохранить расход.");
    setError(null);
    setTitle("");
    setAmount("");
    setDelivery("");
    setComment("");
  }

  return (
    <div className="space-y-5">
      <Card>
        <CardBody className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <Wallet className="h-5 w-5" />
            </span>
            <h2 className="text-base font-bold text-slate-900">Разовый расход</h2>
          </div>
          <p className="inline-flex w-fit rounded-lg bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700">
            Не добавляется на склад · не меняет остатки
          </p>

          <form onSubmit={handleSubmit} className="space-y-3">
            <Field label="Название">
              <input className="form-input" value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Например: Порошок 500 г" />
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Сумма">
                <input className="form-input" inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0 ₸" />
              </Field>
              <Field label="Доставка">
                <input className="form-input" inputMode="numeric" value={delivery} onChange={(e) => setDelivery(e.target.value)} placeholder="0" />
              </Field>
            </div>
            <Field label="Комментарий">
              <input className="form-input" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Необязательно" />
            </Field>
            {error && <p className="text-sm font-medium text-red-600">{error}</p>}
            <Button type="submit" variant="danger" size="lg" fullWidth>
              <Plus className="h-5 w-5" /> Добавить расход
            </Button>
          </form>
        </CardBody>
      </Card>

      <PeriodFilter value={period} onChange={setPeriod} />

      <Card className="p-4 text-center">
        <p className="text-lg font-extrabold text-slate-900 tabular">{formatTenge(sum)}</p>
        <p className="text-[11px] text-slate-400">Итого разовых расходов за период</p>
      </Card>

      <div className="flex items-center justify-between px-1">
        <h2 className="text-sm font-bold uppercase tracking-wide text-slate-400">История</h2>
        <button onClick={() => setShowCancelled((v) => !v)} className="text-xs font-semibold text-brand-600">
          {showCancelled ? "Скрыть отмененные" : "Показать отмененные"}
        </button>
      </div>

      {filtered.length === 0 && <p className="px-1 text-sm text-slate-400">Расходов за период нет.</p>}

      {filtered.map((o) => {
        const deleted = o.status === "deleted";
        return (
          <Card key={o.id} className={deleted ? "border-red-100 bg-red-50/40 p-4" : "p-4"}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-base font-bold text-slate-900">{o.title}</p>
                <p className="text-sm text-slate-400">{o.createdByName} · {formatDateTime(o.createdAt)}{o.comment && ` · ${o.comment}`}</p>
              </div>
              <p className={"text-lg font-extrabold tabular " + (deleted ? "text-slate-400 line-through" : "text-red-600")}>
                −{formatTenge(o.amount + o.deliveryCost)}
              </p>
            </div>
            {deleted && (
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge tone="red">Отменено</Badge>
                {o.deleteReason && <span className="text-xs text-red-600">Причина: {o.deleteReason} · {o.deletedByName}</span>}
              </div>
            )}
            {!deleted && (
              <div className="mt-3 flex gap-4">
                <button onClick={() => createAsItem(o)} className="flex items-center gap-1.5 text-xs font-semibold text-brand-600">
                  <PackagePlus className="h-4 w-4" /> Создать как позицию
                </button>
                {canCancelRecords(role) && (
                  <button onClick={() => setCancelTarget(o)} className="text-xs font-semibold text-slate-400 transition hover:text-red-600">
                    Отменить
                  </button>
                )}
              </div>
            )}
          </Card>
        );
      })}

      <CancelDialog
        open={cancelTarget !== null}
        title="Отменить расход"
        onClose={() => setCancelTarget(null)}
        onConfirm={(reason) => {
          if (cancelTarget) cancelOneOffExpense(cancelTarget.id, reason);
          setCancelTarget(null);
        }}
      />

      <ItemFormModal
        open={itemFormOpen}
        title="Создать позицию склада"
        seed={itemSeed}
        onClose={() => setItemFormOpen(false)}
        onSubmit={(input) => {
          addItem(input);
          setItemFormOpen(false);
        }}
      />
    </div>
  );
}

// --- Tab 3: fixed expenses --------------------------------------------------

function FixedTab() {
  const { activeFixed, allFixed, addFixedExpense, cancelFixedExpense, role } = useAppData();

  const [category, setCategory] = useState(fixedExpenseCategories[0]);
  const [amount, setAmount] = useState("");
  const [periodDate, setPeriodDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [period, setPeriod] = useState<PeriodKey>("month");
  const [showCancelled, setShowCancelled] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<FixedExpense | null>(null);

  const range = getPeriodRange(period);
  const filtered = useMemo(
    () => filterByRange(showCancelled ? allFixed : activeFixed, range),
    [showCancelled, allFixed, activeFixed, range]
  );
  const sum = filtered.filter((f) => f.status === "active").reduce((s, f) => s + f.amount, 0);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const amt = Number(amount);
    if (!amt || amt <= 0) return setError("Введите сумму.");
    const res = addFixedExpense({ category, amount: amt, periodDate, comment });
    if (!res.ok) return setError(res.error ?? "Не удалось сохранить расход.");
    setError(null);
    setAmount("");
    setComment("");
  }

  return (
    <div className="space-y-5">
      <Card>
        <CardBody className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-amber-50 text-amber-600">
              <CalendarClock className="h-5 w-5" />
            </span>
            <h2 className="text-base font-bold text-slate-900">Постоянный расход</h2>
          </div>
          <p className="text-xs text-slate-400">Зарплата, аренда, налоги и другие регулярные затраты.</p>

          <form onSubmit={handleSubmit} className="space-y-3">
            <Field label="Категория">
              <select className="form-input" value={category} onChange={(e) => setCategory(e.target.value)}>
                {fixedExpenseCategories.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>
            <div className="grid grid-cols-2 gap-3">
              <Field label="Сумма">
                <input className="form-input" inputMode="numeric" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0 ₸" />
              </Field>
              <Field label="Дата">
                <input type="date" className="form-input" value={periodDate} onChange={(e) => setPeriodDate(e.target.value)} />
              </Field>
            </div>
            <Field label="Комментарий">
              <input className="form-input" value={comment} onChange={(e) => setComment(e.target.value)} placeholder="Необязательно" />
            </Field>
            {error && <p className="text-sm font-medium text-red-600">{error}</p>}
            <Button type="submit" variant="primary" size="lg" fullWidth>
              <Plus className="h-5 w-5" /> Добавить расход
            </Button>
          </form>
        </CardBody>
      </Card>

      <PeriodFilter value={period} onChange={setPeriod} />

      <Card className="p-4 text-center">
        <p className="text-lg font-extrabold text-slate-900 tabular">{formatTenge(sum)}</p>
        <p className="text-[11px] text-slate-400">Итого постоянных расходов за период</p>
      </Card>

      <div className="flex items-center justify-between px-1">
        <h2 className="text-sm font-bold uppercase tracking-wide text-slate-400">История</h2>
        <button onClick={() => setShowCancelled((v) => !v)} className="text-xs font-semibold text-brand-600">
          {showCancelled ? "Скрыть отмененные" : "Показать отмененные"}
        </button>
      </div>

      {filtered.length === 0 && <p className="px-1 text-sm text-slate-400">Расходов за период нет.</p>}

      {filtered.map((f) => {
        const deleted = f.status === "deleted";
        return (
          <Card key={f.id} className={deleted ? "border-red-100 bg-red-50/40 p-4" : "p-4"}>
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-base font-bold text-slate-900">{f.category}</p>
                <p className="text-sm text-slate-400">{f.createdByName} · {formatDateTime(f.createdAt)}{f.comment && ` · ${f.comment}`}</p>
              </div>
              <p className={"text-lg font-extrabold tabular " + (deleted ? "text-slate-400 line-through" : "text-red-600")}>
                −{formatTenge(f.amount)}
              </p>
            </div>
            {deleted && (
              <div className="mt-2 flex flex-wrap items-center gap-2">
                <Badge tone="red">Отменено</Badge>
                {f.deleteReason && <span className="text-xs text-red-600">Причина: {f.deleteReason} · {f.deletedByName}</span>}
              </div>
            )}
            {!deleted && canCancelRecords(role) && (
              <button onClick={() => setCancelTarget(f)} className="mt-3 text-xs font-semibold text-slate-400 transition hover:text-red-600">
                Отменить запись
              </button>
            )}
          </Card>
        );
      })}

      <CancelDialog
        open={cancelTarget !== null}
        title="Отменить постоянный расход"
        onClose={() => setCancelTarget(null)}
        onConfirm={(reason) => {
          if (cancelTarget) cancelFixedExpense(cancelTarget.id, reason);
          setCancelTarget(null);
        }}
      />
    </div>
  );
}
