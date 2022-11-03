import { faChevronRight } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"
import { Link } from "react-router-dom"
import { FlexList } from "./FlexList"
import { Title } from "./Title"

type Breadcrumb = {
  label: string;
  to: string;
}

export const Breadcrumbs = ({ breadcrumbs }: { breadcrumbs: Breadcrumb[] }) => {
  const links = breadcrumbs.slice(0, -1)
  const current = breadcrumbs[breadcrumbs.length - 1]
  return (
    <FlexList direction="row" items="center" gap={2} wrap>
      {links.map(link => (
        <>
          <Link key={link.label} to={link.to} className="text-slate-400 hover:text-text">
            <Title>{link.label}</Title>
          </Link>
          <FontAwesomeIcon className="text-slate-400" icon={faChevronRight} />
        </>
      ))}
      <Title>{current.label}</Title>
    </FlexList>
  )
}