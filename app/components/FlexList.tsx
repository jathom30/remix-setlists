type FlexListProps = {
  children: React.ReactNode;
  gap?: number
  pad?: number
  items?: 'center' | 'start' | 'end' | 'baseline' | 'stretch'
  direction?: 'row' | 'row-reverse' | 'col' | 'col-reverse'
}

export const FlexList = ({ children, gap = 4, pad, items, direction = 'col' }: FlexListProps) => {
  return (
    <div className={`flex flex-${direction} gap-${gap} ${pad ? `p-${pad}` : ''} ${items ? `items-${items}` : ''} w-full`}>
      {children}
    </div>
  )
}