import { type ReactNode } from 'react'

export function Lead({ children }: { children: ReactNode }) {
	return <p className="text-xl text-muted-foreground">{children}</p>
}
