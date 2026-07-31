import Link from "next/link";
import type { ButtonHTMLAttributes, ReactNode } from "react";

type Variant = "primary" | "secondary" | "outline" | "ghost";

const baseClasses =
  "inline-flex items-center justify-center gap-2 rounded-full font-bold text-center transition-all duration-200 " +
  "active:scale-95 disabled:opacity-50 disabled:pointer-events-none select-none";

const sizeClasses = "px-6 py-4 text-base sm:text-lg min-h-[3.25rem]";

const variantClasses: Record<Variant, string> = {
  primary:
    "bg-navy-800 text-white shadow-soft hover:bg-navy-700 hover:shadow-lg",
  secondary:
    "bg-white text-navy-800 border-2 border-navy-100 shadow-card hover:border-navy-300",
  outline:
    "bg-transparent text-navy-800 border-2 border-navy-800 hover:bg-navy-800 hover:text-white",
  ghost: "bg-navy-50 text-navy-700 hover:bg-navy-100",
};

interface CommonProps {
  children: ReactNode;
  variant?: Variant;
  fullWidth?: boolean;
  className?: string;
}

type ButtonProps = CommonProps &
  ButtonHTMLAttributes<HTMLButtonElement> & {
    href?: undefined;
  };

interface LinkProps extends CommonProps {
  href: string;
  external?: boolean;
}

export function Button({ children, variant = "primary", fullWidth, className = "", ...props }: ButtonProps) {
  return (
    <button
      className={`${baseClasses} ${sizeClasses} ${variantClasses[variant]} ${fullWidth ? "w-full" : ""} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}

export function LinkButton({ children, variant = "primary", fullWidth, className = "", href, external }: LinkProps) {
  const classes = `${baseClasses} ${sizeClasses} ${variantClasses[variant]} ${fullWidth ? "w-full" : ""} ${className}`;
  if (external || href.startsWith("http") || href.startsWith("tel:") || href.startsWith("mailto:")) {
    return (
      <a href={href} className={classes} target={href.startsWith("http") ? "_blank" : undefined} rel="noopener noreferrer">
        {children}
      </a>
    );
  }
  return (
    <Link href={href} className={classes}>
      {children}
    </Link>
  );
}
