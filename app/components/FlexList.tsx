export type FlexListProps = {
  children: React.ReactNode;
  gap?: number
  pad?: number | Partial<Record<'x' | 'y' | 'l' | 'r' | 't' | 'b', number>>
  items?: 'center' | 'start' | 'end' | 'baseline' | 'stretch'
  justify?: 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly'
  direction?: 'row' | 'row-reverse' | 'col' | 'col-reverse'
  height?: 'full'
  width?: 'full' | 'half'
  grow?: boolean
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
  width,
  grow = false,
  wrap = false,
}: FlexListProps) => {
  const createPadding = () => {
    if (!pad) { return '' }
    if (typeof pad === 'number') {
      return `p-${pad}`
    }
    return `px-${pad.x} py-${pad.y} pt-${pad.t} pb-${pad.b} pl-${pad.l} pr-${pad.r}`
  }
  return (
    <div className={`FlexList ${grow ? 'grow' : ''} ${createPadding()} flex flex-${direction} gap-${gap} ${getItems(items)} ${getJustify(justify)} ${height ? `h-${height}` : ''} ${width === 'full' ? `w-full` : ''} ${width === 'half' ? 'w-1/2' : ''} ${wrap ? 'flex-wrap' : ''}`}>
      {children}
    </div>
  )
}

export const getItems = (items: FlexListProps['items']) => {
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

export const getJustify = (justify: FlexListProps['justify']) => {
  switch (justify) {
    case 'around':
      return 'justify-around'
    case "between":
      return 'justify-between'
    case "center":
      return 'justify-center'
    case "end":
      return 'justify-end'
    case "evenly":
      return 'justify-evenly'
    case "start":
      return 'justify-start'
    default:
      return ''
  }
}