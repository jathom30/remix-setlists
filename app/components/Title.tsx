import type { ReactNode } from "react"

export const Title = ({ children }: { children: ReactNode }) => {
  return (
    <h3 className="font-bold text-xl">{children}</h3>
  )
}