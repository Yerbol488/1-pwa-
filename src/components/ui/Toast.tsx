import { CheckCircle2 } from "lucide-react";
import { useAppData } from "../../context/AppDataContext";

/** Bottom feedback toast driven by AppDataContext.feedback. */
export function Toast() {
  const { feedback } = useAppData();
  if (!feedback) return null;
  return (
    <div className="pointer-events-none fixed inset-x-0 bottom-24 z-50 flex justify-center px-4">
      <div className="pointer-events-auto flex items-center gap-2 rounded-2xl bg-slate-900 px-4 py-3 text-sm font-semibold text-white shadow-soft">
        <CheckCircle2 className="h-5 w-5 text-emerald-400" />
        {feedback}
      </div>
    </div>
  );
}
