import { faCaretRight } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import type { MouseEvent, ReactNode } from "react"
import { AnimatePresence, motion } from 'framer-motion'

type CollapsibleProps = {
  children?: ReactNode
  header: ReactNode
  isOpen?: boolean
}

export const Collapsible = ({ children, header, isOpen = true }: CollapsibleProps) => {
  return (
    <div
      className="w-full"
    >
      {header}
      <AnimatePresence initial={false}>
        {isOpen ? (
          <motion.div
            initial={{ opacity: 0, height: 0, scaleY: 0, transformOrigin: 'top' }}
            animate={{ opacity: 1, height: 'auto', scaleY: 1 }}
            exit={{ opacity: 0, height: 0, scaleY: 0 }}
            transition={{ opacity: .2 }}
          >
            {children}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}

export const CollapsibleHeader = ({ children, onClick, isOpen }: { children: ReactNode; onClick: (e: MouseEvent<HTMLButtonElement>) => void; isOpen: boolean; }) => {
  return (
    <div className="flex bg-slate-100 hover:bg-slate-200 w-full">
      <button className="flex items-center justify-between gap-2 p-2 w-full text-left" onClick={onClick} type="button">
        {children}
        <motion.div animate={isOpen ? { rotate: 90 } : {}}>
          <FontAwesomeIcon icon={faCaretRight} />
        </motion.div>
      </button>
    </div>
  )
}