import { useEffect, useState } from "react";
import { Drawer } from "./Drawer";
import { Modal } from "./Modal";

export const MobileModal = ({ children, open, onClose, isPortal }: { children: React.ReactNode; open: boolean; onClose: () => void; isPortal?: boolean }) => {
  const [isMobile, setIsMobile] = useState(true)
  const mobileWidth = 640

  useEffect(() => {
    if (typeof window === 'undefined') {
      return
    }
    const handleResize = () => {
      setIsMobile(window.innerWidth < mobileWidth)
    }
    handleResize()
    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  if (isMobile) {
    return <Drawer open={open} onClose={onClose}>{children}</Drawer>
  } else {
    return (
      <Modal isPortal={isPortal} open={open} onClose={onClose}>{children}</Modal>
    )
  }
}