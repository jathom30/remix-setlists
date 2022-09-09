import { faPenToSquare, faTrash } from "@fortawesome/free-solid-svg-icons";
import { Form, useCatch, useLoaderData, useParams } from "@remix-run/react";
import { json } from '@remix-run/node'
import type { ActionArgs, LoaderArgs } from "@remix-run/server-runtime";
import { redirect } from "@remix-run/server-runtime";
import invariant from "tiny-invariant";
import { Button, FeelTag, FlexList, Header, ItemBox, Label, Link, TempoIcons } from "~/components";
import { deleteSong, getSong } from "~/models/song.server";
import { requireUserId } from "~/session.server";
import pluralize from 'pluralize'
import { setlistAutoGenImportanceEnums } from "~/utils/enums";

export async function loader({ request, params }: LoaderArgs) {
  await requireUserId(request)
  const { songId } = params
  invariant(songId, 'songId not found')

  const song = await getSong(songId)
  if (!song) {
    throw new Response('Song not found', { status: 404 })
  }
  return json({ song })
}

export async function action({ request, params }: ActionArgs) {
  await requireUserId(request)
  const { songId, bandId } = params
  invariant(songId, 'songId not found')
  invariant(bandId, 'bandId not found')

  await deleteSong(songId)
  return redirect(`/${bandId}`)
}

export default function SongDetails() {
  const { song } = useLoaderData<typeof loader>()
  return (
    <FlexList pad={4}>
      <Header>
        <h1 className="font-bold text-3xl">{song.name}</h1>
        <Link to="edit" kind="secondary" icon={faPenToSquare} isCollapsing isRounded>Edit song</Link>
      </Header>
      <FlexList gap={2}>
        <Label>Details</Label>
        <ItemBox>
          <FlexList gap={2}>
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

      {song.note ? (
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
      ) : null}

      <FlexList gap={2}>
        <Label>Settings</Label>
        <ItemBox>
          <FlexList gap={2} direction="row" items="center">
            <Label>Setlist auto-generation importance</Label>
            <span>{setlistAutoGenImportanceEnums[song.rank as keyof typeof setlistAutoGenImportanceEnums]}</span>
          </FlexList>
        </ItemBox>
      </FlexList>

      <FlexList gap={2}>
        <Label>Danger zone</Label>
        <ItemBox isDanger>
          <FlexList direction="row" items="center">
            <FlexList gap={0}>
              <span>Delete this song</span>
              <span className="text-text-subdued">Once you delete this song, it will be removed from this band and any setlists it was used in.</span>
            </FlexList>
            <Form method="post">
              <Button kind="danger" type="submit" icon={faTrash}>Delete</Button>
            </Form>
          </FlexList>
        </ItemBox>
      </FlexList>
    </FlexList>
  )
}

export function ErrorBoundary({ error }: { error: unknown }) {
  console.error(error)
  return (
    <div>
      "I don't know where and I don't know when, but something terrible is about to happen."
    </div>
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