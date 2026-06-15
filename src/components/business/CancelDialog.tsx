import { useEffect, useState } from "react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";
import { cn } from "../../lib/format";

const PRESETS = [
  "Ошибочная сумма",
  "Дубликат записи",
  "Неверный товар / категория",
  "Операция не состоялась",
  "Свой вариант",
];

interface CancelDialogProps {
  open: boolean;
  title?: string;
  description?: string;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

/** Cancel-with-reason dialog with quick presets. Used everywhere a record is cancelled. */
export function CancelDialog({
  open,
  title = "Отменить запись",
  description = "Запись не удаляется, а помечается как отмененная. История сохраняется.",
  onClose,
  onConfirm,
}: CancelDialogProps) {
  const [preset, setPreset] = useState<string | null>(null);
  const [custom, setCustom] = useState("");

  useEffect(() => {
    if (open) {
      setPreset(null);
      setCustom("");
    }
  }, [open]);

  const isCustom = preset === "Свой вариант";
  const reason = isCustom ? custom.trim() : preset ?? "";
  const canConfirm = reason !== "";

  return (
    <Modal
      open={open}
      title={title}
      onClose={onClose}
      footer={
        <div className="flex gap-3">
          <Button variant="secondary" fullWidth onClick={onClose}>
            Назад
          </Button>
          <Button variant="danger" fullWidth disabled={!canConfirm} onClick={() => onConfirm(reason)}>
            Отменить запись
          </Button>
        </div>
      }
    >
      <p className="mb-3 text-sm text-slate-500">{description}</p>
      <p className="mb-2 text-sm font-medium text-slate-600">Причина отмены</p>
      <div className="flex flex-col gap-2">
        {PRESETS.map((p) => (
          <button
            key={p}
            type="button"
            onClick={() => setPreset(p)}
            className={cn(
              "rounded-xl border px-3 py-2.5 text-left text-sm font-medium transition",
              preset === p
                ? "border-brand-500 bg-blue-50 text-brand-700"
                : "border-slate-200 bg-white text-slate-600"
            )}
          >
            {p}
          </button>
        ))}
      </div>
      {isCustom && (
        <textarea
          value={custom}
          onChange={(e) => setCustom(e.target.value)}
          rows={2}
          autoFocus
          placeholder="Опишите причину"
          className="mt-2 w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:bg-white"
        />
      )}
    </Modal>
  );
}
