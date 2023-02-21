import { faTimes } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import type { LoaderArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { useLoaderData, useParams } from "@remix-run/react";
import pluralize from "pluralize";
import invariant from "tiny-invariant";
import { FlexHeader, FlexList, Link, Navbar, Title } from "~/components";
import { getSongSetlists } from "~/models/song.server";
import { requireUserId } from "~/session.server";

export async function loader({ request, params }: LoaderArgs) {
  await requireUserId(request)
  const { songId, bandId } = params
  invariant(songId, 'songId not found')
  invariant(bandId, 'bandId not found')

  const setlists = await getSongSetlists(songId)

  return json({ setlists })
}

export default function Setlists() {
  const { bandId } = useParams()
  const { setlists } = useLoaderData<typeof loader>()


  return (
    <FlexList gap={0}>
      <Navbar>
        <FlexHeader>
          <Title>Song's setlists</Title>
          <Link isRounded to=".." kind="ghost"><FontAwesomeIcon icon={faTimes} /></Link>
        </FlexHeader>
      </Navbar>
      <FlexList pad={4}>
        <p>This song was found in the following {pluralize('setlist', setlists.length)}:</p>
        {setlists.map(setlist => (
          <Link isOutline key={setlist.id} to={`/${bandId}/setlist/${setlist.id}`}>{setlist.name}</Link>
        ))}
      </FlexList>
    </FlexList>
  )
}