import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

export const Modal = ({ children, open, onClose }: { children: React.ReactNode; open: boolean; onClose: () => void }) => {
  const [isWindow, setIsWindow] = useState(false)

  useEffect(() => {
    setIsWindow(true)
  }, [])

  if (!isWindow) return null
  return createPortal(<AnimatePresence>
    {open ? (
      <div
        key="drawer"
        className="fixed inset-0 z-10"
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
          className="bg-black absolute inset-0"
        />
        <motion.div
          role="dialog"
          initial={{
            y: -20,
            opacity: 0,
          }}
          animate={{
            y: 0,
            opacity: 1,
          }}
          exit={{
            y: -20,
            opacity: 0,
          }}
          transition={{ ease: 'easeInOut' }}
          className="absolute top-8 inset-x-4 bg-base-100 rounded overflow-auto max-w-xl m-auto"
          style={{ height: 'min-content', maxHeight: '90vh' }}
        >
          {children}
        </motion.div>
      </div>
    ) : null}
  </AnimatePresence>, document.body)
}