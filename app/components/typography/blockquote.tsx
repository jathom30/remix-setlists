import { type ReactNode } from 'react'

export function Blockquote({ children }: { children: ReactNode }) {
	return (
		<blockquote className="mt-6 border-l-2 pl-6 italic">{children}</blockquote>
	)
}
