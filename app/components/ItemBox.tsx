import React from "react"

type ItemBoxProps = {
  children: React.ReactNode
}

export const ItemBox = ({ children }: ItemBoxProps) => {
  return (
    <div className={`card card-compact shadow-lg bg-neutral w-full`}>
      <div className="card-body">
        {children}
      </div>
    </div>
  )
}