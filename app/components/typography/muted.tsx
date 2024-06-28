import { type ReactNode } from "react";

export function Muted({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <p className={`text-sm text-muted-foreground ${className}`}>{children}</p>
  );
}
