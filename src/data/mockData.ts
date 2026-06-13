import type {
  ActivityLog,
  Expense,
  Item,
  ProductionRecord,
  Sale,
  StockEntry,
  User,
} from "../types";

const BUSINESS_ID = "biz_001";

// --- Dashboard summary -------------------------------------------------------

export const dashboardSummary = {
  revenueToday: 185000,
  expensesToday: 42000,
  profitToday: 143000,
  pendingSync: 3, // 0 => fully synced
};

// --- Users -------------------------------------------------------------------

export const users: User[] = [
  {
    id: "usr_1",
    business_id: BUSINESS_ID,
    created_by: "system",
    created_at: "2026-01-04T08:00:00Z",
    sync_status: "synced",
    name: "Yerkebulan",
    role: "Владелец",
    email: "owner@materialflow.kz",
    active: true,
  },
  {
    id: "usr_2",
    business_id: BUSINESS_ID,
    created_by: "usr_1",
    created_at: "2026-01-06T08:00:00Z",
    sync_status: "synced",
    name: "Алишер",
    role: "Менеджер",
    email: "alisher@materialflow.kz",
    active: true,
  },
  {
    id: "usr_3",
    business_id: BUSINESS_ID,
    created_by: "usr_1",
    created_at: "2026-01-06T08:05:00Z",
    sync_status: "synced",
    name: "Отец",
    role: "Рабочий",
    email: "production@materialflow.kz",
    active: true,
  },
];

// --- Items / catalog ---------------------------------------------------------

export const items: Item[] = [
  {
    id: "itm_1",
    business_id: BUSINESS_ID,
    created_by: "usr_1",
    created_at: "2026-02-01T09:00:00Z",
    sync_status: "synced",
    name: "Газоблок",
    type: "Товар",
    unit: "шт",
    sale_price: 480,
    purchase_price: 360,
    stock_quantity: 4820,
    comment: "Основной товар, D500",
    icon: "block",
  },
  {
    id: "itm_2",
    business_id: BUSINESS_ID,
    created_by: "usr_1",
    created_at: "2026-02-01T09:05:00Z",
    sync_status: "synced",
    name: "Клей",
    type: "Товар",
    unit: "мешок",
    sale_price: 2300,
    purchase_price: 1750,
    stock_quantity: 136,
    comment: "Монтажный, 25 кг",
    icon: "glue",
  },
  {
    id: "itm_3",
    business_id: BUSINESS_ID,
    created_by: "usr_1",
    created_at: "2026-02-01T09:10:00Z",
    sync_status: "pending",
    name: "Цемент",
    type: "Материал",
    unit: "мешок",
    sale_price: 2100,
    purchase_price: 1600,
    stock_quantity: 40,
    comment: "М400, для производства",
    icon: "cement",
  },
  {
    id: "itm_4",
    business_id: BUSINESS_ID,
    created_by: "usr_1",
    created_at: "2026-02-01T09:15:00Z",
    sync_status: "synced",
    name: "Песок",
    type: "Материал",
    unit: "м³",
    sale_price: 9000,
    purchase_price: 6500,
    stock_quantity: 12,
    comment: "Мытый, фракция 0–5",
    icon: "sand",
  },
  {
    id: "itm_5",
    business_id: BUSINESS_ID,
    created_by: "usr_1",
    created_at: "2026-02-01T09:20:00Z",
    sync_status: "synced",
    name: "Поддоны",
    type: "Товар",
    unit: "шт",
    sale_price: 3500,
    purchase_price: 2400,
    stock_quantity: 58,
    comment: "Деревянные, 1200×800",
    icon: "pallet",
  },
  {
    id: "itm_6",
    business_id: BUSINESS_ID,
    created_by: "usr_1",
    created_at: "2026-02-01T09:25:00Z",
    sync_status: "synced",
    name: "Доставка",
    type: "Услуга",
    unit: "рейс",
    sale_price: 15000,
    purchase_price: 9000,
    stock_quantity: 0,
    comment: "По городу до 5 тонн",
    icon: "delivery",
  },
];

// --- Stock (derived view model) ---------------------------------------------

export const stockEntries: StockEntry[] = [
  { id: "stk_1", name: "Газоблок", unit: "шт", quantity: 4820, level: "ok", icon: "block" },
  { id: "stk_2", name: "Клей", unit: "мешков", quantity: 136, level: "ok", icon: "glue" },
  { id: "stk_3", name: "Цемент", unit: "мешков", quantity: 40, level: "low", icon: "cement" },
  { id: "stk_4", name: "Песок", unit: "м³", quantity: 12, level: "low", icon: "sand" },
  { id: "stk_5", name: "Поддоны", unit: "шт", quantity: 58, level: "ok", icon: "pallet" },
  { id: "stk_6", name: "Цемент М500", unit: "мешков", quantity: 6, level: "out", icon: "cement" },
];

// --- Sales -------------------------------------------------------------------

export const sales: Sale[] = [
  {
    id: "sal_1",
    business_id: BUSINESS_ID,
    created_by: "Алишер",
    created_at: "2026-06-13T15:42:00Z",
    sync_status: "pending",
    item_name: "Газоблок",
    quantity: 300,
    price: 480,
    total: 144000,
    payment_type: "Перевод",
    comment: "Постоянный клиент, объект Туран",
  },
  {
    id: "sal_2",
    business_id: BUSINESS_ID,
    created_by: "Алишер",
    created_at: "2026-06-13T13:05:00Z",
    sync_status: "synced",
    item_name: "Клей",
    quantity: 12,
    price: 2300,
    total: 27600,
    payment_type: "Наличные",
    comment: "",
  },
  {
    id: "sal_3",
    business_id: BUSINESS_ID,
    created_by: "Yerkebulan",
    created_at: "2026-06-13T11:20:00Z",
    sync_status: "synced",
    item_name: "Доставка",
    quantity: 1,
    price: 15000,
    total: 15000,
    payment_type: "Карта",
    comment: "Район Алгабас",
  },
  {
    id: "sal_4",
    business_id: BUSINESS_ID,
    created_by: "Алишер",
    created_at: "2026-06-12T17:48:00Z",
    sync_status: "synced",
    item_name: "Поддоны",
    quantity: 8,
    price: 3500,
    total: 28000,
    payment_type: "В долг",
    comment: "Оплата до пятницы",
  },
];

