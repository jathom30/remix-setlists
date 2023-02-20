import type { Size } from "~/utils/flexStyles";
import { getPadding } from "~/utils/flexStyles";

export type FlexListProps = {
  children: React.ReactNode;
  gap?: Size
  pad?: Size | Partial<Record<'x' | 'y' | 'l' | 'r' | 't' | 'b', Size>>
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
  gap = 'md',
  pad,
  items,
  direction = 'col',
  justify,
  height,
  width,
  grow = false,
  wrap = false,
}: FlexListProps) => {
  return (
    <div className={`FlexList ${grow ? 'grow' : ''} ${getPadding(pad)} flex ${getDirection(direction)} ${getGap(gap)} ${getItems(items)} ${getJustify(justify)} ${height ? `h-${height}` : ''} ${width === 'full' ? `w-full` : ''} ${width === 'half' ? 'w-1/2' : ''} ${wrap ? 'flex-wrap' : ''}`}>
      {children}
    </div>
  )
}


const getGap = (gap: Size) => {
  switch (gap) {
    case 'xs':
      return 'gap-1'
    case 'sm':
      return 'gap-2'
    case 'md':
      return 'gap-4'
    case 'lg':
      return 'gap-6'
    case 'xl':
      return 'gap-8'
    default:
      return ''
  }
}

export const getDirection = (direction: FlexListProps['direction']) => {
  switch (direction) {
    case 'col':
      return 'flex-col'
    case 'col-reverse':
      return 'flex-col-reverse'
    case 'row':
      return 'flex-row'
    case 'row-reverse':
      return 'flex-row-reverse'
    default:
      return ''
  }
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