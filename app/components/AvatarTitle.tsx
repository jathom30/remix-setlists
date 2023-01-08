import { Link, useParams } from "@remix-run/react"
import type { ReactNode } from "react"
import { useBandIcon } from "~/utils"
import { Avatar } from "./Avatar"
import { FlexList } from "./FlexList"
import { Title } from "./Title"

export const AvatarTitle = ({ title }: { title: ReactNode }) => {
  const band = useBandIcon()
  const { bandId } = useParams()
  return (
    <FlexList direction="row" items="center">
      {band ? (
        <Link to={`/${bandId}`} className="sm:hidden rounded-md hover:outline hover:outline-2 hover:outline-offset-2 hover:outline-accent">
          <Avatar bandName={band?.bandName} icon={band?.icon} />
        </Link>
      ) : null}
      <Title>{title}</Title>
    </FlexList>
  )
}