import type { ReactNode } from "react";

interface CardTitleProps {
  children: ReactNode;
  compact?: boolean;
  className?: string;
}

export function CardTitle({ children, compact = false, className = "" }: CardTitleProps) {
  return (
    <h3
      className={`heading-card break-words text-foreground ${
        compact ? "heading-card-compact" : "min-h-[2.4em]"
      } ${className}`.trim()}
    >
      {children}
    </h3>
  );
}
