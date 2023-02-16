import { faPenToSquare } from "@fortawesome/free-solid-svg-icons";
import { useLoaderData } from "@remix-run/react";
import type { LoaderArgs } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime"
import invariant from "tiny-invariant"
import { FlexHeader, Link, MaxHeightContainer, Navbar, SongDetails, Title } from "~/components";
import { getSong } from "~/models/song.server"
import { requireUserId } from "~/session.server"
import { useMemberRole } from "~/utils";
import { RoleEnum } from "~/utils/enums";

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

export default function SongDetailsRoute() {
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
      <div className="bg-base-200">
        <SongDetails song={song} />
      </div>
    </MaxHeightContainer>
  )
}