// Single place that talks to localStorage. Pages and the context never touch
// window.localStorage directly — they go through these helpers.

import type {
  ActivityLog,
  Business,
  Client,
  CurrentUser,
  FixedExpense,
  Item,
  Membership,
  OneOffExpense,
  Production,
  Sale,
  StockMovement,
  StockPurchase,
  Supplier,
} from "../types";

export const STORAGE_VERSION = 5;

export const STORAGE_KEYS = {
  businesses: "materialFlow.businesses",
  currentBusinessId: "materialFlow.currentBusinessId",
  currentUser: "materialFlow.currentUser",
  memberships: "materialFlow.memberships",
  items: "materialFlow.items",
  sales: "materialFlow.sales",
  stockPurchases: "materialFlow.stockPurchases",
  oneOffExpenses: "materialFlow.oneOffExpenses",
  fixedExpenses: "materialFlow.fixedExpenses",
  production: "materialFlow.production",
  suppliers: "materialFlow.suppliers",
  clients: "materialFlow.clients",
  stockMovements: "materialFlow.stockMovements",
  activity: "materialFlow.activity",
  pinHash: "materialFlow.pinHash",
  storageVersion: "materialFlow.storageVersion",
} as const;

/** Legacy Stage 2 key (single expenses array) — read only, for migration. */
export const LEGACY_EXPENSES_KEY = "materialFlow.expenses";

export function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

export function saveJSON<T>(key: string, value: T): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* storage full / unavailable — ignore in local MVP */
  }
}

export function loadString(key: string): string | null {
  try {
    return window.localStorage.getItem(key);
  } catch {
    return null;
  }
}

export function saveString(key: string, value: string | null): void {
  try {
    if (value === null) window.localStorage.removeItem(key);
    else window.localStorage.setItem(key, value);
  } catch {
    /* ignore */
  }
}

export function removeKey(key: string): void {
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

/** Remove every Material Flow business-data key (keeps nothing). */
export function clearAllStorage(): void {
  Object.values(STORAGE_KEYS).forEach(removeKey);
  removeKey(LEGACY_EXPENSES_KEY);
}

// --- Typed convenience loaders ----------------------------------------------

export const loadBusinesses = () => loadJSON<Business[]>(STORAGE_KEYS.businesses, []);
export const loadCurrentUser = () => loadJSON<CurrentUser | null>(STORAGE_KEYS.currentUser, null);
export const loadMemberships = () => loadJSON<Membership[]>(STORAGE_KEYS.memberships, []);
export const loadItems = () => loadJSON<Item[]>(STORAGE_KEYS.items, []);
export const loadSales = () => loadJSON<Sale[]>(STORAGE_KEYS.sales, []);
export const loadStockPurchases = () => loadJSON<StockPurchase[]>(STORAGE_KEYS.stockPurchases, []);
export const loadOneOffExpenses = () => loadJSON<OneOffExpense[]>(STORAGE_KEYS.oneOffExpenses, []);
export const loadFixedExpenses = () => loadJSON<FixedExpense[]>(STORAGE_KEYS.fixedExpenses, []);
export const loadProduction = () => loadJSON<Production[]>(STORAGE_KEYS.production, []);
export const loadSuppliers = () => loadJSON<Supplier[]>(STORAGE_KEYS.suppliers, []);
export const loadClients = () => loadJSON<Client[]>(STORAGE_KEYS.clients, []);
export const loadStockMovements = () => loadJSON<StockMovement[]>(STORAGE_KEYS.stockMovements, []);
export const loadActivity = () => loadJSON<ActivityLog[]>(STORAGE_KEYS.activity, []);

// --- ID + time helpers ------------------------------------------------------

export function uid(prefix = "id"): string {
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${Date.now().toString(36)}${rand}`;
}

export function nowIso(): string {
  return new Date().toISOString();
}
