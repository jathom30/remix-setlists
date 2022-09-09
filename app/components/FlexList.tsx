type FlexListProps = {
  children: React.ReactNode;
  gap?: number
  pad?: number
  items?: 'center' | 'start' | 'end' | 'baseline' | 'stretch'
  justify?: 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly'
  direction?: 'row' | 'row-reverse' | 'col' | 'col-reverse'
}

export const FlexList = ({ children, gap = 4, pad, items = 'start', direction = 'col', justify = 'start' }: FlexListProps) => {
  return (
    <div className={`flex flex-${direction} gap-${gap} ${pad ? `p-${pad}` : ''} justify-${justify} items-${items} w-full`}>
      {children}
    </div>
  )
}