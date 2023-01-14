import { AnimatePresence, motion } from "framer-motion"
import type { ReactNode } from "react"

export const Drawer = ({ children, open, onClose }: {
  children: ReactNode;
  open: boolean;
  onClose: () => void;
}) => {

  return (
    <AnimatePresence>
      {open ? (
        <motion.div
          key="drawer"
          className="sticky inset-0"
        >
          <motion.div
            role="presentation"
            onTap={onClose}
            initial={{
              opacity: 0,
            }}
            animate={{
              opacity: .5
            }}
            exit={{
              opacity: 0
            }}
            className="bg-black fixed inset-0"
          />
          <motion.div
            role="dialog"
            initial={{
              y: 200,
              opacity: 0,
            }}
            animate={{
              y: 0,
              opacity: 1,
            }}
            exit={{
              y: 200,
              opacity: 0,
            }}
            transition={{ ease: 'easeInOut' }}
            className="absolute bottom-0 left-0 right-0 bg-base-100 rounded-t overflow-auto"
            style={{ maxHeight: '70vh' }}
          >
            {children}
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}