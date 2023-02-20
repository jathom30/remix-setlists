import { getPadding } from "~/utils/flexStyles";
import type { FlexListProps } from "./FlexList";
import { getJustify, getItems } from "./FlexList";

export const FlexHeader = ({ children, pad, items = 'center' }: { children: React.ReactNode; pad?: FlexListProps['pad']; items?: FlexListProps['items'] }) => {
  return (
    <div className={`FlexHeader flex ${getItems(items)} ${getJustify("between")} gap-2 w-full ${getPadding(pad)}`}>{children}</div>
  )
}