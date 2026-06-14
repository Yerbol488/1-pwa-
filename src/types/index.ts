// Domain types for Material Flow — Stage 2 (local localStorage MVP).
//
// The data model is "company-first": every business record carries a
// businessId plus createdBy* fields and a syncStatus, so a future Supabase
// backend can enforce row-level security and multi-user sync without
// reshaping the UI. For this stage syncStatus is always "local".

export type SyncStatus = "local";

export type Role = "owner" | "admin" | "member";

/** Lifecycle status for accounting records (soft-delete). */
export type RecordStatus = "active" | "deleted";

/** Lifecycle status for catalog items (soft-archive). */
export type ItemStatus = "active" | "archived";

// --- Company / user / membership --------------------------------------------

export interface Business {
  id: string;
  name: string;
  ownerName: string;
  createdAt: string; // ISO 8601
  updatedAt: string;
}

export interface CurrentUser {
  id: string;
  name: string;
  createdAt: string;
}

export interface Membership {
  id: string;
  businessId: string;
  userId: string;
  userName: string;
  role: Role;
  status: "active";
  createdAt: string;
}

// --- Items ------------------------------------------------------------------

export type ItemType = "product" | "material" | "service" | "expense_category";

export type ItemTypeLabel =
  | "Товар"
  | "Материал"
  | "Услуга"
  | "Расходная категория";

export interface ItemAttribute {
  id: string;
  key: string;
  value: string;
}

/** Keys mapped to lucide icons in the icon registry (data/icons.tsx). */
export type ItemIconKey =
  | "block"
  | "glue"
  | "cement"
  | "sand"
  | "pallet"
  | "delivery"
  | "brick"
  | "paint"
  | "tool"
  | "box";

export interface Item {
  id: string;
  businessId: string;
  name: string;
  type: ItemType;
  typeLabel: ItemTypeLabel;
  unit: string;
  salePrice: number;
  purchasePrice: number;
  stockQuantity: number;
  icon: ItemIconKey;
  comment: string;
  attributes: ItemAttribute[];
  status: ItemStatus;
  createdByUserId: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
  syncStatus: SyncStatus;
}

// --- Transactions -----------------------------------------------------------

export type PaymentType = "Наличные" | "Карта" | "Перевод" | "В долг";

/** Fields shared by every soft-deletable accounting record. */
export interface SoftDeleteFields {
  status: RecordStatus;
  deletedAt?: string;
  deletedByUserId?: string;
  deletedByName?: string;
  deleteReason?: string;
}

export interface Sale extends SoftDeleteFields {
  id: string;
  businessId: string;
  itemId: string;
  itemName: string;
  quantity: number;
  price: number;
  total: number;
  paymentType: PaymentType;
  comment: string;
  createdByUserId: string;
  createdByName: string;
  createdAt: string;
  syncStatus: SyncStatus;
}

export interface Expense extends SoftDeleteFields {
  id: string;
  businessId: string;
  category: string;
  amount: number;
  comment: string;
  createdByUserId: string;
  createdByName: string;
  createdAt: string;
  syncStatus: SyncStatus;
}

export interface Production extends SoftDeleteFields {
  id: string;
  businessId: string;
  itemId: string;
  itemName: string;
  quantity: number;
  comment: string;
  createdByUserId: string;
  createdByName: string;
  createdAt: string;
  syncStatus: SyncStatus;
}

// --- Activity / audit log ---------------------------------------------------

export type ActionType =
  | "company_created"
  | "item_created"
  | "item_archived"
  | "sale_created"
  | "sale_deleted"
  | "expense_created"
  | "expense_deleted"
  | "production_created"
  | "production_deleted"
  | "demo_data_reset";

export type EntityType =
  | "company"
  | "item"
  | "sale"
  | "expense"
  | "production"
  | "system";

export interface ActivityLog {
  id: string;
  businessId: string;
  userId: string;
  userName: string;
  actionType: ActionType;
  entityType: EntityType;
  entityId: string;
  description: string;
  createdAt: string;
  syncStatus: SyncStatus;
}

// --- Persisted application state shape ---------------------------------------

export interface AppState {
  businesses: Business[];
  currentBusinessId: string | null;
  currentUser: CurrentUser | null;
  memberships: Membership[];
  items: Item[];
  sales: Sale[];
  expenses: Expense[];
  production: Production[];
  activity: ActivityLog[];
}
