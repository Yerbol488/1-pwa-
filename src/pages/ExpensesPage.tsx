import { Card, CardBody } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { PageTitle } from "../components/ui/PageTitle";
import { Field } from "./SalesPage";
import { expenseCategories, expenses } from "../data/mockData";
import { formatTenge } from "../lib/format";
import { Plus, Wallet } from "lucide-react";

export function ExpensesPage() {
  const total = expenses.reduce((sum, e) => sum + e.amount, 0);

  return (
    <div className="space-y-5">
      <PageTitle title="Расходы" subtitle={`Всего за период: ${formatTenge(total)}`} />

      {/* Add expense form mockup */}
      <Card>
        <CardBody className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <Wallet className="h-5 w-5" />
            </span>
            <h2 className="text-base font-bold text-slate-900">Новый расход</h2>
          </div>

          <Field label="Категория">
            <select className="form-input">
              {expenseCategories.map((c) => (
                <option key={c}>{c}</option>
              ))}
            </select>
          </Field>

          <Field label="Сумма">
            <input className="form-input" inputMode="numeric" placeholder="0 ₸" defaultValue="35000" />
          </Field>

          <Field label="Комментарий">
            <input className="form-input" placeholder="Необязательно" />
          </Field>

          <Button variant="danger" size="lg" fullWidth>
            <Plus className="h-5 w-5" /> Добавить расход
          </Button>
        </CardBody>
      </Card>

      {/* Expense list */}
      <div className="space-y-3">
        <h2 className="px-1 text-sm font-bold uppercase tracking-wide text-slate-400">История</h2>
        {expenses.map((e) => (
          <Card key={e.id} className="flex items-center justify-between p-4">
            <div>
              <p className="text-base font-bold text-slate-900">{e.category}</p>
              <p className="text-sm text-slate-400">
                {e.created_by}
                {e.comment && ` · ${e.comment}`}
              </p>
            </div>
            <p className="text-lg font-extrabold text-red-600 tabular">−{formatTenge(e.amount)}</p>
          </Card>
        ))}
      </div>
    </div>
  );
}
