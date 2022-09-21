import type { ReactNode } from "react"

export const Badge = ({ children, size = 'md', invert = false }: {
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
  invert?: boolean;
}) => {
  const getSize = () => {
    switch (size) {
      case 'sm':
        return 'text-xs'
      case 'md':
        return 'text-sm'
      case 'lg':
        return 'text-md'
      default:
        return 'text-sm'
    }
  }

  const color = invert ? 'white' : 'slate-400'

  return (
    <span className={`px-3 w-max whitespace-nowrap rounded border border-${color} text-${color} ${getSize()}`}>{children}</span>
  )
}