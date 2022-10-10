import { faPenToSquare, faTrash } from "@fortawesome/free-solid-svg-icons";
import { Outlet, useCatch, useLoaderData, useLocation, useNavigate, useParams } from "@remix-run/react";
import { json } from '@remix-run/node'
import type { LoaderArgs } from "@remix-run/server-runtime";
import invariant from "tiny-invariant";
import { Drawer, ErrorContainer, FeelTag, FlexList, ItemBox, Label, Link, MaxHeightContainer, RouteHeader, RouteHeaderBackLink, TempoIcons } from "~/components";
import { getSong } from "~/models/song.server";
import { requireUserId } from "~/session.server";
import pluralize from 'pluralize'
import { roleEnums, setlistAutoGenImportanceEnums } from "~/utils/enums";
import { getMemberRole } from "~/models/usersInBands.server";
import { useState } from "react";

export async function loader({ request, params }: LoaderArgs) {
  const userId = await requireUserId(request)
  const { songId, bandId } = params
  invariant(songId, 'songId not found')
  invariant(bandId, 'bandId not found')

  const role = await getMemberRole(bandId, userId)

  const song = await getSong(songId)
  if (!song) {
    throw new Response('Song not found', { status: 404 })
  }
  return json({ song, isSub: role === roleEnums.sub })
}

export default function SongDetails() {
  const { song, isSub } = useLoaderData<typeof loader>()
  const { pathname, state } = useLocation()
  const [to] = useState<string>(state as string)
  const navigate = useNavigate()

  return (
    <MaxHeightContainer
      fullHeight
      header={
        <RouteHeader>
          <RouteHeaderBackLink label={song.name} to={to} />
          {!isSub ? <Link to="edit" kind="invert" icon={faPenToSquare} isRounded isCollapsing>Edit song</Link> : null}
        </RouteHeader>
      }
      footer={
        <Drawer open={['edit', 'delete'].some(path => pathname.includes(path))} onClose={() => navigate('.')}>
          <Outlet />
        </Drawer>
      }
    >
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
                <FlexList direction="row" gap={2}>
                  {song.feels.map(feel => (
                    <FeelTag key={feel.id} feel={feel} />
                  ))}
                  {song.feels.length === 0 ? "--" : null}
                </FlexList>
              </FlexList>
            </FlexList>
          </ItemBox>
        </FlexList>

        {
          song.note ? (
            <FlexList gap={2}>
              <Label>Notes</Label>
              <ItemBox>
                <FlexList gap={2}>
                  {song.note.split('\n').map((section, i) => (
                    <p key={i}>{section}</p>
                  ))}
                </FlexList>
              </ItemBox>
            </FlexList>
          ) : null
        }

        <FlexList gap={2}>
          <Label>Settings</Label>
          <ItemBox>
            <FlexList gap={2} direction="row" items="center">
              <Label>Setlist auto-generation importance</Label>
              <span>{setlistAutoGenImportanceEnums[song.rank as keyof typeof setlistAutoGenImportanceEnums]}</span>
            </FlexList>
          </ItemBox>
        </FlexList>

        {!isSub ? (
          <FlexList gap={2}>
            <Label>Danger zone</Label>
            <ItemBox isDanger>
              <FlexList>
                <FlexList gap={0}>
                  <span>Delete this song</span>
                  <p className="text-sm text-text-subdued">Once you delete this song, it will be removed from this band and any setlists it was used in.</p>
                </FlexList>
                <Link to="delete" kind="danger" type="submit" icon={faTrash}>Delete</Link>
              </FlexList>
            </ItemBox>
          </FlexList>
        ) : null}
      </FlexList >
    </MaxHeightContainer>
  )
}

export function ErrorBoundary({ error }: { error: Error }) {
  console.error(error)
  return (
    <ErrorContainer error={error} />
  )
}

export function CatchBoundary() {
  const caught = useCatch()
  const { bandId } = useParams()

  if (caught.status === 404) {
    return (
      <FlexList pad={4}>
        <h1 className="text-5xl font-bold">404</h1>
        <p>Oops...</p>
        <p>This song could not be found...</p>
        <Link to={`/${bandId}` || '.'}>Back to band page</Link>
      </FlexList>
    )
  }
  throw new Error(`Unhandled error: ${caught.status}`)
}