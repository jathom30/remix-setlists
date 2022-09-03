import React from "react"

export function MaxWidth({ children }: { children: React.ReactNode }) {
  return (
    <div className="max-w-4xl m-auto">{children}</div>
  )
}