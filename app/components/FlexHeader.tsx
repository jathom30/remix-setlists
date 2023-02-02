import type { FlexListProps } from "./FlexList";
import { getJustify, getItems } from "./FlexList";

export const FlexHeader = ({ children, pad, items = 'center' }: { children: React.ReactNode; pad?: FlexListProps['pad']; items?: FlexListProps['items'] }) => {
  const createPadding = () => {
    if (!pad) { return null }
    if (typeof pad === 'number') {
      return `p-${pad}`
    }
    return `px-${pad.x} py-${pad.y} pt-${pad.t} pb-${pad.b} pl-${pad.l} pr-${pad.r}`
  }
  return (
    <div className={`FlexHeader flex ${getItems(items)} ${getJustify("between")} gap-2 w-full ${createPadding()}`}>{children}</div>
  )
}