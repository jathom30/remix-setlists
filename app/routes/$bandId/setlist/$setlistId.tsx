import type { LoaderArgs } from "@remix-run/server-runtime";
import { json } from '@remix-run/node'
import invariant from "tiny-invariant";
import { getSetlist } from "~/models/setlist.server";
import { requireUserId } from "~/session.server";
import { Outlet, useLoaderData, useLocation, useNavigate, useParams } from "@remix-run/react";
import { Breadcrumbs, CatchContainer, Divider, ErrorContainer, FlexHeader, FlexList, Label, Link, MaxHeightContainer, MaxWidth, MobileModal, Navbar, RouteHeader, RouteHeaderBackLink, SongLink, Title } from "~/components";
import { faDatabase, faEllipsisV } from "@fortawesome/free-solid-svg-icons";
import { getSetLength } from "~/utils/setlists";
import pluralize from "pluralize";

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

  return (
    <MaxHeightContainer
      fullHeight
      header={
        <Navbar>
          <FlexHeader>
            <div>
              <Title>{setlist.name}</Title>
              <Breadcrumbs breadcrumbs={[
                { label: 'Setlists', to: `/${bandId}/setlists` },
                { label: setlist.name, to: '.' },
              ]}
              />
            </div>
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
        {setlist.sets.map((set, i) => (
          <div key={set.id}>
            <FlexList pad={4}>
              <FlexHeader>
                <Label>Set {i + 1} - {pluralize('minute', getSetLength(set.songs), true)}</Label>
                <Link to={`data/${set.id}`} isCollapsing isOutline icon={faDatabase}>Data metrics</Link>
              </FlexHeader>
              <FlexList gap={2}>
                {set.songs.map(song => {
                  if (!song.song) { return null }
                  return (
                    <SongLink key={song.songId} song={song.song} to={`song/${song.songId}`} />
                  )
                })}
                <Divider />
              </FlexList>
            </FlexList>
          </div>
        ))}
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