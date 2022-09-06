import type { ReactNode } from "react"

type MaxHeightContainerType = {
  header?: ReactNode
  footer?: ReactNode
  fullHeight?: boolean
  children?: ReactNode
}

export const MaxHeightContainer = ({ children, header, footer, fullHeight }: MaxHeightContainerType) => {
  return (
    <div className={`flex flex-col max-h-full w-full ${fullHeight ? 'h-full' : ''}`}>
      {header ? <div className="relative z-10">{header}</div> : null}
      <div className="overflow-auto flex-grow relative z-0">{children}</div>
      {footer ? <div className="relative z-10">{footer}</div> : null}
    </div>
  )
}