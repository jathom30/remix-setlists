type FlexListProps = {
  children: React.ReactNode;
  gap?: number
  pad?: number | Partial<Record<'x' | 'y' | 'l' | 'r' | 't' | 'b', number>>
  items?: 'center' | 'start' | 'end' | 'baseline' | 'stretch'
  justify?: 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly'
  direction?: 'row' | 'row-reverse' | 'col' | 'col-reverse'
  height?: 'full'
  wrap?: boolean
}

export const FlexList = ({
  children,
  gap = 4,
  pad,
  items = 'start',
  direction = 'col',
  justify = 'start',
  height,
  wrap = false,
}: FlexListProps) => {
  const createPadding = () => {
    if (!pad) { return null }
    if (typeof pad === 'number') {
      return `p-${pad}`
    }
    return `px-${pad.x} py-${pad.y} pt-${pad.t} pb-${pad.b} pl-${pad.l} pr-${pad.r}`
  }
  return (
    <div className={`${createPadding()} flex flex-${direction} gap-${gap} items-${items} justify-${justify} ${height ? `h-${height}` : ''} ${wrap ? 'flex-wrap' : ''}`}>
      {children}
    </div>
  )
}