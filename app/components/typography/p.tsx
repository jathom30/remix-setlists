import { type ReactNode } from "react";

export function P({ children }: { children: ReactNode }) {
  return <p className="leading-7 min-h-4">{children}</p>;
}
