import { useState, type FormEvent } from "react";
import { Card, CardBody } from "../components/ui/Card";
import { Button } from "../components/ui/Button";
import { Badge } from "../components/ui/Badge";
import { PageTitle } from "../components/ui/PageTitle";
import { Field } from "../components/ui/Field";
import { CancelDialog } from "../components/business/CancelDialog";
import { useAppData } from "../context/AppDataContext";
import { canCancelRecords } from "../lib/permissions";
import { formatTenge, formatDateTime } from "../lib/format";
import { expenseCategories } from "../data/seedData";
import type { Expense } from "../types";
import { Plus, Wallet } from "lucide-react";

export function ExpensesPage() {
  const { activeExpenses, allExpenses, addExpense, cancelExpense, role } = useAppData();

  const [category, setCategory] = useState(expenseCategories[0]);
  const [amount, setAmount] = useState("");
  const [comment, setComment] = useState("");
  const [error, setError] = useState<string | null>(null);

  const [showCancelled, setShowCancelled] = useState(false);
  const [cancelTarget, setCancelTarget] = useState<Expense | null>(null);

  const list = showCancelled ? allExpenses : activeExpenses;
  const total = activeExpenses.reduce((sum, e) => sum + e.amount, 0);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const amt = Number(amount);
    if (!amt || amt <= 0) return setError("Введите сумму больше нуля.");
    const res = addExpense({ category, amount: amt, comment });
    if (!res.ok) return setError(res.error ?? "Не удалось сохранить расход.");
    setError(null);
    setAmount("");
    setComment("");
  }

  return (
    <div className="space-y-5">
      <PageTitle title="Расходы" subtitle={`Активных расходов: ${formatTenge(total)}`} />

      {/* Add expense form */}
      <Card>
        <CardBody className="space-y-3">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-red-50 text-red-600">
              <Wallet className="h-5 w-5" />
            </span>
            <h2 className="text-base font-bold text-slate-900">Новый расход</h2>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3">
            <Field label="Категория">
              <select className="form-input" value={category} onChange={(e) => setCategory(e.target.value)}>
                {expenseCategories.map((c) => (
                  <option key={c}>{c}</option>
                ))}
              </select>
            </Field>

            <Field label="Сумма">
              <input
                className="form-input"
                inputMode="numeric"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="0 ₸"
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

            <Button type="submit" variant="danger" size="lg" fullWidth>
              <Plus className="h-5 w-5" /> Добавить расход
            </Button>
          </form>
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

        {list.length === 0 && <p className="px-1 text-sm text-slate-400">Расходов пока нет.</p>}

        {list.map((exp) => {
          const deleted = exp.status === "deleted";
          return (
            <Card key={exp.id} className={deleted ? "border-red-100 bg-red-50/40 p-4" : "p-4"}>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-base font-bold text-slate-900">{exp.category}</p>
                  <p className="text-sm text-slate-400">
                    {exp.createdByName} · {formatDateTime(exp.createdAt)}
                    {exp.comment && ` · ${exp.comment}`}
                  </p>
                </div>
                <p className={"text-lg font-extrabold tabular " + (deleted ? "text-slate-400 line-through" : "text-red-600")}>
                  −{formatTenge(exp.amount)}
                </p>
              </div>
              {deleted && (
                <div className="mt-2 flex flex-wrap items-center gap-2">
                  <Badge tone="red">Отменено</Badge>
                  {exp.deleteReason && (
                    <span className="text-xs text-red-600">Причина: {exp.deleteReason} · {exp.deletedByName}</span>
                  )}
                </div>
              )}
              {!deleted && canCancelRecords(role) && (
                <button
                  onClick={() => setCancelTarget(exp)}
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
        title="Отменить расход"
        onClose={() => setCancelTarget(null)}
        onConfirm={(reason) => {
          if (cancelTarget) cancelExpense(cancelTarget.id, reason);
          setCancelTarget(null);
        }}
      />
    </div>
  );
}
