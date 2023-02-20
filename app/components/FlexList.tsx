import type { FlexDirection, Padding, Size } from "~/utils/flexStyles";
import { getGap, getPadding } from "~/utils/flexStyles";

export type FlexListProps = {
  children: React.ReactNode;
  gap?: Size | Partial<Record<Size, Size>>
  pad?: Padding | Partial<Record<Size, Padding>>
  items?: 'center' | 'start' | 'end' | 'baseline' | 'stretch'
  justify?: 'start' | 'end' | 'center' | 'between' | 'around' | 'evenly'
  direction?: FlexDirection | Partial<Record<Size, FlexDirection>>
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

const createDirection = (direction: FlexListProps['direction']) => {
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

const createMediaQueryDirection = (direction: Partial<Record<Size, FlexDirection>>) => {
  const directionKeys = Object.keys(direction) as Size[]
  const finalDirection = directionKeys.reduce((acc, key) => {
    const directionAtMedia = direction[key]
    if (!directionAtMedia) { return acc }
    const mediaDirection = key === 'none' ? createDirection(directionAtMedia) : `${key}:${createDirection(directionAtMedia)}`
    return [...acc, mediaDirection]
  }, [] as string[])
  return finalDirection.join(' ')
}

const getDirection = (direction: FlexListProps['direction']): string => {
  if (!direction) return ''
  if (typeof direction === 'string') {
    return createDirection(direction)
  }
  return createMediaQueryDirection(direction)
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