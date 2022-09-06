import { faPenToSquare, faTrash } from "@fortawesome/free-solid-svg-icons";
import { useLoaderData } from "@remix-run/react";
import { json } from '@remix-run/node'
import type { LoaderArgs } from "@remix-run/server-runtime";
import invariant from "tiny-invariant";
import { Button, FeelTag, FlexList, Header, ItemBox, Label, Link, TempoIcons } from "~/components";
import { getSong } from "~/models/song.server";
import { requireUserId } from "~/session.server";
import pluralize from 'pluralize'

export async function loader({ request, params }: LoaderArgs) {
  await requireUserId(request)
  const songId = params.songId
  invariant(songId, 'songId not found')

  const song = await getSong(songId)
  if (!song) {
    throw new Response('Song not found', { status: 404 })
  }
  return json({ song })
}

export default function SongDetails() {
  const { song } = useLoaderData<typeof loader>()
  return (
    <div className="w-full">
      <header className="p-4">
        <Header>
          <h1 className="font-bold text-3xl">{song.name}</h1>
          <Link to="edit" kind="secondary" icon={faPenToSquare} isCollapsing isRounded>Edit song</Link>
        </Header>
      </header>
      <FlexList pad={4}>
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
                    <FeelTag key={feel.id} feel={{ ...feel, updatedAt: new Date(feel.updatedAt), createdAt: new Date(feel.createdAt) }} />
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
              <p>{song.note}</p>
            </ItemBox>
          </FlexList>
        ) : null}

        <FlexList gap={2}>
          <Label>Settings</Label>
          <ItemBox>
            <FlexList gap={2} direction="row" items="center">
              <Label>Setlist auto-generation importance</Label>
              <span>{song.rank === 'star' ? 'Always include' : song.rank === 'exclude' ? 'Always exclude' : 'No preference'}</span>
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
              <Button kind="danger" icon={faTrash}>Delete</Button>
            </FlexList>
          </ItemBox>
        </FlexList>

      </FlexList>
    </div>
  )
}
