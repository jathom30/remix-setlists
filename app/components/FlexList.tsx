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
  items,
  direction = 'col',
  justify,
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
    <div className={`${createPadding()} flex flex-${direction} gap-${gap} ${getItems(items)} justify-${justify} ${height ? `h-${height}` : ''} ${wrap ? 'flex-wrap' : ''}`}>
      {children}
    </div>
  )
}

const getItems = (items: FlexListProps['items']) => {
  switch (items) {
    case 'baseline':
      return 'items-baseline'
    case 'stretch':
      return 'items-stretch'
    case 'start':
      return 'items-start'
    case 'end':
      return 'items-end'
    case 'center':
      return 'items-center'
    default:
      return ''
  }
}