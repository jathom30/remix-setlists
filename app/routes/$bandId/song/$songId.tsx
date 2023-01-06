import { faPenToSquare, faTrash } from "@fortawesome/free-solid-svg-icons";
import { Outlet, useLoaderData, useLocation, useNavigate, useParams } from "@remix-run/react";
import { json } from '@remix-run/node'
import type { LoaderArgs } from "@remix-run/server-runtime";
import invariant from "tiny-invariant";
import { Breadcrumbs, CatchContainer, Divider, ErrorContainer, FeelTag, FlexHeader, FlexList, ItemBox, Label, Link, MaxHeightContainer, MaxWidth, MobileModal, Navbar, RouteHeader, RouteHeaderBackLink, TempoIcons, Title } from "~/components";
import { getSong } from "~/models/song.server";
import { requireUserId } from "~/session.server";
import pluralize from 'pluralize'
import { RoleEnum, setlistAutoGenImportanceEnums } from "~/utils/enums";
import { useMemberRole } from "~/utils";

export async function loader({ request, params }: LoaderArgs) {
  await requireUserId(request)
  const { songId, bandId } = params
  invariant(songId, 'songId not found')
  invariant(bandId, 'bandId not found')

  const song = await getSong(songId, bandId)
  if (!song) {
    throw new Response('Song not found', { status: 404 })
  }
  return json({ song })
}

export default function SongDetails() {
  const { song } = useLoaderData<typeof loader>()
  const memberRole = useMemberRole()
  const isSub = memberRole === RoleEnum.SUB
  const { pathname } = useLocation()
  const { bandId } = useParams()
  const navigate = useNavigate()

  return (
    <MaxHeightContainer
      fullHeight
      header={
        <Navbar>
          <FlexHeader>
            <div>
              <Title>{song.name}</Title>
              <Breadcrumbs breadcrumbs={[
                { label: 'Songs', to: `/${bandId}/songs` },
                { label: song.name, to: '.' },
              ]}
              />
            </div>
            {!isSub ? <Link to="edit" icon={faPenToSquare} kind="ghost" isCollapsing>Edit song</Link> : null}
          </FlexHeader>
        </Navbar>
      }
      footer={
        <MobileModal open={['edit', 'delete'].some(path => pathname.includes(path))} onClose={() => navigate('.')}>
          <Outlet />
        </MobileModal>
      }
    >
      <MaxWidth>
        <FlexList pad={4}>
          <FlexList gap={2}>
            <Label>Details</Label>
            <ItemBox>
              <FlexList gap={2}>
                <FlexList direction="row" items="center">
                  <Label>Name</Label>
                  <span>{song.name}</span>
                </FlexList>
                <FlexList direction="row" items="center">
                  <Label>Artist</Label>
                  <span>{song.isCover ? 'Cover' : 'Original'}</span>
                </FlexList>
                <FlexList direction="row" items="center">
                  <Label>Key</Label>
                  {song.keyLetter ? <span>{song.keyLetter} {song.isMinor ? 'Minor' : 'Major'}</span> : <span>--</span>}
                </FlexList>

                <FlexList direction="row" items="center">
                  <Label>Tempo</Label>
                  <TempoIcons tempo={song.tempo} />
                </FlexList>

                <FlexList direction="row" items="center">
                  <Label>Length</Label>
                  <span>{pluralize('Minutes', song.length, true)}</span>
                </FlexList>

                <FlexList direction="row" items="center">
                  <Label>Position</Label>
                  <span>{song.position || 'Other'}</span>
                </FlexList>

                <FlexList direction="row" items="center">
                  <Label>Feels</Label>
                  <FlexList direction="row" gap={2} wrap>
                    {song.feels.map(feel => (
                      <FeelTag key={feel.id} feel={feel} />
                    ))}
                    {song.feels.length === 0 ? "--" : null}
                  </FlexList>
                </FlexList>
              </FlexList>
            </ItemBox>
          </FlexList>

          <Divider />

          <FlexList gap={2}>
            <Label>Notes</Label>
            <ItemBox>
              <FlexList gap={2}>
                {!song.note ? (
                  <span className="text-sm">N/A</span>
                ) : (
                  song.note?.split('\n').map((section, i) => (
                    <p key={i}>{section}</p>
                  ))
                )}
              </FlexList>
            </ItemBox>
          </FlexList>

          <Divider />

          <FlexList gap={2}>
            <Label>Settings</Label>
            <ItemBox>
              <FlexList gap={2} direction="row" items="center">
                <Label>Setlist auto-generation importance</Label>
                <span>{setlistAutoGenImportanceEnums[song.rank as keyof typeof setlistAutoGenImportanceEnums]}</span>
              </FlexList>
            </ItemBox>
          </FlexList>

          <Divider />

          {!isSub ? (
            <FlexList gap={2}>
              <Label isDanger>Danger zone</Label>
              <ItemBox>
                <FlexList>
                  <FlexList>
                    <span className="font-bold">Delete this song</span>
                    <p className="text-sm text-text-subdued">Once you delete this song, it will be removed from this band and any setlists it was used in.</p>
                  </FlexList>
                  <Link to="delete" kind="error" type="submit" icon={faTrash}>Delete</Link>
                </FlexList>
              </ItemBox>
            </FlexList>
          ) : null}
        </FlexList >
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