// Demo seed data. Used ONLY when the user explicitly chooses "Загрузить
// демо-данные" (or resets to demo). Normal company setup starts EMPTY.

import type {
  ActivityLog,
  CurrentUser,
  Item,
  ItemAttribute,
  ItemIconKey,
  ItemType,
  Supplier,
} from "../types";
import { nowIso, uid } from "../lib/storage";
import { defaultFlagsForType, typeLabelFor } from "../lib/items";

export interface ItemTemplate {
  name: string;
  type: ItemType;
  unit: string;
  salePrice: number;
  purchasePrice: number;
  stockQuantity: number;
  icon: ItemIconKey;
  comment: string;
  attributes: Array<{ key: string; value: string }>;
}

const demoTemplates: ItemTemplate[] = [
  {
    name: "Газоблок",
    type: "product",
    unit: "шт",
    salePrice: 500,
    purchasePrice: 0,
    stockQuantity: 4820,
    icon: "block",
    comment: "Готовая продукция собственного производства",
    attributes: [
      { key: "Размер", value: "600×300×200" },
      { key: "Плотность", value: "D500" },
    ],
  },
  {
    name: "Цемент",
    type: "material",
    unit: "мешок",
    salePrice: 0,
    purchasePrice: 2000,
    stockQuantity: 40,
    icon: "cement",
    comment: "Используется в производстве",
    attributes: [{ key: "Марка", value: "М500" }],
  },
  {
    name: "Песок",
    type: "material",
    unit: "тонна",
    salePrice: 0,
    purchasePrice: 6500,
    stockQuantity: 18,
    icon: "sand",
    comment: "",
    attributes: [],
  },
  {
    name: "Доставка",
    type: "service",
    unit: "рейс",
    salePrice: 15000,
    purchasePrice: 0,
    stockQuantity: 0,
    icon: "delivery",
    comment: "Доставка по городу",
    attributes: [],
  },
];

/** Payment options for the sale form. */
export const paymentTypes = ["Наличные", "Карта", "Перевод", "В долг"] as const;

/** Suggested categories for fixed (recurring) expenses. */
export const fixedExpenseCategories = [
  "Зарплата",
  "Аренда",
  "Интернет",
  "Электричество",
  "Налоги",
  "Кредит",
  "Охрана",
  "Бухгалтерия",
  "Прочее",
];

function itemFromTemplate(t: ItemTemplate, businessId: string, user: CurrentUser): Item {
  const ts = nowIso();
  const attributes: ItemAttribute[] = t.attributes.map((a) => ({ id: uid("attr"), key: a.key, value: a.value }));
  return {
    ...defaultFlagsForType(t.type),
    id: uid("itm"),
    businessId,
    name: t.name,
    type: t.type,
    typeLabel: typeLabelFor(t.type),
    unit: t.unit,
    salePrice: t.salePrice,
    purchasePrice: t.purchasePrice,
    stockQuantity: t.stockQuantity,
    icon: t.icon,
    comment: t.comment,
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
  suppliers: Supplier[];
  activity: ActivityLog[];
}

/** Build a demo dataset (catalog + one supplier + activity) for a company. */
export function buildDemoData(businessId: string, user: CurrentUser): SeedResult {
  const items = demoTemplates.map((t) => itemFromTemplate(t, businessId, user));

  const ts = nowIso();
  const supplier: Supplier = {
    id: uid("sup"),
    businessId,
    name: "ТОО СтройМатериал",
    contactPerson: "Асхат",
    whatsappNumber: "+7 777 123 45 67",
    phoneNumber: "+7 777 123 45 67",
    sellsText: "цемент, песок, клей",
    comment: "",
    supplierStatus: "Активный",
    status: "active",
    createdByUserId: user.id,
    createdByName: user.name,
    createdAt: ts,
    updatedAt: ts,
    syncStatus: "local",
  };

  const activity: ActivityLog[] = [
    {
      id: uid("act"),
      businessId,
      userId: user.id,
      userName: user.name,
      actionType: "demo_data_loaded",
      entityType: "system",
      entityId: businessId,
      description: `${user.name} загрузил демо-данные`,
      createdAt: nowIso(),
      syncStatus: "local",
    },
    ...items.map((item) => ({
      id: uid("act"),
      businessId,
      userId: user.id,
      userName: user.name,
      actionType: "item_created" as const,
      entityType: "item" as const,
      entityId: item.id,
      description: `${user.name} добавил позицию: ${item.name}`,
      createdAt: nowIso(),
      syncStatus: "local" as const,
    })),
    {
      id: uid("act"),
      businessId,
      userId: user.id,
      userName: user.name,
      actionType: "supplier_created",
      entityType: "supplier",
      entityId: supplier.id,
      description: `${user.name} добавил поставщика: ${supplier.name}`,
      createdAt: nowIso(),
      syncStatus: "local",
    },
  ];

  return { items, suppliers: [supplier], activity };
}
