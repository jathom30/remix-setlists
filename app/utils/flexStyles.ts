import type { FlexListProps } from "~/components"

export type Size = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'none'
export type Side = 'x' | 'y' | 'l' | 'r' | 't' | 'b'
export type FlexDirection = 'row' | 'row-reverse' | 'col' | 'col-reverse'
export type Padding = Size | Partial<Record<Side, Size>>

// ************* PADDING UTILS ************* //
const createPaddingX = (x?: Size) => {
  switch (x) {
    case 'xs':
      return 'px-1'
    case 'sm':
      return 'px-2'
    case 'md':
      return 'px-4'
    case 'lg':
      return 'px-6'
    case 'xl':
      return 'px-8'
    default:
      return ''
  }
}
const createPaddingY = (y?: Size) => {
  switch (y) {
    case 'xs':
      return 'py-1'
    case 'sm':
      return 'py-2'
    case 'md':
      return 'py-4'
    case 'lg':
      return 'py-6'
    case 'xl':
      return 'py-8'
    default:
      return ''
  }
}
const createPaddingTop = (top?: Size) => {
  switch (top) {
    case 'xs':
      return 'pt-1'
    case 'sm':
      return 'pt-2'
    case 'md':
      return 'pt-4'
    case 'lg':
      return 'pt-6'
    case 'xl':
      return 'pt-8'
    default:
      return ''
  }
}
const createPaddingBottom = (bottom?: Size) => {
  switch (bottom) {
    case 'xs':
      return 'pb-1'
    case 'sm':
      return 'pb-2'
    case 'md':
      return 'pb-4'
    case 'lg':
      return 'pb-6'
    case 'xl':
      return 'pb-8'
    default:
      return ''
  }
}
const createPaddingLeft = (left?: Size) => {
  switch (left) {
    case 'xs':
      return 'pl-1'
    case 'sm':
      return 'pl-2'
    case 'md':
      return 'pl-4'
    case 'lg':
      return 'pl-6'
    case 'xl':
      return 'pl-8'
    default:
      return ''
  }
}
const createPaddingRight = (right?: Size) => {
  switch (right) {
    case 'xs':
      return 'pr-1'
    case 'sm':
      return 'pr-2'
    case 'md':
      return 'pr-4'
    case 'lg':
      return 'pr-6'
    case 'xl':
      return 'pr-8'
    default:
      return ''
  }
}
const createPadding = (padding: Padding) => {
  if (typeof padding === 'string') {
    switch (padding) {
      case 'xs':
        return 'p-1'
      case 'sm':
        return 'p-2'
      case 'md':
        return 'p-4'
      case 'lg':
        return 'p-6'
      case 'xl':
        return 'p-8'
      default:
        return ''
    }
  }
  return [createPaddingX(padding.x), createPaddingY(padding.y), createPaddingTop(padding.t), createPaddingBottom(padding.b), createPaddingLeft(padding.l), createPaddingRight(padding.r)].filter(classname => !!classname).join(' ')
}

function padEntryIsMediaQuery(padEntry: Record<string, Padding | Size>): padEntry is Record<Size, Padding> {
  const [value] = Object.values(padEntry)
  return typeof value !== 'string'
}
function padEntryIsSide(padEntry: Record<string, Padding | Size>): padEntry is Record<Side, Size> {
  const [value] = Object.values(padEntry)
  return typeof value === 'string'
}

const createMediaQueryPadding = (padding: Partial<Record<Side, Size>> | Partial<Record<Size, Padding>>): string => {
  const paddingEntries = Object.entries(padding) as ([Size, Padding] | [Side, Size])[]

  const finalPadding = paddingEntries.reduce((acc, entry) => {
    const item = { [entry[0]]: entry[1] }
    if (padEntryIsMediaQuery(item)) {
      const mediaPad = entry[0] === 'none' ? createPadding(entry[1]) : `${entry[0]}:${createPadding(entry[1])}`
      return [...acc, mediaPad]
    }
    if (padEntryIsSide(item)) {
      return [...acc, createPadding(item)]
    }
    return acc
  }, [] as string[])
  return finalPadding.join(' ')
}

export const getPadding = (padding: FlexListProps['pad']): string => {
  if (!padding) { return '' }
  if (typeof padding === 'string') {
    return createPadding(padding)
  }
  return createMediaQueryPadding(padding)
}

// ************* GAP UTILS ************* //

const createMediaQueryGap = (gap: Partial<Record<Size, Size>>) => {
  const gapKeys = Object.keys(gap) as Size[]
  const finalGap = gapKeys.reduce((acc, key) => {
    const gapAtMedia = gap[key]
    if (!gapAtMedia) {
      return acc
    }
    const mediaGap = key === 'none' ? createGap(gapAtMedia) : `${key}:${createGap(gapAtMedia)}`
    return [...acc, mediaGap]
  }, [] as string[])
  return finalGap.join(' ')
}

const createGap = (gap: Size) => {
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
    case 'none':
      return 'gap-0'
    default:
      return ''
  }
}

export const getGap = (gap: FlexListProps['gap']): string => {
  if (!gap) { return '' }
  if (typeof gap === 'string') {
    return createGap(gap)
  }
  return createMediaQueryGap(gap)
}