import { type ReactNode } from "react";

export function Small({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <small className={`text-sm font-medium leading-none ${className}`}>
      {children}
    </small>
  );
}
