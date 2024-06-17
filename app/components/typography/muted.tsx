import { type ReactNode } from 'react'

export function Muted({ children }: { children: ReactNode }) {
	return <p className="text-sm text-muted-foreground">{children}</p>
}
