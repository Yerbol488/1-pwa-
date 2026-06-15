import type { ReactNode } from "react";
import { cn } from "../../lib/format";

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export function Card({ children, className, onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={cn(
        "rounded-2xl bg-white shadow-card border border-slate-100",
        onClick && "cursor-pointer transition hover:shadow-soft active:scale-[0.99]",
        className
      )}
    >
      {children}
    </div>
  );
}

export function CardBody({ children, className }: { children: ReactNode; className?: string }) {
  return <div className={cn("p-4", className)}>{children}</div>;
}

export function CardHeader({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn("px-4 pt-4 pb-2 flex items-center justify-between", className)}>{children}</div>
  );
}
