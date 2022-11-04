export const FlexHeader = ({ children, pad }: { children: React.ReactNode; pad?: number | Partial<Record<'x' | 'y' | 'l' | 'r' | 't' | 'b', number>> }) => {
  const createPadding = () => {
    if (!pad) { return null }
    if (typeof pad === 'number') {
      return `p-${pad}`
    }
    return `px-${pad.x} py-${pad.y} pt-${pad.t} pb-${pad.b} pl-${pad.l} pr-${pad.r}`
  }
  return (
    <div className={`flex items-center justify-between gap-2 w-full ${createPadding()}`}>{children}</div>
  )
}