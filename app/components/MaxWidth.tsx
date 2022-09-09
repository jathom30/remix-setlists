import React from "react"

export function MaxWidth({ children }: { children: React.ReactNode }) {
  return (
    <div className="w-full overflow-auto">
      <div className="max-w-4xl w-full m-auto my-0">{children}</div>
    </div>
  )
}