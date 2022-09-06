import React from "react"

type ItemBoxProps = {
  children: React.ReactNode
  pad?: number
  isDanger?: boolean
}

export const ItemBox = ({ children, pad = 4, isDanger = false }: ItemBoxProps) => {
  return (
    <div className={`p-${pad} rounded shadow bg-component-background ${isDanger ? 'border border-danger' : ''}`}>{children}</div>
  )
}