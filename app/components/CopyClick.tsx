import { faCopy } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";

export const CopyClick = ({
  textToCopy,
  copyMessage,
  successMessage,
}: {
  textToCopy?: string;
  copyMessage: string;
  successMessage: string;
}) => {
  const [showSuccess, setShowSuccess] = useState(false);

  const handleCopy = () => {
    if (!textToCopy) return;
    navigator.clipboard.writeText(textToCopy).then(() => setShowSuccess(true));
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      if (showSuccess) {
        setShowSuccess(false);
      }
    }, 1000);
    return () => clearTimeout(timer);
  }, [showSuccess]);

  return (
    <div className="relative">
      <button
        onClick={handleCopy}
        className=" rounded border flex justify-between items-center p-2 w-full"
      >
        <span className="font-bold">{copyMessage}</span>
        <FontAwesomeIcon icon={faCopy} />
      </button>
      <AnimatePresence>
        {showSuccess ? (
          <motion.span
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ opacity: 0.2 }}
            className="absolute top-full right-0 text-primary bg-white p-2 rounded"
          >
            {successMessage}
          </motion.span>
        ) : null}
      </AnimatePresence>
    </div>
  );
};
