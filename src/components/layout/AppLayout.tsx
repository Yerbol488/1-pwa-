import { Outlet, useLocation } from "react-router-dom";
import { Header } from "./Header";
import { BottomNav } from "./BottomNav";

// Page titles keyed by route prefix for the header.
const titles: Record<string, string> = {
  "/dashboard": "Главная",
  "/sales": "Продажи",
  "/expenses": "Расходы",
  "/production": "Производство",
  "/stock": "Склад",
  "/items": "Товары",
  "/reports": "Отчеты",
  "/activity": "Журнал",
  "/settings": "Настройки",
  "/more": "Еще",
};

export function AppLayout() {
  const { pathname } = useLocation();
  const title = titles[pathname] ?? "Material Flow";

  return (
    <div className="min-h-full bg-slate-100">
      <Header title={title} />
      <main className="mx-auto max-w-3xl px-4 pb-28 pt-4">
        <Outlet />
      </main>
      <BottomNav />
    </div>
  );
}
