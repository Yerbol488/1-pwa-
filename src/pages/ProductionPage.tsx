import { Card, CardBody } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { PageTitle } from "../components/ui/PageTitle";
import { Field } from "./SalesPage";
import { items, production } from "../data/mockData";
import { formatNumber } from "../lib/format";
import { Plus, Factory, CalendarDays } from "lucide-react";

export function ProductionPage() {
  const total = production.reduce((sum, p) => sum + p.quantity, 0);

  return (
    <div className="space-y-5">
      <PageTitle title="Производство" subtitle={`Выпущено за период: ${formatNumber(total)} шт`} />

      {/* Add production form mockup */}
      <Card>
        <CardBody className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-blue-50 text-brand-600">
              <Factory className="h-5 w-5" />
            </span>
            <h2 className="text-base font-bold text-slate-900">Новая партия</h2>
          </div>

          <Field label="Товар">
            <select className="form-input">
              {items
                .filter((i) => i.type === "Товар")
                .map((i) => (
                  <option key={i.id}>{i.name}</option>
                ))}
            </select>
          </Field>

          <Field label="Количество">
            <input className="form-input" inputMode="numeric" placeholder="0" defaultValue="1200" />
          </Field>

          <Field label="Комментарий">
            <input className="form-input" placeholder="Необязательно" />
          </Field>

          <Button variant="primary" size="lg" fullWidth>
            <Plus className="h-5 w-5" /> Добавить производство
          </Button>
        </CardBody>
      </Card>

      {/* Production list */}
      <div className="space-y-3">
        <h2 className="px-1 text-sm font-bold uppercase tracking-wide text-slate-400">История</h2>
        {production.map((p) => (
          <Card key={p.id} className="flex items-center justify-between p-4">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-50 text-brand-600">
                <CalendarDays className="h-5 w-5" />
              </span>
              <div>
                <p className="text-base font-bold text-slate-900">{p.item_name}</p>
                <p className="text-sm text-slate-400">
                  {p.created_by}
                  {p.comment && ` · ${p.comment}`}
                </p>
              </div>
            </div>
            <p className="text-lg font-extrabold text-brand-600 tabular">+{formatNumber(p.quantity)}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
