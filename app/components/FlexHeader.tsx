export const FlexHeader = ({ children }: { children: React.ReactNode }) => {
  return (
    <div className="flex items-center justify-between gap-2 w-full">{children}</div>
  )
}