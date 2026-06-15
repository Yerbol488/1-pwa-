import { useState, type FormEvent } from "react";
import { useAppData } from "../context/AppDataContext";
import { Button } from "../components/ui/Button";
import { Field } from "../components/ui/Field";
import { AmbientBackground } from "../components/ui/AmbientBackground";
import { Lock, ShieldCheck } from "lucide-react";

export function LoginPage() {
  const { currentBusiness, currentUser, login } = useAppData();
  const [pin, setPin] = useState("");
  const [error, setError] = useState<string | null>(null);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!login(pin)) {
      setError("Неверный PIN-код.");
      setPin("");
    }
  }

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-5 py-10">
      <AmbientBackground />
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-600 shadow-soft">
            <Lock className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">{currentBusiness?.name ?? "Material Flow"}</h1>
          {currentUser && <p className="mt-1 text-sm text-slate-500">{currentUser.name}</p>}
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-100 bg-white p-6 shadow-soft">
          <Field label="PIN-код">
            <input
              type="password"
              inputMode="numeric"
              autoFocus
              value={pin}
              onChange={(e) => setPin(e.target.value)}
              className="form-input text-center text-lg tracking-[0.4em]"
              placeholder="••••"
            />
          </Field>

          {error && <p className="mt-3 text-sm font-medium text-red-600">{error}</p>}

          <Button type="submit" size="lg" fullWidth className="mt-6">
            Войти
          </Button>

          <p className="mt-5 flex items-center justify-center gap-1.5 text-center text-xs text-slate-400">
            <ShieldCheck className="h-4 w-4" />
            Локальная защита. Настоящий вход появится после подключения Supabase.
          </p>
        </form>
      </div>
    </div>
  );
}
