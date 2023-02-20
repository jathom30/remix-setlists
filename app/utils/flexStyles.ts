import type { FlexListProps } from "~/components"

export type Sizes = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | 'none'

const createPaddingX = (x?: Sizes) => {
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
const createPaddingY = (y?: Sizes) => {
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
const createPaddingTop = (top?: Sizes) => {
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
const createPaddingBottom = (bottom?: Sizes) => {
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
const createPaddingLeft = (left?: Sizes) => {
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
const createPaddingRight = (right?: Sizes) => {
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
const createPadding = (padding: Sizes) => {
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

export const getPadding = (padding: FlexListProps['pad']) => {
  if (!padding) { return '' }
  if (typeof padding === 'string') {
    return createPadding(padding)
  }
  return [createPaddingX(padding.x), createPaddingY(padding.y), createPaddingTop(padding.t), createPaddingBottom(padding.b), createPaddingLeft(padding.l), createPaddingRight(padding.r)].join(' ')
}