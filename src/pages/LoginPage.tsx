import { useState, type FormEvent } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../app/auth";
import { Button } from "../components/ui/Button";
import { Boxes, Lock, Mail, ShieldCheck } from "lucide-react";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("owner@materialflow.kz");
  const [password, setPassword] = useState("demo1234");

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    // Stage 1: no real auth — just flip mock state and go to dashboard.
    login();
    navigate("/dashboard");
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-gradient-to-b from-slate-100 to-blue-50 px-5">
      <div className="w-full max-w-sm">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-brand-600 shadow-soft">
            <Boxes className="h-8 w-8 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold text-slate-900">Material Flow</h1>
          <p className="mt-1 text-sm text-slate-500">
            Учет продаж, расходов, производства и склада
          </p>
        </div>

        <form
          onSubmit={handleSubmit}
          className="rounded-2xl border border-slate-100 bg-white p-6 shadow-soft"
        >
          <label className="mb-4 block">
            <span className="mb-1.5 block text-sm font-medium text-slate-600">Email</span>
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 focus-within:border-brand-500 focus-within:bg-white">
              <Mail className="h-5 w-5 text-slate-400" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-12 w-full bg-transparent text-sm text-slate-900 outline-none"
                placeholder="you@company.kz"
                required
              />
            </div>
          </label>

          <label className="mb-6 block">
            <span className="mb-1.5 block text-sm font-medium text-slate-600">Пароль</span>
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 bg-slate-50 px-3 focus-within:border-brand-500 focus-within:bg-white">
              <Lock className="h-5 w-5 text-slate-400" />
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="h-12 w-full bg-transparent text-sm text-slate-900 outline-none"
                placeholder="••••••••"
                required
              />
            </div>
          </label>

          <Button type="submit" size="lg" fullWidth>
            Войти
          </Button>

          <p className="mt-5 flex items-center justify-center gap-1.5 text-center text-xs text-slate-400">
            <ShieldCheck className="h-4 w-4" />
            Закрытая система для сотрудников компании
          </p>
        </form>
      </div>
    </div>
  );
}
