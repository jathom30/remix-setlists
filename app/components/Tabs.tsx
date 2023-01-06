import type { ReactNode } from "react"

export const Tabs = ({ children, tabs }: { children: ReactNode; tabs: { label: string, isActive: boolean, onClick: () => void }[] }) => {
  return (
    <div>
      <div className="tabs w-full">
        {tabs.map(tab => (
          <button className={`tab tab-bordered ${tab.isActive ? 'tab-active' : ''}`} onClick={tab.onClick} key={tab.label}>{tab.label}</button>
        ))}
      </div>
      <div className="p-4">
        {children}
      </div>
    </div>
  )
}