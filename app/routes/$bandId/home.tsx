import type { LoaderArgs } from "@remix-run/server-runtime"
import { json } from "@remix-run/node"
import invariant from "tiny-invariant";
import { FlexList, Collapsible, CollapsibleHeader, SongLink, MaxHeightContainer, Avatar, Badge, RouteHeader, RouteHeaderBackLink, CreateNewButton, SetlistLink, ErrorContainer, MobileModal, Title, Link, ItemBox } from "~/components"
import { Outlet, useLoaderData, useLocation, useNavigate, useParams, useSearchParams } from "@remix-run/react";
import { getRecentSetlists } from "~/models/setlist.server";
import { getRecentSongs } from "~/models/song.server";
import { getBandHome } from "~/models/band.server";
import { RoleEnum, showHideEnums } from "~/utils/enums";
import { useMemberRole } from "~/utils";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faBoxOpen, faMusic } from "@fortawesome/free-solid-svg-icons";

export async function loader({ request, params }: LoaderArgs) {
  const { bandId } = params
  invariant(bandId, 'bandId note found')

  const url = new URL(request.url)
  // returning the searchParams so that the browser will remember them if combined with other params
  const searchParams = Object.fromEntries(url.searchParams.entries())

  const [band, setlists, songs] = await Promise.all([getBandHome(bandId), getRecentSetlists(bandId), getRecentSongs(bandId)])
  if (!band) {
    throw new Response("Band not found", { status: 404 })
  }
  return json({ band, setlists: setlists.filter(setlist => !setlist.editedFromId), songs, searchParams })
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
          desktopAction={isSub ? null : <Link to="new" kind="primary">New</Link>}
          desktopChildren={<Title>Home</Title>}
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
      <div className="h-full">
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
              {!setlists.length ? (
                <div className="p-4">
                  <ItemBox>
                    <FlexList>
                      <FontAwesomeIcon icon={faBoxOpen} size="3x" />
                      <p className="text-center">Looks like this band doesn't have any setlists yet...</p>
                      <Link to={`/${bandId}/setlist/new`} kind="secondary">Create your first setlist</Link>
                    </FlexList>
                  </ItemBox>
                </div>
              ) : null}
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
              {!songs.length ? (
                <div className="p-4">
                  <ItemBox>
                    <FlexList>
                      <FontAwesomeIcon icon={faMusic} size="3x" />
                      <p className="text-center">Looks like this band doesn't have any songs yet...</p>
                      <Link to={`/${bandId}/song/new`} kind="secondary">Create your first song</Link>
                    </FlexList>
                  </ItemBox>
                </div>
              ) : null}
              {songs.map(song => (
                <SongLink key={song.id} song={song} />
              ))}
            </Collapsible>
          </div>
        </FlexList>
      </div>
    </MaxHeightContainer>
  )
}

export function ErrorBoundary({ error }: { error: Error }) {
  return <ErrorContainer error={error} />
}