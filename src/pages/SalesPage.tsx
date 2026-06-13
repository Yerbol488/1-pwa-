import type { ReactNode } from "react";
import { Card, CardBody } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { PageTitle } from "../components/ui/PageTitle";
import { items, paymentTypes, sales } from "../data/mockData";
import { formatNumber, formatTenge } from "../lib/format";
import { Plus, ShoppingCart } from "lucide-react";

const paymentTone = {
  Наличные: "green",
  Карта: "blue",
  Перевод: "blue",
  "В долг": "amber",
} as const;

export function SalesPage() {
  return (
    <div className="space-y-5">
      <PageTitle title="Продажи" subtitle="Сегодня · 4 операции" />

      {/* Add sale form mockup */}
      <Card>
        <CardBody className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-emerald-50 text-emerald-600">
              <ShoppingCart className="h-5 w-5" />
            </span>
            <h2 className="text-base font-bold text-slate-900">Новая продажа</h2>
          </div>

          <Field label="Товар">
            <select className="form-input">
              {items
                .filter((i) => i.type === "Товар" || i.type === "Услуга")
                .map((i) => (
                  <option key={i.id}>{i.name}</option>
                ))}
            </select>
          </Field>

          <div className="grid grid-cols-2 gap-3">
            <Field label="Количество">
              <input className="form-input" inputMode="numeric" defaultValue="300" />
            </Field>
            <Field label="Цена за ед.">
              <input className="form-input" inputMode="numeric" defaultValue="480" />
            </Field>
          </div>

          <div className="flex items-center justify-between rounded-xl bg-slate-50 px-4 py-3">
            <span className="text-sm font-medium text-slate-500">Итог</span>
            <span className="text-xl font-extrabold text-slate-900 tabular">{formatTenge(144000)}</span>
          </div>

          <Field label="Тип оплаты">
            <select className="form-input">
              {paymentTypes.map((p) => (
                <option key={p}>{p}</option>
              ))}
            </select>
          </Field>

          <Field label="Комментарий">
            <input className="form-input" placeholder="Необязательно" />
          </Field>

          <Button variant="success" size="lg" fullWidth>
            <Plus className="h-5 w-5" /> Добавить продажу
          </Button>
        </CardBody>
      </Card>

      {/* Sales list */}
      <div className="space-y-3">
        <h2 className="px-1 text-sm font-bold uppercase tracking-wide text-slate-400">История</h2>
        {sales.map((sale) => (
          <Card key={sale.id} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-base font-bold text-slate-900">{sale.item_name}</p>
                <p className="text-sm text-slate-500 tabular">
                  {formatNumber(sale.quantity)} × {formatTenge(sale.price)}
                </p>
              </div>
              <p className="text-lg font-extrabold text-emerald-600 tabular">{formatTenge(sale.total)}</p>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-2">
              <Badge tone={paymentTone[sale.payment_type]}>{sale.payment_type}</Badge>
              <span className="text-xs text-slate-400">{sale.created_by}</span>
              {sale.comment && <span className="text-xs text-slate-400">· {sale.comment}</span>}
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-sm font-medium text-slate-600">{label}</span>
      {children}
    </label>
  );
}
