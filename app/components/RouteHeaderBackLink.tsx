import { faChevronLeft } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Link } from "@remix-run/react"
import type { ReactNode } from "react"
import { FlexList } from "./FlexList"

export const RouteHeaderBackLink = ({ children, label, to }: { children?: ReactNode; label: string; to: string }) => {
  return (
    <Link to={to} className="text-white">
      <FlexList gap={2} direction="row" items="center">
        <FontAwesomeIcon icon={faChevronLeft} />
        {children}
        <h1 className="text-lg">{label}</h1>
      </FlexList>
    </Link>
  )
}