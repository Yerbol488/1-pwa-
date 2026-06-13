# Material Flow

Учет продаж, расходов, производства и склада для одной компании
(производство и продажа газоблоков, клея, цемента, материалов, доставки).

**Этап 1 — только статичный фронтенд UI на моковых данных.** Без backend,
Supabase, IndexedDB/Dexie, реальной авторизации и синхронизации.

## Стек

- Vite + React + TypeScript
- Tailwind CSS
- React Router
- lucide-react (только иконки)

## Запуск

```bash
npm install
npm run dev      # запуск дев-сервера
npm run build    # сборка в dist/ (tsc + vite build)
npm run preview  # предпросмотр собранной версии
npm run lint     # проверка типов (tsc --noEmit)
```

Откройте адрес, который покажет Vite (обычно http://localhost:5173).
На экране входа нажмите «Войти» — поля уже заполнены демо-значениями.

## Страницы

Login · Главная · Продажи · Расходы · Производство · Склад · Товары ·
Отчеты · Журнал · Настройки. Нижняя навигация (моб.): Главная, Продажи,
Склад, Отчеты, Еще. Раздел «Еще» ведет в Расходы, Производство, Товары,
Журнал, Настройки.

## Структура

```
src/
  app/        App.tsx, routes.tsx, auth.tsx (мок-авторизация)
  pages/      10 страниц + MorePage
  components/
    layout/   AppLayout, Header, BottomNav
    ui/       Card, Button, Badge, StatCard, PageTitle
    business/ ItemCard, StockCard, ActivityItem
  data/       mockData.ts, icons.tsx
  types/      index.ts (типы с future-ready полями)
  lib/        format.ts
  styles/     globals.css
```
