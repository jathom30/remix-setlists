import { faCaretRight } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { AnimatePresence, motion } from "framer-motion";
import type { MouseEvent, ReactNode } from "react";

interface CollapsibleProps {
  children?: ReactNode;
  header?: ReactNode;
  isOpen?: boolean;
  isBordered?: boolean;
}

export const Collapsible = ({
  children,
  header,
  isBordered = false,
  isOpen = true,
}: CollapsibleProps) => {
  return (
    <div
      className={`w-full ${isBordered ? "border-b border-base-content" : ""}`}
    >
      {header}
      <AnimatePresence initial={false}>
        {isOpen ? (
          <motion.div
            initial={{
              opacity: 0,
              height: 0,
              scaleY: 0,
              transformOrigin: "top",
            }}
            animate={{ opacity: 1, height: "auto", scaleY: 1 }}
            exit={{ opacity: 0, height: 0, scaleY: 0 }}
            transition={{ opacity: 0.2 }}
          >
            {children}
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
};

export const CollapsibleHeader = ({
  children,
  onClick,
  isOpen,
}: {
  children: ReactNode;
  onClick: (e: MouseEvent<HTMLButtonElement>) => void;
  isOpen: boolean;
}) => {
  return (
    <div className="flex  hover:bg-base-300 w-full">
      <button
        className="flex items-center justify-between gap-2 p-2 w-full text-left"
        onClick={onClick}
        type="button"
      >
        {children}
        <motion.div animate={isOpen ? { rotate: 90 } : {}}>
          <FontAwesomeIcon icon={faCaretRight} />
        </motion.div>
      </button>
    </div>
  );
};
