import type { LoaderArgs } from "@remix-run/server-runtime";
import { json } from '@remix-run/node'
import invariant from "tiny-invariant";
import { getSetlist } from "~/models/setlist.server";
import { requireUserId } from "~/session.server";
import { Outlet, useLoaderData, useLocation, useNavigate, useParams } from "@remix-run/react";
import { AvatarTitle, Breadcrumbs, Button, CatchContainer, Collapsible, ErrorContainer, FlexHeader, FlexList, Label, Link, MaxHeightContainer, MaxWidth, MobileModal, Navbar, SongLink } from "~/components";
import { faCompress, faDatabase, faEllipsisV, faExpand } from "@fortawesome/free-solid-svg-icons";
import { getSetLength } from "~/utils/setlists";
import pluralize from "pluralize";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { useState } from "react";

export async function loader({ request, params }: LoaderArgs) {
  await requireUserId(request)

  const setlistId = params.setlistId
  invariant(setlistId, 'setlistId not found')

  const setlist = await getSetlist(setlistId)

  if (!setlist) {
    throw new Response("Setlist not found", { status: 404 })
  }
  return json({ setlist })
}

const subRoutes = ['rename', 'edit', 'condensed', 'data', 'delete', 'menu', 'song']

export default function Setlist() {
  const { setlist } = useLoaderData<typeof loader>()
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { bandId } = useParams()
  const setKeyDefaults = setlist.sets.reduce((acc, set) => ({ ...acc, [set.id]: true }), {} as Record<string, boolean>)
  const [isOpen, setIsOpen] = useState(setKeyDefaults)

  const handleOpenSet = (setId: string) => {
    setIsOpen(prevOpen => {
      return {
        ...prevOpen,
        [setId]: !prevOpen[setId]
      }
    })
  }

  return (
    <MaxHeightContainer
      fullHeight
      header={
        <Navbar>
          <FlexHeader>
            <FlexList gap={2}>
              <AvatarTitle title={setlist.name} />
              <Breadcrumbs breadcrumbs={[
                { label: 'Setlists', to: `/${bandId}/setlists` },
                { label: setlist.name, to: '.' },
              ]}
              />
            </FlexList>
            <Link to="menu" icon={faEllipsisV} kind="ghost" isCollapsing>Menu</Link>
          </FlexHeader>
        </Navbar>
      }
      footer={
        <MobileModal open={subRoutes.some(route => pathname.includes(route))} onClose={() => navigate('.')}>
          <Outlet />
        </MobileModal>
      }
    >
      <MaxWidth>
        <FlexList pad={4}>
          {setlist.sets.map((set, i) => (
            <Collapsible
              key={set.id}
              isOpen={isOpen[set.id]}
              header={
                <div className="pb-4">
                  <FlexHeader>
                    <FlexList direction="row" items="center">
                      <Button kind="accent" isOutline onClick={() => handleOpenSet(set.id)}>
                        <FontAwesomeIcon icon={!isOpen[set.id] ? faCompress : faExpand} />
                      </Button>
                      <Label>Set {i + 1} - {pluralize('minute', getSetLength(set.songs), true)}</Label>
                    </FlexList>
                    <Link to={`data/${set.id}`} isCollapsing isOutline icon={faDatabase}>Data metrics</Link>
                  </FlexHeader>
                </div>
              }
            >
              <FlexList gap={2}>
                {set.songs.map(song => {
                  if (!song.song) { return null }
                  return (
                    <SongLink key={song.songId} song={song.song} to={`song/${song.songId}`} />
                  )
                })}
              </FlexList>
            </Collapsible>
          ))}
        </FlexList>
      </MaxWidth>
    </MaxHeightContainer>
  )
}

export function ErrorBoundary({ error }: { error: Error }) {
  return <ErrorContainer error={error} />
}

export function CatchBoundary() {
  return <CatchContainer />
}