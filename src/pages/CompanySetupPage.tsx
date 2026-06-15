import { useState, type FormEvent } from "react";
import { useAppData } from "../context/AppDataContext";
import { Button } from "../components/ui/Button";
import { Field } from "../components/ui/Field";
import { AmbientBackground } from "../components/ui/AmbientBackground";
import { Boxes, Building2, User, Lock, ShieldCheck } from "lucide-react";

export function CompanySetupPage() {
  const { createCompany } = useAppData();
  const [companyName, setCompanyName] = useState("");
  const [userName, setUserName] = useState("");
  const [pin, setPin] = useState("");
  const [pin2, setPin2] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!companyName.trim() || !userName.trim()) {
      setError("Заполните название компании и ваше имя.");
      return;
    }
    if (pin.trim() && pin.trim().length < 4) {
      setError("PIN-код должен быть не короче 4 символов.");
      return;
    }
    if (pin.trim() !== pin2.trim()) {
      setError("PIN-коды не совпадают.");
      return;
    }
    setError(null);
    createCompany(companyName, userName, pin.trim() || undefined);
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-5 py-10">
      <AmbientBackground />
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-600 shadow-soft">
            <Boxes className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">Добро пожаловать</h1>
          <p className="mt-1 text-sm text-slate-500">Создайте компанию для учета материалов</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-soft">
          <div className="space-y-4">
            <Field label="Название компании">
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 focus-within:border-brand-500 focus-within:bg-white">
                <Building2 className="h-5 w-5 text-slate-400" />
                <input
                  value={companyName}
                  onChange={(e) => setCompanyName(e.target.value)}
                  className="h-12 w-full bg-transparent text-sm text-slate-900 outline-none"
                  placeholder="Например: Газоблок Караганда"
                />
              </div>
            </Field>

            <Field label="Ваше имя">
              <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 focus-within:border-brand-500 focus-within:bg-white">
                <User className="h-5 w-5 text-slate-400" />
                <input
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="h-12 w-full bg-transparent text-sm text-slate-900 outline-none"
                  placeholder="Например: Отец"
                />
              </div>
            </Field>

            <div className="grid grid-cols-2 gap-3">
              <Field label="PIN-код">
                <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 focus-within:border-brand-500 focus-within:bg-white">
                  <Lock className="h-5 w-5 text-slate-400" />
                  <input
                    type="password"
                    inputMode="numeric"
                    value={pin}
                    onChange={(e) => setPin(e.target.value)}
                    className="h-12 w-full bg-transparent text-sm text-slate-900 outline-none"
                    placeholder="••••"
                  />
                </div>
              </Field>
              <Field label="Повтор PIN">
                <input
                  type="password"
                  inputMode="numeric"
                  value={pin2}
                  onChange={(e) => setPin2(e.target.value)}
                  className="form-input"
                  placeholder="••••"
                />
              </Field>
            </div>
            <p className="text-xs text-slate-400">PIN можно не указывать. Его можно добавить позже в настройках.</p>
          </div>

          {error && <p className="mt-3 text-sm font-medium text-red-600">{error}</p>}

          <Button type="submit" size="lg" fullWidth className="mt-6">
            Создать компанию
          </Button>

          <p className="mt-5 flex items-center justify-center gap-1.5 text-center text-xs text-slate-400">
            <ShieldCheck className="h-4 w-4" />
            Данные пока хранятся только на этом устройстве
          </p>
        </form>
      </div>
    </div>
  );
}
