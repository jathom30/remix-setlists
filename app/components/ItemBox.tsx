import React from "react"

type ItemBoxProps = {
  children: React.ReactNode
  pad?: number
}

export const ItemBox = ({ children, pad = 4 }: ItemBoxProps) => {
  return (
    <div className={`p-${pad} rounded shadow bg-component-background`}>{children}</div>
  )
}