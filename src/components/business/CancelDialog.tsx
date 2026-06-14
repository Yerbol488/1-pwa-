import { useEffect, useState } from "react";
import { Modal } from "../ui/Modal";
import { Button } from "../ui/Button";

interface CancelDialogProps {
  open: boolean;
  title?: string;
  description?: string;
  onClose: () => void;
  onConfirm: (reason: string) => void;
}

/** Reusable "cancel record with reason" dialog used by Sales/Expenses/Production. */
export function CancelDialog({
  open,
  title = "Отменить запись",
  description = "Запись не удаляется, а помечается как отмененная. История сохраняется.",
  onClose,
  onConfirm,
}: CancelDialogProps) {
  const [reason, setReason] = useState("");

  useEffect(() => {
    if (open) setReason("");
  }, [open]);

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
          <Button
            variant="danger"
            fullWidth
            disabled={reason.trim() === ""}
            onClick={() => onConfirm(reason.trim())}
          >
            Отменить запись
          </Button>
        </div>
      }
    >
      <p className="mb-3 text-sm text-slate-500">{description}</p>
      <label className="block">
        <span className="mb-1.5 block text-sm font-medium text-slate-600">Причина отмены</span>
        <textarea
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          rows={3}
          placeholder="Например: ошибочная сумма"
          className="w-full rounded-xl border border-slate-200 bg-slate-50 p-3 text-sm text-slate-900 outline-none transition focus:border-brand-500 focus:bg-white"
        />
      </label>
    </Modal>
  );
}
