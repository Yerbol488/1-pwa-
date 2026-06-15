import type { ItemBehaviorFlags, ItemType, ItemTypeLabel } from "../types";

export const TYPE_OPTIONS: Array<{ type: ItemType; label: ItemTypeLabel }> = [
  { type: "product", label: "Товар" },
  { type: "material", label: "Материал" },
  { type: "service", label: "Услуга" },
  { type: "expense_category", label: "Расходная категория" },
];

export function typeLabelFor(type: ItemType): ItemTypeLabel {
  return TYPE_OPTIONS.find((o) => o.type === type)!.label;
}

/** Sensible default behavior flags when the user picks an item type. */
export function defaultFlagsForType(type: ItemType): ItemBehaviorFlags {
  switch (type) {
    case "product":
      return { sellable: true, purchasable: false, stockTracked: true, consumableInProduction: false };
    case "material":
      return { sellable: false, purchasable: true, stockTracked: true, consumableInProduction: true };
    case "service":
      return { sellable: true, purchasable: false, stockTracked: false, consumableInProduction: false };
    case "expense_category":
      return { sellable: false, purchasable: false, stockTracked: false, consumableInProduction: false };
  }
}
