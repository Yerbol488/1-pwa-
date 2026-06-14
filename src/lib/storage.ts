// Single place that talks to localStorage.
// Pages and the context never touch window.localStorage directly — they go
// through these helpers, so the persistence format stays in one file.

import type {
  ActivityLog,
  Business,
  CurrentUser,
  Expense,
  Item,
  Membership,
  Production,
  Sale,
} from "../types";

export const STORAGE_KEYS = {
  businesses: "materialFlow.businesses",
  currentBusinessId: "materialFlow.currentBusinessId",
  currentUser: "materialFlow.currentUser",
  memberships: "materialFlow.memberships",
  items: "materialFlow.items",
  sales: "materialFlow.sales",
  expenses: "materialFlow.expenses",
  production: "materialFlow.production",
  activity: "materialFlow.activity",
} as const;

/** Read + JSON.parse a value, returning fallback on any error. */
export function loadJSON<T>(key: string, fallback: T): T {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw === null) return fallback;
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/** JSON.stringify + write a value. */
export function saveJSON<T>(key: string, value: T): void {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch {
    // Storage full / unavailable — ignore in this local MVP.
  }
}

/** Read a plain string value (used for currentBusinessId). */
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
    // ignore
  }
}

/** Remove every Material Flow key (used by "reset demo data"). */
export function clearAllStorage(): void {
  Object.values(STORAGE_KEYS).forEach((key) => {
    try {
      window.localStorage.removeItem(key);
    } catch {
      // ignore
    }
  });
}

// --- Typed convenience loaders ----------------------------------------------

export function loadBusinesses(): Business[] {
  return loadJSON<Business[]>(STORAGE_KEYS.businesses, []);
}
export function loadCurrentUser(): CurrentUser | null {
  return loadJSON<CurrentUser | null>(STORAGE_KEYS.currentUser, null);
}
export function loadMemberships(): Membership[] {
  return loadJSON<Membership[]>(STORAGE_KEYS.memberships, []);
}
export function loadItems(): Item[] {
  return loadJSON<Item[]>(STORAGE_KEYS.items, []);
}
export function loadSales(): Sale[] {
  return loadJSON<Sale[]>(STORAGE_KEYS.sales, []);
}
export function loadExpenses(): Expense[] {
  return loadJSON<Expense[]>(STORAGE_KEYS.expenses, []);
}
export function loadProduction(): Production[] {
  return loadJSON<Production[]>(STORAGE_KEYS.production, []);
}
export function loadActivity(): ActivityLog[] {
  return loadJSON<ActivityLog[]>(STORAGE_KEYS.activity, []);
}

// --- ID + time helpers ------------------------------------------------------

/** Short unique id, good enough for a local single-device MVP. */
export function uid(prefix = "id"): string {
  const rand = Math.random().toString(36).slice(2, 8);
  return `${prefix}_${Date.now().toString(36)}${rand}`;
}

export function nowIso(): string {
  return new Date().toISOString();
}
