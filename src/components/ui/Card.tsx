import type { HTMLAttributes, ReactNode } from "react";

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  padded?: boolean;
}

export function Card({ children, className = "", padded = true, ...props }: CardProps) {
  return (
    <div
      className={`rounded-3xl bg-white/90 backdrop-blur shadow-card border border-navy-50 ${
        padded ? "p-5 sm:p-7" : ""
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
