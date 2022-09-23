import invariant from "tiny-invariant";
import { json } from '@remix-run/node'
import type { ActionArgs, LoaderArgs, SerializeFrom } from "@remix-run/server-runtime";
import { redirect } from "@remix-run/server-runtime";
import { MaxHeightContainer, SongForm } from "~/components";
import { getSong, updateSong } from "~/models/song.server";
import { getFields } from "~/utils/form";
import { requireUserId } from "~/session.server";
import { getFeels } from "~/models/feel.server";
import { Form, useActionData, useLoaderData, useParams } from "@remix-run/react";
import type { Feel, Song } from "@prisma/client";
import { SaveButtons } from "~/components/SaveButtons";

export async function loader({ request, params }: LoaderArgs) {
  await requireUserId(request)
  const { songId, bandId } = params
  invariant(songId, 'songId not found')
  invariant(bandId, 'bandId not found')
  const feels = await getFeels(bandId)
  const song = await getSong(songId)
  if (!song) {
    throw new Response('Song not found', { status: 404 })
  }
  return json({ song, feels })
}

export async function action({ request, params }: ActionArgs) {
  await requireUserId(request)
  const { songId, bandId } = params
  const formData = await request.formData()
  // const newFeel = formData.get('newFeel')

  invariant(bandId, 'bandId not found')
  invariant(songId, 'songId not found')

  const { fields, errors } = getFields<SerializeFrom<Song & { feels: Feel['id'][] }>>(formData, [
    { name: 'name', type: 'string', isRequired: true },
    { name: 'length', type: 'number', isRequired: true },
    { name: 'keyLetter', type: 'string', isRequired: false },
    { name: 'isMinor', type: 'boolean', isRequired: false },
    { name: 'tempo', type: 'number', isRequired: true },
    // { name: 'feels', type: 'array', isRequired: false },
    { name: 'isCover', type: 'boolean', isRequired: false },
    { name: 'position', type: 'string', isRequired: true },
    { name: 'rank', type: 'string', isRequired: true },
    { name: 'note', type: 'string', isRequired: false },
  ])

  if (Object.keys(errors).length) {
    return json({ errors }, { status: 400 })
  }
  // TODO add value to submit button to diff from creating new feel
  await updateSong(songId, fields)
  return redirect(`/${bandId}/songs/${songId}`)


  // // create new feel and attach to song
  // if (newFeel && typeof newFeel === 'string') {
  //   // https://css-tricks.com/snippets/javascript/random-hex-color/
  //   const randomColor = `#${Math.floor(Math.random() * 16777215).toString(16)}`;
  //   await createFeelWithSong({ label: newFeel, color: randomColor, songId, bandId })
  //   return redirect(`/${bandId}/songs/${songId}/edit`)
  // }
}

export default function EditSong() {
  const { song, feels } = useLoaderData<typeof loader>()
  const { songId, bandId } = useParams()
  const actionData = useActionData()

  return (
    <Form method="put">
      <MaxHeightContainer
        fullHeight
        footer={
          <SaveButtons saveLabel="Save" cancelTo={`/${bandId}/songs/${songId}`} />
        }
      >
        <SongForm song={song} feels={feels} errors={actionData?.errors} />
      </MaxHeightContainer>
    </Form>
  )
}