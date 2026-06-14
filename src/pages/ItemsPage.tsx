import { useMemo, useState } from "react";
import { PageTitle } from "../components/ui/PageTitle";
import { Button } from "../components/ui/Button";
import { Card } from "../components/ui/Card";
import { ItemCard } from "../components/business/ItemCard";
import {
  ItemFormModal,
  emptySeed,
  type ItemFormSeed,
} from "../components/business/ItemFormModal";
import { useAppData } from "../context/AppDataContext";
import { canManageItems } from "../lib/permissions";
import { itemTemplates, type ItemTemplate } from "../data/seedData";
import { itemIcons, itemIconTints } from "../data/icons";
import { cn } from "../lib/format";
import { Plus } from "lucide-react";
import type { Item } from "../types";

function templateToSeed(t: ItemTemplate): ItemFormSeed {
  return {
    name: t.name,
    type: t.type,
    unit: t.unit,
    salePrice: String(t.salePrice),
    purchasePrice: String(t.purchasePrice),
    stockQuantity: String(t.stockQuantity),
    icon: t.icon,
    comment: t.comment,
    attributes: t.attributes.map((a) => ({ ...a })),
  };
}

export function ItemsPage() {
  const { allItems, activeItems, addItem, archiveItem, role } = useAppData();
  const canManage = canManageItems(role);

  const [showArchived, setShowArchived] = useState(false);
  const [formOpen, setFormOpen] = useState(false);
  const [formTitle, setFormTitle] = useState("Новая позиция");
  const [seed, setSeed] = useState<ItemFormSeed>(emptySeed);

  const archivedCount = useMemo(() => allItems.filter((i) => i.status === "archived").length, [allItems]);
  const list = showArchived ? allItems : activeItems;

  function openBlank() {
    setSeed(emptySeed);
    setFormTitle("Новая позиция");
    setFormOpen(true);
  }

  function openTemplate(t: ItemTemplate) {
    setSeed(templateToSeed(t));
    setFormTitle(`Шаблон: ${t.name}`);
    setFormOpen(true);
  }

  return (
    <div className="space-y-5">
      <PageTitle
        title="Товары"
        subtitle={`${activeItems.length} активных позиций`}
        action={
          canManage ? (
            <Button variant="primary" onClick={openBlank}>
              <Plus className="h-5 w-5" /> Создать
            </Button>
          ) : undefined
        }
      />

      {/* Popular templates */}
      {canManage && (
        <div>
          <h2 className="mb-2 px-1 text-sm font-bold uppercase tracking-wide text-slate-400">
            Популярные шаблоны
          </h2>
          <div className="-mx-4 flex gap-3 overflow-x-auto px-4 pb-1 no-scrollbar">
            {itemTemplates.map((t) => {
              const Icon = itemIcons[t.icon];
              return (
                <button
                  key={t.name}
                  onClick={() => openTemplate(t)}
                  className="flex w-24 shrink-0 flex-col items-center gap-2 rounded-2xl border border-slate-100 bg-white p-3 shadow-card transition active:scale-[0.97]"
                >
                  <span className={cn("flex h-11 w-11 items-center justify-center rounded-xl", itemIconTints[t.icon])}>
                    <Icon className="h-5 w-5" />
                  </span>
                  <span className="text-center text-xs font-semibold text-slate-700">{t.name}</span>
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Archive toggle */}
      {archivedCount > 0 && (
        <button onClick={() => setShowArchived((v) => !v)} className="px-1 text-xs font-semibold text-brand-600">
          {showArchived ? "Скрыть архив" : `Показать архив (${archivedCount})`}
        </button>
      )}

      {/* Item list */}
      {list.length === 0 ? (
        <Card className="p-5 text-center text-sm text-slate-400">
          Пока нет позиций.{canManage ? " Создайте свою позицию или выберите шаблон." : ""}
        </Card>
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {list.map((item) => (
            <div key={item.id} className={item.status === "archived" ? "opacity-60" : ""}>
              <ItemCard item={item} onArchive={canManage && item.status === "active" ? handleArchive : undefined} />
            </div>
          ))}
        </div>
      )}

      <ItemFormModal
        open={formOpen}
        title={formTitle}
        seed={seed}
        onClose={() => setFormOpen(false)}
        onSubmit={(input) => {
          addItem(input);
          setFormOpen(false);
        }}
      />
    </div>
  );

  function handleArchive(item: Item) {
    archiveItem(item.id);
  }
}
