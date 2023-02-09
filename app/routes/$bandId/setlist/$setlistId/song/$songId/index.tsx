import { faPenToSquare } from "@fortawesome/free-solid-svg-icons";
import { useLoaderData } from "@remix-run/react";
import type { LoaderArgs } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime"
import pluralize from "pluralize";
import invariant from "tiny-invariant"
import { Divider, FeelTag, FlexHeader, FlexList, ItemBox, Label, Link, MaxHeightContainer, Navbar, TempoIcons, Title } from "~/components";
import { getSong } from "~/models/song.server"
import { requireUserId } from "~/session.server"
import { useMemberRole } from "~/utils";
import { capitalizeFirstLetter } from "~/utils/assorted";
import { RoleEnum, setlistAutoGenImportanceEnums } from "~/utils/enums";

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

  return (
    <MaxHeightContainer
      fullHeight
      header={
        <Navbar>
          <FlexHeader>
            <Title>{song.name}</Title>
            {!isSub ? <Link to="edit" icon={faPenToSquare} kind="ghost" isCollapsing>Edit song</Link> : null}
          </FlexHeader>
        </Navbar>
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
                <span>{capitalizeFirstLetter(song.position) || 'Other'}</span>
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
          <Label>Notes/Lyrics</Label>
          <ItemBox>
            <FlexList gap={2}>
              {!song.note ? (
                <span className="text-sm">--</span>
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
      </FlexList>
    </MaxHeightContainer>
  )
}