import { type ReactNode } from "react";

export function Large({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return <div className={`text-lg font-semibold ${className}`}>{children}</div>;
}
