import { motion } from "framer-motion";
import { useLayoutEffect, useState } from "react";
import { createPortal } from "react-dom"

export const Modal = ({ children, onClose }: { children: React.ReactNode; onClose: () => void }) => {
  const [isOpen, setIsOpen] = useState(false)

  useLayoutEffect(() => {
    setIsOpen(true)
  }, [])

  const handleClose = () => {
    setIsOpen(false)
    setTimeout(() => {
      onClose()
    }, 200);
  }

  if (!isOpen) {
    return null
  }
  return createPortal(
    <div className="fixed inset-0">
      <motion.div
        role="presentation"
        className="bg-black fixed inset-0"
        onClick={handleClose}
        initial={{ opacity: 0 }}
        animate={{ opacity: .5 }}
      />
      <motion.div
        className="relative z-10 max-w-2xl flex m-4 bg-white p-4 rounded shadow-lg sm:m-auto sm:mt-4"
        initial={{ opacity: 0, y: -200 }}
        animate={{ opacity: 1, y: 0 }}
      >
        {children}
      </motion.div>
    </div>
    , document.body
  )
}