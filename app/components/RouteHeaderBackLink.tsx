import { faChevronLeft } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useNavigate } from "@remix-run/react"
import type { ReactNode } from "react"
import { TextOverflow } from "./TextOverflow"

export const RouteHeaderBackLink = ({ children, label, to }: { children?: ReactNode; label: string, to?: string }) => {
  const navigate = useNavigate()
  const back = () => to ? navigate(to) : navigate(-1)
  return (
    <button onClick={back} className="text-white w-full flex gap-2 items-center">
      <FontAwesomeIcon icon={faChevronLeft} />
      {children}
      <TextOverflow className="text-lg">{label}</TextOverflow>
    </button>
  )
}