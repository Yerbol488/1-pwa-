import { useMemo, useState } from "react";
import { PageTitle } from "../components/ui/PageTitle";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { ItemCard } from "../components/business/ItemCard";
import { ItemFormModal, emptySeed, type ItemFormSeed } from "../components/business/ItemFormModal";
import { useAppData } from "../context/AppDataContext";
import { canManageItems } from "../lib/permissions";
import { Package, Plus, Sparkles } from "lucide-react";
import type { Item } from "../types";

function itemToSeed(item: Item): ItemFormSeed {
  return {
    name: item.name,
    type: item.type,
    unit: item.unit,
    salePrice: String(item.salePrice),
    purchasePrice: String(item.purchasePrice),
    stockQuantity: String(item.stockQuantity),
    icon: item.icon,
    comment: item.comment,
    attributes: item.attributes.map((a) => ({ key: a.key, value: a.value })),
    sellable: item.sellable,
    purchasable: item.purchasable,
    stockTracked: item.stockTracked,
    consumableInProduction: item.consumableInProduction,
  };
}

export function ItemsPage() {
  const { allItems, activeItems, addItem, updateItem, archiveItem, loadDemoData, role } = useAppData();
  const canManage = canManageItems(role);

  const [showArchived, setShowArchived] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [formTitle, setFormTitle] = useState("Новая позиция");
  const [seed, setSeed] = useState<ItemFormSeed>(emptySeed);
  const [editingId, setEditingId] = useState<string | null>(null);

  const archivedCount = useMemo(() => allItems.filter((i) => i.status === "archived").length, [allItems]);
  const list = showArchived ? allItems : activeItems;

  function openCreate() {
    setSeed(emptySeed);
    setEditingId(null);
    setFormTitle("Новая позиция");
    setFormOpen(true);
  }

  function openEdit(item: Item) {
    setSeed(itemToSeed(item));
    setEditingId(item.id);
    setFormTitle("Изменить позицию");
    setFormOpen(true);
  }

  return (
    <div className="space-y-5">
      <PageTitle
        title="Товары и материалы"
        subtitle={`${activeItems.length} активных позиций`}
        action={
          canManage && activeItems.length > 0 ? (
            <Button variant="primary" onClick={openCreate}>
              <Plus className="h-5 w-5" /> Создать
            </Button>
          ) : undefined
        }
      />

      {activeItems.length === 0 ? (
        <Card className="p-6 text-center">
          <span className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-50 text-brand-600">
            <Package className="h-7 w-7" />
          </span>
          <h2 className="text-lg font-extrabold text-slate-900">Пока нет позиций</h2>
          <p className="mx-auto mt-1 max-w-xs text-sm text-slate-500">
            Добавьте товары, материалы или услуги, которые хотите учитывать.
          </p>
          {canManage && (
            <div className="mt-5 space-y-2">
              <Button variant="primary" size="lg" fullWidth onClick={openCreate}>
                <Plus className="h-5 w-5" /> Добавить позицию
              </Button>
              <Button variant="secondary" fullWidth onClick={loadDemoData}>
                <Sparkles className="h-5 w-5" /> Загрузить демо-данные
              </Button>
              <p className="text-xs text-slate-400">Демо-данные можно удалить позже в настройках.</p>
            </div>
          )}
        </Card>
      ) : (
        <>
          {archivedCount > 0 && (
            <button onClick={() => setShowArchived((v) => !v)} className="px-1 text-xs font-semibold text-brand-600">
              {showArchived ? "Скрыть архив" : `Показать архив (${archivedCount})`}
            </button>
          )}
          <div className="grid gap-3 sm:grid-cols-2">
            {list.map((item) => (
              <div key={item.id} className={item.status === "archived" ? "opacity-60" : ""}>
                <ItemCard
                  item={item}
                  onEdit={canManage && item.status === "active" ? openEdit : undefined}
                  onArchive={canManage && item.status === "active" ? (i) => archiveItem(i.id) : undefined}
                />
              </div>
            ))}
          </div>
        </>
      )}

      <ItemFormModal
        open={formOpen}
        title={formTitle}
        seed={seed}
        onClose={() => setFormOpen(false)}
        onSubmit={(input) => {
          if (editingId) updateItem(editingId, input);
          else addItem(input);
          setFormOpen(false);
        }}
      />
    </div>
  );
}
