import { useLoaderData, useParams } from "@remix-run/react";
import type { LoaderArgs } from "@remix-run/server-runtime";
import { json } from "@remix-run/server-runtime";
import invariant from "tiny-invariant";
import { Navbar, Title } from "~/components";
import { getFeels } from "~/models/feel.server";
import { SongNew } from "~/routes/resource/songNew";
import { requireNonSubMember } from "~/session.server";

export async function loader({ request, params }: LoaderArgs) {
  const { bandId } = params
  invariant(bandId, 'bandId not found')
  await requireNonSubMember(request, bandId)
  const feels = await getFeels(bandId)
  return json({ feels })
}

export default function NewSong() {
  const { feels } = useLoaderData<typeof loader>()
  const { bandId, setlistId, setId } = useParams()
  return (
    <SongNew
      header={
        <Navbar>
          <Title>New song</Title>
        </Navbar>
      }
      feels={feels}
      redirectTo={`/${bandId}/setlist/edit/${setlistId}/${setId}/addSongs`}
      cancelTo={`/${bandId}/setlist/edit/${setlistId}/${setId}/addSongs`}
    />
  )
}