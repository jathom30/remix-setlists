import { faChevronLeft } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { useNavigate } from "@remix-run/react"
import type { ReactNode } from "react"
import { FlexList } from "./FlexList"

export const RouteHeaderBackLink = ({ children, label, to }: { children?: ReactNode; label: string, to?: string }) => {
  const navigate = useNavigate()
  const back = () => to ? navigate(to) : navigate(-1)
  return (
    <button onClick={back} className="text-white">
      <FlexList gap={2} direction="row" items="center">
        <FontAwesomeIcon icon={faChevronLeft} />
        {children}
        <h1 className="text-lg">{label}</h1>
      </FlexList>
    </button>
  )
}