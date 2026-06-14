// Demo seed data. Used ONLY to initialise a freshly created company (and the
// "reset demo data" action). After seeding, the live UI renders from the
// localStorage-backed app state, never from this file.

import type {
  ActivityLog,
  CurrentUser,
  Item,
  ItemAttribute,
  ItemIconKey,
  ItemType,
  ItemTypeLabel,
} from "../types";
import { nowIso, uid } from "../lib/storage";

/** A reusable catalog template (also powers the "Популярные шаблоны" section). */
export interface ItemTemplate {
  name: string;
  type: ItemType;
  typeLabel: ItemTypeLabel;
  unit: string;
  salePrice: number;
  purchasePrice: number;
  stockQuantity: number;
  icon: ItemIconKey;
  comment: string;
  attributes: Array<{ key: string; value: string }>;
}

export const itemTemplates: ItemTemplate[] = [
  {
    name: "Газоблок",
    type: "product",
    typeLabel: "Товар",
    unit: "шт",
    salePrice: 480,
    purchasePrice: 360,
    stockQuantity: 4820,
    icon: "block",
    comment: "Основной товар собственного производства",
    attributes: [
      { key: "Размер", value: "600×300×200" },
      { key: "Плотность", value: "D500" },
    ],
  },
  {
    name: "Клей",
    type: "product",
    typeLabel: "Товар",
    unit: "мешок",
    salePrice: 2300,
    purchasePrice: 1750,
    stockQuantity: 136,
    icon: "glue",
    comment: "Монтажный клей для блоков",
    attributes: [{ key: "Вес мешка", value: "25 кг" }],
  },
  {
    name: "Цемент",
    type: "material",
    typeLabel: "Материал",
    unit: "мешок",
    salePrice: 2100,
    purchasePrice: 1600,
    stockQuantity: 40,
    icon: "cement",
    comment: "Используется в производстве",
    attributes: [{ key: "Марка", value: "М500" }],
  },
  {
    name: "Песок",
    type: "material",
    typeLabel: "Материал",
    unit: "тонна",
    salePrice: 9000,
    purchasePrice: 6500,
    stockQuantity: 18,
    icon: "sand",
    comment: "",
    attributes: [],
  },
  {
    name: "Поддоны",
    type: "material",
    typeLabel: "Материал",
    unit: "шт",
    salePrice: 3500,
    purchasePrice: 2400,
    stockQuantity: 60,
    icon: "pallet",
    comment: "",
    attributes: [],
  },
  {
    name: "Доставка",
    type: "service",
    typeLabel: "Услуга",
    unit: "рейс",
    salePrice: 15000,
    purchasePrice: 9000,
    stockQuantity: 0,
    icon: "delivery",
    comment: "Доставка по городу до 5 тонн",
    attributes: [],
  },
];

/** Suggested expense categories for the expense form. */
export const expenseCategories = [
  "Цемент",
  "Песок",
  "Топливо",
  "Зарплата",
  "Ремонт",
  "Доставка",
  "Электричество",
  "Прочее",
];

/** Payment options for the sale form. */
export const paymentTypes = ["Наличные", "Карта", "Перевод", "В долг"] as const;

/** Convert a template into a persisted Item for the given company + user. */
export function itemFromTemplate(
  template: ItemTemplate,
  businessId: string,
  user: CurrentUser
): Item {
  const ts = nowIso();
  const attributes: ItemAttribute[] = template.attributes.map((a) => ({
    id: uid("attr"),
    key: a.key,
    value: a.value,
  }));
  return {
    id: uid("itm"),
    businessId,
    name: template.name,
    type: template.type,
    typeLabel: template.typeLabel,
    unit: template.unit,
    salePrice: template.salePrice,
    purchasePrice: template.purchasePrice,
    stockQuantity: template.stockQuantity,
    icon: template.icon,
    comment: template.comment,
    attributes,
    status: "active",
    createdByUserId: user.id,
    createdByName: user.name,
    createdAt: ts,
    updatedAt: ts,
    syncStatus: "local",
  };
}

export interface SeedResult {
  items: Item[];
  activity: ActivityLog[];
}

/**
 * Build the initial demo dataset for a new company: the six catalog items plus
 * activity entries (company created + one per seeded item). Sales / expenses /
 * production start empty so the owner begins with a clean, consistent ledger.
 */
export function buildSeedData(
  businessId: string,
  businessName: string,
  user: CurrentUser
): SeedResult {
  const items = itemTemplates.map((t) => itemFromTemplate(t, businessId, user));

  const activity: ActivityLog[] = [];
  activity.push({
    id: uid("act"),
    businessId,
    userId: user.id,
    userName: user.name,
    actionType: "company_created",
    entityType: "company",
    entityId: businessId,
    description: `${user.name} создал компанию: ${businessName}`,
    createdAt: nowIso(),
    syncStatus: "local",
  });
  items.forEach((item) => {
    activity.push({
      id: uid("act"),
      businessId,
      userId: user.id,
      userName: user.name,
      actionType: "item_created",
      entityType: "item",
      entityId: item.id,
      description: `${user.name} добавил позицию: ${item.name}`,
      createdAt: nowIso(),
      syncStatus: "local",
    });
  });

  return { items, activity };
}