// --- Expenses ----------------------------------------------------------------

export const expenses: Expense[] = [
  {
    id: "exp_1",
    business_id: BUSINESS_ID,
    created_by: "Yerkebulan",
    created_at: "2026-06-13T12:30:00Z",
    sync_status: "synced",
    category: "Цемент",
    amount: 35000,
    comment: "Закуп 20 мешков М400",
  },
  {
    id: "exp_2",
    business_id: BUSINESS_ID,
    created_by: "Алишер",
    created_at: "2026-06-13T10:10:00Z",
    sync_status: "synced",
    category: "Топливо",
    amount: 12000,
    comment: "Дизель для грузовика",
  },
  {
    id: "exp_3",
    business_id: BUSINESS_ID,
    created_by: "Отец",
    created_at: "2026-06-12T16:00:00Z",
    sync_status: "pending",
    category: "Зарплата",
    amount: 60000,
    comment: "Аванс рабочим",
  },
  {
    id: "exp_4",
    business_id: BUSINESS_ID,
    created_by: "Yerkebulan",
    created_at: "2026-06-12T09:30:00Z",
    sync_status: "synced",
    category: "Ремонт",
    amount: 18500,
    comment: "Замена формы для блоков",
  },
];

// --- Production --------------------------------------------------------------

export const production: ProductionRecord[] = [
  {
    id: "prd_1",
    business_id: BUSINESS_ID,
    created_by: "Отец",
    created_at: "2026-06-13T14:10:00Z",
    sync_status: "synced",
    item_name: "Газоблок",
    quantity: 1200,
    comment: "Партия №47, сушка 2 дня",
  },
  {
    id: "prd_2",
    business_id: BUSINESS_ID,
    created_by: "Отец",
    created_at: "2026-06-12T14:30:00Z",
    sync_status: "synced",
    item_name: "Газоблок",
    quantity: 1000,
    comment: "Партия №46",
  },
  {
    id: "prd_3",
    business_id: BUSINESS_ID,
    created_by: "Отец",
    created_at: "2026-06-11T15:00:00Z",
    sync_status: "synced",
    item_name: "Газоблок",
    quantity: 1350,
    comment: "Партия №45, отличное качество",
  },
];

// --- Activity log ------------------------------------------------------------

export const activity: ActivityLog[] = [
  {
    id: "act_1",
    business_id: BUSINESS_ID,
    created_by: "Алишер",
    created_at: "2026-06-13T15:42:00Z",
    sync_status: "pending",
    user: "Алишер",
    kind: "sale",
    action: "Продажа",
    description: "Продал газоблок 300 шт",
    time: "15:42",
  },
  {
    id: "act_2",
    business_id: BUSINESS_ID,
    created_by: "Отец",
    created_at: "2026-06-13T14:10:00Z",
    sync_status: "synced",
    user: "Отец",
    kind: "production",
    action: "Производство",
    description: "Производство +1200",
    time: "14:10",
  },
  {
    id: "act_3",
    business_id: BUSINESS_ID,
    created_by: "Yerkebulan",
    created_at: "2026-06-13T12:30:00Z",
    sync_status: "synced",
    user: "Yerkebulan",
    kind: "expense",
    action: "Расход",
    description: "Расход цемент 35 000 ₸",
    time: "12:30",
  },
  {
    id: "act_4",
    business_id: BUSINESS_ID,
    created_by: "Алишер",
    created_at: "2026-06-13T11:20:00Z",
    sync_status: "synced",
    user: "Алишер",
    kind: "sale",
    action: "Продажа",
    description: "Доставка — район Алгабас, 15 000 ₸",
    time: "11:20",
  },
  {
    id: "act_5",
    business_id: BUSINESS_ID,
    created_by: "Yerkebulan",
    created_at: "2026-06-13T09:15:00Z",
    sync_status: "synced",
    user: "Yerkebulan",
    kind: "stock",
    action: "Склад",
    description: "Корректировка остатков: песок −2 м³",
    time: "09:15",
  },
];

// --- Reports -----------------------------------------------------------------

export interface WeeklyBar {
  label: string; // day of week
  revenue: number;
  expense: number;
}

export const weeklyBars: WeeklyBar[] = [
  { label: "Пн", revenue: 120000, expense: 40000 },
  { label: "Вт", revenue: 165000, expense: 52000 },
  { label: "Ср", revenue: 98000, expense: 30000 },
  { label: "Чт", revenue: 210000, expense: 61000 },
  { label: "Пт", revenue: 178000, expense: 44000 },
  { label: "Сб", revenue: 185000, expense: 42000 },
  { label: "Вс", revenue: 76000, expense: 21000 },
];

export const reportSummary = {
  revenueWeek: 1032000,
  expenseWeek: 290000,
  profitWeek: 742000,
  topItem: "Газоблок",
  topItemUnits: 5200,
};

// Payment-type options for the sale form mockup.
export const paymentTypes = ["Наличные", "Карта", "Перевод", "В долг"] as const;

// Expense category options for the expense form mockup.
export const expenseCategories = [
  "Цемент",
  "Песок",
  "Топливо",
  "Зарплата",
  "Ремонт",
  "Аренда",
  "Прочее",
];
