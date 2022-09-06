import { motion } from 'framer-motion'

export const SideBar = ({ children, collapse = false }: { children?: React.ReactNode, collapse?: boolean }) => {
  return (
    <motion.div
      className={`h-full bg-component-background border-r border-component-background-darken`}
      initial={{ width: 0 }}
      animate={{ width: 'auto' }}
    >
      {children}
    </motion.div>
  )
}