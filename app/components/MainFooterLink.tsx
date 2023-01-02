import type { IconDefinition } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useLocation, Link } from "@remix-run/react";
import { FlexList } from "./FlexList";

export const MainFooterLink = ({ icon, label, to }: { icon: IconDefinition; label: string, to: string }) => {
  const { pathname } = useLocation()

  const isActive = pathname.includes(label.toLowerCase())

  return (
    <Link className={`p-2 ${isActive ? 'text-white' : ''}`} to={to}>
      <FlexList items="center" gap={0}>
        <FontAwesomeIcon icon={icon} />
        <span>{label}</span>
      </FlexList>
    </Link>
  )
}