// Domain types for Material Flow.
// Stage 1 is static/mock, but types include future-ready fields
// (id, business_id, created_by, created_at, sync_status) so the data
// layer can later be wired to a backend without reshaping the UI.

export type SyncStatus = "synced" | "pending" | "error";

/** Category of an item in the catalog. */
export type ItemType = "Товар" | "Материал" | "Услуга" | "Расходная категория";

/** Stock health indicator. */
export type StockLevel = "ok" | "low" | "out";

/** Payment method for a sale. */
export type PaymentType = "Наличные" | "Карта" | "Перевод" | "В долг";

/** Fields shared by every persisted record. */
export interface BaseRecord {
  id: string;
  business_id: string;
  created_by: string;
  created_at: string; // ISO 8601
  sync_status: SyncStatus;
}

export interface User extends BaseRecord {
  name: string;
  role: "Владелец" | "Менеджер" | "Рабочий";
  email: string;
  active: boolean;
}

export interface Item extends BaseRecord {
  name: string;
  type: ItemType;
  unit: string; // шт, мешок, м³, услуга …
  sale_price: number; // ₸
  purchase_price: number; // ₸
  stock_quantity: number;
  comment: string;
  icon: ItemIconKey;
}

export interface Sale extends BaseRecord {
  item_name: string;
  quantity: number;
  price: number; // unit price ₸
  total: number; // ₸
  payment_type: PaymentType;
  comment: string;
}

export interface Expense extends BaseRecord {
  category: string;
  amount: number; // ₸
  comment: string;
}

export interface ProductionRecord extends BaseRecord {
  item_name: string;
  quantity: number;
  comment: string;
}

export type ActivityKind = "sale" | "expense" | "production" | "stock";

export interface ActivityLog extends BaseRecord {
  user: string;
  kind: ActivityKind;
  action: string;
  description: string;
  time: string; // HH:MM display value
}

/** Stock view model derived from items. */
export interface StockEntry {
  id: string;
  name: string;
  unit: string;
  quantity: number;
  level: StockLevel;
  icon: ItemIconKey;
}

/** Keys mapped to lucide icons in the icon registry. */
export type ItemIconKey =
  | "block"
  | "glue"
  | "cement"
  | "sand"
  | "pallet"
  | "delivery";
