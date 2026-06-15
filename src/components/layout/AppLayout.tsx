import { Outlet, useLocation } from "react-router-dom";
import { Header } from "./Header";
import { BottomNav } from "./BottomNav";
import { Toast } from "../ui/Toast";
import { AmbientBackground } from "../ui/AmbientBackground";

const titles: Record<string, string> = {
  "/": "Главная",
  "/dashboard": "Главная",
  "/sales": "Продажи",
  "/expenses": "Расходы",
  "/production": "Производство",
  "/stock": "Склад",
  "/items": "Товары",
  "/reports": "Отчеты",
  "/activity": "Журнал",
  "/suppliers": "Поставщики",
  "/contacts": "Контакты",
  "/settings": "Настройки",
  "/more": "Еще",
};

export function AppLayout() {
  const { pathname } = useLocation();
  const title = titles[pathname] ?? "Material Flow";

  return (
    <div className="relative min-h-full">
      <AmbientBackground />
      <Header title={title} />
      <main className="mx-auto max-w-3xl px-4 pb-28 pt-4">
        <Outlet />
      </main>
      <BottomNav />
      <Toast />
    </div>
  );
}
