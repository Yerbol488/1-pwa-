// Domain types for Material Flow — Stage 3 (universal local accounting MVP).
//
// Company-first: every record carries businessId + createdBy* + syncStatus so a
// future Supabase backend can enforce RLS without reshaping the UI. syncStatus
// is always "local" for now.

export type SyncStatus = "local";

export type Role = "owner" | "admin" | "member";

/** Lifecycle status for accounting records (soft-delete). */
export type RecordStatus = "active" | "deleted";

/** Lifecycle status for catalog items / suppliers (soft-archive). */
export type ArchiveStatus = "active" | "archived";

// --- Company / user / membership --------------------------------------------

export interface Business {
  id: string;
  name: string;
  ownerName: string;
  createdAt: string;
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
  | "box"
  | "bag"
  | "delivery"
  | "tool"
  | "money"
  | "warehouse"
  | "block"
  | "glue"
  | "cement"
  | "sand"
  | "pallet"
  | "brick"
  | "paint";

/** How an item participates in accounting flows. */
export interface ItemBehaviorFlags {
  sellable: boolean;
  purchasable: boolean;
  stockTracked: boolean;
  consumableInProduction: boolean;
}

export interface Item extends ItemBehaviorFlags {
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
  status: ArchiveStatus;
  createdByUserId: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
  syncStatus: SyncStatus;
}

// --- Shared soft-delete -----------------------------------------------------

export interface SoftDeleteFields {
  status: RecordStatus;
  deletedAt?: string;
  deletedByUserId?: string;
  deletedByName?: string;
  deleteReason?: string;
}

/** Shared price-override fields used by sales and purchases. */
export interface PriceOverrideFields {
  originalUnitPrice?: number;
  priceOverrideReason?: string;
}

// --- Sales ------------------------------------------------------------------

export type PaymentType = "Наличные" | "Карта" | "Перевод" | "В долг";

/** Whether the customer paid fully, partially, or took goods on debt. */
export type PaymentStatus = "paid" | "partial" | "debt";

export type PaymentMethod = "cash" | "kaspi" | "card" | "other" | "none";

export interface Sale extends SoftDeleteFields, PriceOverrideFields {
  id: string;
  businessId: string;
  itemId: string;
  itemName: string;
  quantity: number;
  price: number; // actual unit price
  total: number;
  // Payment / debt
  paymentStatus: PaymentStatus;
  paymentMethod: PaymentMethod;
  paidAmount: number;
  debtAmount: number;
  customerName?: string;
  customerContactId?: string;
  paymentComment?: string;
  comment: string;
  createdByUserId: string;
  createdByName: string;
  createdAt: string;
  syncStatus: SyncStatus;
}

// --- Expenses 2.0 -----------------------------------------------------------

/** Tab 1 — purchase that increases stock and adds an expense. */
export interface StockPurchase extends SoftDeleteFields, PriceOverrideFields {
  id: string;
  businessId: string;
  itemId: string;
  itemName: string;
  quantity: number;
  unit: string;
  unitPrice: number; // actual unit price
  itemSubtotal: number; // quantity * unitPrice
  deliveryCost: number;
  totalAmount: number; // itemSubtotal + deliveryCost
  supplierId?: string;
  supplierName?: string;
  comment: string;
  createdByUserId: string;
  createdByName: string;
  createdAt: string;
  syncStatus: SyncStatus;
}

/** Tab 2 — one-off expense/purchase that does NOT create an item or touch stock. */
export interface OneOffExpense extends SoftDeleteFields {
  id: string;
  businessId: string;
  title: string;
  amount: number;
  quantity?: number;
  unit?: string;
  deliveryCost: number;
  supplierId?: string;
  supplierName?: string;
  comment: string;
  createdByUserId: string;
  createdByName: string;
  createdAt: string;
  syncStatus: SyncStatus;
}

/** Tab 3 — fixed / recurring monthly cost. */
export interface FixedExpense extends SoftDeleteFields {
  id: string;
  businessId: string;
  category: string;
  amount: number;
  periodDate: string; // YYYY-MM-DD, the month/date the cost applies to
  comment: string;
  createdByUserId: string;
  createdByName: string;
  createdAt: string;
  syncStatus: SyncStatus;
}

// --- Production --------------------------------------------------------------

export interface ConsumedMaterial {
  itemId: string;
  itemName: string;
  quantity: number;
  unit: string;
}

export interface Production extends SoftDeleteFields {
  id: string;
  businessId: string;
  itemId: string;
  itemName: string;
  quantity: number;
  consumedMaterials: ConsumedMaterial[];
  comment: string;
  createdByUserId: string;
  createdByName: string;
  createdAt: string;
  syncStatus: SyncStatus;
}

// --- Suppliers --------------------------------------------------------------

export type SupplierStatus = "Активный" | "Запасной" | "Не использовать";

export interface Supplier {
  id: string;
  businessId: string;
  name: string;
  contactPerson: string;
  whatsappNumber: string;
  phoneNumber: string;
  sellsText: string;
  comment: string;
  supplierStatus: SupplierStatus;
  status: ArchiveStatus;
  createdByUserId: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
  syncStatus: SyncStatus;
}

// --- Clients (light CRM) ----------------------------------------------------

export type ClientStatus =
  | "Новый"
  | "Думает"
  | "Заказал"
  | "Оплатил"
  | "Доставлено"
  | "Отказался";

export interface Client {
  id: string;
  businessId: string;
  type: "client";
  name: string;
  contactPerson: string;
  whatsappNumber: string;
  phoneNumber: string;
  interestText: string;
  clientStatus: ClientStatus;
  comment: string;
  status: ArchiveStatus;
  createdByUserId: string;
  createdByName: string;
  createdAt: string;
  updatedAt: string;
  syncStatus: SyncStatus;
}

// --- Stock movements --------------------------------------------------------

export type StockMovementType =
  | "sale_out"
  | "purchase_in"
  | "production_in"
  | "production_consumption_out"
  | "writeoff_out"
  | "adjustment_in"
  | "adjustment_out";

export interface StockMovement {
  id: string;
  businessId: string;
  itemId: string;
  itemName: string;
  movementType: StockMovementType;
  quantity: number; // signed: positive = in, negative = out
  unit: string;
  relatedEntityType: EntityType;
  relatedEntityId: string;
  createdByUserId: string;
  createdByName: string;
  createdAt: string;
  syncStatus: SyncStatus;
}

// --- Activity / audit log ---------------------------------------------------

export type ActionType =
  | "company_created"
  | "demo_data_loaded"
  | "data_reset"
  | "item_created"
  | "item_updated"
  | "item_archived"
  | "sale_created"
  | "sale_cancelled"
  | "stock_purchase_created"
  | "stock_purchase_cancelled"
  | "one_off_expense_created"
  | "one_off_expense_cancelled"
  | "fixed_expense_created"
  | "fixed_expense_cancelled"
  | "production_created"
  | "production_cancelled"
  | "price_override_used"
  | "supplier_created"
  | "supplier_updated"
  | "supplier_archived"
  | "client_created"
  | "client_updated"
  | "client_archived";

export type EntityType =
  | "company"
  | "item"
  | "sale"
  | "stock_purchase"
  | "one_off_expense"
  | "fixed_expense"
  | "production"
  | "supplier"
  | "client"
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
