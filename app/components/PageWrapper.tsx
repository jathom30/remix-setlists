import React from "react";
import { MaxWidth, SiteHeader } from "./";

export function PageWrapper({ children }: { children: React.ReactNode }) {
  return (
    <div>
      <SiteHeader />
      <MaxWidth>{children}</MaxWidth>
    </div>
  )
}