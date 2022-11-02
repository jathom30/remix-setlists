import type { LoaderArgs } from "@remix-run/server-runtime"
import { json } from "@remix-run/node"
import invariant from "tiny-invariant";
import { FlexList, Collapsible, CollapsibleHeader, SongLink, MaxHeightContainer, Avatar, Badge, RouteHeader, RouteHeaderBackLink, CreateNewButton, SetlistLink, ErrorContainer, MobileModal, Link } from "~/components"
import { Link as RemixLink, Outlet, useLoaderData, useLocation, useNavigate, useParams, useSearchParams } from "@remix-run/react";
import { getRecentSetlists } from "~/models/setlist.server";
import { getRecentSongs } from "~/models/song.server";
import { getBandHome } from "~/models/band.server";
import { RoleEnum, showHideEnums } from "~/utils/enums";
import { useMemberRole } from "~/utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faList, faMusic } from "@fortawesome/free-solid-svg-icons";

export async function loader({ request, params }: LoaderArgs) {
  const bandId = params.bandId
  invariant(bandId, 'bandId note found')

  const url = new URL(request.url)
  // returning the searchParams so that the browser will remember them if combined with other params
  const searchParams = Object.fromEntries(url.searchParams.entries())

  const [band, setlists, songs] = await Promise.all([getBandHome(bandId), getRecentSetlists(bandId), getRecentSongs(bandId)])
  if (!band) {
    throw new Response("Band not found", { status: 404 })
  }
  return json({ band, setlists, songs, searchParams })
}

export default function BandIndex() {
  const { band, setlists, songs, searchParams } = useLoaderData<typeof loader>()
  const memberRole = useMemberRole()
  const isSub = memberRole === RoleEnum.SUB
  const { pathname } = useLocation()
  const navigate = useNavigate()
  const { bandId } = useParams()
  const [params, setParams] = useSearchParams()
  const showSongs = params.get('showSongs')
  const showSetlists = params.get('showSetlists')

  const handleShow = (param: string, value: string | null) => {
    setParams({
      ...searchParams,
      [param]: value === showHideEnums.hide ? showHideEnums.show : showHideEnums.hide
    })
  }

  return (
    <MaxHeightContainer
      fullHeight
      header={
        <RouteHeader
          mobileChildren={
            <RouteHeaderBackLink
              label={band.name}
              to="/bandSelect"
            >
              <Avatar size="sm" bandName={band.name} icon={band.icon} />
            </RouteHeaderBackLink>
          }
          action={<Badge invert size="sm">{memberRole}</Badge>}
        />
      }
      footer={
        <>
          {!isSub ? <CreateNewButton to="new" /> : null}
          <MobileModal open={pathname.includes('new')} onClose={() => navigate('.')}>
            <Outlet />
          </MobileModal>
        </>
      }
    >
      <div className="h-full sm:hidden">
        <FlexList gap={0}>
          <div className="border-b border-slate-300 w-full">
            <Collapsible
              header={
                <CollapsibleHeader isOpen={showSetlists !== showHideEnums.hide} onClick={() => handleShow('showSetlists', showSetlists)}>
                  <FlexList gap={0}>
                    <span className="text-sm font-bold">Setlists</span>
                    <span className="uppercase text-text-subdued text-sm">Most recent</span>
                  </FlexList>
                </CollapsibleHeader>
              }
              isOpen={showSetlists !== showHideEnums.hide}
            >
              {setlists.map(setlist => (
                <SetlistLink key={setlist.id} setlist={setlist} />
              ))}
            </Collapsible>
          </div>

          <div className="border-b border-slate-300 w-full">
            <Collapsible
              header={
                <CollapsibleHeader isOpen={showSongs !== showHideEnums.hide} onClick={() => handleShow('showSongs', showSongs)}>
                  <FlexList gap={0} items="start">
                    <span className="text-sm font-bold">Songs</span>
                    <span className="uppercase text-text-subdued text-sm">Most recent</span>
                  </FlexList>
                </CollapsibleHeader>
              }
              isOpen={showSongs !== showHideEnums.hide}
            >
              {songs.map(song => (
                <SongLink key={song.id} song={song} />
              ))}
            </Collapsible>
          </div>
        </FlexList>
      </div>
      <div className="hidden h-full sm:h-full sm:bg-slate-100 sm:block">
        <FlexList height="full" pad={4} items="center">
          <RemixLink className="bg-white p-4 rounded shadow sm:w-4/5 md:w-2/3 hover:bg-slate-100" to={`/${bandId}/setlists/new`}>
            <FlexList items="center" gap={2}>
              <FontAwesomeIcon icon={faList} size="2x" />
              Create setlist
            </FlexList>
          </RemixLink>
          <RemixLink className="bg-white p-4 rounded shadow sm:w-4/5 md:w-2/3 hover:bg-slate-100" to={`/${bandId}/songs/new`}>
            <FlexList items="center" gap={2}>
              <FontAwesomeIcon icon={faMusic} size="2x" />
              Create song
            </FlexList>
          </RemixLink>
        </FlexList>
      </div>
    </MaxHeightContainer>
  )
}

export function ErrorBoundary({ error }: { error: Error }) {
  return <ErrorContainer error={error} />
}