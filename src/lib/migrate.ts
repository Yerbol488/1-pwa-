// One-time localStorage migration from Stage 2 to Stage 3.
// Runs before the context loads state. Idempotent: guarded by storageVersion.

import {
  LEGACY_EXPENSES_KEY,
  STORAGE_KEYS,
  STORAGE_VERSION,
  loadJSON,
  loadString,
  removeKey,
  saveJSON,
  saveString,
} from "./storage";
import { defaultFlagsForType } from "./items";
import type {
  ConsumedMaterial,
  FixedExpense,
  Item,
  ItemType,
  OneOffExpense,
  Production,
  Sale,
  SoftDeleteFields,
} from "../types";

/** Shape of a Stage 2 expense record (single expenses array). */
interface LegacyExpense extends SoftDeleteFields {
  id: string;
  businessId: string;
  category: string;
  amount: number;
  comment: string;
  createdByUserId: string;
  createdByName: string;
  createdAt: string;
  syncStatus: "local";
}

export function runMigrations(): void {
  const version = Number(loadString(STORAGE_KEYS.storageVersion) ?? "0");
  if (version >= STORAGE_VERSION) return;

  // 1) Items: add behavior flags + ensure attributes array exists.
  const items = loadJSON<Item[]>(STORAGE_KEYS.items, []);
  let itemsChanged = false;
  const migratedItems = items.map((i) => {
    const hasFlags = typeof i.sellable === "boolean";
    if (hasFlags && Array.isArray(i.attributes)) return i;
    itemsChanged = true;
    const flags = defaultFlagsForType((i.type as ItemType) ?? "product");
    return {
      ...flags,
      ...i,
      // If flags were missing, the spread above keeps defaults; if present, keep them.
      sellable: hasFlags ? i.sellable : flags.sellable,
      purchasable: hasFlags ? i.purchasable : flags.purchasable,
      stockTracked: hasFlags ? i.stockTracked : flags.stockTracked,
      consumableInProduction: hasFlags ? i.consumableInProduction : flags.consumableInProduction,
      attributes: Array.isArray(i.attributes) ? i.attributes : [],
    };
  });
  if (itemsChanged) saveJSON(STORAGE_KEYS.items, migratedItems);

  // 2) Legacy expenses -> one-off expenses.
  const legacy = loadJSON<LegacyExpense[]>(LEGACY_EXPENSES_KEY, []);
  if (legacy.length > 0) {
    const existing = loadJSON<OneOffExpense[]>(STORAGE_KEYS.oneOffExpenses, []);
    const converted: OneOffExpense[] = legacy.map((e) => ({
      id: e.id,
      businessId: e.businessId,
      title: e.category,
      amount: e.amount,
      deliveryCost: 0,
      comment: e.comment ?? "",
      status: e.status ?? "active",
      deletedAt: e.deletedAt,
      deletedByUserId: e.deletedByUserId,
      deletedByName: e.deletedByName,
      deleteReason: e.deleteReason,
      createdByUserId: e.createdByUserId,
      createdByName: e.createdByName,
      createdAt: e.createdAt,
      syncStatus: "local",
    }));
    saveJSON(STORAGE_KEYS.oneOffExpenses, [...converted, ...existing]);
    removeKey(LEGACY_EXPENSES_KEY);
  }

  // 3) Production: ensure consumedMaterials array.
  const production = loadJSON<Production[]>(STORAGE_KEYS.production, []);
  let prodChanged = false;
  const migratedProduction = production.map((p) => {
    if (Array.isArray(p.consumedMaterials)) return p;
    prodChanged = true;
    return { ...p, consumedMaterials: [] as ConsumedMaterial[] };
  });
  if (prodChanged) saveJSON(STORAGE_KEYS.production, migratedProduction);

  // 4) Sales: add payment/debt fields (old sales treated as fully paid).
  const sales = loadJSON<Sale[]>(STORAGE_KEYS.sales, []);
  let salesChanged = false;
  const migratedSales = sales.map((s) => {
    if (typeof s.paymentStatus === "string" && typeof s.paidAmount === "number") return s;
    salesChanged = true;
    return {
      ...s,
      paymentStatus: "paid" as const,
      paymentMethod: "other" as const,
      paidAmount: s.total,
      debtAmount: 0,
    };
  });
  if (salesChanged) saveJSON(STORAGE_KEYS.sales, migratedSales);

  // 5) Fixed expenses: ensure periodDate (fallback to the createdAt date).
  const fixed = loadJSON<FixedExpense[]>(STORAGE_KEYS.fixedExpenses, []);
  let fixedChanged = false;
  const migratedFixed = fixed.map((f) => {
    if (f.periodDate) return f;
    fixedChanged = true;
    return { ...f, periodDate: (f.createdAt || new Date().toISOString()).slice(0, 10) };
  });
  if (fixedChanged) saveJSON(STORAGE_KEYS.fixedExpenses, migratedFixed);

  saveString(STORAGE_KEYS.storageVersion, String(STORAGE_VERSION));
}
