import type { LoaderArgs } from "@remix-run/server-runtime"
import { json } from "@remix-run/node"
import { MaxHeightContainer, FlexList, Avatar, Badge } from "~/components"
import { getBands } from "~/models/band.server"
import { requireUserId } from "~/session.server"
import { useLoaderData, Link, NavLink, useLocation } from "@remix-run/react"
import { faPlusCircle } from "@fortawesome/free-solid-svg-icons"
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome"

export async function loader({ request }: LoaderArgs) {
  const userId = await requireUserId(request)
  const bands = await getBands(userId)
  if (!bands) {
    throw new Response("Band not found", { status: 404 })
  }
  return json({ bands })
}

const linkStyles = 'p-4 border-t border-slate-300 w-full flex items-center gap-4'
const activeStyles = "bg-slate-200"

export default function Bands() {
  const { bands } = useLoaderData<typeof loader>()
  const location = useLocation()
  const isActive = (path: string) => location.pathname.includes(path)

  return (
    <MaxHeightContainer
      header={
        <div className="p-4 ">
          <h1 className="text-5xl font-bold">Bands</h1>
        </div>
      }
      footer={
        <Link className={`${linkStyles} ${isActive('new') ? activeStyles : ''}`} to="new">
          <FontAwesomeIcon size="2x" icon={faPlusCircle} />
          <h5>Add a band</h5>
        </Link>
      }
      fullHeight
    >
      <div className="bg-white">
        <FlexList gap={0}>
          {bands.map(band => (
            <NavLink
              key={band.id}
              className={` hover:bg-slate-200 ${isActive(band.id) ? activeStyles : ''}`}
              to={`${band.id}/home`}
            >
              <FlexList direction="row" pad={4} items="center">
                <Avatar size="lg" icon={band.icon} bandName={band.name} />
                <FlexList gap={0}>
                  <h2 className="text-2xl">{band.name}</h2>
                  <div>
                    <Badge>{band.members[0].role}</Badge>
                  </div>
                </FlexList>
              </FlexList>
            </NavLink>
          ))}
        </FlexList>
      </div>
    </MaxHeightContainer>
  )
}
