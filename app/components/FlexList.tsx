type FlexListProps = {
  children: React.ReactNode;
  gap?: number
  pad?: number
  items?: 'center' | 'start' | 'end' | 'baseline' | 'stretch'
}

export const FlexList = ({ children, gap = 4, pad, items }: FlexListProps) => {
  return (
    <div className={`flex flex-col gap-${gap} ${pad ? `p-${pad}` : ''} ${items ? `items-${items}` : ''} w-full`}>
      {children}
    </div>
  )
}