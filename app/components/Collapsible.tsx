import { faCaretRight, faPlus } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import type { ReactNode } from "react"
import { motion } from 'framer-motion'
import { Link } from "@remix-run/react"

type CollapsibleProps = {
  children?: ReactNode
  header: ReactNode
  isOpen?: boolean
}

export const Collapsible = ({ children, header, isOpen = true }: CollapsibleProps) => {
  return (
    <div>
      {header}
      {isOpen ? children : null}
    </div>
  )
}

export const CollapsibleHeader = ({ label, onClick, isOpen, newTo }: { label: string; onClick: () => void; isOpen: boolean; newTo: string }) => {
  return (
    <div className="flex bg-slate-100 hover:bg-slate-200">
      <button className="flex items-center gap-2 p-2 w-full" onClick={onClick}>
        <motion.div animate={isOpen ? { rotate: 90 } : {}}>
          <FontAwesomeIcon icon={faCaretRight} />
        </motion.div>
        {label}
      </button>
      <Link to={newTo} className="p-2 hover:bg-slate-300"><FontAwesomeIcon icon={faPlus} /></Link>
    </div>
  )
}