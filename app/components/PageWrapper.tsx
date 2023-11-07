import React from "react";
import { SiteHeader } from "./";

export function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div className="h-full">
      <SiteHeader />
      <main className="h-full bg-background">{children}</main>
    </div>
  );
}
