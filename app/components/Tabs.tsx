import type { ReactNode } from "react"
import { FlexList } from "./FlexList";

export const Tabs = ({ children, tabs }: { children: ReactNode; tabs: { label: string, isActive: boolean, onClick: () => void }[] }) => {
  return (
    <div>
      <FlexList direction="row" gap={0} justify="between">
        {tabs.map(tab => (
          <button className={`bg-slate-100 ${tab.isActive ? 'bg-white' : ''} p-1 w-full border rounded-t border-b-transparent`} onClick={tab.onClick} key={tab.label}>{tab.label}</button>
        ))}
      </FlexList>
      <div className="border border-t-transparent p-4 rounded-b">
        {children}
      </div>
    </div>
  )
}