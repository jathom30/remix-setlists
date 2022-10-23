import invariant from "tiny-invariant";
import { json } from '@remix-run/node'
import type { ActionArgs, LoaderArgs, SerializeFrom } from "@remix-run/server-runtime";
import { redirect } from "@remix-run/server-runtime";
import { MaxHeightContainer, SongForm, SaveButtons, ErrorContainer, CatchContainer } from "~/components";
import { getSong, updateSong } from "~/models/song.server";
import { getFields } from "~/utils/form";
import { requireNonSubMember } from "~/session.server";
import { createFeel, getFeels } from "~/models/feel.server";
import { useActionData, useFetcher, useLoaderData, useParams } from "@remix-run/react";
import type { Feel, Song } from "@prisma/client";

export async function loader({ request, params }: LoaderArgs) {
  const { songId, bandId } = params
  invariant(songId, 'songId not found')
  invariant(bandId, 'bandId not found')
  await requireNonSubMember(request, bandId)
  const feels = await getFeels(bandId)
  const song = await getSong(songId)
  if (!song) {
    throw new Response('Song not found', { status: 404 })
  }

  return json({ song, feels })
}

export async function action({ request, params }: ActionArgs) {
  const { songId, bandId } = params
  invariant(bandId, 'bandId not found')
  invariant(songId, 'songId not found')
  await requireNonSubMember(request, bandId)

  const formData = await request.formData()
  const newFeel = formData.get('newFeel')

  if (newFeel && typeof newFeel === 'string') {
    return json({
      newFeel: await createFeel(newFeel, bandId)
    })
  }

  const { fields, errors } = getFields<SerializeFrom<Song & { feels: Feel['id'][] }>>(formData, [
    { name: 'name', type: 'string', isRequired: true },
    { name: 'length', type: 'number', isRequired: true },
    { name: 'keyLetter', type: 'string', isRequired: false },
    { name: 'isMinor', type: 'boolean', isRequired: false },
    { name: 'tempo', type: 'number', isRequired: true },
    { name: 'isCover', type: 'boolean', isRequired: false },
    { name: 'position', type: 'string', isRequired: true },
    { name: 'rank', type: 'string', isRequired: true },
    { name: 'note', type: 'string', isRequired: false },
  ])
  const feels = formData.getAll('feels')

  if (!Array.isArray(feels)) {
    return json({ errors: { feels: 'Invalid feels' } })
  }

  if (Object.keys(errors).length) {
    return json({ errors }, { status: 400 })
  }

  const validFeels = feels.reduce((acc: string[], feelId) => {
    if (feelId.toString().length) {
      return [
        ...acc, feelId.toString()
      ]
    }
    return acc
  }, [])

  await updateSong(songId, fields, validFeels)
  return redirect(`/${bandId}/songs/${songId}`)
}


export default function EditSong() {
  const { song, feels } = useLoaderData<typeof loader>()
  const { songId, bandId } = useParams()
  const actionData = useActionData()
  const fetcher = useFetcher<typeof action>()

  const handleCreateFeel = (newFeel: string) => {
    fetcher.submit({ newFeel }, { method: 'post' })
  }

  return (
    <fetcher.Form method="put" className="h-full">
      <MaxHeightContainer
        fullHeight
        footer={
          <SaveButtons isDisabled={fetcher.state !== 'idle'} saveLabel="Save" cancelTo={`/${bandId}/songs/${songId}`} />
        }
      >
        <SongForm
          song={song}
          feels={feels}
          errors={actionData?.errors}
          onCreateFeel={handleCreateFeel}
        />
      </MaxHeightContainer>
    </fetcher.Form>
  )
}

export function CatchBoundary() {
  return <CatchContainer />
}

export function ErrorBoundary({ error }: { error: Error }) {
  return <ErrorContainer error={error} />
}