import { PageTitle } from "../components/ui/PageTitle";
import { Button } from "../components/ui/Button";
import { ItemCard } from "../components/business/ItemCard";
import { items } from "../data/mockData";
import { Plus } from "lucide-react";

export function ItemsPage() {
  return (
    <div className="space-y-5">
      <PageTitle
        title="Товары"
        subtitle={`${items.length} позиций в каталоге`}
        action={
          <Button variant="secondary">
            <Plus className="h-5 w-5" /> Добавить
          </Button>
        }
      />

      <div className="grid gap-3 sm:grid-cols-2">
        {items.map((item) => (
          <ItemCard key={item.id} item={item} />
        ))}
      </div>
    </div>
  );
}
