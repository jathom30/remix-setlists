import { Link, useParams, useTransition } from "@remix-run/react"
import type { ReactNode } from "react"
import { useSpinDelay } from "spin-delay"
import { useBandIcon } from "~/utils"
import { Avatar } from "./Avatar"
import { FlexList } from "./FlexList"
import { Loader } from "./Loader"
import { Title } from "./Title"

export const AvatarTitle = ({ title }: { title: ReactNode }) => {
  const transition = useTransition()
  const isSubmitting = useSpinDelay(transition.state !== 'idle')
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
      {isSubmitting ? <Loader /> : null}
    </FlexList>
  )
}