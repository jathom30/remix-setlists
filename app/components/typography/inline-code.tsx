import { type ReactNode } from 'react'

export function InlineCode({
	children,
	ariaLabel,
}: {
	ariaLabel?: string
	children: ReactNode
}) {
	return (
		<code
			aria-label={ariaLabel}
			className="relative rounded bg-muted px-[0.3rem] py-[0.2rem] font-mono text-sm font-semibold"
		>
			{children}
		</code>
	)
}
