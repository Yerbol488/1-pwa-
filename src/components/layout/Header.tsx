import { HardDrive } from "lucide-react";
import { useAppData } from "../../context/AppDataContext";

interface HeaderProps {
  title: string;
}

export function Header({ title }: HeaderProps) {
  const { currentBusiness } = useAppData();
  return (
    <header className="sticky top-0 z-20 border-b border-slate-100 bg-white/80 backdrop-blur">
      <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-brand-600 text-sm font-extrabold text-white">
            MF
          </div>
          <div>
            <p className="text-[13px] font-bold leading-tight text-slate-900">{title}</p>
            <p className="text-[11px] leading-tight text-slate-400">
              {currentBusiness ? currentBusiness.name : "Material Flow"}
            </p>
          </div>
        </div>
        <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-700">
          <HardDrive className="h-3.5 w-3.5" />
          Локально
        </span>
      </div>
    </header>
  );
}
