type FlexListProps = {
  children: React.ReactNode;
  gap?: number
  pad?: number | Record<'x' | 'y', number>
  items?: 'center' | 'start' | 'end' | 'baseline' | 'stretch'
  justify?: 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly'
  direction?: 'row' | 'row-reverse' | 'col' | 'col-reverse'
  height?: 'full'
}

export const FlexList = ({
  children,
  gap = 4,
  pad,
  items = 'start',
  direction = 'col',
  justify = 'start',
  height
}: FlexListProps) => {
  const createPadding = () => {
    if (!pad) { return null }
    if (typeof pad === 'number') {
      return `p-${pad}`
    }
    return `px-${pad.x} py-${pad.y}`
  }
  return (
    <div className={`${createPadding()} flex flex-${direction} gap-${gap} items-${items} justify-${justify} w-full ${height ? `h-${height}` : ''}`}>
      {children}
    </div>
  )
}