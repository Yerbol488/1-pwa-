import type { ButtonHTMLAttributes, ReactNode } from "react";
import { cn } from "../../lib/format";

type Variant = "primary" | "secondary" | "success" | "danger" | "ghost";
type Size = "md" | "lg";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  variant?: Variant;
  size?: Size;
  fullWidth?: boolean;
}

const variants: Record<Variant, string> = {
  primary: "bg-brand-600 text-white hover:bg-brand-700 shadow-sm",
  secondary: "bg-slate-100 text-slate-800 hover:bg-slate-200",
  success: "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm",
  danger: "bg-red-600 text-white hover:bg-red-700 shadow-sm",
  ghost: "bg-transparent text-slate-600 hover:bg-slate-100",
};

const sizes: Record<Size, string> = {
  md: "h-11 px-4 text-sm",
  lg: "h-14 px-6 text-base",
};

export function Button({
  children,
  variant = "primary",
  size = "md",
  fullWidth,
  className,
  ...rest
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 rounded-xl font-semibold transition active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100",
        variants[variant],
        sizes[size],
        fullWidth && "w-full",
        className
      )}
      {...rest}
    >
      {children}
    </button>
  );
}
