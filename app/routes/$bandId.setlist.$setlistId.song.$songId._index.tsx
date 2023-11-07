import { faPenToSquare } from "@fortawesome/free-solid-svg-icons";
import { useLoaderData } from "@remix-run/react";
import type { LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node"
import invariant from "tiny-invariant"
import { FlexHeader, Link, MaxHeightContainer, Navbar, SongDetails, Title } from "~/components";
import { getSong } from "~/models/song.server"
import { requireUserId } from "~/session.server"
import { useMemberRole } from "~/utils";
import { RoleEnum } from "~/utils/enums";

export async function loader({ request, params }: LoaderFunctionArgs) {
  await requireUserId(request)
  const { songId, bandId } = params
  invariant(songId, 'songId not found')
  invariant(bandId, 'bandId not found')

  const response = await getSong(songId, bandId)
  const song = response?.song
  const setlists = response?.setlists
  if (!song) {
    throw new Response('Song not found', { status: 404 })
  }
  return json({ song, setlists })
}

export default function SongDetailsRoute() {
  const { song, setlists } = useLoaderData<typeof loader>()
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
      <div className="bg-base-200">
        <SongDetails song={song} setlists={setlists} />
      </div>
    </MaxHeightContainer>
  )
}